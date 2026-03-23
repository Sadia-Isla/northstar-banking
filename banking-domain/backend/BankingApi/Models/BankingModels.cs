namespace NorthstarBankApi.Models;

public record BankingSnapshot(
    string CustomerName,
    decimal TotalBalance,
    decimal InvestedAssets,
    decimal MonthlyIncome,
    decimal MonthlySpend,
    decimal CreditUtilization,
    IReadOnlyList<AccountSummary> Accounts,
    IReadOnlyList<TransactionItem> RecentTransactions,
    IReadOnlyList<SpendingCategory> SpendingCategories,
    IReadOnlyList<MarketMover> MarketMovers,
    IReadOnlyList<RiskAlert> Alerts);

public record AccountSummary(
    int Id,
    string Name,
    string Type,
    string NumberMasked,
    decimal Balance,
    decimal ChangePercent,
    string Status);

public record TransactionItem(
    int Id,
    string Date,
    string Description,
    string Category,
    string Account,
    decimal Amount,
    string Direction,
    string Status);

public record UpsertTransactionRequest(
    string Date,
    string Description,
    string Category,
    string Account,
    decimal Amount,
    string Direction,
    string Status);

public record SpendingCategory(
    string Label,
    decimal Amount,
    decimal Percentage);

public record MarketMover(
    string Symbol,
    string Name,
    decimal Price,
    decimal ChangePercent);

public record RiskAlert(
    string Title,
    string Severity,
    string Detail);

public record ApiSession(
    bool AuthenticationEnabled,
    bool IsAuthenticated,
    string? Name,
    string? Subject,
    string? AuthenticationType);
