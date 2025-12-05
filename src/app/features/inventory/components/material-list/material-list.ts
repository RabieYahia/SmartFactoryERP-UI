import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory';
import { Material } from '../../models/material.model';
import { AiService } from '../../../ai/services/ai';

/**
 * COMPONENT: MaterialListComponent
 * 
 * Purpose:
 * - Display all raw materials in the inventory system in a searchable table
 * - Provide real-time search functionality to filter materials by name or code
 * - Allow users to edit, delete, or forecast materials using AI
 * - Responsive Bootstrap table with action buttons for all operations
 * 
 * Features:
 * - Real-time search filtering (case-insensitive)
 * - Responsive design (desktop, tablet, mobile)
 * - Loading spinner while fetching data from backend
 * - AI forecast integration for demand prediction
 * - Error handling with user-friendly alerts
 * - Result count badge to show filtered records
 * 
 * Signal State Management:
 * - materials: Complete array of all materials from backend
 * - searchQuery: Current search filter text (updated on user input)
 * - isLoading: Loading state indicator for API calls
 * - filteredMaterials: Computed signal that auto-filters based on searchQuery
 * 
 * No functional changes from original - styling and layout only.
 */
@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './material-list.html',
  styleUrl: './material-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialListComponent implements OnInit {
  // ===== DEPENDENCY INJECTION =====
  // Services for data operations and AI features
  private inventoryService = inject(InventoryService);
  private aiService = inject(AiService);

  // ===== STATE SIGNALS =====
  // Complete array of all materials fetched from database
  materials = signal<Material[]>([]);
  
  // Current search query text (updated on user input event)
  searchQuery = signal<string>('');
  
  // Loading indicator while fetching materials from API
  isLoading = signal<boolean>(true);

  // ===== COMPUTED SIGNALS =====
  // Automatically recomputes whenever materials or searchQuery changes
  // Filters materials by name or code in case-insensitive manner
  filteredMaterials = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const all = this.materials();
      
    if (!query) return all;

    return all.filter(m => 
      m.materialName.toLowerCase().includes(query) || 
      m.materialCode.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    // Load all materials from backend on component initialization
    this.fetchData();
  }

  /**
   * FETCH DATA METHOD
   * Retrieves all materials from the backend API
   * Used during component initialization and after delete operations
   * 
   * Flow:
   * 1. Set loading flag to show spinner to user
   * 2. Call InventoryService.getMaterials() to fetch from backend
   * 3. On success: Update materials signal and hide spinner
   * 4. On error: Log error and hide spinner (user sees empty state)
   */
  fetchData() {
    this.isLoading.set(true);
    this.inventoryService.getMaterials().subscribe({
      next: (data) => {
        // Backend returned materials successfully
        this.materials.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        // Network or backend error occurred
        console.error(err);
        this.isLoading.set(false);
        // User will see empty table, can retry by refreshing
      }
    });
  }

  /**
   * SEARCH/FILTER HANDLER
   * Called on every keystroke in the search input field
   * Updates searchQuery signal which triggers filteredMaterials recomputation
   * 
   * @param event - Input event from the search field
   */
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    // Update signal - computed filteredMaterials will auto-update
    this.searchQuery.set(input.value);
  }
  
  /**
   * DELETE MATERIAL HANDLER
   * Deletes a material from inventory with optimistic UI update
   * 
   * Flow:
   * 1. Ask user for confirmation (prevent accidental deletion)
   * 2. Immediately remove from UI (optimistic update for better UX)
   * 3. Send DELETE request to backend
   * 4. On error: Reload all materials to restore deleted item
   * 
   * @param id - Material ID to delete
   */
  onDelete(id: number) {
    // Confirm user really wants to delete
    const confirmDelete = confirm('Are you sure you want to delete this material?');
    
    if (confirmDelete) {
      // Step 1: Optimistic UI update - remove immediately from table
      // This gives user instant feedback even while waiting for backend
      this.materials.update(currentList => currentList.filter(m => m.id !== id));

      // Step 2: Send DELETE request to backend
      this.inventoryService.deleteMaterial(id).subscribe({
        next: () => {
          // ✅ DELETE successful
          console.log('Material deleted successfully');
        },
        error: (err) => {
          // ❌ DELETE failed
          console.error(err);
          alert('❌ Error deleting material. It may have related transactions.');
          
          // Step 3: Rollback - reload all materials to restore deleted item
          this.fetchData(); 
        }
        
      });
      
      
    }
    
  }
  onPredict(materialId: number, materialName: string) {
  const confirmPredict = confirm(`🔮 Do you want to generate AI sales forecast for '${materialName}'?`);

  if (confirmPredict) {
    this.isLoading.set(true); // نستخدم نفس لودر الصفحة مؤقتاً

    this.aiService.getForecast(materialId).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        // عرض النتيجة في رسالة جميلة
        alert(`
          🤖 AI Prediction for ${materialName}:
          -----------------------------------------
          📊 Expected Sales Next Month: ${res.predictedSalesQuantity} Units
          💡 Advice: ${res.advice}
        `);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        alert('❌ Failed to generate forecast. Not enough historical data?');
      }
    });
  }
}
}