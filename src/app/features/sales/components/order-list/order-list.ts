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
        console.log('📦 Sales Orders Response:', data);
        console.log('First Order:', data[0]);
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading orders:', err);
        this.isLoading.set(false);
      }
    });
  }

  // دالة مساعدة لتحويل Status (يدعم رقم أو نص)
  getStatus(status: any): string {
    if (status === null || status === undefined) return 'unknown';
    
    // إذا كان رقم، حوله لنص
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'draft';
        case 1: return 'confirmed';
        case 2: return 'invoiced';
        default: return 'unknown';
      }
    }
    
    // إذا كان نص، حوله لحروف صغيرة
    return status.toString().toLowerCase();
  }

  // دالة لعرض اسم Status بشكل جميل
  getStatusLabel(status: any): string {
    const normalized = this.getStatus(status);
    switch (normalized) {
      case 'draft': return 'Draft';
      case 'confirmed': return 'Confirmed';
      case 'invoiced': return 'Invoiced';
      default: return 'Unknown';
    }
  }

  // إنشاء فاتورة وتحميلها
  generateAndDownloadInvoice(orderId: number) {
    if (!confirm('Generate invoice for this order?')) return;

    this.isLoading.set(true);
    
    // 1. إنشاء الفاتورة أولاً
    this.salesService.generateInvoice({ salesOrderId: orderId }).subscribe({
      next: (invoiceId) => {
        console.log('✅ Invoice created with ID:', invoiceId);
        alert(`✅ Invoice #${invoiceId} generated successfully!`);
        
        // 2. إعادة تحميل القائمة لتحديث الـ Status
        this.loadOrders();
        
        // 3. تحميل الـ PDF بعد ثانية (لإعطاء Backend وقت لإنشاء الملف)
        setTimeout(() => {
          this.downloadInvoicePdf(invoiceId);
        }, 500);
      },
      error: (err) => {
        console.error('❌ Generate Invoice Error:', err);
        
        // استخراج رسالة الخطأ
        let errorMsg = 'Failed to generate invoice.';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.error?.title) {
          errorMsg = err.error.title;
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        alert(`❌ Error: ${errorMsg}`);
        this.isLoading.set(false);
      }
    });
  }

  // تحميل PDF لفاتورة موجودة
  downloadInvoicePdf(invoiceId: number) {
    console.log('📥 Downloading PDF for invoice:', invoiceId);
    
    this.salesService.downloadInvoice(invoiceId).subscribe({
      next: (blob) => {
        console.log('✅ PDF received, size:', blob.size);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${invoiceId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Download PDF Error:', err);
        alert(`❌ Error downloading PDF. Invoice #${invoiceId} was created but PDF generation failed.`);
        this.isLoading.set(false);
      }
    });
  }

  // تحميل PDF لطلب (يبحث عن الفاتورة المرتبطة)
  downloadPdf(invoiceId: number) {
    if (!confirm('Download invoice PDF?')) return;
    this.isLoading.set(true);
    this.downloadInvoicePdf(invoiceId);
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