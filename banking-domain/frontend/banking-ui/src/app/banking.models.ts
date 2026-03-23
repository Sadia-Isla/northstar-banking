export interface BankingSnapshot {
  customerName: string;
  totalBalance: number;
  investedAssets: number;
  monthlyIncome: number;
  monthlySpend: number;
  creditUtilization: number;
  accounts: AccountSummary[];
  recentTransactions: TransactionItem[];
  spendingCategories: SpendingCategory[];
  marketMovers: MarketMover[];
  alerts: RiskAlert[];
}

export interface AccountSummary {
  id: number;
  name: string;
  type: string;
  numberMasked: string;
  balance: number;
  changePercent: number;
  status: string;
}

export interface TransactionItem {
  id: number;
  date: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  direction: 'credit' | 'debit';
  status: string;
}

export interface TransactionInput {
  date: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  direction: 'credit' | 'debit';
  status: string;
}

export interface SpendingCategory {
  label: string;
  amount: number;
  percentage: number;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface RiskAlert {
  title: string;
  severity: string;
  detail: string;
}

export interface ApiSession {
  authenticationEnabled: boolean;
  isAuthenticated: boolean;
  name: string | null;
  subject: string | null;
  authenticationType: string | null;
}
