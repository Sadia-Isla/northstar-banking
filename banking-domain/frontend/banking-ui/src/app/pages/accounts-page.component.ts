import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountSummary } from '../banking.models';
import { BankingService } from '../banking.service';

@Component({
  selector: 'app-accounts-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <div class="panel wide">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Accounts</p>
            <h1>Relationship Snapshot</h1>
          </div>
          <span>4 active products</span>
        </div>

        <div class="account-grid" *ngIf="accounts.length; else loadingTpl">
          <article class="account-card" *ngFor="let account of accounts">
            <div class="account-topline">
              <div>
                <h2>{{ account.name }}</h2>
                <p>{{ account.type }} &middot; {{ account.numberMasked }}</p>
              </div>
              <span class="account-status">{{ account.status }}</span>
            </div>
            <strong class="account-balance">{{ account.balance | currency }}</strong>
            <p class="account-change" [class.positive]="account.changePercent >= 0" [class.negative]="account.changePercent < 0">
              {{ account.changePercent }}% this month
            </p>
          </article>
        </div>

        <ng-template #loadingTpl>
          <div class="loading-card">Loading account balances...</div>
        </ng-template>
      </div>
    </section>
  `,
  styleUrl: './page-styles.css'
})
export class AccountsPageComponent implements OnInit {
  accounts: AccountSummary[] = [];

  constructor(private bankingService: BankingService) {}

  ngOnInit(): void {
    this.bankingService.getAccounts().subscribe(data => {
      this.accounts = data;
    });
  }
}
