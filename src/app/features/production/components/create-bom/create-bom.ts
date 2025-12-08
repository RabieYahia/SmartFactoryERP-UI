import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductionService, CreateBOMCommand } from '../../services/production';
import { InventoryService } from '../../../inventory/services/inventory';
import { Material } from '../../../inventory/models/material.model';

@Component({
  selector: 'app-create-bom',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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

  // Computed signals للتصفية
  finishedProducts = signal<Material[]>([]);
  rawMaterials = signal<Material[]>([]);

  // الفورم الرئيسي باستخدام FormArray
  bomForm: FormGroup = this.fb.group({
    productId: [null, Validators.required],
    components: this.fb.array([]) // FormArray للمكونات
  });

  // دالة مساعدة للوصول للـ FormArray بسهولة
  get componentsArr(): FormArray {
    return this.bomForm.get('components') as FormArray;
  }

  ngOnInit() {
    // استخدام الـ endpoints المتخصصة للحصول على البيانات المفلترة مباشرة
    this.inventoryService.getFinishedGoods().subscribe({
      next: (finished) => {
        this.finishedProducts.set(finished);
        console.log('🔨 Finished Products loaded:', finished.length);
      },
      error: (err) => console.error('❌ Error loading finished products:', err)
    });
    
    this.inventoryService.getRawMaterials().subscribe({
      next: (raw) => {
        this.rawMaterials.set(raw);
        console.log('🪵 Raw Materials loaded:', raw.length);
      },
      error: (err) => console.error('❌ Error loading raw materials:', err)
    });
  }

  // إضافة مكون جديد للـ FormArray
  addComponent() {
    const productId = this.bomForm.get('productId')?.value;
    
    if (!productId) {
      alert('⚠️ Please select a finished product first!');
      return;
    }

    const componentGroup = this.fb.group({
      componentId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.1)]]
    });
    
    this.componentsArr.push(componentGroup);
    console.log('✅ Component row added. Total:', this.componentsArr.length);
  }

  // حذف مكون من الـ FormArray
  removeComponent(index: number) {
    this.componentsArr.removeAt(index);
    console.log('🗑️ Component removed at index', index);
  }

  // الحصول على اسم المادة حسب الـ ID
  getMaterialName(materialId: number): string {
    const material = this.rawMaterials().find(m => m.id === materialId);
    return material ? material.materialName : 'Unknown';
  }

  // التحقق من إضافة نفس المكون مرتين
  isComponentAlreadyAdded(componentId: number, currentIndex: number): boolean {
    return this.componentsArr.controls.some(
      (ctrl, index) => index !== currentIndex && ctrl.get('componentId')?.value === componentId
    );
  }

  // معالج تغيير اختيار المكون
  onComponentSelected(index: number, componentId: number) {
    if (this.isComponentAlreadyAdded(componentId, index)) {
      alert('⚠️ This component is already added!');
      this.componentsArr.at(index).get('componentId')?.reset();
    }
  }

  // حفظ الوصفة الكاملة
  onSubmit() {
    console.log('🔵 Submit clicked');
    console.log('📋 Form Valid:', this.bomForm.valid);
    console.log('📦 Form Data:', this.bomForm.value);

    if (this.bomForm.invalid) {
      this.bomForm.markAllAsTouched();
      alert('⚠️ Please complete all required fields!');
      return;
    }

    if (this.componentsArr.length === 0) {
      alert('⚠️ Please add at least one component!');
      return;
    }

    const productId = this.bomForm.get('productId')?.value;

    // التحقق من عدم اختيار المنتج كمكون لنفسه
    const hasSelfReference = this.componentsArr.controls.some(
      ctrl => ctrl.get('componentId')?.value === productId
    );

    if (hasSelfReference) {
      alert('❌ A product cannot be a component of itself!');
      return;
    }

    // عرض ملخص التأكيد
    const productName = this.finishedProducts().find(p => p.id === productId)?.materialName;
    const componentsList = this.componentsArr.value.map((c: any) => {
      const material = this.rawMaterials().find(m => m.id === c.componentId);
      return `  • ${c.quantity}x ${material?.materialName}`;
    }).join('\n');

    const confirmed = confirm(
      `📋 Create Recipe for "${productName}"?\n\nComponents:\n${componentsList}\n\nClick OK to confirm.`
    );

    if (!confirmed) return;

    this.isSubmitting.set(true);

    const command: CreateBOMCommand = {
      productId: Number(productId),
      components: this.componentsArr.value.map((c: any) => ({
        componentId: Number(c.componentId),
        quantity: Number(c.quantity)
      }))
    };

    console.log('📤 Sending to backend:', command);

    this.productionService.createBOM(command).subscribe({
      next: (componentsAdded: number) => {
        console.log('✅ Success:', componentsAdded);
        alert(`✅ Recipe Created Successfully! ${componentsAdded} component(s) added.`);
        this.bomForm.reset();
        this.componentsArr.clear();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('❌ Backend Error:', err);
        const errorMessage = err.error?.message || err.message || 'Unknown error';
        alert(`❌ Error: ${errorMessage}`);
        this.isSubmitting.set(false);
      }
    });
  }
}