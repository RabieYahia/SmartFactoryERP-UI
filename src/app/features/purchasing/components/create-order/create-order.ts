import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchasingService } from '../../services/purchasing';
import { InventoryService } from '../../../inventory/services/inventory';
import { Supplier } from '../../models/supplier.model';
import { Material } from '../../../inventory/models/material.model';
import { CreatePurchaseOrderCommand } from '../../models/purchase-order.model';
import { AlertService } from '../../../../core/services/alert.service';

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
  private alertService = inject(AlertService);

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

  // فلترة المواد لعرض "المواد الخام" فقط
  loadData() {
    this.purchasingService.getSuppliers().subscribe(res => this.suppliers.set(res));

    this.inventoryService.getMaterials().subscribe(res => {
      // الفلتر اللي هيجيب المواد الخام فقط
      const rawMaterialsOnly = res.filter(m => {
        const type = (m.materialType as any); // عشان نتجاهل تدقيق الأنواع

        return type === 'RawMaterial' || // الحالة الأولى (نص)
               type === 'Raw'         || // احتياطي
               type === 0             || // الحالة التانية (رقم)
               type === '0';             // الحالة التالتة (نص "0")
      });

      console.log('📦 Raw Materials:', rawMaterialsOnly);
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
      this.alertService.warning('At least one item is required.');
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
      this.alertService.warning('Please complete all required fields.');
      return;
    }

    this.isSubmitting.set(true);

    // تجهيز البيانات يدوياً لضمان صحتها
    const formValues = this.orderForm.value;

    const command: CreatePurchaseOrderCommand = {
      // ضمان أن الـ ID رقم وليس نص
      supplierId: Number(formValues.supplierId),

      // ضمان أن التاريخ بصيغة ISO
      expectedDeliveryDate: new Date(formValues.expectedDeliveryDate).toISOString(),

      // PO Number اختياري
      poNumber: formValues.poNumber || undefined,

      // تحويل أصناف الجدول
      items: formValues.items.map((item: any) => ({
        materialId: Number(item.materialId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      }))
    };

    console.log('🚀 Sending Purchase Order:', command);

    this.purchasingService.createPurchaseOrder(command).subscribe({
      next: (res) => {
        this.alertService.success(`Purchase Order Created Successfully! ID: ${res}`);
        this.router.navigate(['/purchasing/orders']);
      },
      error: (err) => {
        console.error('❌ Create Purchase Order Error:', err);

        // قراءة رسالة الخطأ من السيرفر
        let errorMsg = 'Failed to create purchase order. Please check the data.';

        if (err.error?.errors) {
          // Validation errors from backend
          errorMsg = JSON.stringify(err.error.errors);
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMsg = err.error;
        }

        this.alertService.error(`Error: ${errorMsg}`);
        this.isSubmitting.set(false);
      }
    });
  }
}
