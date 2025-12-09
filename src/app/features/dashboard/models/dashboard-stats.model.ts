export interface DashboardStats {
  totalMaterialsCount: number;
  lowStockItemsCount: number;
  pendingSalesOrders: number;
  potentialRevenue: number;
  activeProductionOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  criticalRawMaterials: any[];
}