import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// ✅ Import OrderItemInputDto
import { ProductionService, CreateProductionOrderCommand, OrderItemInputDto, CreateBOMCommand, BomComponentDto } from '../../services/production';
import { InventoryService } from '../../../inventory/services/inventory';
import { Material } from '../../../inventory/models/material.model';

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

  // Wizard state
  currentStep = signal<WizardStep>('select-product');
 
  // Data signals
  finishedProducts = signal<Material[]>([]);
  rawMaterials = signal<Material[]>([]);
  selectedProduct = signal<Material | null>(null);
 
  // ✅ ملاحظة مهمة: لن نحتاج هذا المتغير بعد الآن طالما أننا سنلغي حفظ الـ BOM القديمة
  hasBOM = signal<boolean>(false);
 
  isSubmitting = signal<boolean>(false);
  isCheckingBOM = signal<boolean>(false);

  // Forms
  productForm: FormGroup = this.fb.group({
    productId: ['', Validators.required]
  });

  // ✅ تم تعديل هذا الـ FormArray ليمثل الخامات المؤقتة لكل أوردر
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
      const finished = res;
      const raw = res;
     
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
     
      // ✅✅ تغيير المنطق: نذهب دائماً لتعريف الـ BOM الفوري ✅✅
      this.currentStep.set('create-bom');
     
      // تهيئة الجدول بخانتين فارغتين
      this.componentsArray.clear();
      this.addComponentRow();
      this.addComponentRow();
    }
  }

  // ✅✅ تم إلغاء هذه الدالة بالكامل لعدم الاعتماد على BOM مسجلة ✅✅
  // checkBOMExists(productId: number) { ... }

  // Step 2 (جديد): Create BOM (الخامات الفورية)
  addComponentRow() {
    const row = this.fb.group({
      componentId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.001)]] // الكمية للوحدة الواحدة
    });
    this.componentsArray.push(row);
  }

  removeComponentRow(index: number) {
    this.componentsArray.removeAt(index);
  }

  // ✅✅ تم إلغاء هذه الدالة بالكامل وعدم حفظ الـ BOM بشكل منفصل ✅✅
  // onSaveBOM() { ... }

  // Step 3 (جديد): الانتقال من BOM إلى Order Details
  onNextToOrderDetails() {
    // ✅ نتأكد أن المستخدم على الأقل أدخل مادة واحدة
    if (this.bomForm.invalid || this.componentsArray.length === 0) {
        alert('Please define at least one raw material and ensure all fields are valid.');
        return;
    }
    this.currentStep.set('order-details');
  }

  // Step 4: Create Order (الآن مع الخامات المرفقة)
  onCreateOrder() {
    if (this.orderForm.invalid || this.bomForm.invalid || !this.selectedProduct()) return;

    // 1. ✅ حساب الكميات الإجمالية المطلوبة وإعداد مصفوفة الخامات (Items)
    const orderQuantity = Number(this.orderForm.value.quantity);
    const orderComponents: OrderItemInputDto[] = this.componentsArray.value
        .filter((c: any) => c.componentId && c.quantity > 0)
        .map((c: any) => ({
            materialId: Number(c.componentId),
            // الكمية الإجمالية المطلوبة = (كمية الوحدة الواحدة من الـ BOM) * (كمية الأوردر)
            quantity: Number(c.quantity) * orderQuantity
        }));

    if (orderComponents.length === 0) {
        alert('Order creation failed: Raw materials list is empty.');
        return;
    }

    this.isSubmitting.set(true);
    const val = this.orderForm.value;

    // 2. ✅ إعداد الـ Command وإضافة مصفوفة الخامات
    const command: CreateProductionOrderCommand = {
      productId: this.selectedProduct()!.id,
      quantity: orderQuantity,
      startDate: new Date(val.startDate).toISOString(),
      priority: val.priority,
      notes: val.notes,
      items: orderComponents // ✅✅ الإرسال هنا ✅✅
    };

    // 3. إرسال الأوردر
    this.productionService.createOrder(command).subscribe({
      next: (orderId) => {
        alert(`✅ Production Order #${orderId} Created Successfully!`);
        this.router.navigate(['/production']);
      },
      error: (err) => {
        console.error('❌ Error creating order', err);
        alert('Failed to create production order.');
        this.isSubmitting.set(false);
      }
    });
  }

  // Navigation helpers
  goBack() {
    switch (this.currentStep()) {
      case 'create-bom':
        this.currentStep.set('select-product');
        break;
      case 'order-details':
        this.currentStep.set('create-bom'); // دائماً نرجع لـ create-bom
        break;
    }
  }

  cancel() {
    this.router.navigate(['/production']);
  }

  getStepNumber(): number {
    switch (this.currentStep()) {
      case 'select-product': return 1;
      case 'create-bom': return 2;
      case 'order-details': return 3;
      default: return 1;
    }
  }
}
