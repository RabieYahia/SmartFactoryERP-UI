import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Material } from '../models/material.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // 1. حقن الـ HttpClient بالطريقة الحديثة
  private http = inject(HttpClient);
  
  // 2. رابط الـ Backend (تأكد من البورت 7093)
  private apiUrl = 'https://localhost:7093/api/v1/inventory';

  // =========================
  // CRUD Operations
  // =========================

  // 1. جلب كل المواد (Read All)
  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/materials`);
  }

  // 2. جلب مادة واحدة (Read One) - لصفحة التعديل
  getMaterialById(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/materials/${id}`);
  }

  // 3. إضافة مادة جديدة (Create)
  createMaterial(material: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/materials`, material);
  }

  // 4. تعديل مادة موجودة (Update)
  updateMaterial(id: number, material: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/materials/${id}`, material);
  }

  // 5. حذف مادة (Delete)
  // ... (if implemented)

  // 6. جلب المنتجات النهائية فقط
  getFinishedGoods(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/materials/finished-goods`);
  }

  // 7. جلب المواد الخام فقط
  getRawMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/materials/raw-materials`);
  }
  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/materials/${id}`);
  }
}