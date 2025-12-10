import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
<<<<<<< HEAD
import { PurchasingService } from '../../services/purchasing'; // تأكد من المسار
=======
import { PurchasingService } from '../../services/purchasing';
import { AlertService } from '../../../../core/services/alert.service';
>>>>>>> c70a22fee14f6993b4b4670197472033b10f8036

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

  // ✅ ترتيب الحقول هنا لازم يكون مطابق للي الباك إند مستنيه
  supplierForm: FormGroup = this.fb.group({
    supplierCode: ['', [Validators.required, Validators.maxLength(50)]],
    supplierName: ['', [Validators.required, Validators.maxLength(200)]],
    contactPerson: ['', Validators.maxLength(100)],
    phoneNumber: ['', Validators.required], // تأكد إن ده مربوط بحقل التليفون
    email: ['', [Validators.email]],       // تأكد إن ده مربوط بحقل الإيميل
    address: ['']
  });

  onSubmit() {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // طباعة البيانات في الكونسول للتأكد قبل الإرسال
    console.log('📤 Sending Data:', this.supplierForm.value);

    this.purchasingService.createSupplier(this.supplierForm.value).subscribe({
      next: (res) => {
<<<<<<< HEAD
        alert('✅ Supplier Added Successfully!');
        this.router.navigate(['/purchasing']);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error creating supplier.');
=======
        this.alertService.success('Supplier Added Successfully!');
        this.router.navigate(['/purchasing']); // الرجوع للقائمة
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error creating supplier. Code might be duplicate.');
>>>>>>> c70a22fee14f6993b4b4670197472033b10f8036
        this.isSubmitting.set(false);
      }
    });
  }
}
