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

export interface DashboardCharts {
  salesTrend: DailySales[];
  topProducts: TopProduct[];
  ordersStatus: OrderStatus[];
}

// (الموديل القديم كما هو)
export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeProductionOrders: number;
  // ... باقي الخصائص القديمة
}