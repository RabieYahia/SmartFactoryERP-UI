import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PurchasingService, CreateGoodsReceiptCommand } from '../../services/purchasing';
import { HrService, Employee } from '../../../../core/services/hr.service';
import { AlertService } from '../../../../core/services/alert.service'; 

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
  private hrService = inject(HrService);
  private alertService = inject(AlertService);

  orderData = signal<any>(null);
  employees = signal<Employee[]>([]); // 👈 2. قائمة الموظفين
  isSubmitting = signal<boolean>(false);
  poId: number = 0;

  receiptForm: FormGroup = this.fb.group({
    receivedById: ['', Validators.required],
    notes: [''],
    items: this.fb.array([])
  });

  ngOnInit() {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.poId) {
      this.loadOrderDetails();
    }
    this.loadEmployees();
  }

  get itemsArray(): FormArray {
    return this.receiptForm.get('items') as FormArray;
  }

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
      receivedById: Number(formValue.receivedById),
      notes: formValue.notes || '',
      items: formValue.items.map((i: any) => ({
        poItemId: i.poItemId,
        receivedQuantity: Number(i.receivedQuantity),
        rejectedQuantity: Number(i.rejectedQuantity)
      }))
    };

    console.log('Sending Receipt:', command);
    console.log('Full Details:', JSON.stringify(command, null, 2));

    this.purchasingService.createGoodsReceipt(command).subscribe({
      next: () => {
        this.alertService.success('Goods Received Successfully! Inventory Updated.');
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        console.error('Receipt Error:', err);
        console.error('Error Details:', err.error);
        const msg = err.error?.message || err.error?.title || 'Unknown Error';
        this.alertService.error(`Error receiving goods: ${msg}`);;
        this.isSubmitting.set(false);
      }
    });
  }
}