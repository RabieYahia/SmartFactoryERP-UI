import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // عشان زرار الإضافة يشتغل
import { PurchasingService } from '../../services/purchasing';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, RouterLink], // استيراد الأدوات اللازمة
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.css'
})
export class SupplierListComponent implements OnInit {
  // 1. حقن السيرفس
  private purchasingService = inject(PurchasingService);

  // 2. تعريف الـ Signals (أحدث طريقة لإدارة الحالة)
  suppliers = signal<Supplier[]>([]); // مصفوفة الموردين
  isLoading = signal<boolean>(true);  // حالة التحميل

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.purchasingService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers.set(data); // تحديث الإشارة بالبيانات
        this.isLoading.set(false); // وقف التحميل
      },
      error: (err) => {
        console.error('Error fetching suppliers:', err);
        this.isLoading.set(false);
      }
    });
  }
}