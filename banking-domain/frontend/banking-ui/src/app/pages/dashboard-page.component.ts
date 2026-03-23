import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BankingService } from '../banking.service';
import { BankingSnapshot } from '../banking.models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell" *ngIf="snapshot as data; else loadingTpl">
      <div class="hero-card dashboard-hero">
        <div>
          <p class="eyebrow">Private Banking Overview</p>
          <h1>{{ data.customerName }}</h1>
          <p class="hero-copy">
            A softer, easier-to-read view of cash, investments, spending pressure,
            and account health across your household finances.
          </p>
          <p class="live-copy">{{ liveMessage }}</p>
        </div>
        <div class="hero-pill live-pill">Portfolio health: Strong</div>
      </div>

      <div class="stats-grid">
        <article class="stat-card dashboard-card">
          <span>Total Balance</span>
          <strong>{{ data.totalBalance | currency }}</strong>
          <p>Across banking, credit, and investment products.</p>
        </article>
        <article class="stat-card dashboard-card">
          <span>Invested Assets</span>
          <strong>{{ data.investedAssets | currency }}</strong>
          <p>Diversified holdings under active review.</p>
        </article>
        <article class="stat-card dashboard-card">
          <span>Monthly Inflow</span>
          <strong>{{ data.monthlyIncome | currency }}</strong>
          <p>Salary, coupons, and portfolio income.</p>
        </article>
        <article class="stat-card warning dashboard-card">
          <span>Credit Utilization</span>
          <strong>{{ data.creditUtilization | percent:'1.0-0' }}</strong>
          <p>Higher than target. Consider an early payment.</p>
        </article>
      </div>

      <div class="content-grid dashboard-grid">
        <section class="panel dashboard-panel">
          <div class="panel-header">
            <h2>Priority Alerts</h2>
            <span>{{ data.alerts.length }} active</span>
          </div>
          <div class="alert-list">
            <article
              class="alert-card dashboard-alert-card"
              *ngFor="let alert of data.alerts; let i = index"
              [class.live-card]="isActiveAlert(i)">
              <div>
                <h3>{{ alert.title }}</h3>
                <p>{{ alert.detail }}</p>
              </div>
              <span class="severity" [class.high]="alert.severity === 'high'" [class.medium]="alert.severity === 'medium'">
                {{ alert.severity }}
              </span>
            </article>
          </div>
        </section>

        <section class="panel dashboard-panel">
          <div class="panel-header">
            <h2>Recent Transactions</h2>
            <span>Last 6 entries</span>
          </div>
          <div class="list-table">
            <article
              class="row-item dashboard-row-item"
              *ngFor="let txn of data.recentTransactions; let i = index"
              [class.live-card]="isActiveTransaction(i)">
              <div>
                <strong>{{ txn.description }}</strong>
                <p>{{ txn.category }} &middot; {{ txn.account }}</p>
              </div>
              <div class="row-meta">
                <strong [class.positive]="txn.direction === 'credit'" [class.negative]="txn.direction === 'debit'">
                  {{ txn.amount | currency }}
                </strong>
                <span>{{ txn.date }}</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>

    <ng-template #loadingTpl>
      <section class="page-shell">
        <div class="loading-card">Loading banking overview...</div>
      </section>
    </ng-template>
  `,
  styleUrl: './page-styles.css'
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  snapshot?: BankingSnapshot;
  activeAlertIndex = 0;
  activeTransactionIndex = 0;

  private readonly liveMessages = [
    'Live monitor: outgoing transfers, utilization, and deposits are being reviewed.',
    'Live monitor: card activity, incoming cash flow, and portfolio drift are in view.',
    'Live monitor: alerts and transaction highlights rotate automatically.'
  ];
  private messageIndex = 0;
  private messageTimer?: ReturnType<typeof setInterval>;
  private spotlightTimer?: ReturnType<typeof setInterval>;

  constructor(private bankingService: BankingService) {}

  ngOnInit(): void {
    this.bankingService.getOverview().subscribe(data => {
      this.snapshot = data;
      this.startLiveMotion(data);
    });
  }

  ngOnDestroy(): void {
    if (this.messageTimer) {
      clearInterval(this.messageTimer);
    }

    if (this.spotlightTimer) {
      clearInterval(this.spotlightTimer);
    }
  }

  get liveMessage(): string {
    return this.liveMessages[this.messageIndex];
  }

  isActiveAlert(index: number): boolean {
    return index === this.activeAlertIndex;
  }

  isActiveTransaction(index: number): boolean {
    return index === this.activeTransactionIndex;
  }

  private startLiveMotion(data: BankingSnapshot): void {
    if (this.messageTimer) {
      clearInterval(this.messageTimer);
    }

    if (this.spotlightTimer) {
      clearInterval(this.spotlightTimer);
    }

    this.messageTimer = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.liveMessages.length;
    }, 2800);

    this.spotlightTimer = setInterval(() => {
      this.activeAlertIndex = (this.activeAlertIndex + 1) % data.alerts.length;
      this.activeTransactionIndex = (this.activeTransactionIndex + 1) % data.recentTransactions.length;
    }, 2200);
  }
}
