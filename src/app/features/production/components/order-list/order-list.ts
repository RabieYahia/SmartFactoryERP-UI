import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductionService, ProductionOrderDto } from '../../services/production';
import { AlertService } from '../../../../core/services/alert.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-production-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit {
  // ===== DEPENDENCY INJECTION =====
  private productionService = inject(ProductionService);
  private alertService = inject(AlertService);
  private confirmService = inject(ConfirmService);

  // ===== STATE SIGNALS =====
  orders = signal<ProductionOrderDto[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.productionService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => { // ✅ Added type any
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  onStart(id: number) {
    if (!confirm('Start production? This will DEDUCT raw materials from inventory.')) {
      return;
    }

    // Step 1: Confirm user really wants to start production
    this.confirmService.warning(
      'Start production? This will DEDUCT raw materials from inventory.',
      () => this.proceedStartProduction(id)
    );
  }

  private proceedStartProduction(id: number) {
    // Step 2: Show loading spinner
    this.isLoading.set(true);

    // ✅✅ التصحيح هنا: استخدام startOrder بدلاً من startProduction ✅✅
    this.productionService.startOrder(id).subscribe({
      next: () => {

        alert('🚀 Production Started! Materials deducted from inventory.');
        this.loadOrders();
      },
      error: (err: any) => { // ✅ Added type any
        console.error('❌ Start Production Error:', err);

        // استخراج رسالة الخطأ وعرضها
        const errorMessage = err.error?.message || 'Failed to start production. Check raw materials availability.';
        alert(`❌ Error: ${errorMessage}`);

        // ✅ SUCCESS: Production started, materials deducted
        this.alertService.success('Production Started! Materials deducted from inventory.');
        // Reload orders to show updated status
        this.loadOrders();
      },
      error: (err) => {
        // ❌ ERROR: Failed to start production
        console.error('Start Production Error:', err);
        console.error('Error Details:', err.error);

        // Extract error message - Backend returns plain text in err.error
        let msg = 'Failed to start production. Check raw materials availability.';

        if (typeof err.error === 'string') {
          // Backend returns exception message with stack trace
          const fullError = err.error;

          // Extract just the exception message (after "System.Exception: ")
          let errorMessage = fullError;
          const exceptionMatch = fullError.match(/System\.Exception:\s*(.+?)(?:\r?\n|$)/);
          if (exceptionMatch) {
            errorMessage = exceptionMatch[1].trim();
          }

          console.log('Error Details:', fullError);
          console.log('Extracted Message:', errorMessage);

          // Check for insufficient stock error
          if (errorMessage.includes('Insufficient stock')) {
            // Pattern: "Insufficient stock for material 'MaterialName'. Required: X, Available: Y"
            const match = errorMessage.match(/material '(.+?)'\.\s*Required:\s*([\d.]+),\s*Available:\s*([\d.]+)/i);

            if (match) {
              const [, material, required, available] = match;
              msg = `Insufficient Stock! Material: ${material}. Required: ${required}, Available: ${available}. Purchase more from Purchasing module.`;
            } else {
              msg = `${errorMessage}. Purchase raw materials from Purchasing module.`;
            }
          } else if (errorMessage.includes('No BOM found')) {
            msg = `BOM Not Found! This product doesn't have a Bill of Materials defined. Create BOM first using the Production Wizard.`;
          } else {
            msg = errorMessage;
          }
        }

        this.alertService.error(msg);
        // Hide spinner for retry
        this.isLoading.set(false);
      }
    });
  }

  onComplete(id: number) {
    if (!confirm('Complete production? This will ADD finished goods to inventory.')) {
      return;
    }

    // Step 1: Confirm user really wants to complete production
    this.confirmService.warning(
      'Complete production? This will ADD finished goods to inventory.',
      () => this.proceedCompleteProduction(id)
    );
  }

  private proceedCompleteProduction(id: number) {
    // Step 2: Show loading spinner
    this.isLoading.set(true);

    this.productionService.completeProduction(id).subscribe({
      next: () => {
        alert('✅ Production Completed! Finished goods added to stock.');
        // ✅ SUCCESS: Production completed, finished goods added
        this.alertService.success('Production Completed! Finished goods added to stock.');
        // Reload orders to show updated status
        this.loadOrders();
      },
      error: (err: any) => { // ✅ Added type any
        console.error(err);
        alert('❌ Error completing production. Please try again.');
        this.alertService.error('Error completing production. Please try again.');
        // Hide spinner for retry
        this.isLoading.set(false);
      }
    });
  }
}
