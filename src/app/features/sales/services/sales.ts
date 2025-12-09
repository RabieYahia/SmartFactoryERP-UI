import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { CreateSalesOrderCommand } from '../models/sales-order.model';

// 1. تعريف الواجهة خارج الكلاس
export interface SalesOrderListDto {
  id: number;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  // 2. حقن الـ HttpClient
  private http = inject(HttpClient);
  
  // 3. رابط الـ Backend (تأكد من البورت)
  private apiUrl = 'https://localhost:7093/api/v1/sales';

  // =========================
  // Customers Methods
  // =========================
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
  }

  createCustomer(customer: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/customers`, customer);
  }

  // =========================
  // Sales Orders Methods
  // =========================
  
  // إنشاء طلب جديد
  createSalesOrder(command: CreateSalesOrderCommand): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/orders`, command);
  }

  // جلب قائمة الطلبات
  getOrders(): Observable<SalesOrderListDto[]> {
    return this.http.get<SalesOrderListDto[]>(`${this.apiUrl}/orders`);
  }

  // تأكيد الطلب (حجز المخزون)
  confirmOrder(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/orders/${id}/confirm`, {});
  }

  // =========================
  // Invoices Methods
  // =========================
  
  // إنشاء فاتورة من طلب مؤكد
  generateInvoice(command: { salesOrderId: number }): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/invoices`, command);
  }

  // تحميل الفاتورة كـ PDF
  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/invoices/${id}/pdf`, { responseType: 'blob' });
  }
}