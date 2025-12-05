import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductionService, ProductionOrderDto } from '../../services/production';

/**
 * COMPONENT: OrderListComponent (Production Order List)
 * 
 * Purpose:
 * - Display all production orders in a responsive Bootstrap table
 * - Allow users to start production (deduct materials) and complete production (add finished goods)
 * - Track production order status (Planned → Started → Completed)
 * - Show order details: order#, product, quantity, start date, status
 * 
 * Features:
 * - Real-time order status updates
 * - Confirmation dialogs before critical actions (start/complete)
 * - Error handling with user-friendly alerts
 * - Loading spinner while fetching data
 * - Responsive Bootstrap table design
 * - Status-based action buttons (different buttons for each status)
 * 
 * Order Lifecycle:
 * 1. Planned: Order created, waiting to start → Show "Start" button
 * 2. Started: Production in progress, materials deducted → Show "Complete" button
 * 3. Completed: Production finished, finished goods added → Show completed status
 * 
 * Signal State Management:
 * - orders: Array of all production orders from backend
 * - isLoading: Loading indicator for API calls and actions
 * 
 * No functional changes - styling and layout only.
 */
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
  // Service for production-related API calls
  private productionService = inject(ProductionService);

  // ===== STATE SIGNALS =====
  // Complete array of all production orders from backend
  orders = signal<ProductionOrderDto[]>([]);
  
  // Loading indicator while fetching orders or performing actions
  isLoading = signal<boolean>(true);

  /**
   * ANGULAR LIFECYCLE HOOK
   * Called when component is initialized
   * Triggers data fetching from backend
   */
  ngOnInit() {
    this.loadOrders();
  }

  /**
   * LOAD ORDERS METHOD
   * Fetches all production orders from the backend API
   * 
   * Flow:
   * 1. Set loading flag to show spinner
   * 2. Call ProductionService.getOrders() to fetch data
   * 3. On success: Update orders signal and hide spinner
   * 4. On error: Log error and hide spinner (user sees empty table)
   */
  loadOrders() {
    this.isLoading.set(true);
    this.productionService.getOrders().subscribe({
      next: (data) => {
        // ✅ SUCCESS: Backend returned list of production orders
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        // ❌ ERROR: Failed to fetch orders
        console.error(err);
        this.isLoading.set(false);
        // User will see empty table, can retry by refreshing
      }
    });
  }

  /**
   * START PRODUCTION HANDLER
   * Initiates production for a Planned order
   * 
   * Important: Starting production will:
   * - Change order status from "Planned" to "Started"
   * - DEDUCT raw materials from inventory based on the BOM
   * - Reduce available stock for the components
   * 
   * Preconditions:
   * - Order must be in "Planned" status
   * - Required raw materials must be available in inventory
   * - All BOM entries for the product must exist
   * 
   * User Flow:
   * 1. User clicks "Start" button on a Planned order
   * 2. Confirmation dialog asks for confirmation
   * 3. If confirmed: Show loading spinner and send request
   * 4. On success: Update order list and show success message
   * 5. On error: Show error alert with backend message
   * 
   * @param id - Production order ID to start
   */
  onStart(id: number) {
    // Step 1: Confirm user really wants to start production
    if (!confirm('Start production? This will DEDUCT raw materials from inventory.')) {
      return; // User cancelled, don't proceed
    }

    // Step 2: Show loading spinner
    this.isLoading.set(true);

    // Step 3: Send START request to backend
    this.productionService.startProduction(id).subscribe({
      next: () => {
        // ✅ SUCCESS: Production started, materials deducted
        alert('🚀 Production Started! Materials deducted from inventory.');
        // Reload orders to show updated status
        this.loadOrders();
      },
      error: (err) => {
        // ❌ ERROR: Failed to start production
        console.error(err);
        // Extract error message from backend if available
        const msg = err.error?.message || 'Failed to start. Check that raw materials are in stock.';
        alert(`❌ Error: ${msg}`);
        // Hide spinner for retry
        this.isLoading.set(false);
      }
    });
  }

  /**
   * COMPLETE PRODUCTION HANDLER
   * Finalizes production for a Started order
   * 
   * Important: Completing production will:
   * - Change order status from "Started" to "Completed"
   * - ADD finished goods to inventory
   * - Increase available stock for the product
   * 
   * Preconditions:
   * - Order must be in "Started" status
   * - Materials must have been deducted (done in onStart())
   * 
   * User Flow:
   * 1. User clicks "Complete" button on a Started order
   * 2. Confirmation dialog asks for confirmation
   * 3. If confirmed: Show loading spinner and send request
   * 4. On success: Update order list and show success message
   * 5. On error: Show error alert
   * 
   * @param id - Production order ID to complete
   */
  onComplete(id: number) {
    // Step 1: Confirm user really wants to complete production
    if (!confirm('Complete production? This will ADD finished goods to inventory.')) {
      return; // User cancelled, don't proceed
    }

    // Step 2: Show loading spinner
    this.isLoading.set(true);

    // Step 3: Send COMPLETE request to backend
    this.productionService.completeProduction(id).subscribe({
      next: () => {
        // ✅ SUCCESS: Production completed, finished goods added
        alert('✅ Production Completed! Finished goods added to stock.');
        // Reload orders to show updated status
        this.loadOrders();
      },
      error: (err) => {
        // ❌ ERROR: Failed to complete production
        console.error(err);
        alert('❌ Error completing production. Please try again.');
        // Hide spinner for retry
        this.isLoading.set(false);
      }
    });
  }
}