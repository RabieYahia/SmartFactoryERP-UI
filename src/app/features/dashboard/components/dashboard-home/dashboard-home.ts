import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard';
import { DashboardStats } from '../../models/dashboard-stats.model';

/**
 * COMPONENT: DashboardHomeComponent
 * 
 * Purpose:
 * - Display key performance indicators (KPIs) and business metrics
 * - Show factory production statistics with trends
 * - Provide quick insights into operational performance
 * 
 * Displayed Metrics:
 * - Total Production (revenue or quantity)
 * - Active Machines (count of operational equipment)
 * - Orders in Progress (active work)
 * - Efficiency Rating (performance metric)
 * 
 * Features:
 * - Real-time data fetching from dashboard service
 * - Responsive card grid layout
 * - Trend indicators (up/down arrows with percentage)
 * - Loading spinner while fetching data
 * - Color-coded trend indicators (green for increase, red for decrease)
 * 
 * No functional changes - styling and layout only.
 */
@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHomeComponent implements OnInit {
  // ===== DEPENDENCY INJECTION =====
  // Service for fetching dashboard statistics and KPIs
  private dashboardService = inject(DashboardService);

  // ===== STATE SIGNALS =====
  // Dashboard statistics data (null until loaded)
  stats = signal<DashboardStats | null>(null);
  
  // Loading indicator while fetching data
  isLoading = signal<boolean>(true);

  /**
   * ANGULAR LIFECYCLE HOOK
   * Called when component is initialized
   * Triggers data fetching from backend
   */
  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
}