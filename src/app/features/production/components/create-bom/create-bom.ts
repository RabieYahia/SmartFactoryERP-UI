import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductionService, CreateBOMCommand } from '../../services/production';
import { InventoryService } from '../../../inventory/services/inventory';
import { Material } from '../../../inventory/models/material.model';

@Component({
  selector: 'app-create-bom',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-bom.html',
  styleUrl: './create-bom.css'
})
export class CreateBomComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productionService = inject(ProductionService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  materials = signal<Material[]>([]);
  isSubmitting = signal<boolean>(false);

  bomForm: FormGroup = this.fb.group({
    productId: ['', Validators.required],
    componentId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(0.1)]]
  });

  ngOnInit() {
    // نحتاج المواد عشان نملأ القوائم
    this.inventoryService.getMaterials().subscribe(res => this.materials.set(res));
  }

  onSubmit() {
    if (this.bomForm.invalid) return;

    const val = this.bomForm.value;
    
    // منع اختيار نفس المادة كمنتج ومكون
    if (val.productId == val.componentId) {
      alert('❌ A product cannot be a component of itself!');
      return;
    }

    this.isSubmitting.set(true);

    const command: CreateBOMCommand = {
      productId: Number(val.productId),
      componentId: Number(val.componentId),
      quantity: Number(val.quantity)
    };

    this.productionService.createBOM(command).subscribe({
      next: () => {
        alert('✅ Recipe (BOM) Created Successfully!');
        this.bomForm.reset({ quantity: 1 });
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error creating BOM.');
        this.isSubmitting.set(false);
      }
    });
  }
}