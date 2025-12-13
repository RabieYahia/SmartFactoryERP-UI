import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../../core/services/signalr.service'; // خدمة IoT
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-production-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './production-monitor.html',
  styleUrl: './production-monitor.css'
})
export class ProductionMonitorComponent implements OnInit, OnDestroy {
  public signalR = inject(SignalrService); // IoT Data
  private http = inject(HttpClient);
  
  // Data Signals
  presentWorkers = signal<number>(0);
  activeOrders = signal<any[]>([]);
  
  // Auto-refresh subscription (لتحديث نسبة الوقت كل دقيقة)
  private refreshSub!: Subscription;

  ngOnInit() {
    // 1. بدء الـ IoT
    // (يتم تلقائياً في السيرفس لو وضعت الكود في الـ Constructor، أو استدعه هنا)
    
    // 2. جلب البيانات الأولية
    this.loadMonitorData();

    // 3. تحديث البيانات كل 30 ثانية (عشان لو حد سجل حضور جديد أو أمر جديد بدأ)
    this.refreshSub = interval(30000).subscribe(() => this.loadMonitorData());
  }

  loadMonitorData() {
    this.http.get<any>('https://localhost:7093/api/v1/dashboard/production-monitor')
      .subscribe(data => {
        this.presentWorkers.set(data.presentWorkersCount);
        this.activeOrders.set(data.activeOrders);
      });
  }

  ngOnDestroy() {
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  // Helper for progress color
  getProgressColor(percent: number): string {
    if (percent < 50) return 'bg-success';
    if (percent < 80) return 'bg-warning';
    return 'bg-danger'; // Late!
  }
}