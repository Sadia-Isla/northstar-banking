using NorthstarBankApi.Models;

namespace NorthstarBankApi.Data;

public class BankingRepository
{
    private static readonly Lock SyncRoot = new();

    private static readonly List<AccountSummary> Accounts =
    [
        new(101, "Premier Checking", "Checking", "**** 4821", 28450.12m, 2.4m, "Healthy"),
        new(102, "Rainy Day Savings", "Savings", "**** 1184", 96500.42m, 4.8m, "Healthy"),
        new(103, "Global Equity Portfolio", "Investment", "Managed", 187340.70m, 8.1m, "Active"),
        new(104, "Travel Rewards Card", "Credit", "**** 9044", -4312.89m, -1.2m, "Payment Due")
    ];

    private static readonly List<TransactionItem> Transactions =
    [
        new(1, "2026-03-21", "Acme Payroll", "Income", "Premier Checking", 12450.00m, "credit", "Posted"),
        new(2, "2026-03-20", "Maple Capital Transfer", "Investment", "Premier Checking", -3500.00m, "debit", "Posted"),
        new(3, "2026-03-19", "North Shore Mortgage", "Housing", "Premier Checking", -2860.00m, "debit", "Posted"),
        new(4, "2026-03-19", "Executive Air", "Travel", "Travel Rewards Card", -1184.22m, "debit", "Pending"),
        new(5, "2026-03-18", "Downtown Market", "Dining", "Travel Rewards Card", -142.90m, "debit", "Posted"),
        new(6, "2026-03-17", "Bond Coupon Payout", "Income", "Rainy Day Savings", 840.55m, "credit", "Posted"),
        new(7, "2026-03-17", "Harbor Energy", "Utilities", "Premier Checking", -218.31m, "debit", "Posted"),
        new(8, "2026-03-16", "Client Dinner", "Business", "Travel Rewards Card", -324.40m, "debit", "Posted"),
        new(9, "2026-03-15", "Wellness Club", "Lifestyle", "Premier Checking", -96.00m, "debit", "Posted"),
        new(10, "2026-03-14", "ETF Rebalance", "Investment", "Global Equity Portfolio", 5600.00m, "credit", "Posted")
    ];

    private static readonly List<SpendingCategory> SpendingCategories =
    [
        new("Housing", 2860.00m, 38m),
        new("Investment", 3500.00m, 28m),
        new("Travel", 1184.22m, 16m),
        new("Dining", 467.30m, 9m),
        new("Utilities", 218.31m, 5m),
        new("Lifestyle", 96.00m, 4m)
    ];

    private static readonly List<MarketMover> MarketMovers =
    [
        new("SPY", "S&P 500 ETF", 582.34m, 1.16m),
        new("QQQ", "Nasdaq 100 ETF", 498.22m, 1.72m),
        new("BND", "Total Bond Market", 73.11m, -0.34m),
        new("GLD", "Gold Trust", 219.45m, 0.91m)
    ];

    private static readonly List<RiskAlert> Alerts =
    [
        new("Large outbound transfer", "medium", "A $3,500 investment transfer cleared today from Premier Checking."),
        new("Credit utilization rising", "high", "Travel Rewards Card is at 62% of the recommended utilization threshold."),
        new("Portfolio review due", "low", "Your equity allocation drifted 4.2% above target this month.")
    ];

    public BankingSnapshot GetSnapshot()
    {
        return new BankingSnapshot(
            "Avery Stone",
            Accounts.Sum(a => a.Balance),
            Accounts.Where(a => a.Type == "Investment").Sum(a => a.Balance),
            Transactions.Where(t => t.Direction == "credit").Sum(t => t.Amount),
            Math.Abs(Transactions.Where(t => t.Direction == "debit").Sum(t => t.Amount)),
            0.62m,
            Accounts,
            Transactions.Take(6).ToList(),
            SpendingCategories,
            MarketMovers,
            Alerts);
    }

    public IReadOnlyList<AccountSummary> GetAccounts() => Accounts;

    public IReadOnlyList<TransactionItem> GetTransactions(string? search = null, string? direction = null)
    {
        List<TransactionItem> snapshot;

        lock (SyncRoot)
        {
            snapshot = Transactions
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.Id)
                .ToList();
        }

        IEnumerable<TransactionItem> query = snapshot;

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t =>
                t.Description.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                t.Category.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                t.Account.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(direction))
        {
            query = query.Where(t => t.Direction.Equals(direction, StringComparison.OrdinalIgnoreCase));
        }

        return query.ToList();
    }

    public TransactionItem? GetTransactionById(int id)
    {
        lock (SyncRoot)
        {
            return Transactions.FirstOrDefault(t => t.Id == id);
        }
    }

    public TransactionItem CreateTransaction(UpsertTransactionRequest request)
    {
        lock (SyncRoot)
        {
            var nextId = Transactions.Count == 0 ? 1 : Transactions.Max(t => t.Id) + 1;
            var transaction = MapTransaction(nextId, request);
            Transactions.Add(transaction);
            return transaction;
        }
    }

    public TransactionItem? UpdateTransaction(int id, UpsertTransactionRequest request)
    {
        lock (SyncRoot)
        {
            var existingIndex = Transactions.FindIndex(t => t.Id == id);

            if (existingIndex < 0)
            {
                return null;
            }

            var updated = MapTransaction(id, request);
            Transactions[existingIndex] = updated;
            return updated;
        }
    }

    public bool DeleteTransaction(int id)
    {
        lock (SyncRoot)
        {
            var existing = Transactions.FirstOrDefault(t => t.Id == id);

            if (existing is null)
            {
                return false;
            }

            return Transactions.Remove(existing);
        }
    }

    private static TransactionItem MapTransaction(int id, UpsertTransactionRequest request)
    {
        return new TransactionItem(
            id,
            request.Date,
            request.Description.Trim(),
            request.Category.Trim(),
            request.Account.Trim(),
            request.Amount,
            request.Direction.Trim().ToLowerInvariant(),
            request.Status.Trim());
    }
}
