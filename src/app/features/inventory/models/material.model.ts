export interface Material {
  id: number;
  materialCode: string;
  materialName: string;
  materialType: number;
  unitOfMeasure: string;
  unitPrice: number;
  currentStockLevel: number;  // ✅ يدعم decimal من Backend
  minimumStockLevel: number;  // ✅ يدعم decimal من Backend
  
  // Aliases for backward compatibility
  name?: any;
  code?: any;
  unit?: any;
}