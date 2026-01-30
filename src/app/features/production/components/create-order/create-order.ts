import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductionService, CreateProductionOrderCommand, OrderItemInputDto } from '../../services/production';
import { InventoryService } from '../../../inventory/services/inventory';
import { Material } from '../../../inventory/models/material.model';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-create-production-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-order.html',
  styleUrl: './create-order.css'
})
export class CreateOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productionService = inject(ProductionService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  // --- Step Control ---
  currentStep = signal<number>(1); // 1: Product/BOM, 2: Quantity/Stock Check

  // --- Data ---
  finishedProducts = signal<Material[]>([]);
  rawMaterials = signal<Material[]>([]);
  selectedBOM = signal<{ components: any[] } | null>(null);
  stockStatus = signal<any[]>([]); // Store stock status (sufficient/insufficient)

  isSubmitting = signal<boolean>(false);
  isBomMissing = signal<boolean>(false); // Does the product need BOM definition?

  // --- Main Form (Step 2) ---
  orderForm: FormGroup = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    priority: ['Medium', Validators.required],
    notes: ['']
  });

  // --- BOM Form (Step 1 - if no BOM exists) ---
  bomForm: FormGroup = this.fb.group({
    productId: ['', Validators.required],
    components: this.fb.array([])
  });

  get componentsArr(): FormArray {
    return this.bomForm.get('components') as FormArray;
  }

  ngOnInit() {
    this.loadMaterials();
  }

  loadMaterials() {
    this.inventoryService.getMaterials().subscribe(res => {
      // Filter finished products
      this.finishedProducts.set(res.filter(m => (m.materialType as any) === 'FinishedGood' || (m.materialType as any) === 2 || (m.materialType as any) === '2'));
      // Filter raw materials
      this.rawMaterials.set(res.filter(m => (m.materialType as any) === 'RawMaterial' || (m.materialType as any) === 0 || (m.materialType as any) === '0'));
    });
  }

  // --- Step 1: Select product and verify BOM ---
  onProductSelect() {
    const prodId = this.bomForm.get('productId')?.value;
    if (!prodId) return;

    this.isBomMissing.set(false);

    // Always assume user will define BOM immediately
    this.isBomMissing.set(true); // Open BOM entry screen
    this.componentsArr.clear();
    this.addComponent(); // Add empty row for components
  }

  // --- BOM Form Functions ---
  addComponent() {
    const g = this.fb.group({
      componentId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.1)]]
    });
    this.componentsArr.push(g);
  }

  removeComponent(i: number) {
    this.componentsArr.removeAt(i);
  }

  // Navigate to step 2 with temporary BOM save
  goToStep2() {
    if (this.bomForm.invalid || this.componentsArr.length === 0) {
      this.alertService.warning('Please define at least one valid raw material component.');
      return;
    }

    // Save components locally (immediate BOM)
    this.selectedBOM.set({ components: this.componentsArr.value });

    this.isBomMissing.set(false);
    this.nextStep();
  }

  // --- Navigation ---
  nextStep() {
    this.currentStep.set(2);
    this.calculateStockRequirements(); // Calculate when entering step 2
  }

  goBack() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  cancel() {
    if (confirm('Are you sure you want to cancel? All data will be lost.')) {
      this.router.navigate(['/production/orders']);
    }
  }

  // --- Step 2: Calculate Stock Requirements ---
  calculateStockRequirements() {
    const orderQty = this.orderForm.get('quantity')?.value || 0;

    // Use the components stored in selectedBOM
    const componentsToUse = this.selectedBOM()?.components || [];

    const status = componentsToUse.map(comp => {
      const rawMat = this.rawMaterials().find(m => m.id == comp.componentId);
      const requiredQty = comp.quantity * orderQty; // Unit quantity * Order quantity
      const availableQty = rawMat?.currentStockLevel || 0;

      return {
        name: rawMat?.materialName || 'Unknown',
        required: requiredQty,
        available: availableQty,
        isSufficient: availableQty >= requiredQty,
        materialId: comp.componentId // Very important: to pass in the Command
      };
    });

    this.stockStatus.set(status);
  }

  // When quantity changes in the form
  onQuantityChange() {
    this.calculateStockRequirements();
  }

  // --- Final Step: Create Order ---
  submitOrder() {
    if (this.orderForm.invalid) {
      this.alertService.warning('Please complete all required fields.');
      return;
    }

    // Prevent creation if stock is insufficient
    const hasShortage = this.stockStatus().some(s => !s.isSufficient);
    if (hasShortage) {
      const confirmMsg = '⚠️ Warning: Not enough stock for some materials. Do you want to proceed anyway?';
      if (!confirm(confirmMsg)) return;
    }

    this.isSubmitting.set(true);

    // Create final materials array (Items) required for the Command
    const orderComponents: OrderItemInputDto[] = this.stockStatus().map(s => ({
      materialId: s.materialId,
      quantity: s.required // Use the calculated Required Quantity
    }));

    const command: CreateProductionOrderCommand = {
      productId: Number(this.bomForm.get('productId')?.value),
      quantity: Number(this.orderForm.get('quantity')?.value),
      startDate: new Date(this.orderForm.get('startDate')?.value).toISOString(),
      priority: this.orderForm.get('priority')?.value,
      notes: this.orderForm.get('notes')?.value,
      items: orderComponents // Pass materials array
    };

    console.log('🚀 Creating Production Order:', command);

    this.productionService.createOrder(command).subscribe({
      next: (res) => {
        this.alertService.success(`Production Order Created Successfully! ID: ${res}`);
        this.router.navigate(['/production/orders']);
      },
      error: (err) => {
        console.error('❌ Create Order Error:', err);
        const errorMessage = err.error?.message || err.message || 'Failed to create production order.';
        this.alertService.error(`Error: ${errorMessage}`);
        this.isSubmitting.set(false);
      }
    });
  }
}
