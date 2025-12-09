import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardService } from '../../services/dashboard';
import { DashboardStats } from '../../../../core/models/dashboard-stats.model';

interface QuickAction {
  icon: string;
  label: string;
  route: string;
  color: string;
  bgColor: string;
}

interface RecentActivity {
  icon: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, RouterLink],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private refreshInterval: any;

  // Stats Signals
  stats = signal<DashboardStats | null>(null);
  
  // Charts Data Signals
  salesChartData = signal<any[]>([]);
  productsChartData = signal<any[]>([]);
  statusChartData = signal<any[]>([]);

  // UI State
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  lastUpdated = signal<Date>(new Date());
  isRefreshing = signal<boolean>(false);

  // Quick Actions
  quickActions = signal<QuickAction[]>([
    {
      icon: 'bi-cart-plus',
      label: 'New Purchase',
      route: '/purchasing/create-order',
      color: 'text-primary',
      bgColor: 'bg-primary-subtle'
    },
    {
      icon: 'bi-gear-wide-connected',
      label: 'Start Production',
      route: '/production/wizard',
      color: 'text-success',
      bgColor: 'bg-success-subtle'
    },
    {
      icon: 'bi-receipt',
      label: 'Create Order',
      route: '/sales/create-order',
      color: 'text-warning',
      bgColor: 'bg-warning-subtle'
    },
    {
      icon: 'bi-box-seam',
      label: 'Add Material',
      route: '/inventory/create',
      color: 'text-info',
      bgColor: 'bg-info-subtle'
    }
  ]);

  // Recent Activities (mock data - replace with real API later)
  recentActivities = signal<RecentActivity[]>([
    {
      icon: 'bi-check-circle-fill',
      title: 'Production Order Completed',
      description: 'Order #PO-2024-003 completed successfully',
      time: '5 minutes ago',
      type: 'success'
    },
    {
      icon: 'bi-exclamation-triangle-fill',
      title: 'Low Stock Alert',
      description: 'SteelSheets 10mm below reorder level',
      time: '15 minutes ago',
      type: 'warning'
    },
    {
      icon: 'bi-cart-check-fill',
      title: 'Purchase Order Received',
      description: 'Received 100 units of Raw Material',
      time: '1 hour ago',
      type: 'info'
    }
  ]);

  // Chart Config
  colorScheme: any = { 
    domain: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0'] 
  };
  
  // Responsive chart dimensions
  chartView = signal<[number, number]>([700, 300]);

  ngOnInit() {
    this.loadAllData();
    this.startAutoRefresh();
    this.updateChartDimensions();
    
    // Listen to window resize
    window.addEventListener('resize', () => this.updateChartDimensions());
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    window.removeEventListener('resize', () => this.updateChartDimensions());
  }

  updateChartDimensions() {
    const width = window.innerWidth;
    if (width < 768) {
      this.chartView.set([300, 250]);
    } else if (width < 1024) {
      this.chartView.set([500, 300]);
    } else {
      this.chartView.set([700, 300]);
    }
  }

  startAutoRefresh() {
    // Auto-refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, 5 * 60 * 1000);
  }

  refreshData() {
    this.isRefreshing.set(true);
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    // 1. Load Stats
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        const mappedStats: DashboardStats = {
          ...data,
          criticalRawMaterials: data.criticalRawMaterials || []
        };
        this.stats.set(mappedStats);
        this.lastUpdated.set(new Date());
      },
      error: (err) => {
        console.error('❌ Stats Error:', err);
        this.hasError.set(true);
        this.errorMessage.set('Failed to load statistics');
      }
    });

    // 2. Load Charts Data
    this.dashboardService.getChartsData().subscribe({
      next: (data) => {
        // Line Chart (Sales Trend)
        const trend = [
          {
            name: "Sales",
            series: data.salesTrend.map(d => ({
              name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
              value: d.totalAmount
            }))
          }
        ];
        this.salesChartData.set(trend);

        // Bar Chart (Top Products)
        const products = data.topProducts.map(p => ({
          name: p.productName,
          value: p.quantitySold
        }));
        this.productsChartData.set(products);

        // Pie Chart (Order Status)
        const statuses = data.ordersStatus.map(s => ({
          name: s.status,
          value: s.count
        }));
        this.statusChartData.set(statuses);

        this.isLoading.set(false);
        this.isRefreshing.set(false);
      },
      error: (err) => {
        console.error('❌ Charts Error:', err);
        this.hasError.set(true);
        this.errorMessage.set('Failed to load charts data');
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      }
    });
  }

  getActivityBadgeClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-success-subtle text-success border border-success';
      case 'warning': return 'bg-warning-subtle text-warning border border-warning';
      case 'danger': return 'bg-danger-subtle text-danger border border-danger';
      case 'info': return 'bg-info-subtle text-info border border-info';
      default: return 'bg-secondary-subtle text-secondary border border-secondary';
    }
  }

  getKpiTrend(current: number, previous: number): { value: number, isPositive: boolean } {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0
    };
  }
}