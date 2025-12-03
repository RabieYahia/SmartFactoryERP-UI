import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SalesService, SalesOrderListDto } from '../../services/sales';

@Component({
  selector: 'app-sales-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderListComponent implements OnInit {
  private salesService = inject(SalesService);

  orders = signal<SalesOrderListDto[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.salesService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
// دالة لتنزيل الملف
downloadPdf(orderId: number) {
  // افترضنا اننا بنجيب الفاتورة بمعلومية الطلب، أو ممكن نعمل زرار في قائمة الفواتير
  // هنا مثال عام:
  
  this.salesService.downloadInvoice(orderId).subscribe({
    next: (blob) => {
      // كود الجافاسكريبت السحري لتنزيل الملف
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderId}.pdf`; // اسم الملف
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => alert('Error downloading PDF')
  });
}
  onConfirm(id: number) {
    if (!confirm('Confirming this order will DEDUCT stock immediately. Continue?')) return;

    this.isLoading.set(true);
    this.salesService.confirmOrder(id).subscribe({
      next: () => {
        alert('✅ Order Confirmed! Stock Reserved.');
        this.loadOrders(); // تحديث القائمة
      },
      error: (err) => {
        console.error(err);
        // عرض رسالة الخطأ من السيرفر (مهم جداً هنا عشان لو الرصيد غير كافي)
        const msg = err.error?.message || 'Failed to confirm. Check stock levels.';
        alert(`❌ Error: ${msg}`);
        this.isLoading.set(false);
      }
    });
  }
}