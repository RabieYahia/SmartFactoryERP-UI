import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchasingService } from '../../services/purchasing';

@Component({
  selector: 'app-create-supplier',
  standalone: true,
  // 👇 ReactiveFormsModule أساسي للفورم
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './create-supplier.html',
  styleUrl: './create-supplier.css'
})
export class CreateSupplierComponent {
  private fb = inject(FormBuilder);
  private purchasingService = inject(PurchasingService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false);

  // تصميم شكل الفورم بناءً على الـ API Command
  supplierForm: FormGroup = this.fb.group({
    supplierCode: ['', [Validators.required, Validators.maxLength(50)]],
    supplierName: ['', [Validators.required, Validators.maxLength(200)]],
    contactPerson: ['', Validators.maxLength(100)],
    email: ['', [Validators.email]], // تحقق من صيغة الإيميل
    phoneNumber: ['', Validators.required],
    address: ['']
  });

  onSubmit() {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched(); // إظهار الأخطاء
      return;
    }

    this.isSubmitting.set(true);

    this.purchasingService.createSupplier(this.supplierForm.value).subscribe({
      next: (res) => {
        alert('✅ Supplier Added Successfully!');
        this.router.navigate(['/purchasing']); // الرجوع للقائمة
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error creating supplier. Code might be duplicate.');
        this.isSubmitting.set(false);
      }
    });
  }
}