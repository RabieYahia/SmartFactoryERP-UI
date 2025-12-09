// أضف هذه الواجهات (Interfaces) الجديدة
export interface DailySales {
  date: string;
  totalAmount: number;
}

export interface TopProduct {
  productName: string;
  quantitySold: number;
}

export interface OrderStatus {
  status: string;
  count: number;
}

export interface LowStockMaterial {
  materialId: number;
  name: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  shortage: number;
}

export interface DashboardCharts {
  salesTrend: DailySales[];
  topProducts: TopProduct[];
  ordersStatus: OrderStatus[];
}

export interface DashboardStats {
  totalMaterialsCount: number;
  lowStockItemsCount: number;
  pendingSalesOrders: number;
  potentialRevenue: number;
  activeProductionOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  criticalRawMaterials: LowStockMaterial[];
}