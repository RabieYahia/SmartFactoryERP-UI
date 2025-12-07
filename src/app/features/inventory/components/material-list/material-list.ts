import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory';

import { Material } from '../../models/material.model'; // تأكد من المسار حسب هيكل ملفاتك

@Component({
  selector: 'app-material-list', // تأكد أن السليكتور مطابق لما تستخدمه
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './material-list.html',
  styleUrls: ['./material-list.css']
})
export class MaterialListComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  // Data Signals
  allMaterials = signal<Material[]>([]);
  isLoading = signal<boolean>(true);
  
  // Tab State: 'raw' or 'finished'
  activeTab = signal<'raw' | 'finished'>('raw');

  // Computed Signals (الفلترة التلقائية)
  // 0 = RawMaterial, 1 = FinishedGood (حسب الـ Enum في الباك اند)
  // Assuming materialType is a number: 0 = RawMaterial, 1 = FinishedGood
  rawMaterials = computed(() => 
    this.allMaterials().filter(m => m.materialType === 0)
  );

  finishedGoods = computed(() => 
    this.allMaterials().filter(m => m.materialType === 1)
  );

  // القائمة المعروضة حالياً
  currentList = computed(() => 
    this.activeTab() === 'raw' ? this.rawMaterials() : this.finishedGoods()
  );

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.inventoryService.getMaterials().subscribe({
      next: (data) => {
        this.allMaterials.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: 'raw' | 'finished') {
    this.activeTab.set(tab);
  }
}