import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

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
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  // If editing an existing supplier, this holds its id
  supplierId: number | null = null;

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

    if (this.supplierId) {
      // Update existing supplier (PUT)
      const body = { ...this.supplierForm.value, id: this.supplierId };
      this.purchasingService.updateSupplier(this.supplierId, body).subscribe({
        next: () => {
          this.alertService.success('Supplier updated successfully!');
          this.router.navigate(['/purchasing']);
        },
        error: (err) => {
          console.error(err);
          this.alertService.error('Error updating supplier.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      // Create new supplier
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

  ngOnInit(): void {
    // check for edit route param
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        if (!isNaN(id) && id > 0) {
          this.supplierId = id;
          this.loadSupplier(id);
        }
      }
    });
  }

  private loadSupplier(id: number) {
    this.purchasingService.getSupplierById(id).subscribe({
      next: (s) => {
        this.supplierForm.patchValue({
          supplierCode: s.supplierCode,
          supplierName: s.supplierName,
          contactPerson: s.contactPerson,
          phoneNumber: s.phoneNumber,
          email: s.email,
          address: s.address
        });
      },
      error: (err) => {
        console.error('Error loading supplier for edit:', err);
        this.alertService.error('Could not load supplier data.');
      }
    });
  }
}
