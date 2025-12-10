import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchasingService, PurchaseOrderListDto } from '../../services/purchasing';
import { AlertService } from '../../../../core/services/alert.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderListComponent implements OnInit {
  private purchasingService = inject(PurchasingService);
  private alertService = inject(AlertService);
  private confirmService = inject(ConfirmService);

  orders = signal<PurchaseOrderListDto[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.purchasingService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // دالة تأكيد الطلب
  onConfirm(orderId: number) {
    this.confirmService.warning(
      'Are you sure you want to CONFIRM this order? This action cannot be undone.',
      () => this.proceedConfirm(orderId)
    );
  }

  private proceedConfirm(orderId: number) {

    this.isLoading.set(true); // إظهار تحميل بسيط
    this.purchasingService.confirmOrder(orderId).subscribe({
      next: () => {
        this.alertService.success('Order Confirmed Successfully!');
        this.loadOrders(); // إعادة تحميل القائمة لتحديث الحالة
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Failed to confirm order. Make sure it has items.');
        this.isLoading.set(false);
      }
    });
  }
}