import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { AccountsPageComponent } from './pages/accounts-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { InsightsPageComponent } from './pages/insights-page.component';
import { SupportPageComponent } from './pages/support-page.component';
import { TransactionsPageComponent } from './pages/transactions-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'accounts', component: AccountsPageComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionsPageComponent, canActivate: [authGuard] },
  { path: 'insights', component: InsightsPageComponent, canActivate: [authGuard] },
  { path: 'support', component: SupportPageComponent, canActivate: [authGuard] },
];
