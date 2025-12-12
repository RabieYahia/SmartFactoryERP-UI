import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PurchasingService } from '../../services/purchasing';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-create-supplier',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-supplier.html',
  styleUrl: './create-supplier.css'
})
export class CreateSupplierComponent {
  private fb = inject(FormBuilder);
  private purchasingService = inject(PurchasingService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  isSubmitting = signal<boolean>(false);

  supplierForm: FormGroup = this.fb.group({
    supplierCode: ['', [Validators.required, Validators.maxLength(50)]],
    supplierName: ['', [Validators.required, Validators.maxLength(200)]],
    contactPerson: ['', Validators.maxLength(100)],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.email]],
    address: ['']
  });

  onSubmit() {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    console.log('📤 Sending Data:', this.supplierForm.value);

    this.purchasingService.createSupplier(this.supplierForm.value).subscribe({
      next: (res) => {
        this.alertService.success('Supplier Added Successfully!');
        this.router.navigate(['/purchasing']);
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error creating supplier. Code might be duplicate.');
        this.isSubmitting.set(false);
      }
    });
  }
}
