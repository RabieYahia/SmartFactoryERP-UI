import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  FormBuilder, 
  Validators, 
  FormGroup 
} from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory';

@Component({
  selector: 'app-create-material',
  standalone: true,
  // 👇 استيراد ReactiveFormsModule ضروري جداً للفورم
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './create-material.html',
  styleUrl: './create-material.css'
})
export class CreateMaterialComponent {
  // الحقن الحديث
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false); // لمنع الضغط المتكرر

  // تعريف الفورم والتحقق (Validation)
  materialForm: FormGroup = this.fb.group({
    materialCode: ['', [Validators.required, Validators.maxLength(50)]],
    materialName: ['', [Validators.required, Validators.maxLength(200)]],
    // 0 هو قيمة الـ Enum لـ RawMaterial (مؤقتاً)
    materialType: [0, [Validators.required]], 
    unitOfMeasure: ['', Validators.required],
    unitPrice: [0, [Validators.required, Validators.min(0.01)]],
    minimumStockLevel: [0, [Validators.required, Validators.min(0)]]
  });

  onSubmit() {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched(); // إظهار الأخطاء الحمراء
      return;
    }

    this.isSubmitting.set(true);

    // إرسال البيانات للـ Backend
    this.inventoryService.createMaterial(this.materialForm.value).subscribe({
      next: (res) => {
        alert('✅ Material Created Successfully! ID: ' + res);
        this.router.navigate(['/inventory']); // الرجوع للقائمة
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error creating material. Check console.');
        this.isSubmitting.set(false);
      }
    });
  }
}