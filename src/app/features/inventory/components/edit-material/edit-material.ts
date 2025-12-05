import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory';

/**
 * COMPONENT: EditMaterialComponent
 * 
 * Purpose:
 * - Allow users to edit existing material information (name, unit, price, min stock)
 * - Fetch current material data and pre-populate the form for editing
 * - Submit updates to the backend with validation
 * 
 * Features:
 * - Form pre-population from database with current material values
 * - Real-time validation feedback with error messages
 * - Loading/submitting indicator during API calls
 * - Navigation back to materials list on successful save
 * - Error handling with user-friendly alerts
 * - Prevents duplicate submissions with isSubmitting flag
 * 
 * Form Fields (Editable):
 * - materialName: Display name of the material (required, text)
 * - unitOfMeasure: How it's measured - KG, Meter, Piece, Liter (required, text)
 * - unitPrice: Cost per unit of measurement (required, must be > 0, decimal)
 * - minimumStockLevel: Reorder alert threshold (required, must be >= 0, integer)
 * 
 * Immutable Fields (NOT Editable):
 * - materialCode: Unique identifier (cannot be changed once created)
 * - materialType: Enum classification (cannot be changed once set)
 * 
 * Workflow:
 * 1. Component loads material ID from URL route parameter
 * 2. ngOnInit() fetches material data from backend
 * 3. Form is populated with current values (patchValue)
 * 4. User edits desired fields
 * 5. User clicks Save - onSubmit() validates and sends to backend
 * 6. On success: Navigate back to materials list
 * 7. On error: Show error alert, re-enable submit button for retry
 * 
 * No functional changes - styling and layout only.
 */
@Component({
  selector: 'app-edit-material',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-material.html',
  styleUrl: './edit-material.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditMaterialComponent implements OnInit {
  // ===== DEPENDENCY INJECTION =====
  // Angular services for routing, forms, and data
  private route = inject(ActivatedRoute);              // Extract route parameters (material ID)
  private router = inject(Router);                     // Navigate after save
  private fb = inject(FormBuilder);                    // Create reactive form
  private inventoryService = inject(InventoryService); // API calls for material data

  // ===== STATE SIGNALS =====
  // Prevents duplicate form submissions while waiting for backend response
  isSubmitting = signal(false);
  
  // Material ID extracted from URL (e.g., /inventory/edit/5)
  materialId = 0;

  // ===== REACTIVE FORM =====
  // FormGroup with validators for each editable field
  // Note: Material code and type are NOT included (immutable identifiers)
  form: FormGroup = this.fb.group({
    // Material name - required field, descriptive text for the material
    materialName: ['', Validators.required],
    
    // Unit of measurement - required, examples: KG, Meter, Piece, Liter
    unitOfMeasure: ['', Validators.required],
    
    // Cost per unit - required, must be greater than 0.01
    unitPrice: [0, [Validators.required, Validators.min(0.01)]],
    
    // Reorder point - required, must be 0 or greater
    minimumStockLevel: [0, [Validators.required, Validators.min(0)]]
    // Note: materialCode and materialType are immutable, not editable in this form
  });

  ngOnInit() {
    // Extract material ID from URL route parameter (e.g., /inventory/edit/5 -> id=5)
    this.materialId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Only load material data if we have a valid ID
    if (this.materialId) {
      this.loadMaterial();
    }
  }

  /**
   * LOAD MATERIAL METHOD
   * Fetches material details from backend and populates form
   * 
   * Flow:
   * 1. Call InventoryService.getMaterialById(materialId)
   * 2. On success: Use patchValue() to populate form fields with current data
   * 3. On error: Show alert to user and log to console
   * 
   * patchValue() is used instead of setValue() because:
   * - patchValue only updates provided fields, doesn't require all fields
   * - Safer for partial data updates
   */
  loadMaterial() {
    this.inventoryService.getMaterialById(this.materialId).subscribe({
      next: (data) => {
        // ✅ SUCCESS: Backend returned the material data
        // Populate form with current values from database
        this.form.patchValue({
          materialName: data.materialName,
          unitOfMeasure: data.unitOfMeasure,  // Measurement unit (KG, Meter, etc.)
          unitPrice: data.unitPrice,          // Cost per unit
          minimumStockLevel: data.minimumStockLevel  // Reorder threshold
        });
      },
      error: (err) => {
        // ❌ ERROR: Failed to fetch material details
        console.error(err);
        alert('❌ Error loading material details. Please try again.');
      }
    });
  }

  /**
   * FORM SUBMISSION HANDLER
   * Validates form and sends update request to backend
   * 
   * Steps:
   * 1. Check if form is valid (all required fields filled correctly)
   * 2. Set isSubmitting flag to disable button and show spinner
   * 3. Prepare command with material ID and updated field values
   * 4. Call InventoryService.updateMaterial() with the command
   * 5. On success: Show success message and navigate back to materials list
   * 6. On error: Show error alert and re-enable submit button
   */
  onSubmit() {
    // First validation: Ensure form has no errors
    if (this.form.invalid) {
      // Form has validation errors, don't submit
      return;
    }

    // Prevent duplicate submissions
    this.isSubmitting.set(true);

    // Prepare the update command with material ID and new values
    const command = { id: this.materialId, ...this.form.value };

    // Send UPDATE request to backend
    this.inventoryService.updateMaterial(this.materialId, command).subscribe({
      next: () => {
        // ✅ UPDATE successful
        alert('✅ Material Updated Successfully!');
        // Navigate back to materials list
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        // ❌ UPDATE failed (validation error, network issue, etc.)
        console.error(err);
        alert('❌ Error updating material. Please check your input.');
        // Re-enable submit button for retry
        this.isSubmitting.set(false);
      }
    });
  }
}