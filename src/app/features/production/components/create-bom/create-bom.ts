import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductionService, CreateBOMCommand } from '../../services/production';
import { InventoryService } from '../../../inventory/services/inventory';
import { Material } from '../../../inventory/models/material.model';
import { AlertService } from '../../../../core/services/alert.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

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
  private alertService = inject(AlertService);
  private confirmService = inject(ConfirmService);

  isSubmitting = signal<boolean>(false);

  // القوائم المفلترة
  finishedProducts = signal<Material[]>([]); // للمنتج النهائي
  rawMaterials = signal<Material[]>([]);     // للمواد الخام

  bomForm: FormGroup = this.fb.group({
    productId: [null, Validators.required],
    components: this.fb.array([])
  });

  get componentsArr(): FormArray {
    return this.bomForm.get('components') as FormArray;
  }

  ngOnInit() {
    this.loadAndFilterMaterials();
  }

  loadAndFilterMaterials() {
    // هنجيب كل المواد مرة واحدة ونفلترها هنا (عشان نضمن الدقة)
    this.inventoryService.getMaterials().subscribe({
      next: (allMaterials) => {
        console.log('📦 All Materials:', allMaterials);

        // 1️⃣ فلتر المنتجات النهائية (Finished Goods)
        const finished = allMaterials.filter(m => {
          const t = (m.materialType as any);
          return t === 'FinishedGood' || t === 'Finished' || t === 2 || t === '2';
        });
        this.finishedProducts.set(finished);

        // 2️⃣ فلتر المواد الخام (Raw Materials)
        const raw = allMaterials.filter(m => {
          const t = (m.materialType as any);
          return t === 'RawMaterial' || t === 'Raw' || t === 0 || t === '0';
        });
        this.rawMaterials.set(raw);

        console.log('🔨 Finished Goods:', finished);
        console.log('🪵 Raw Materials:', raw);
      },
      error: (err) => console.error('Failed to load materials', err)
    });
  }

  addComponent() {
<<<<<<< HEAD
=======
    const productId = this.bomForm.get('productId')?.value;
    
    if (!productId) {
      this.alertService.warning('Please select a finished product first!');
      return;
    }

>>>>>>> c70a22fee14f6993b4b4670197472033b10f8036
    const componentGroup = this.fb.group({
      componentId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.1)]]
    });
    this.componentsArr.push(componentGroup);
  }

  removeComponent(index: number) {
    this.componentsArr.removeAt(index);
  }

  isComponentAlreadyAdded(componentId: number, currentIndex: number): boolean {
    return this.componentsArr.controls.some(
      (ctrl, index) => index !== currentIndex && ctrl.get('componentId')?.value === componentId
    );
  }

  onComponentSelected(index: number, componentId: number) {
    // منع تكرار نفس المادة
    if (this.isComponentAlreadyAdded(componentId, index)) {
<<<<<<< HEAD
      alert('⚠️ This material is already added to the recipe!');
      this.componentsArr.at(index).get('componentId')?.setValue(null);
    }

    // منع اختيار المنتج نفسه كمكون (Infinite Loop)
    const mainProductId = this.bomForm.get('productId')?.value;
    if (mainProductId && componentId === mainProductId) {
      alert('❌ Cannot use the finished product as a component of itself!');
      this.componentsArr.at(index).get('componentId')?.setValue(null);
=======
      this.alertService.warning('This component is already added!');
      this.componentsArr.at(index).get('componentId')?.reset();
>>>>>>> c70a22fee14f6993b4b4670197472033b10f8036
    }
  }

  onSubmit() {
    if (this.bomForm.invalid || this.componentsArr.length === 0) {
      this.bomForm.markAllAsTouched();
<<<<<<< HEAD
      if (this.componentsArr.length === 0) alert('Please add at least one component.');
      return;
    }

=======
      this.alertService.warning('Please complete all required fields!');
      return;
    }

    if (this.componentsArr.length === 0) {
      this.alertService.warning('Please add at least one component!');
      return;
    }

    const productId = this.bomForm.get('productId')?.value;

    // التحقق من عدم اختيار المنتج كمكون لنفسه
    const hasSelfReference = this.componentsArr.controls.some(
      ctrl => ctrl.get('componentId')?.value === productId
    );

    if (hasSelfReference) {
      this.alertService.error('A product cannot be a component of itself!');
      return;
    }

    // عرض ملخص التأكيد
    const productName = this.finishedProducts().find(p => p.id === productId)?.materialName;
    const componentsList = this.componentsArr.value.map((c: any) => {
      const material = this.rawMaterials().find(m => m.id === c.componentId);
      return `  • ${c.quantity}x ${material?.materialName}`;
    }).join('\n');

    this.confirmService.warning(
      `Create Recipe for "${productName}"?\n\nComponents:\n${componentsList}\n\nClick OK to confirm.`,
      () => this.proceedCreateBom(productId)
    );
  }

  private proceedCreateBom(productId: number) {
>>>>>>> c70a22fee14f6993b4b4670197472033b10f8036
    this.isSubmitting.set(true);
    const val = this.bomForm.value;

    const command: CreateBOMCommand = {
      productId: Number(val.productId),
      components: val.components.map((c: any) => ({
        componentId: Number(c.componentId),
        quantity: Number(c.quantity)
      }))
    };

    console.log('🚀 Saving BOM:', command);

    this.productionService.createBOM(command).subscribe({
<<<<<<< HEAD
      next: () => {
        alert('✅ Recipe (BOM) Created Successfully!');
        this.router.navigate(['/production']);
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to save recipe. It might already exist.');
=======
      next: (componentsAdded: number) => {
        console.log('✅ Success:', componentsAdded);
        this.alertService.success(`Recipe Created Successfully! ${componentsAdded} component(s) added.`);
        this.bomForm.reset();
        this.componentsArr.clear();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('❌ Backend Error:', err);
        const errorMessage = err.error?.message || err.message || 'Unknown error';
        this.alertService.error(`Error: ${errorMessage}`);
>>>>>>> c70a22fee14f6993b4b4670197472033b10f8036
        this.isSubmitting.set(false);
      }
    });
  }
}
