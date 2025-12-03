import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SalesService } from '../../services/sales';
import { InventoryService } from '../../../inventory/services/inventory'; // 👈 استيراد خدمة المخزون
import { Customer } from '../../models/customer.model';
import { Material } from '../../../inventory/models/material.model';
import { CreateSalesOrderCommand } from '../../models/sales-order.model';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-order.html',
  styleUrl: './create-order.css'
})
export class CreateOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private salesService = inject(SalesService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  // Signals للقوائم المنسدلة
  customers = signal<Customer[]>([]);
  materials = signal<Material[]>([]);
  isSubmitting = signal<boolean>(false);

  orderForm: FormGroup = this.fb.group({
    customerId: ['', Validators.required],
    items: this.fb.array([]) 
  });

  ngOnInit() {
    this.loadData();
    this.addItem(); // سطر مبدئي
  }

  loadData() {
    // تحميل العملاء والمواد
    this.salesService.getCustomers().subscribe(res => this.customers.set(res));
    this.inventoryService.getMaterials().subscribe(res => this.materials.set(res));
  }

  // --- إدارة الجدول (FormArray) ---
  get itemsArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem() {
    const itemGroup = this.fb.group({
      materialId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      // السعر هنا هو سعر البيع، ممكن نجيبه من المادة أوتوماتيك لاحقاً
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });
    
    // استماع لتغيير المادة لتحديث السعر تلقائياً (Optional UX enhancement)
   // لاحظ استخدام val بدلاً من id للتوضيح، ثم تحويلها
itemGroup.get('materialId')?.valueChanges.subscribe(val => {
  // 👇 الحل هنا: تحويل القيمة لنفس نوع الـ ID (رقم)
  const id = Number(val); 
  
  const selectedMaterial = this.materials().find(m => m.id === id);
  
  if (selectedMaterial) {
    itemGroup.patchValue({ unitPrice: selectedMaterial.unitPrice * 1.2 });
  }
});

    this.itemsArray.push(itemGroup);
  }

  removeItem(index: number) {
    this.itemsArray.removeAt(index);
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
    const formVal = this.orderForm.value;

    // تجهيز البيانات للـ Backend
    const command: CreateSalesOrderCommand = {
      customerId: Number(formVal.customerId),
      items: formVal.items.map((i: any) => ({
        materialId: Number(i.materialId),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice)
      }))
    };

    this.salesService.createSalesOrder(command).subscribe({
      next: (res) => {
        alert(`✅ Sales Order Created! ID: ${res}\n(Don't forget to CONFIRM it to reserve stock)`);
        this.router.navigate(['/sales']);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to create order.');
        this.isSubmitting.set(false);
      }
    });
  }
}