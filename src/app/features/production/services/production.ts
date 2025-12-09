import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * INTERFACE: BomComponentDto
 * Represents a single component in the BOM
 */
export interface BomComponentDto {
  componentId: number;  // Raw material ID
  quantity: number;     // Quantity needed
}

/**
 * INTERFACE: CreateBOMCommand
 * Defines the structure for creating Bill of Materials (BOM) entries
 * A BOM specifies which raw materials are needed to create a finished product
 */
export interface CreateBOMCommand {
  productId: number;    // Finished product (target item being manufactured)
  components: BomComponentDto[];  // List of raw materials with quantities
}

/**
 * INTERFACE: CreateBOMCommandSingle (Legacy - for single component)
 * Used for backward compatibility with old API endpoint
 */
export interface CreateBOMCommandSingle {
  productId: number;
  componentId: number;
  quantity: number;
}

/**
 * INTERFACE: CreateProductionOrderCommand
 * Defines the structure for creating new production orders
 */
export interface CreateProductionOrderCommand {
  productId: number;         // Which finished product to manufacture
  quantity: number;          // How many units to produce
  startDate: string;         // When production should begin (ISO format)
  notes: string;             // Additional notes or requirements
  priority?: 'High' | 'Medium' | 'Low';  // Order priority (default: Medium)
}

/**
 * INTERFACE: ProductionOrderDto
 * Data transfer object representing a production order from the API
 * Used for displaying orders in the UI
 */
export interface ProductionOrderDto {
  id: number;              // Unique order identifier
  orderNumber: string;     // Human-readable order reference (e.g., "PO-001")
  productId: number;       // Product being manufactured
  productName: string;     // Name of the product being manufactured
  quantity: number;        // Quantity to produce
  status: string;          // Planned, Started, or Completed
  startDate: string;       // When production was/should be started
  endDate?: string | null; // When production should end
  notes?: string;          // Additional notes
  createdDate?: string;    // When order was created
  priority?: 'High' | 'Medium' | 'Low';  // Order priority (Frontend only)
  progress?: number;       // Production progress percentage (Frontend only)
}

/**
 * SERVICE: ProductionService
 * 
 * Purpose:
 * - Handle all production-related API calls (BOM, orders, production lifecycle)
 * - Manage communication with backend production API
 * - Provide methods for creating, reading, and updating production data
 * 
 * Key Operations:
 * 1. Bill of Materials (BOM): Define which materials are needed for products
 * 2. Production Orders: Create and track production work orders
 * 3. Production Status: Start (deduct materials) and complete (add finished goods)
 * 
 * API Endpoints:
 * - POST /api/v1/production/bom - Create new BOM entry
 * - POST /api/v1/production/orders - Create new production order
 * - GET /api/v1/production/orders - List all production orders
 * - POST /api/v1/production/orders/{id}/start - Start production (deduct materials)
 * - POST /api/v1/production/orders/{id}/complete - Complete production (add goods)
 * 
 * No functional changes - comments and documentation only.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  // HTTP client for making API requests
  private http = inject(HttpClient);
  
  // Backend API base URL for production endpoints
  private apiUrl = 'https://localhost:7093/api/v1/production';

  /**
   * CREATE BILL OF MATERIALS
   * Defines which raw materials (components) are needed to create a finished product
   * 
   * @param command - BOM data: productId, components array
   * @returns Observable<number> - Number of components added
   */
  createBOM(command: CreateBOMCommand): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/bom`, command);
  }

  /**
   * CREATE PRODUCTION ORDER
   * Creates a new production work order for manufacturing a product
   * 
   * @param command - Order data: productId, quantity, startDate, notes
   * @returns Observable<number> - Order ID created in database
   */
  createOrder(command: CreateProductionOrderCommand): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/orders`, command);
  }

  /**
   * GET ALL PRODUCTION ORDERS
   * Retrieves list of all production orders (Planned, Started, Completed)
   * 
   * @returns Observable<ProductionOrderDto[]> - Array of all production orders
   */
  getOrders(): Observable<ProductionOrderDto[]> {
    return this.http.get<ProductionOrderDto[]>(`${this.apiUrl}/orders`);
  }

  /**
   * START PRODUCTION
   * Changes order status to "Started" and deducts raw materials from inventory
   * This initiates the manufacturing process
   * 
   * @param id - Production order ID to start
   * @returns Observable<void>
   */
  startProduction(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/orders/${id}/start`, {});
  }

  /**
   * COMPLETE PRODUCTION
   * Changes order status to "Completed" and adds finished goods to inventory
   * This finalizes the manufacturing process
   * 
   * @param id - Production order ID to complete
   * @returns Observable<void>
   */
  completeProduction(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/orders/${id}/complete`, {});
  }
}