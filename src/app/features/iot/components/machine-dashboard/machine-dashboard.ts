import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../../core/services/signalr.service';

@Component({
  selector: 'app-machine-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './machine-dashboard.html',
  styleUrl: './machine-dashboard.css'
})
export class MachineDashboardComponent {
  public signalR = inject(SignalrService);

  // دالة مساعدة لتحويل رقم الحالة لنص
  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Running';
      case 1: return 'Idle';
      case 2: return 'Stopped';
      default: return 'Unknown';
    }
  }

  // دالة مساعدة لتحديد لون الحالة (CSS Class)
  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'status-running';
      case 1: return 'status-idle';
      case 2: return 'status-stopped';
      default: return '';
    }
  }
}