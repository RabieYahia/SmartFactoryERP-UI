export interface Expense {
  id: number;
  description: string;
  amount: number;
  expenseDate: string;
  // some APIs may return alternate date fields
  date?: string;
  createdAt?: string;
  category: string; // "Rent", "Utilities", etc.
  employeeId?: number; // اختياري
}

// قائمة الفئات (مطابقة للـ Enum في الـ Backend)
export const EXPENSE_CATEGORIES = [
  'Utilities',
  'Rent',
  'Salaries',
  'Maintenance',
  'OfficeSupplies',
  'Other'
];