import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductionService, CreateProductionOrderCommand } from '../../services/production';
import { InventoryService } from '../../../inventory/services/inventory';
import { Material } from '../../../inventory/models/material.model';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-create-production-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-order.html',
  styleUrl: './create-order.css'
})
export class CreateOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productionService = inject(ProductionService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  products = signal<Material[]>([]);
  isSubmitting = signal<boolean>(false);

  orderForm: FormGroup = this.fb.group({
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    priority: ['Medium', Validators.required],
    notes: ['']
  });

  ngOnInit() {
    // نحمل المواد، ونفلترها لو أمكن (أو نعرض الكل والمستخدم يختار المنتج)
    // الأفضل: نعرض فقط المواد اللي ليها BOM (بس حالياً هنعرض الكل للتبسيط)
    this.inventoryService.getMaterials().subscribe(res => {
      this.products.set(res);
    });
  }

  onSubmit() {
    if (this.orderForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.orderForm.value;

    const command: CreateProductionOrderCommand = {
      productId: Number(val.productId),
      quantity: Number(val.quantity),
      startDate: new Date(val.startDate).toISOString(),
      priority: val.priority,
      notes: val.notes
    };

    this.productionService.createOrder(command).subscribe({
      next: (res) => {
        this.alertService.success(`Production Order Created! ID: ${res}`);
        // سنقوم بتوجيهه لقائمة الإنتاج (التي سنبنيها الخطوة القادمة)
        this.router.navigate(['/production/orders']); 
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Failed to create order.');
        this.isSubmitting.set(false);
      }
    });
  }
}