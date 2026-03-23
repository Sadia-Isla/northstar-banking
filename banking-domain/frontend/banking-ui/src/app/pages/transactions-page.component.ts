import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../banking.service';
import { TransactionInput, TransactionItem } from '../banking.models';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <section class="ag-showcase-hero">
        <div class="hero-copy">
          <p class="eyebrow">Transaction Workspace</p>
          <h1>Visible rows, editable records, and reliable CRUD.</h1>
          <p>
            The explorer now shows real transaction rows directly, keeps 10 visible per page,
            and gives clear feedback when records are created, updated, or removed.
          </p>

          <div class="hero-feature-list">
            <span>10 visible rows</span>
            <span>Quick filter</span>
            <span>Pagination</span>
            <span>CRUD feedback</span>
          </div>
        </div>

        <div class="hero-highlight-card">
          <p class="eyebrow">Live Snapshot</p>
          <strong>{{ filteredTransactions().length }}</strong>
          <span>Rows loaded</span>
          <p>{{ creditCount() }} credits, {{ debitCount() }} debits, {{ totalVolume() | currency }} in total movement.</p>
        </div>
      </section>

      <div class="transaction-stat-strip">
        <article class="transaction-stat-card">
          <span>Credits</span>
          <strong>{{ creditCount() }}</strong>
          <p>Inbound transactions currently in the result set.</p>
        </article>
        <article class="transaction-stat-card">
          <span>Debits</span>
          <strong>{{ debitCount() }}</strong>
          <p>Outbound transactions currently available for review.</p>
        </article>
        <article class="transaction-stat-card">
          <span>Total volume</span>
          <strong>{{ totalVolume() | currency }}</strong>
          <p>Combined movement across all visible rows.</p>
        </article>
      </div>

      <div class="ag-showcase-shell">
        <div class="showcase-toolbar">
          <div>
            <p class="eyebrow">Transactions</p>
            <h2>Transactions Explorer</h2>
          </div>

          <div class="showcase-badges">
            <span class="showcase-chip">{{ visibleTransactions().length }} visible</span>
            <span class="showcase-chip">{{ selectedTransaction() ? '1 row selected' : 'No row selected' }}</span>
          </div>
        </div>

        <div class="demo-action-row">
          <button class="demo-action-button" (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1">Previous page</button>
          <button class="demo-action-button" (click)="resetGridState()">Reset filters</button>
          <button class="demo-action-button" (click)="clearSelection()">Clear selection</button>
        </div>

        <div class="showcase-filter-bar">
          <input [(ngModel)]="search" placeholder="Server filter: description, category, or account" />
          <select [(ngModel)]="direction">
            <option value="">All directions</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
          </select>
          <input [(ngModel)]="quickFilter" (ngModelChange)="goToPage(1)" placeholder="Quick filter inside the explorer" />
          <button (click)="loadTransactions()">Apply API filter</button>
        </div>

        <div class="transaction-workspace transaction-workspace-showcase">
          <div class="table-explorer-panel" *ngIf="filteredTransactions().length; else emptyTpl">
            <div class="table-explorer-meta">
              <span>Showing {{ pageStart() }} to {{ pageEnd() }} of {{ filteredTransactions().length }}</span>
              <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
            </div>

            <div class="transaction-table-wrap">
              <table class="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Account</th>
                    <th>Direction</th>
                    <th>Status</th>
                    <th class="align-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let txn of visibleTransactions()"
                    (click)="selectTransaction(txn)"
                    [class.selected-row]="selectedTransactionId() === txn.id">
                    <td>{{ txn.date }}</td>
                    <td>
                      <strong>{{ txn.description }}</strong>
                    </td>
                    <td>{{ txn.category }}</td>
                    <td>{{ txn.account }}</td>
                    <td>
                      <span class="table-badge">{{ txn.direction }}</span>
                    </td>
                    <td>{{ txn.status }}</td>
                    <td class="align-right" [class.positive]="txn.direction === 'credit'" [class.negative]="txn.direction === 'debit'">
                      {{ txn.amount | currency }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-pagination">
              <button class="demo-action-button" (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1">Back</button>
              <button class="demo-action-button" (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()">Next</button>
            </div>
          </div>

          <aside class="editor-rail">
            <form class="editor-panel editor-panel-showcase" (ngSubmit)="saveTransaction()">
              <div class="editor-header">
                <div>
                  <p class="eyebrow">CRUD Workspace</p>
                  <h2>{{ selectedTransactionId() === null ? 'Create transaction' : 'Edit transaction' }}</h2>
                </div>
                <button type="button" class="ghost-button" (click)="resetForm()">New</button>
              </div>

              <p *ngIf="message()" class="crud-message">{{ message() }}</p>

              <div class="editor-actions editor-actions-top">
                <button type="submit">{{ selectedTransactionId() === null ? 'Create now' : 'Save changes' }}</button>
                <button *ngIf="selectedTransactionId() !== null" type="button" class="danger-button" (click)="deleteTransaction()">Delete</button>
              </div>

              <label>
                <span>Date</span>
                <input type="date" [(ngModel)]="form.date" name="date" required />
              </label>
              <label>
                <span>Description</span>
                <input [(ngModel)]="form.description" name="description" required />
              </label>
              <label>
                <span>Category</span>
                <input [(ngModel)]="form.category" name="category" required />
              </label>
              <label>
                <span>Account</span>
                <input [(ngModel)]="form.account" name="account" required />
              </label>
              <label>
                <span>Amount</span>
                <input type="number" step="0.01" [(ngModel)]="form.amount" name="amount" required />
              </label>
              <label>
                <span>Direction</span>
                <select [(ngModel)]="form.direction" name="direction" required>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </label>
              <label>
                <span>Status</span>
                <select [(ngModel)]="form.status" name="status" required>
                  <option value="Posted">Posted</option>
                  <option value="Pending">Pending</option>
                </select>
              </label>

              <div class="editor-actions sticky-actions">
                <button type="submit">{{ selectedTransactionId() === null ? 'Create now' : 'Save changes' }}</button>
                <button *ngIf="selectedTransactionId() !== null" type="button" class="danger-button" (click)="deleteTransaction()">Delete</button>
              </div>
            </form>

            <div class="selection-summary-card" *ngIf="selectedTransaction(); else helperTpl">
              <p class="eyebrow">Selected Row</p>
              <h3>{{ selectedTransaction()!.description }}</h3>
              <p>{{ selectedTransaction()!.category }} · {{ selectedTransaction()!.account }}</p>
              <div class="selection-summary-grid">
                <div>
                  <span>Amount</span>
                  <strong>{{ selectedTransaction()!.amount | currency }}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{{ selectedTransaction()!.status }}</strong>
                </div>
                <div>
                  <span>Date</span>
                  <strong>{{ selectedTransaction()!.date }}</strong>
                </div>
                <div>
                  <span>Direction</span>
                  <strong>{{ selectedTransaction()!.direction }}</strong>
                </div>
              </div>
            </div>

            <ng-template #helperTpl>
              <div class="selection-summary-card muted-card">
                <p class="eyebrow">Grid Guidance</p>
                <h3>Click a row to inspect it.</h3>
                <p>The explorer now uses a visible transaction table so all 10 rows on the page are easy to read.</p>
              </div>
            </ng-template>
          </aside>
        </div>

        <ng-template #emptyTpl>
          <div class="empty-card">No transactions matched your current filter.</div>
        </ng-template>
      </div>
    </section>
  `,
  styleUrl: './page-styles.css'
})
export class TransactionsPageComponent {
  transactions = signal<TransactionItem[]>([]);
  selectedTransactionId = signal<number | null>(null);
  currentPage = signal(1);
  readonly pageSize = 10;
  message = signal('');

  search = '';
  direction = '';
  quickFilter = '';
  form: TransactionInput = this.createEmptyForm();

  readonly filteredTransactions = computed(() => {
    const quick = this.quickFilter.trim().toLowerCase();

    if (!quick) {
      return this.transactions();
    }

    return this.transactions().filter(item =>
      item.description.toLowerCase().includes(quick) ||
      item.category.toLowerCase().includes(quick) ||
      item.account.toLowerCase().includes(quick) ||
      item.status.toLowerCase().includes(quick) ||
      item.direction.toLowerCase().includes(quick)
    );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredTransactions().length / this.pageSize)));

  readonly visibleTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTransactions().slice(start, start + this.pageSize);
  });

  readonly selectedTransaction = computed(() =>
    this.transactions().find(item => item.id === this.selectedTransactionId()) ?? undefined
  );

  readonly creditCount = computed(() => this.filteredTransactions().filter(item => item.direction === 'credit').length);
  readonly debitCount = computed(() => this.filteredTransactions().filter(item => item.direction === 'debit').length);
  readonly totalVolume = computed(() => this.filteredTransactions().reduce((sum, item) => sum + Math.abs(item.amount), 0));
  readonly pageStart = computed(() => this.filteredTransactions().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1);
  readonly pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.filteredTransactions().length));

  constructor(private bankingService: BankingService) {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.bankingService.getTransactions(this.search, this.direction).subscribe({
      next: data => {
        this.transactions.set(data);
        this.currentPage.set(1);
        this.message.set(`${data.length} transactions loaded.`);

        const selected = data.find(item => item.id === this.selectedTransactionId());
        if (selected) {
          this.patchForm(selected);
        } else {
          this.selectedTransactionId.set(null);
        }
      },
      error: () => {
        this.message.set('Could not load transactions. Check that the backend is running.');
      }
    });
  }

  selectTransaction(transaction: TransactionItem): void {
    this.selectedTransactionId.set(transaction.id);
    this.patchForm(transaction);
    this.message.set(`Selected transaction ${transaction.id}.`);
  }

  goToPage(page: number): void {
    const boundedPage = Math.max(1, Math.min(page, this.totalPages()));
    this.currentPage.set(boundedPage);
  }

  resetGridState(): void {
    this.search = '';
    this.direction = '';
    this.quickFilter = '';
    this.currentPage.set(1);
    this.loadTransactions();
  }

  clearSelection(): void {
    this.selectedTransactionId.set(null);
    this.message.set('Selection cleared.');
  }

  fitColumns(): void {
    this.message.set('Explorer now shows a fixed, readable 10-row table.');
  }

  saveTransaction(): void {
    this.message.set('');
    const request = { ...this.form, amount: Number(this.form.amount) };
    const isCreate = this.selectedTransactionId() === null;

    const operation = isCreate
      ? this.bankingService.createTransaction(request)
      : this.bankingService.updateTransaction(this.selectedTransactionId()!, request);

    operation.subscribe({
      next: savedTransaction => {
        this.selectedTransactionId.set(savedTransaction.id);
        this.patchForm(savedTransaction);
        this.message.set(isCreate
          ? `Transaction ${savedTransaction.id} created successfully.`
          : `Transaction ${savedTransaction.id} saved successfully.`);
        this.loadTransactions();
      },
      error: error => {
        const serverMessage = error?.error?.message;
        this.message.set(serverMessage || 'Could not save transaction.');
      }
    });
  }

  deleteTransaction(): void {
    const id = this.selectedTransactionId();

    if (id === null) {
      this.message.set('Select a transaction first.');
      return;
    }

    this.bankingService.deleteTransaction(id).subscribe({
      next: () => {
        this.resetForm();
        this.message.set(`Transaction ${id} deleted successfully.`);
        this.loadTransactions();
      },
      error: () => {
        this.message.set('Could not delete transaction.');
      }
    });
  }

  resetForm(): void {
    this.selectedTransactionId.set(null);
    this.form = this.createEmptyForm();
  }

  private patchForm(transaction: TransactionItem): void {
    this.form = {
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      account: transaction.account,
      amount: transaction.amount,
      direction: transaction.direction,
      status: transaction.status
    };
  }

  private createEmptyForm(): TransactionInput {
    return {
      date: new Date().toISOString().slice(0, 10),
      description: '',
      category: 'Operations',
      account: 'Premier Checking',
      amount: 0,
      direction: 'debit',
      status: 'Posted'
    };
  }
}
