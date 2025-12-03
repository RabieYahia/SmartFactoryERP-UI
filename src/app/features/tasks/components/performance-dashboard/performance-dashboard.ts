import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksService } from '../../services/tasks';
import { EmployeePerformance } from '../../models/performance.model';

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance-dashboard.html',
  styleUrl: './performance-dashboard.css'
})
export class PerformanceDashboardComponent implements OnInit {
  private tasksService = inject(TasksService);

  report = signal<EmployeePerformance[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.tasksService.getPerformance().subscribe({
      next: (data) => {
        this.report.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // دالة مساعدة لتلوين التقييم
  getBadgeClass(label: string): string {
    if (label.includes('Excellent')) return 'badge-excellent';
    if (label.includes('Good')) return 'badge-good';
    if (label.includes('Average')) return 'badge-average';
    return 'badge-poor';
  }
}