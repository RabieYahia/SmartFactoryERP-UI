import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../services/inventory'; // تأكد أن المسار صحيح

// 1. تعريف شكل الداتا القادمة من الباك إند
interface BackendMaterial {
  id: number;
  materialName: string;
  materialCode: string;
  materialType: string | number;
  unitOfMeasure: string;
  currentStockLevel?: number;
  unitPrice?: number;
  minimumStockLevel?: number;
}

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './material-list.html',
  styleUrls: ['./material-list.css']
})
export class MaterialListComponent implements OnInit {
  // حقن السيرفيس
  private inventoryService = inject(InventoryService);

  // 2. Signals للتحكم في الحالة
  isLoading = signal<boolean>(true);
  activeTab = signal<'raw' | 'finished'>('raw');

  // الداتا الخام
  private allMaterials = signal<BackendMaterial[]>([]);

  // 3. تصفية المواد الخام
  rawMaterials = computed(() => {
    const all = this.allMaterials();
    return all.filter(m => {
      const typeStr = String(m.materialType).toLowerCase();
      return typeStr === '0' || typeStr === 'rawmaterial' || typeStr.includes('raw');
    });
  });

  // 4. تصفية المنتجات النهائية
  finishedGoods = computed(() => {
    const all = this.allMaterials();
    return all.filter(m => {
      const typeStr = String(m.materialType).toLowerCase();
      return typeStr === '1' || typeStr === 'finishedgood' || typeStr.includes('finished');
    });
  });

  // 5. القائمة المعروضة حالياً (Mapped for View)
  currentList = computed(() => {
    const all = this.allMaterials();
    const tab = this.activeTab();

    // التصفية أولاً
    const filtered = all.filter(item => {
      const typeStr = String(item.materialType).toLowerCase();
      if (tab === 'raw') {
        return typeStr === '0' || typeStr === 'rawmaterial' || typeStr.includes('raw');
      } else {
        return typeStr === '1' || typeStr === 'finishedgood' || typeStr.includes('finished');
      }
    });

    // تحويل البيانات لتناسب العرض
    return filtered.map(item => ({
      id: item.id,
      materialName: item.materialName,
      materialCode: item.materialCode,
      unit: item.unitOfMeasure || 'N/A',
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
        console.error('❌ Error loading data:', err);
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: 'raw' | 'finished') {
    this.activeTab.set(tab);
  }

  // ✅✅ هذه هي الدالة التي كانت ناقصة ✅✅
  onDelete(id: number, name: string) {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      // نفترض أن دالة الحذف في السيرفيس اسمها deleteMaterial
      this.inventoryService.deleteMaterial(id).subscribe({
        next: () => {
          alert('Material deleted successfully ✅');
          // إعادة تحميل البيانات لتحديث الجدول
          this.loadData();
        },
        error: (err: any) => {
          console.error('❌ Delete Error:', err);
          alert('❌ Failed to delete material');
        }
      });
    }
  }
}
