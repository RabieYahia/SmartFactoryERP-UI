import { Routes } from '@angular/router';

// --- Inventory Components ---
import { MaterialListComponent } from './features/inventory/components/material-list/material-list';
import { CreateMaterialComponent } from './features/inventory/components/create-material/create-material';

// --- Purchasing Components (مع استخدام Aliases لتجنب التكرار) ---
import { SupplierListComponent } from './features/purchasing/components/supplier-list/supplier-list';
import { CreateSupplierComponent } from './features/purchasing/components/create-supplier/create-supplier';
import { CreateOrderComponent as PurchasingCreateOrder } from './features/purchasing/components/create-order/create-order'; // 👈 اسم مميز
import { OrderListComponent as PurchasingOrderList } from './features/purchasing/components/order-list/order-list';     // 👈 اسم مميز
import { CreateReceiptComponent } from './features/purchasing/components/create-receipt/create-receipt';

// --- Sales Components ---
import { CustomerListComponent } from './features/sales/components/customer-list/customer-list';
import { CreateCustomerComponent } from './features/sales/components/create-customer/create-customer';
import { CreateOrderComponent as SalesCreateOrder } from './features/sales/components/create-order/create-order';       // 👈 اسم مميز
import { OrderListComponent as SalesOrderList } from './features/sales/components/order-list/order-list';               // 👈 اسم مميز

// --- Production Components ---
import { CreateBomComponent } from './features/production/components/create-bom/create-bom';
import { CreateOrderComponent as ProductionCreateOrder } from './features/production/components/create-order/create-order'; // 👈 اسم مميز
import { OrderListComponent as ProductionOrderList } from './features/production/components/order-list/order-list';
import { DashboardHomeComponent } from './features/dashboard/components/dashboard-home/dashboard-home';
import { CreateDepartmentComponent } from './features/hr/components/create-department/create-department';
import { CreateEmployeeComponent } from './features/hr/components/create-employee/create-employee';
import { EmployeeListComponent } from './features/hr/components/employee-list/employee-list';
import { CreateExpenseComponent } from './features/expenses/components/create-expense/create-expense';
import { ExpenseListComponent } from './features/expenses/components/expense-list/expense-list';
import { PerformanceDashboardComponent } from './features/tasks/components/performance-dashboard/performance-dashboard';
import { TaskListComponent } from './features/tasks/components/task-list/task-list';
import { CreateTaskComponent } from './features/tasks/components/create-task/create-task';
import { EditMaterialComponent } from './features/inventory/components/edit-material/edit-material';
export const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  
  // --- Inventory ---
  { path: 'inventory', component: MaterialListComponent },
  { path: 'inventory/create', component: CreateMaterialComponent },
  { path: 'inventory/edit/:id', component: EditMaterialComponent },

  // --- Purchasing ---
  { path: 'purchasing', component: SupplierListComponent },
  { path: 'purchasing/create', component: CreateSupplierComponent },
  { path: 'purchasing/orders', component: PurchasingOrderList },       // قائمة أوامر الشراء
  { path: 'purchasing/create-order', component: PurchasingCreateOrder }, // شاشة إنشاء أمر شراء
  { path: 'purchasing/receive/:id', component: CreateReceiptComponent }, // 👈 تصحيح: شاشة الاستلام

  // --- Sales ---
  { path: 'sales', component: CustomerListComponent },
  { path: 'sales/create-customer', component: CreateCustomerComponent },
  { path: 'sales/orders', component: SalesOrderList },                 // قائمة أوامر البيع
  { path: 'sales/create-order', component: SalesCreateOrder },         // شاشة إنشاء أمر بيع

  // --- Production ---
  { path: 'production/bom', component: CreateBomComponent },
  { path: 'production/create-order', component: ProductionCreateOrder }, // شاشة إنشاء أمر تصنيع
  { path: 'production/orders', component: ProductionOrderList },

  // Hr 
  // ...
{ path: 'hr/create-department', component: CreateDepartmentComponent },
{ path: 'hr/create-employee', component: CreateEmployeeComponent },
{ path: 'hr', component: EmployeeListComponent },
  // ...
  // Expenses
  { path: 'expenses', component: ExpenseListComponent },
  // Task
  { path: 'tasks/performance', component: PerformanceDashboardComponent },
{ path: 'expenses/create', component: CreateExpenseComponent },
// ...
{ path: 'tasks', component: TaskListComponent },
{ path: 'tasks/create', component: CreateTaskComponent },
  // ...
{ path: 'dashboard', component: DashboardHomeComponent },
// وتغيير الـ Redirect الافتراضي
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];