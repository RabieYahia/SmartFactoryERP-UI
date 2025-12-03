import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense';
import { EXPENSE_CATEGORIES } from '../../models/expense.model';
import { HrService, Employee } from '../../../../core/services/hr.service'; // لجلب الموظفين

@Component({
  selector: 'app-create-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-expense.html',
  styleUrl: './create-expense.css'
})
export class CreateExpenseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private hrService = inject(HrService);
  private router = inject(Router);

  categories = EXPENSE_CATEGORIES; // القائمة الثابتة
  employees = signal<Employee[]>([]);
  isSubmitting = signal(false);

  form = this.fb.group({
    description: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    expenseDate: [new Date().toISOString().split('T')[0], Validators.required],
    category: [null, Validators.required], // يجب أن يكون رقم (Enum) في الباك إند
    employeeId: [null] // اختياري
  });

  ngOnInit() {
    this.hrService.getEmployees().subscribe(res => this.employees.set(res));
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    // تحويل القيم لتناسب الباك إند
    const payload = {
      ...this.form.value,
      amount: Number(this.form.value.amount),
      // ملاحظة: الباك إند يتوقع الـ Category كرقم (Enum int)
      // سنحتاج لتحويل النص إلى رقم بناءً على ترتيب الـ Array
      category: this.categories.indexOf(this.form.value.category!) + 1 
    };

    this.expenseService.createExpense(payload).subscribe({
      next: () => {
        alert('✅ Expense Recorded!');
        this.router.navigate(['/expenses']);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error recording expense');
        this.isSubmitting.set(false);
      }
    });
  }
}