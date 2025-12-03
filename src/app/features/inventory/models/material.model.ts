export interface Material {
  id: number;
  materialCode: string;
  materialName: string;
  currentStockLevel: number;
  unitPrice: number;
  minimumStockLevel: number;

  // 👇 أضف هذا السطر ليختفي الخطأ
  unitOfMeasure: string; 
}