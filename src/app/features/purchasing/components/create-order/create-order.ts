import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchasingService } from '../../services/purchasing';
import { InventoryService } from '../../../inventory/services/inventory';
import { Supplier } from '../../models/supplier.model';
import { Material } from '../../../inventory/models/material.model';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-order.html',
  styleUrl: './create-order.css'
})
export class CreateOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private purchasingService = inject(PurchasingService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  // Signals
  suppliers = signal<Supplier[]>([]);
  materials = signal<Material[]>([]);
  isSubmitting = signal<boolean>(false);

  // تعريف الفورم
  orderForm: FormGroup = this.fb.group({
    supplierId: ['', Validators.required],
    expectedDeliveryDate: [new Date().toISOString().split('T')[0], Validators.required],
    poNumber: [''],
    items: this.fb.array([])
  });

  ngOnInit() {
    this.loadData();
    this.addItem(); // إضافة سطر افتراضي
  }

  // ✅✅ التعديل هنا: فلترة المواد لعرض "المواد الخام" فقط ✅✅
  loadData() {
    this.purchasingService.getSuppliers().subscribe(res => this.suppliers.set(res));

    this.inventoryService.getMaterials().subscribe(res => {
      // الفلتر اللي هيجيب الـ 5 أصناف كلهم
      const rawMaterialsOnly = res.filter(m => {
        const type = (m.materialType as any); // عشان نتجاهل تدقيق الأنواع

        return type === 'RawMaterial' || // الحالة الأولى (نص)
               type === 'Raw'         || // احتياطي
               type === 0             || // الحالة التانية (رقم)
               type === '0';             // 👈👈 الحالة التالتة (نص "0" زي ما ظهر في الصورة)
      });

      this.materials.set(rawMaterialsOnly);
    });
  }

  // --- التعامل مع الجدول ---
  get itemsArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem() {
    const itemGroup = this.fb.group({
      materialId: [null, Validators.required], // null عشان الـ placeholder يظهر
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
    this.itemsArray.push(itemGroup);
  }

  removeItem(index: number) {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
    } else {
      alert("At least one item is required.");
    }
  }

  get totalAmount(): number {
    return this.itemsArray.controls.reduce((sum, control) => {
      const qty = control.get('quantity')?.value || 0;
      const price = control.get('unitPrice')?.value || 0;
      return sum + (qty * price);
    }, 0);
  }

  // --- الإرسال ---
  onSubmit() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.orderForm.value;

    // تجهيز الـ Payload
    const command = {
      supplierId: Number(formValue.supplierId),
      expectedDeliveryDate: formValue.expectedDeliveryDate,
      poNumber: formValue.poNumber || null,
      items: formValue.items.map((item: any) => ({
        materialId: Number(item.materialId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      }))
    };

    console.log('🚀 Sending Order Payload:', command);

    this.purchasingService.createPurchaseOrder(command).subscribe({
      next: (res) => {
        alert('✅ Order Created Successfully!');
        this.router.navigate(['/purchasing/orders']);
      },
      error: (err) => {
        console.error('❌ API Error:', err);
        alert('Failed to create order. Please check the data.');
        this.isSubmitting.set(false);
      }
    });
  }
}
