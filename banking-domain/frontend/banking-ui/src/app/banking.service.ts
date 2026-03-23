import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AccountSummary, ApiSession, BankingSnapshot, TransactionInput, TransactionItem } from './banking.models';

@Injectable({ providedIn: 'root' })
export class BankingService {
  private readonly apiBaseUrl = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<BankingSnapshot> {
    return this.http.get<BankingSnapshot>(`${this.apiBaseUrl}/banking/overview`);
  }

  getAccounts(): Observable<AccountSummary[]> {
    return this.http.get<AccountSummary[]>(`${this.apiBaseUrl}/banking/accounts`);
  }

  getTransactions(search = '', direction = ''): Observable<TransactionItem[]> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (direction.trim()) {
      params = params.set('direction', direction.trim());
    }

    return this.http.get<TransactionItem[]>(`${this.apiBaseUrl}/banking/transactions`, { params });
  }

  createTransaction(transaction: TransactionInput): Observable<TransactionItem> {
    return this.http.post<TransactionItem>(`${this.apiBaseUrl}/banking/transactions`, transaction);
  }

  updateTransaction(id: number, transaction: TransactionInput): Observable<TransactionItem> {
    return this.http.put<TransactionItem>(`${this.apiBaseUrl}/banking/transactions/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/banking/transactions/${id}`);
  }

  getSession(): Observable<ApiSession> {
    return this.http.get<ApiSession>(`${this.apiBaseUrl}/auth/session`);
  }
}
