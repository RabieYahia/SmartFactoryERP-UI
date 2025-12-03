export interface CreatePurchaseOrderItemDto {
  materialId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderCommand {
  supplierId: number;
  expectedDeliveryDate: string; // ISO Date String
  poNumber?: string;
  items: CreatePurchaseOrderItemDto[];
} 