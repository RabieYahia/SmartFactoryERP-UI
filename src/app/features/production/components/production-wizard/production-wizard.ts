import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ProductionService,
  CreateProductionOrderCommand,
  OrderItemInputDto
} from '../../services/production';

import { InventoryService } from '../../../inventory/services/inventory';
import { Material } from '../../../inventory/models/material.model';
import { AlertService } from '../../../../core/services/alert.service';

// Define WizardStep as a const enum or use string literal union
const WizardStep = {
  SELECT_PRODUCT: 'select-product' as const,
  CREATE_BOM: 'create-bom' as const,
  ORDER_DETAILS: 'order-details' as const
} as const;

type WizardStepType = typeof WizardStep[keyof typeof WizardStep];

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

  // Use the WizardStep object for better type safety
  WizardStep = WizardStep;
  currentStep = signal<WizardStepType>(WizardStep.SELECT_PRODUCT);

  finishedProducts = signal<Material[]>([]);
  rawMaterials = signal<Material[]>([]);
  selectedProduct = signal<Material | null>(null);

  isSubmitting = signal<boolean>(false);
  isCheckingBOM = signal<boolean>(false); // Add this missing signal

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
      this.finishedProducts.set(res);
      this.rawMaterials.set(res);
    });
  }

  // STEP 1: Select product
  onProductSelected() {
    if (this.productForm.invalid) return;

    const productId = Number(this.productForm.value.productId);
    const product = this.finishedProducts().find(p => p.id === productId);

    if (product) {
      this.selectedProduct.set(product);

      // If you want to check BOM first, uncomment this:
      // this.isCheckingBOM.set(true);
      // this.currentStep.set(WizardStep.CHECK_BOM);

      // Then check if BOM exists and transition accordingly
      // For now, go directly to create-BOM
      this.currentStep.set(WizardStep.CREATE_BOM);

      this.componentsArray.clear();
      this.addComponentRow();
      this.addComponentRow();
    }
  }

  // Create BOM rows (inline)
  addComponentRow() {
    const row = this.fb.group({
      componentId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.001)]]
    });
    this.componentsArray.push(row);
  }

  removeComponentRow(index: number) {
    this.componentsArray.removeAt(index);
  }

  // Step 2 → Step 3
  onNextToOrderDetails() {
    if (this.bomForm.invalid || this.componentsArray.length === 0) {
      this.alertService.error('Please add at least one raw material and ensure all fields are valid.');
      return;
    }
    this.currentStep.set(WizardStep.ORDER_DETAILS);
  }

  // STEP 3: Create Order
  onCreateOrder() {
    if (this.orderForm.invalid || this.bomForm.invalid || !this.selectedProduct()) return;

    const orderQty = Number(this.orderForm.value.quantity);

    const items: OrderItemInputDto[] = this.componentsArray.value
      .filter((c: any) => c.componentId && c.quantity > 0)
      .map((c: any) => ({
        materialId: Number(c.componentId),
        quantity: Number(c.quantity) * orderQty
      }));

    if (items.length === 0) {
      this.alertService.error('Order creation failed: Raw materials list is empty.');
      return;
    }

    this.isSubmitting.set(true);

    const val = this.orderForm.value;

    const command: CreateProductionOrderCommand = {
      productId: this.selectedProduct()!.id,
      quantity: orderQty,
      startDate: new Date(val.startDate).toISOString(),
      priority: val.priority,
      notes: val.notes,
      items: items
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

  // Navigation
  goBack() {
    switch (this.currentStep()) {
      case WizardStep.CREATE_BOM:
        this.currentStep.set(WizardStep.SELECT_PRODUCT);
        break;
      case WizardStep.ORDER_DETAILS:
        this.currentStep.set(WizardStep.CREATE_BOM);
        break;
    }
  }

  cancel() {
    this.router.navigate(['/production']);
  }

  getStepNumber(): number {
    switch (this.currentStep()) {
      case WizardStep.SELECT_PRODUCT: return 1;
      case WizardStep.CREATE_BOM: return 2;
      case WizardStep.ORDER_DETAILS: return 3;
      default: return 1;
    }
  }
}
