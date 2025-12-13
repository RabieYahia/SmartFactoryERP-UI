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

  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/departments/${id}`);
  }

  createDepartment(dept: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/departments`, dept);
  }

  updateDepartment(id: number, dept: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/departments/${id}`, dept);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/departments/${id}`);
  }

  // --- Employees ---
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employees/${id}`);
  }

  createEmployee(emp: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/employees`, emp);
  }

  updateEmployee(id: number, emp: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/employees/${id}`, emp);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/employees/${id}`);
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