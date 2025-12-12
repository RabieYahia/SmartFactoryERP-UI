import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.css'
})
export class ExpenseListComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  expenses = signal<Expense[]>([]);

  ngOnInit() {
    console.log('🔄 Loading expenses...');
    this.expenseService.getExpenses().subscribe({
      next: (res) => {
        console.log('✅ Expenses from Backend:', res);
        if (res && res.length > 0) {
          console.log('📅 First expense date:', res[0].expenseDate);
          console.log('📊 First expense full:', res[0]);
        }
        this.expenses.set(res);
      },
      error: (err) => {
        console.error('❌ Error loading expenses:', err);
      }
    });
  }
}