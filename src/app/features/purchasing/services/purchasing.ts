import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import { CreatePurchaseOrderCommand } from '../models/purchase-order.model';

// ==========================================
// 1. Interfaces Definitions
// ==========================================

// ✅ 1. واجهة القائمة المختصرة (موجودة عندك)
export interface PurchaseOrderListDto {
  id: number;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string; // ضفت دي عشان بنحتاجها في العرض
  totalAmount: number;
  status: string;
}

// ✅ 2. واجهة تفاصيل الصنف (للصفحة الجديدة)
export interface PurchaseOrderItemDto {
  id: number;
  materialId: number;
  materialName: string;
  materialCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ✅ 3. واجهة تفاصيل الطلب بالكامل (Header + Items)
export interface PurchaseOrderDetailDto {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: string;
  totalAmount: number;
  items: PurchaseOrderItemDto[]; // القائمة اللي هنعرضها في الجدول
}

// DTOs for Goods Receipt
export interface CreateGoodsReceiptItemDto {
  poItemId: number;
  receivedQuantity: number;
  rejectedQuantity: number;
}

export interface CreateGoodsReceiptCommand {
  purchaseOrderId: number;
  receivedById: string; // عدلتها لـ string لأن الـ User ID في الـ Identity بيكون string عادة
  notes: string;
  items: CreateGoodsReceiptItemDto[];
}

// ==========================================
// 2. The Service Logic
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class PurchasingService {
  private http = inject(HttpClient);

  // رابط الباك إند
  private apiUrl = 'https://sfe.runasp.net/api/v1/purchasing';

  // -------------------------
  // Suppliers Methods
  // -------------------------
  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/suppliers`);
  }

  createSupplier(supplier: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/suppliers`, supplier);
  }

  // Get single supplier by id
  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/suppliers/${id}`);
  }

  // Update existing supplier
  updateSupplier(id: number, supplier: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/suppliers/${id}`, supplier);
  }

  // -------------------------
  // Purchase Orders Methods
  // -------------------------
  createPurchaseOrder(command: CreatePurchaseOrderCommand): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/orders`, command);
  }

  getOrders(): Observable<PurchaseOrderListDto[]> {
    return this.http.get<PurchaseOrderListDto[]>(`${this.apiUrl}/orders`);
  }

  // ✅ جلب تفاصيل الطلب بالكامل (استخدمنا Interface الجديد هنا)
  // لاحظ: سميتها getOrderById زي ما هي عندك، بس غيرت النوع لـ PurchaseOrderDetailDto
  getOrderById(id: number): Observable<PurchaseOrderDetailDto> {
    return this.http.get<PurchaseOrderDetailDto>(`${this.apiUrl}/orders/${id}`);
  }

  confirmOrder(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/orders/${id}/confirm`, {});
  }

  // -------------------------
  // Goods Receipt Methods
  // -------------------------
  createGoodsReceipt(command: CreateGoodsReceiptCommand): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/goods-receipt`, command);
  }
}
