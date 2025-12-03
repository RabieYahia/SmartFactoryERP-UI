import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductionService, ProductionOrderDto } from '../../services/production';

@Component({
  selector: 'app-production-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderListComponent implements OnInit {
  private productionService = inject(ProductionService);

  orders = signal<ProductionOrderDto[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.productionService.getOrders().subscribe({
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

  // 1. دالة بدء التصنيع
  onStart(id: number) {
    if (!confirm('Start production? This will DEDUCT raw materials from inventory.')) return;

    this.isLoading.set(true);
    this.productionService.startProduction(id).subscribe({
      next: () => {
        alert('🚀 Production Started! Materials deducted.');
        this.loadOrders(); // تحديث الحالة
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Failed to start. Check raw materials stock.';
        alert(`❌ Error: ${msg}`);
        this.isLoading.set(false);
      }
    });
  }

  // 2. دالة إنهاء التصنيع
  onComplete(id: number) {
    if (!confirm('Complete production? This will ADD finished goods to inventory.')) return;

    this.isLoading.set(true);
    this.productionService.completeProduction(id).subscribe({
      next: () => {
        alert('✅ Production Completed! Finished goods added to stock.');
        this.loadOrders(); // تحديث الحالة
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error completing production.');
        this.isLoading.set(false);
      }
    });
  }
}