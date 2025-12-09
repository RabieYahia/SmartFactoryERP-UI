import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductionService, ProductionOrderDto } from '../../services/production';

interface ProductionMetrics {
  activeOrders: number;
  completedToday: number;
  inProgress: number;
  efficiency: number;
}

@Component({
  selector: 'app-production-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './production-dashboard.html',
  styleUrl: './production-dashboard.css'
})
export class ProductionDashboardComponent implements OnInit {
  private productionService = inject(ProductionService);

  orders = signal<ProductionOrderDto[]>([]);
  metrics = signal<ProductionMetrics>({
    activeOrders: 0,
    completedToday: 0,
    inProgress: 0,
    efficiency: 0
  });
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);
    this.productionService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.calculateMetrics(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading production data', err);
        this.isLoading.set(false);
      }
    });
  }

  calculateMetrics(orders: ProductionOrderDto[]) {
    const activeOrders = orders.filter(o => o.status === 'Planned' || o.status === 'Started').length;
    const inProgress = orders.filter(o => o.status === 'Started').length;
    const completedToday = orders.filter(o => {
      if (!o.endDate || o.status !== 'Completed') return false;
      const today = new Date().toDateString();
      const completedDate = new Date(o.endDate).toDateString();
      return today === completedDate;
    }).length;

    // Calculate efficiency (completed vs total)
    const totalOrders = orders.length || 1;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;
    const efficiency = Math.round((completedOrders / totalOrders) * 100);

    this.metrics.set({
      activeOrders,
      completedToday,
      inProgress,
      efficiency
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Planned': return 'badge bg-info';
      case 'Started': return 'badge bg-warning';
      case 'Completed': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  getProgressPercentage(order: ProductionOrderDto): number {
    // Use progress from backend if available, otherwise calculate based on status
    if (order.progress !== undefined) return order.progress;
    if (order.status === 'Completed') return 100;
    if (order.status === 'Started') return 50;
    if (order.status === 'Planned') return 0;
    return 0;
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'text-danger fw-bold';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-secondary';
      default: return '';
    }
  }
}
