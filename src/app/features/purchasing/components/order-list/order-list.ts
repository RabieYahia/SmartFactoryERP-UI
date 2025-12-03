import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchasingService, PurchaseOrderListDto } from '../../services/purchasing';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderListComponent implements OnInit {
  private purchasingService = inject(PurchasingService);

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
    if (!confirm('Are you sure you want to CONFIRM this order? This action cannot be undone.')) return;

    this.isLoading.set(true); // إظهار تحميل بسيط
    this.purchasingService.confirmOrder(orderId).subscribe({
      next: () => {
        alert('✅ Order Confirmed Successfully!');
        this.loadOrders(); // إعادة تحميل القائمة لتحديث الحالة
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to confirm order. Make sure it has items.');
        this.isLoading.set(false);
      }
    });
  }
}