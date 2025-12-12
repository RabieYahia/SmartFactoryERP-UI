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
  employees = signal<Employee[]>([]);
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
      error: (err) => {
        console.error('Error loading employees', err);
        this.alertService.error('Failed to load employees list.');
      }
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
      error: (err) => {
        console.error('Error loading order details:', err);
        this.alertService.error('Failed to load purchase order details.');
      }
    });
  }

  onSubmit() {
    if (this.receiptForm.invalid) {
      this.receiptForm.markAllAsTouched();
      this.alertService.warning('Please complete all required fields.');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.receiptForm.value;

    const command: CreateGoodsReceiptCommand = {
      purchaseOrderId: this.poId,
      receivedById: String(formValue.receivedById),
      notes: formValue.notes || '',
      items: formValue.items.map((i: any) => ({
        poItemId: i.poItemId,
        receivedQuantity: Number(i.receivedQuantity),
        rejectedQuantity: Number(i.rejectedQuantity)
      }))
    };

    console.log('🚀 Sending Goods Receipt:', command);
    console.log('Full Details:', JSON.stringify(command, null, 2));

    this.purchasingService.createGoodsReceipt(command).subscribe({
      next: (receiptId) => {
        this.alertService.success(`Goods Received Successfully! Receipt ID: ${receiptId}. Inventory Updated.`);
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        console.error('❌ Receipt Error:', err);
        console.error('Error Details:', err.error);

        let errorMsg = 'Failed to receive goods. Please try again.';

        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.error?.title) {
          errorMsg = err.error.title;
        } else if (typeof err.error === 'string') {
          errorMsg = err.error;
        }

        this.alertService.error(`Error: ${errorMsg}`);
        this.isSubmitting.set(false);
      }
    });
  }
}
