import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PurchasingService, CreateGoodsReceiptCommand } from '../../services/purchasing';
// 👇 تأكد من صحة المسار الخاص بـ HrService عندك
import { HrService, Employee } from '../../../../core/services/hr.service'; 

@Component({
  selector: 'app-create-receipt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-receipt.html',
  styleUrl: './create-receipt.css'
})
export class CreateReceiptComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private purchasingService = inject(PurchasingService);
  private hrService = inject(HrService); // 👈 1. حقن خدمة HR

  orderData = signal<any>(null);
  employees = signal<Employee[]>([]); // 👈 2. قائمة الموظفين
  isSubmitting = signal<boolean>(false);
  poId: number = 0;

  receiptForm: FormGroup = this.fb.group({
    // 👈 3. تغيير الاسم والقيمة الافتراضية
    receivedById: ['', Validators.required], 
    notes: [''],
    items: this.fb.array([])
  });

  ngOnInit() {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.poId) {
      this.loadOrderDetails();
    }
    this.loadEmployees(); // 👈 4. تحميل الموظفين عند البدء
  }

  get itemsArray(): FormArray {
    return this.receiptForm.get('items') as FormArray;
  }

  // تحميل قائمة الموظفين للـ Dropdown
  loadEmployees() {
    this.hrService.getEmployees().subscribe({
      next: (res) => this.employees.set(res),
      error: (err) => console.error('Error loading employees', err)
    });
  }

  loadOrderDetails() {
    this.purchasingService.getOrderById(this.poId).subscribe({
      next: (order) => {
        this.orderData.set(order);
        
        // مسح العناصر القديمة (لتجنب التكرار لو حصل reload)
        this.itemsArray.clear();

        order.items.forEach((item: any) => {
          const group = this.fb.group({
            poItemId: [item.id],
            materialName: [item.materialName || 'Material #' + item.materialId],
            orderedQty: [item.quantity],
            receivedQuantity: [item.quantity, [Validators.required, Validators.min(0)]],
            rejectedQuantity: [0, [Validators.required, Validators.min(0)]]
          });
          this.itemsArray.push(group);
        });
      },
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    if (this.receiptForm.invalid) {
      this.receiptForm.markAllAsTouched(); // إظهار الأخطاء
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.receiptForm.value;

    const command: CreateGoodsReceiptCommand = {
      purchaseOrderId: this.poId,
      
      // 👈 5. إرسال رقم الموظف (تحويل لنص لرقم)
      receivedBy: Number(formValue.receivedById), 
      
      notes: formValue.notes,
      items: formValue.items.map((i: any) => ({
        poItemId: i.poItemId,
        receivedQuantity: Number(i.receivedQuantity),
        rejectedQuantity: Number(i.rejectedQuantity)
      }))
    };

    console.log('Sending Receipt:', command);

    this.purchasingService.createGoodsReceipt(command).subscribe({
      next: () => {
        alert('✅ Goods Received Successfully! Inventory Updated.');
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Unknown Error';
        alert(`❌ Error receiving goods: ${msg}`);
        this.isSubmitting.set(false);
      }
    });
  }
}