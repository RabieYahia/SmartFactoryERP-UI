import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PurchasingService } from '../../services/purchasing';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html'
})
export class OrderDetailsComponent implements OnInit {
  // حقن الخدمات
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private purchasingService = inject(PurchasingService);

  // تعريف الـ Signals
  order = signal<any>(null);      // لتخزين بيانات الطلب
  isLoading = signal<boolean>(true); // حالة التحميل

  ngOnInit() {
    // التقاط الـ ID من الرابط عند فتح الصفحة
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderDetails(Number(id));
    }
  }

  // دالة تحميل البيانات
  loadOrderDetails(id: number) {
    this.isLoading.set(true);

    // ✅ هنا استخدمنا الاسم الصح الموجود في السيرفيس (getOrderById)
    this.purchasingService.getOrderById(id).subscribe({
      next: (data: any) => {
        console.log('📄 Order Details:', data); // عشان تشوف الداتا في الكونسول
        this.order.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('❌ Error loading order:', err);
        this.isLoading.set(false);
      }
    });
  }

  // دالة اعتماد الطلب
  confirmOrder() {
    if (confirm('Are you sure you want to confirm this order?')) {
      const id = this.order().id;

      this.isLoading.set(true);
      this.purchasingService.confirmOrder(id).subscribe({
        next: () => {
          alert('✅ Order Confirmed Successfully!');
          // إعادة تحميل البيانات عشان الحالة تتغير لـ Confirmed
          this.loadOrderDetails(id);
        },
        error: (err: any) => {
          console.error(err);
          alert('❌ Failed to confirm order');
          this.isLoading.set(false);
        }
      });
    }
  }
}
