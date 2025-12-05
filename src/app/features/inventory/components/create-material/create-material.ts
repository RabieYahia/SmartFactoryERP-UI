import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  FormBuilder, 
  Validators, 
  FormGroup 
} from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory';

/**
 * COMPONENT: CreateMaterialComponent
 * 
 * Purpose:
 * - Provides a form to create new raw materials in the inventory system
 * - Validates material information (code, name, unit, price, min stock)
 * - Submits material data to the backend via InventoryService
 * - Navigates back to inventory list on successful submission
 * 
 * Form Fields:
 * - materialCode: Unique identifier for the material (required, max 50 chars)
 * - materialName: Full descriptive name (required, max 200 chars)
 * - materialType: Material classification (default: RawMaterial)
 * - unitOfMeasure: How the material is measured (KG, Meter, etc.)
 * - unitPrice: Cost per unit (required, must be > 0)
 * - minimumStockLevel: Reorder point for alerts (required, min 0)
 * 
 * No functional changes - all validation logic and form submission intact.
 */
@Component({
  selector: 'app-create-material',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './create-material.html',
  styleUrl: './create-material.css'
})
export class CreateMaterialComponent {
  // ===== DEPENDENCY INJECTION =====
  // Using Angular's modern inject() function instead of constructor
  private fb = inject(FormBuilder);                    // Reactive form builder
  private inventoryService = inject(InventoryService); // Material API service
  private router = inject(Router);                     // Navigation service

  // ===== STATE SIGNALS =====
  // Signal to prevent duplicate form submissions while awaiting backend response
  isSubmitting = signal<boolean>(false);

  // ===== REACTIVE FORM DEFINITION =====
  // FormGroup with validators for each field
  // Benefits: Type-safe, reactive, easy to test and validate
  materialForm: FormGroup = this.fb.group({
    // Code: Required, must be 50 chars or less, unique identifier
    materialCode: ['', [Validators.required, Validators.maxLength(50)]],
    
    // Name: Required, descriptive name, max 200 chars
    materialName: ['', [Validators.required, Validators.maxLength(200)]],
    
    // Type: Enum value (0 = RawMaterial), required
    materialType: [0, [Validators.required]], 
    
    // Unit: How to measure (KG, Meter, etc.), required
    unitOfMeasure: ['', Validators.required],
    
    // Price: Must be positive decimal, required
    unitPrice: [0, [Validators.required, Validators.min(0.01)]],
    
    // Min Stock: Reorder alert threshold, required, non-negative
    minimumStockLevel: [0, [Validators.required, Validators.min(0)]]
  });

  /**
   * FORM SUBMISSION HANDLER
   * 
   * Steps:
   * 1. Check if form is valid (all required fields filled correctly)
   * 2. Mark all fields as touched to show validation errors
   * 3. Disable submit button with isSubmitting flag
   * 4. Call InventoryService.createMaterial() with form data
   * 5. On success: Show success alert and navigate to inventory list
   * 6. On error: Show error alert and enable submit button for retry
   * 
   * @returns void
   */
  onSubmit() {
    // First validation: Check if form has errors
    if (this.materialForm.invalid) {
      // Mark all fields as touched to display red borders + error messages
      this.materialForm.markAllAsTouched();
      return;
    }

    // Prevent duplicate submission by disabling submit button
    this.isSubmitting.set(true);

    // Call backend service to create the material
    this.inventoryService.createMaterial(this.materialForm.value).subscribe({
      next: (res) => {
        // ✅ SUCCESS: Material created with ID returned from backend
        alert('✅ Material Created Successfully! ID: ' + res);
        // Navigate back to inventory list
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        // ❌ ERROR: Backend validation or network error
        console.error(err);
        // Show user-friendly error message
        alert('❌ Error creating material. Check console for details.');
        // Re-enable submit button for retry
        this.isSubmitting.set(false);
      }
    });
  }
}