export interface ProductForecast {
  productId: number;
  predictedSalesQuantity: number;
  advice: string;
}

export interface SalesHistoryRecord {
  date: string;
  totalQuantity: number;
}

export interface ForecastResult {
  predictedSales: number;
  lowerBound: number;
  upperBound: number;
}