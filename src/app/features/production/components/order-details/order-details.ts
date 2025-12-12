import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // ✅ ضفنا RouterLink
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProductionService, ProductionOrderDto, UpdateOrderItemDto } from '../../services/production';
import { InventoryService } from '../../../inventory/services/inventory';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // ✅ RouterLink مهم للزرار
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productionService = inject(ProductionService);
  private inventoryService = inject(InventoryService);

  orderId: number = 0;
  orderData = signal<ProductionOrderDto | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  // الفورم اللي شايل خامات الأوردر
  bomForm: FormGroup = this.fb.group({
    items: this.fb.array([])
  });

  get itemsArr(): FormArray {
    return this.bomForm.get('items') as FormArray;
  }

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.orderId) {
      this.loadOrderData();
    }
  }

  loadOrderData() {
    this.isLoading.set(true);

    this.productionService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.orderData.set(order);

        // نجيب أرصدة المخازن الحالية عشان نقارن
        this.inventoryService.getMaterials().subscribe(materials => {

          this.itemsArr.clear();

          if (order.items && order.items.length > 0) {
            order.items.forEach((item: any) => {
              // بنشوف الخامة دي رصيدها كام في المخزن دلوقتي
              const stockItem = materials.find(m => m.id === item.materialId || m.id === item.componentId);
              const currentStock = stockItem ? stockItem.currentStockLevel : 0;

              this.itemsArr.push(this.fb.group({
                id: [item.id], // ID السطر في الأوردر
                materialName: [item.materialName || item.componentName],
                quantity: [item.quantity, [Validators.required, Validators.min(0.01)]],
                currentStock: [currentStock],
                unit: [stockItem?.unitOfMeasure || 'Unit']
              }));
            });
          }

          this.isLoading.set(false);
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // حفظ تعديلات الـ BOM
  saveChanges() {
    if (this.bomForm.invalid) return;
    this.isSaving.set(true);

    const updates: UpdateOrderItemDto[] = this.itemsArr.controls.map((ctrl: any) => ({
      id: ctrl.get('id')?.value,
      quantity: Number(ctrl.get('quantity')?.value)
    }));

    this.productionService.updateOrderItems(this.orderId, updates).subscribe({
      next: () => {
        alert('✅ Order BOM updated successfully!');
        this.isSaving.set(false);
        this.loadOrderData();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to update items.');
        this.isSaving.set(false);
      }
    });
  }

  // بدء التصنيع
  startProduction() {
    const hasShortage = this.itemsArr.controls.some((c: any) =>
      c.get('quantity')?.value > c.get('currentStock')?.value
    );

    if (hasShortage) {
      const confirmStart = confirm('⚠️ Warning: Shortage in stock! Do you want to force start?');
      if (!confirmStart) return;
    } else {
      if (!confirm('🚀 Start production? Materials will be deducted.')) return;
    }

    this.productionService.startOrder(this.orderId).subscribe({
      next: () => {
        alert('✅ Production Started!');
        this.loadOrderData();
      },
      error: (err) => alert(err.error?.message || 'Failed to start.')
    });
  }

  // إنهاء التصنيع
  completeProduction() {
    if (!confirm('✅ Is production finished? Goods will be added to stock.')) return;

    this.productionService.completeProduction(this.orderId).subscribe({
      next: () => {
        alert('🎉 Order Completed!');
        this.router.navigate(['/production/orders']);
      },
      error: (err) => alert(err.error?.message || 'Failed to complete.')
    });
  }
}
