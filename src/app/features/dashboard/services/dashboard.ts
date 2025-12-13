import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/dashboard-stats.model';
import { DashboardCharts } from '../../../core/models/dashboard-stats.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'https://sfe.runasp.net/api/v1/dashboard';

getStats(): Observable<DashboardStats> {
  return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
}

getChartsData(): Observable<DashboardCharts> {
  return this.http.get<DashboardCharts>(`${this.apiUrl}/charts`);
}
}