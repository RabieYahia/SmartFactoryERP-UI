import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchasingService } from '../../services/purchasing';
import { InventoryService } from '../../../inventory/services/inventory';
import { Supplier } from '../../models/supplier.model';
import { Material } from '../../../inventory/models/material.model';
import { CreatePurchaseOrderCommand } from '../../models/purchase-order.model';

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

  // Signals للداتا اللي هنملا بيها الـ Dropdowns
  suppliers = signal<Supplier[]>([]);
  materials = signal<Material[]>([]);
  
  isSubmitting = signal<boolean>(false);

  // الفورم الرئيسي
  orderForm: FormGroup = this.fb.group({
    supplierId: ['', Validators.required],
    expectedDeliveryDate: [new Date().toISOString().split('T')[0], Validators.required], // تاريخ اليوم
    // 👇 هذا هو المصفوفة الديناميكية للأصناف
    items: this.fb.array([]) 
  });

  ngOnInit() {
    this.loadData();
    this.addItem(); // إضافة سطر فارغ في البداية
  }

  loadData() {
    // تحميل الموردين والمواد بالتوازي
    this.purchasingService.getSuppliers().subscribe(res => this.suppliers.set(res));
    this.inventoryService.getMaterials().subscribe(res => this.materials.set(res));
  }

  // --- FormArray Helpers (أدوات التحكم في الجدول) ---

  // Getter لسهولة الوصول للـ Array في الـ HTML
  get itemsArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  // إضافة سطر جديد
  addItem() {
    const itemGroup = this.fb.group({
      materialId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });
    this.itemsArray.push(itemGroup);
  }

  // حذف سطر
  removeItem(index: number) {
    this.itemsArray.removeAt(index);
  }

  // حساب الإجمالي (للعرض فقط)
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

  // 👇 التعديل هنا: تجهيز البيانات يدوياً لضمان صحتها
  const formValues = this.orderForm.value;

  const command: CreatePurchaseOrderCommand = {
    // 1. ضمان أن الـ ID رقم وليس نص (أحياناً الـ Select بيرجع نص)
    supplierId: Number(formValues.supplierId),
    
    // 2. ضمان أن التاريخ نص بصيغة YYYY-MM-DD
    // هذا السطر يحل مشكلة التواريخ العربية أو الصيغ المختلفة
    expectedDeliveryDate: new Date(formValues.expectedDeliveryDate).toISOString(), 
    
    // 3. تحويل أصناف الجدول
    items: formValues.items.map((item: any) => ({
      materialId: Number(item.materialId),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice)
    }))
  };

  console.log('Sending Payload:', command); // 👈 اطبع البيانات في الكونسول عشان تراجعها

  this.purchasingService.createPurchaseOrder(command).subscribe({
    next: (res) => {
      alert(`✅ Order Created Successfully! ID: ${res}`);
      this.router.navigate(['/purchasing']);
    },
    error: (err) => {
      console.error(err);
      // قراءة رسالة الخطأ من السيرفر
      const errorMsg = err.error?.errors 
                       ? JSON.stringify(err.error.errors) 
                       : (err.error?.message || 'Unknown Error');
                       
      alert(`❌ Failed: ${errorMsg}`);
      this.isSubmitting.set(false);
    }
  });
}
}