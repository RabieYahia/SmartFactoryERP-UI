import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
// 👇 1. تم إضافة RouterLink هنا لحل مشكلة الزرار
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory';
import { Material } from '../../models/material.model';
import { AiService } from '../../../ai/services/ai';

@Component({
  selector: 'app-material-list',
  standalone: true,
  // 👇 2. تم إضافتها في مصفوفة الـ imports
  imports: [CommonModule, RouterLink], 
  templateUrl: './material-list.html',
  styleUrl: './material-list.css'
})
export class MaterialListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
private aiService = inject(AiService);
  // الإشارات (Signals)
  materials = signal<Material[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);

  // القائمة المفلترة (Computed)
  filteredMaterials = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const all = this.materials();
      
    if (!query) return all;

    return all.filter(m => 
      m.materialName.toLowerCase().includes(query) || 
      m.materialCode.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    // تحميل البيانات عند فتح الصفحة
    this.fetchData();
  }

  // دالة مساعدة لجلب البيانات (عشان نستخدمها في البداية وفي حالة الخطأ)
  fetchData() {
    this.isLoading.set(true);
    this.inventoryService.getMaterials().subscribe({
      next: (data) => {
        this.materials.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // دالة البحث
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
  

  // دالة الحذف
  onDelete(id: number) {
    const confirmDelete = confirm('Are you sure you want to delete this material?');
    
    if (confirmDelete) {
      // 1. تحديث متفائل (احذف من الشاشة فوراً)
      this.materials.update(currentList => currentList.filter(m => m.id !== id));

      // 2. إرسال للسيرفر
      this.inventoryService.deleteMaterial(id).subscribe({
        next: () => {
          console.log('Deleted successfully');
        },
        error: (err) => {
          console.error(err);
          alert('❌ Error deleting material. Maybe it has related transactions?');
          
          // 👇 3. التعديل هنا: لو فشل الحذف، نرجع نحمل البيانات تاني
          this.fetchData(); 
        }
        
      });
      
      
    }
    
  }
  onPredict(materialId: number, materialName: string) {
  const confirmPredict = confirm(`🔮 Do you want to generate AI sales forecast for '${materialName}'?`);

  if (confirmPredict) {
    this.isLoading.set(true); // نستخدم نفس لودر الصفحة مؤقتاً

    this.aiService.getForecast(materialId).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        // عرض النتيجة في رسالة جميلة
        alert(`
          🤖 AI Prediction for ${materialName}:
          -----------------------------------------
          📊 Expected Sales Next Month: ${res.predictedSalesQuantity} Units
          💡 Advice: ${res.advice}
        `);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        alert('❌ Failed to generate forecast. Not enough historical data?');
      }
    });
  }
}
}