import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SalesService } from '../../services/sales';

@Component({
  selector: 'app-create-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-customer.html',
  styleUrl: './create-customer.css'
})
export class CreateCustomerComponent {
  private fb = inject(FormBuilder);
  private salesService = inject(SalesService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false);

  customerForm: FormGroup = this.fb.group({
    customerName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    address: [''],
    taxNumber: ['', Validators.maxLength(50)],
    creditLimit: [0, [Validators.required, Validators.min(0)]]
  });

  onSubmit() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.salesService.createCustomer(this.customerForm.value).subscribe({
      next: (res) => {
        alert('✅ Customer Added Successfully!');
        this.router.navigate(['/sales']);
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Error creating customer. Email might be duplicate.';
        alert(`❌ Failed: ${errorMsg}`);
        this.isSubmitting.set(false);
      }
    });
  }
}