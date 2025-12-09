import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductionService, CreateProductionOrderCommand, CreateBOMCommand, BomComponentDto } from '../../services/production';
import { InventoryService } from '../../../inventory/services/inventory';
import { Material } from '../../../inventory/models/material.model';
import { AlertService } from '../../../../core/services/alert.service';

type WizardStep = 'select-product' | 'check-bom' | 'create-bom' | 'order-details';

@Component({
  selector: 'app-production-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './production-wizard.html',
  styleUrl: './production-wizard.css'
})
export class ProductionWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productionService = inject(ProductionService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  // Wizard state
  currentStep = signal<WizardStep>('select-product');
  
  // Data signals
  finishedProducts = signal<Material[]>([]);
  rawMaterials = signal<Material[]>([]);
  selectedProduct = signal<Material | null>(null);
  hasBOM = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isCheckingBOM = signal<boolean>(false);

  // Forms
  productForm: FormGroup = this.fb.group({
    productId: ['', Validators.required]
  });

  bomForm: FormGroup = this.fb.group({
    components: this.fb.array([])
  });

  orderForm: FormGroup = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    priority: ['Medium', Validators.required],
    notes: ['']
  });

  get componentsArray(): FormArray {
    return this.bomForm.get('components') as FormArray;
  }

  ngOnInit() {
    this.loadMaterials();
  }

  loadMaterials() {
    this.inventoryService.getMaterials().subscribe(res => {
      console.log('All Materials:', res);
      console.log('First Material Type:', res[0]?.materialType, 'Type:', typeof res[0]?.materialType);
      
      // For now, show ALL materials in both lists until we know the correct filter
      // This is temporary to debug the issue
      const finished = res; // Show all for finished products selection
      const raw = res; // Show all for raw materials selection
      
      console.log('Finished Products COUNT:', finished.length);
      console.log('Raw Materials COUNT:', raw.length);
      
      this.finishedProducts.set(finished);
      this.rawMaterials.set(raw);
    });
  }

  // Step 1: Select Product
  onProductSelected() {
    if (this.productForm.invalid) return;

    const productId = Number(this.productForm.value.productId);
    const product = this.finishedProducts().find(p => p.id === productId);
    
    if (product) {
      this.selectedProduct.set(product);
      this.checkBOMExists(productId);
    }
  }

  // Step 2: Check if BOM exists
  checkBOMExists(productId: number) {
    this.isCheckingBOM.set(true);
    this.currentStep.set('check-bom');

    // TODO: Replace with real API call to check BOM
    // For now, simulate API call
    setTimeout(() => {
      // Mock: Assume product ID 2 has BOM, others don't
      const exists = productId === 2;
      this.hasBOM.set(exists);
      this.isCheckingBOM.set(false);

      if (exists) {
        // BOM exists, go directly to order details
        this.currentStep.set('order-details');
      } else {
        // BOM doesn't exist, need to create it
        this.currentStep.set('create-bom');
        // Clear any old rows and add 2 fresh rows
        this.componentsArray.clear();
        this.addComponentRow();
        this.addComponentRow();
      }
    }, 1000);
  }

  // Step 3: Create BOM (if needed)
  addComponentRow() {
    const row = this.fb.group({
      componentId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.componentsArray.push(row);
  }

  removeComponentRow(index: number) {
    this.componentsArray.removeAt(index);
  }

  onSaveBOM() {
    if (this.bomForm.invalid || !this.selectedProduct()) return;

    this.isSubmitting.set(true);
    const components: BomComponentDto[] = this.componentsArray.value.map((c: any) => ({
      componentId: Number(c.componentId),
      quantity: Number(c.quantity)
    }));

    const command: CreateBOMCommand = {
      productId: this.selectedProduct()!.id,
      components: components
    };

    this.productionService.createBOM(command).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.hasBOM.set(true);
        // Move to order details
        this.currentStep.set('order-details');
      },
      error: (err) => {
        console.error('Error creating BOM', err);
        this.alertService.error('Failed to create BOM. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  // Step 4: Create Order
  onCreateOrder() {
    if (this.orderForm.invalid || !this.selectedProduct()) return;

    this.isSubmitting.set(true);
    const val = this.orderForm.value;

    const command: CreateProductionOrderCommand = {
      productId: this.selectedProduct()!.id,
      quantity: Number(val.quantity),
      startDate: new Date(val.startDate).toISOString(),
      priority: val.priority,
      notes: val.notes
    };

    this.productionService.createOrder(command).subscribe({
      next: (orderId) => {
        this.alertService.success(`Production Order #${orderId} Created Successfully!`);
        this.router.navigate(['/production']);
      },
      error: (err) => {
        console.error('Error creating order', err);
        this.alertService.error('Failed to create production order.');
        this.isSubmitting.set(false);
      }
    });
  }

  // Navigation helpers
  goBack() {
    switch (this.currentStep()) {
      case 'check-bom':
      case 'create-bom':
        this.currentStep.set('select-product');
        break;
      case 'order-details':
        if (!this.hasBOM()) {
          this.currentStep.set('create-bom');
        } else {
          this.currentStep.set('select-product');
        }
        break;
    }
  }

  cancel() {
    this.router.navigate(['/production']);
  }

  getStepNumber(): number {
    switch (this.currentStep()) {
      case 'select-product': return 1;
      case 'check-bom': return 2;
      case 'create-bom': return 2;
      case 'order-details': return 3;
      default: return 1;
    }
  }
}
