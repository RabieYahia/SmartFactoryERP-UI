import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Department, Employee } from '../models/hr.model';
import { AttendanceLog } from '../models/hr.model'; // Import
@Injectable({
  providedIn: 'root'
})
export class HrService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7093/api/v1/hr';

  // --- Departments ---
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`);
  }

  createDepartment(dept: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/departments`, dept);
  }

  // --- Employees ---
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }

  createEmployee(emp: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/employees`, emp);
  }
  toggleAttendance(employeeId: number): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.apiUrl}/attendance/toggle`, { employeeId });
}
getTodayAttendance(): Observable<AttendanceLog[]> {
  return this.http.get<AttendanceLog[]>(`${this.apiUrl}/attendance/today`);
}
}

// 👇 التعديل هنا: إضافة كلمة type
export type { Employee };