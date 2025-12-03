import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface CreateBOMCommand {
  productId: number;    // المنتج النهائي
  componentId: number;  // المادة الخام
  quantity: number;     // الكمية المطلوبة
}
export interface CreateProductionOrderCommand {
  productId: number;
  quantity: number;
  startDate: string;
  notes: string;
}
export interface ProductionOrderDto {
  id: number;
  orderNumber: string;
  productName: string;
  quantity: number;
  status: string; // Planned, Started, Completed
  startDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7093/api/v1/production';

  // إنشاء BOM
  createBOM(command: CreateBOMCommand): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/bom`, command);
  }
// 2. إنشاء أمر إنتاج
  createOrder(command: CreateProductionOrderCommand): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/orders`, command);
  }
  // 3. جلب قائمة الأوامر (للمرحلة القادمة)
  getOrders(): Observable<ProductionOrderDto[]> {
    return this.http.get<ProductionOrderDto[]>(`${this.apiUrl}/orders`);
  }
  // 4. بدء التصنيع (سحب المواد)
  startProduction(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/orders/${id}/start`, {});
  }
  // 5. إنهاء التصنيع (إضافة المنتج)
  completeProduction(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/orders/${id}/complete`, {});
  }
}