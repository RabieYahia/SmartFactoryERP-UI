import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts'; // 👈 استيراد المكتبة
import { DashboardService } from '../../services/dashboard';
import { DashboardStats } from '../../../../core/models/dashboard-stats.model';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, NgxChartsModule], // 👈 لا تنسَ إضافتها هنا
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHomeComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  // Stats Signals (القديم)
  stats = signal<DashboardStats | null>(null);
  
  // Charts Data Signals (الجديد)
  salesChartData = signal<any[]>([]);
  productsChartData = signal<any[]>([]);
  statusChartData = signal<any[]>([]);

  isLoading = signal<boolean>(true);

  // خيارات الرسوم البيانية (Config)
  colorScheme: any = { domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'] };
  view: [number, number] = [700, 300]; // الأبعاد الافتراضية

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading.set(true);

    // 1. تحميل الإحصائيات الرقمية
    this.dashboardService.getStats().subscribe({
      next: (data) => this.stats.set(data)
    });

    // 2. تحميل بيانات الرسوم البيانية
    this.dashboardService.getChartsData().subscribe({
      next: (data) => {
        // تحويل البيانات لتناسب NGX-Charts

        // أ) Line Chart (Sales Trend)
        const trend = [
          {
            name: "Sales",
            series: data.salesTrend.map(d => ({
              name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }), // يحول التاريخ لـ Mon, Tue
              value: d.totalAmount
            }))
          }
        ];
        this.salesChartData.set(trend);

        // ب) Bar Chart (Top Products)
        const products = data.topProducts.map(p => ({
          name: p.productName,
          value: p.quantitySold
        }));
        this.productsChartData.set(products);

        // ج) Pie Chart (Order Status)
        const statuses = data.ordersStatus.map(s => ({
          name: s.status,
          value: s.count
        }));
        this.statusChartData.set(statuses);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
}