import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory';

@Component({
  selector: 'app-edit-material',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-material.html',
  styleUrl: './edit-material.css'
})
export class EditMaterialComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);

  isSubmitting = signal(false);
  materialId = 0;

  // نفس شكل فورم الإضافة
  form: FormGroup = this.fb.group({
    materialName: ['', Validators.required],
    unitOfMeasure: ['', Validators.required],
    unitPrice: [0, [Validators.required, Validators.min(0.01)]],
    minimumStockLevel: [0, [Validators.required, Validators.min(0)]]
    // لاحظ: الكود (Code) والنوع (Type) لا يمكن تعديلهم عادةً، فمش هنحطهم في الفورم
  });

  ngOnInit() {
    this.materialId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.materialId) {
      this.loadMaterial();
    }
  }

  loadMaterial() {
    this.inventoryService.getMaterialById(this.materialId).subscribe({
      next: (data) => {
        // ملء الفورم بالبيانات الحالية
        this.form.patchValue({
          materialName: data.materialName,
          unitOfMeasure: data.unitOfMeasure, // تأكد إن الاسم في الموديل unitOfMeasure مش UnitOfMeasure
          unitPrice: data.unitPrice,
          minimumStockLevel: data.minimumStockLevel
        });
      },
      error: (err) => alert('❌ Error loading material details')
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    // نرسل الـ ID والبيانات الجديدة
    const command = { id: this.materialId, ...this.form.value };

    this.inventoryService.updateMaterial(this.materialId, command).subscribe({
      next: () => {
        alert('✅ Material Updated Successfully!');
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error updating material');
        this.isSubmitting.set(false);
      }
    });
  }
}