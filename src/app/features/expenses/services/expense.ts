import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = 'https://sfe.runasp.net/api/v1/expenses';

  createExpense(expense: any): Observable<number> {
    return this.http.post<number>(this.apiUrl, expense);
  }

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl); // تأكد إننا عملنا Endpoint GetAll في الباك إند
  }
}