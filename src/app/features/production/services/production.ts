import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * INTERFACE: OrderItemInputDto
 * ✅ جديد: DTO للخامة الواحدة المرسلة مع Create Order
 */
export interface OrderItemInputDto {
  materialId: number; // Raw material ID
  quantity: number;   // الكمية الإجمالية المطلوبة
}

/**
 * INTERFACE: CreateProductionOrderCommand
 * Structure for creating new production orders
 */
export interface CreateProductionOrderCommand {
  productId: number;
  quantity: number;
  startDate: string;
  notes: string;
  priority?: 'High' | 'Medium' | 'Low';

  // ✅✅ الإضافة الجديدة: تمرير الخامات فوراً (لإلغاء الاعتماد على BOM مسجلة) ✅✅
  items: OrderItemInputDto[];
}


// Interfaces الأخرى (بدون تعديل جوهري)

/**
 * INTERFACE: BomComponentDto
 * Represents a single component in the BOM
 */
export interface BomComponentDto {
  componentId: number;
  quantity: number;
}

/**
 * INTERFACE: CreateBOMCommand
 * Structure for creating Bill of Materials
 */
export interface CreateBOMCommand {
  productId: number;
  components: BomComponentDto[];
}

/**
 * INTERFACE: UpdateOrderItemDto
 * يستخدم لتحديث كميات الخامات داخل الأوردر
 */
export interface UpdateOrderItemDto {
  id: number;       // ID الصنف داخل الأوردر (ليس ID الخامة)
  quantity: number; // الكمية الجديدة
}

/**
 * INTERFACE: ProductionOrderDto
 * Data transfer object representing a production order
 */
export interface ProductionOrderDto {
  id: number;
  orderNumber: string;
  productId: number;
  productName: string;
  quantity: number;
  status: string;
  startDate: string;
  endDate?: string | null;
  notes?: string;
  createdDate?: string;
  priority?: 'High' | 'Medium' | 'Low';
  progress?: number;
  items?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7093/api/v1/production';

  // --- BOM Operations ---
  getBomByProductId(productId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bom/${productId}`);
  }

  createBOM(command: CreateBOMCommand): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/bom`, command);
  }

  // --- Order Operations ---

  // ✅✅ دالة إنشاء الأوردر: تم التعديل على الـ Interface لتقبل الخامات
  createOrder(command: CreateProductionOrderCommand): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/orders`, command);
  }

  getOrders(): Observable<ProductionOrderDto[]> {
    return this.http.get<ProductionOrderDto[]>(`${this.apiUrl}/orders`);
  }

  getOrderById(id: number): Observable<ProductionOrderDto> {
    return this.http.get<ProductionOrderDto>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderItems(orderId: number, items: UpdateOrderItemDto[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/${orderId}/items`, items);
  }

  /**
   * Start Production - يستدعي StartProductionCommand في الباك إند
   */
  startOrder(id: number): Observable<void> {
    // الـ Body الفارغ {} ضروري لإرسال POST
    return this.http.post<void>(`${this.apiUrl}/orders/${id}/start`, {});
  }

  completeProduction(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/orders/${id}/complete`, {});
  }
}
