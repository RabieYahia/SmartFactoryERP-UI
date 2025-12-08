import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../services/inventory';

// 1. تعريف شكل الداتا القادمة من الباك إند بالضبط
interface BackendMaterial {
  id: number;
  materialName: string;
  materialCode: string;
  materialType: string | number; // قد تكون رقم أو نص
  unitOfMeasure: string;
  // الحقول الاختيارية التي قد تكون مفقودة
  currentStockLevel?: number;
  unitPrice?: number;
  minimumStockLevel?: number;
}

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './material-list.html',
  styleUrls: ['./material-list.css'] // تأكد من اسم ملف الـ CSS
})
export class MaterialListComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  // 2. استخدام Signals لأن الـ HTML عندك بيستخدم ()
  isLoading = signal<boolean>(true);
  activeTab = signal<'raw' | 'finished'>('raw');
  
  // الداتا الخام اللي راجعة من السيرفر
  private allMaterials = signal<BackendMaterial[]>([]);

  // 3. تصفية المواد الخام (Raw)
  rawMaterials = computed(() => {
    const all = this.allMaterials();
    const filtered = all.filter(m => {
      const typeStr = String(m.materialType).toLowerCase();
      return typeStr === '0' || typeStr === 'rawmaterial' || typeStr.includes('raw');
    });
    console.log(`🪵 Raw Materials: ${filtered.length}`);
    return filtered;
  });

  // 4. تصفية المنتجات النهائية (Finished)
  finishedGoods = computed(() => {
    const all = this.allMaterials();
    const filtered = all.filter(m => {
      const typeStr = String(m.materialType).toLowerCase();
      return typeStr === '1' || typeStr === 'finishedgood' || typeStr.includes('finished');
    });
    console.log(`🛋️ Finished Goods: ${filtered.length}`);
    return filtered;
  });

  // 5. القائمة الحالية المعروضة بناءً على التاب المختار - مع طباعة تفصيلية
  currentList = computed(() => {
    const all = this.allMaterials();
    const tab = this.activeTab();

    console.log(`🔍 Filtering for tab: ${tab}`);
    console.log(`📊 Total items before filter: ${all.length}`);

    // الخطوة 1: التصفية (Filtering)
    const filtered = all.filter(item => {
      // توحيد التعامل مع النوع كـ نص (String) لتجنب مشاكل الأرقام
      const typeStr = String(item.materialType).toLowerCase();
      
      if (tab === 'raw') {
        // نعتبر الـ 0 أو RawMaterial مواد خام
        return typeStr === '0' || typeStr === 'rawmaterial' || typeStr.includes('raw');
      } else {
        // نعتبر الـ 1 أو FinishedGood منتجات نهائية
        return typeStr === '1' || typeStr === 'finishedgood' || typeStr.includes('finished');
      }
    });

    console.log(`✅ Items after filter: ${filtered.length}`);

    // الخطوة 2: تعيين القيم (Mapping) لتناسب الـ HTML
    return filtered.map(item => ({
      id: item.id,
      materialName: item.materialName,
      materialCode: item.materialCode,
      // الـ HTML ينتظر unit، ونحن نأخذها من unitOfMeasure
      unit: item.unitOfMeasure || 'N/A', 
      // وضع قيم افتراضية لو كانت الأرقام غير موجودة عشان الضرب ما يضربش
      currentStockLevel: Number(item.currentStockLevel) || 0,
      minimumStockLevel: Number(item.minimumStockLevel) || 0,
      unitPrice: Number(item.unitPrice) || 0
    }));
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.inventoryService.getMaterials().subscribe({
      next: (data) => {
        console.log('📦 Inventory Data Received:', data);
        this.allMaterials.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: 'raw' | 'finished') {
    this.activeTab.set(tab);
  }
}