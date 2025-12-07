export interface Material {
name: any;
code: any;
unit: any;
  materialType: number;
  id: number;
  materialCode: string;
  materialName: string;
  currentStockLevel: number;
  unitPrice: number;
  minimumStockLevel: number;

  // 👇 أضف هذا السطر ليختفي الخطأ
  unitOfMeasure: string; 
}