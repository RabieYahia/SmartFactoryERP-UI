import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductionService, ProductionOrderDto } from '../../services/production';

@Component({
  selector: 'app-production-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit {
  // ===== DEPENDENCY INJECTION =====
  private productionService = inject(ProductionService);

  // ===== STATE SIGNALS =====
  orders = signal<ProductionOrderDto[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.productionService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => { // ✅ Added type any
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  onStart(id: number) {
    if (!confirm('Start production? This will DEDUCT raw materials from inventory.')) {
      return;
    }

    this.isLoading.set(true);

    // ✅✅ التصحيح هنا: استخدام startOrder بدلاً من startProduction ✅✅
    this.productionService.startOrder(id).subscribe({
      next: () => {
        alert('🚀 Production Started! Materials deducted from inventory.');
        this.loadOrders();
      },
      error: (err: any) => { // ✅ Added type any
        console.error('❌ Start Production Error:', err);

        // استخراج رسالة الخطأ وعرضها
        const errorMessage = err.error?.message || 'Failed to start production. Check raw materials availability.';
        alert(`❌ Error: ${errorMessage}`);

        this.isLoading.set(false);
      }
    });
  }

  onComplete(id: number) {
    if (!confirm('Complete production? This will ADD finished goods to inventory.')) {
      return;
    }

    this.isLoading.set(true);

    this.productionService.completeProduction(id).subscribe({
      next: () => {
        alert('✅ Production Completed! Finished goods added to stock.');
        this.loadOrders();
      },
      error: (err: any) => { // ✅ Added type any
        console.error(err);
        alert('❌ Error completing production. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
