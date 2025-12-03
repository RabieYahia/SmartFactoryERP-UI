export interface CreateSalesOrderItemDto {
  materialId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderCommand {
  customerId: number;
  items: CreateSalesOrderItemDto[];
}