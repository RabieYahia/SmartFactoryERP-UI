import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeePerformance } from '../models/performance.model'; // تأكد من وجود هذا الملف

// تعريف واجهة المهمة
export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: string;   // 'Pending', 'InProgress', 'Completed'
  priority: string; // 'Low', 'Medium', 'High'
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7093/api/v1/tasks';

  // --- 1. إدارة المهام (CRUD) ---

  // جلب كل المهام
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // إنشاء مهمة جديدة
  createTask(task: any): Observable<number> {
    return this.http.post<number>(this.apiUrl, task);
  }

  // تغيير حالة المهمة (Start / Complete)
  // هذا هو الـ Endpoint "الجوكر" الذي يرسل الحالة كنص
  changeTaskStatus(id: number, status: 'Start' | 'Complete'): Observable<void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // نرسل النص داخل علامات تنصيص JSON
    return this.http.post<void>(`${this.apiUrl}/${id}/status`, JSON.stringify(status), { headers });
  }

  // --- 2. التقارير (Performance) ---

  getPerformance(): Observable<EmployeePerformance[]> {
    return this.http.get<EmployeePerformance[]>(`${this.apiUrl}/performance`);
  }
}