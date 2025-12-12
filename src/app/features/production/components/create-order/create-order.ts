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

  // --- التحكم في الخطوات ---
  currentStep = signal<number>(1); // 1: Product/BOM, 2: Quantity/Stock Check

  // --- البيانات ---
  finishedProducts = signal<Material[]>([]);
  rawMaterials = signal<Material[]>([]);
  selectedBOM = signal<{ components: any[] } | null>(null);
  stockStatus = signal<any[]>([]); // لتخزين حالة المخزون (يكفي/لا يكفي)

  isSubmitting = signal<boolean>(false);
  isBomMissing = signal<boolean>(false); // هل المنتج محتاج تعريف BOM؟

  // --- الفورم الأساسي (الخطوة 2) ---
  orderForm: FormGroup = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    startDate: [new Date().toISOString().split('T')[0], Validators.required],
    priority: ['Medium', Validators.required],
    notes: ['']
  });

  // --- فورم الـ BOM (الخطوة 1 - لو مفيش BOM) ---
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
      // فلتر المنتجات التامة
      this.finishedProducts.set(res.filter(m => (m.materialType as any) === 'FinishedGood' || (m.materialType as any) === 2 || (m.materialType as any) === '2'));
      // فلتر المواد الخام
      this.rawMaterials.set(res.filter(m => (m.materialType as any) === 'RawMaterial' || (m.materialType as any) === 0 || (m.materialType as any) === '0'));
    });
  }

  // --- الخطوة 1: اختيار المنتج والتحقق من الـ BOM ---
  onProductSelect() {
    const prodId = this.bomForm.get('productId')?.value;
    if (!prodId) return;

    this.isBomMissing.set(false);

    // نفترض دائماً أن المستخدم سيعرف BOM فورية
    this.isBomMissing.set(true); // لفتح شاشة إدخال الـ BOM
    this.componentsArr.clear();
    this.addComponent(); // إضافة سطر فاضي للمكونات
  }

  // --- دوال فورم الـ BOM ---
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

  // الانتقال للخطوة 2 مع حفظ BOM مؤقتاً
  goToStep2() {
    if (this.bomForm.invalid || this.componentsArr.length === 0) {
      this.alertService.warning('Please define at least one valid raw material component.');
      return;
    }

    // حفظ الـ components محلياً (BOM الفورية)
    this.selectedBOM.set({ components: this.componentsArr.value });

    this.isBomMissing.set(false);
    this.nextStep();
  }

  // --- التنقل ---
  nextStep() {
    this.currentStep.set(2);
    this.calculateStockRequirements(); // أول ما يدخل الخطوة 2 يحسب
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

  // --- الخطوة 2: حساب المخزون ---
  calculateStockRequirements() {
    const orderQty = this.orderForm.get('quantity')?.value || 0;

    // نستخدم الـ components المحفوظة في selectedBOM
    const componentsToUse = this.selectedBOM()?.components || [];

    const status = componentsToUse.map(comp => {
      const rawMat = this.rawMaterials().find(m => m.id == comp.componentId);
      const requiredQty = comp.quantity * orderQty; // كمية الوحدة * كمية الأوردر
      const availableQty = rawMat?.currentStockLevel || 0;

      return {
        name: rawMat?.materialName || 'Unknown',
        required: requiredQty,
        available: availableQty,
        isSufficient: availableQty >= requiredQty,
        materialId: comp.componentId // مهم جداً: لتمريره في الـ Command
      };
    });

    this.stockStatus.set(status);
  }

  // عند تغيير الكمية في الفورم
  onQuantityChange() {
    this.calculateStockRequirements();
  }

  // --- الخطوة الأخيرة: إنشاء الأوردر ---
  submitOrder() {
    if (this.orderForm.invalid) {
      this.alertService.warning('Please complete all required fields.');
      return;
    }

    // منع الإنشاء لو المخزون لا يكفي
    const hasShortage = this.stockStatus().some(s => !s.isSufficient);
    if (hasShortage) {
      const confirmMsg = '⚠️ Warning: Not enough stock for some materials. Do you want to proceed anyway?';
      if (!confirm(confirmMsg)) return;
    }

    this.isSubmitting.set(true);

    // إنشاء مصفوفة الخامات (Items) النهائية المطلوبة للـ Command
    const orderComponents: OrderItemInputDto[] = this.stockStatus().map(s => ({
      materialId: s.materialId,
      quantity: s.required // نستخدم الـ Required Quantity المحسوبة
    }));

    const command: CreateProductionOrderCommand = {
      productId: Number(this.bomForm.get('productId')?.value),
      quantity: Number(this.orderForm.get('quantity')?.value),
      startDate: new Date(this.orderForm.get('startDate')?.value).toISOString(),
      priority: this.orderForm.get('priority')?.value,
      notes: this.orderForm.get('notes')?.value,
      items: orderComponents // تمرير مصفوفة الخامات
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
