export interface Supplier {
  id: number;
  supplierCode: string;
  supplierName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address?: string;
  isActive: boolean;
}