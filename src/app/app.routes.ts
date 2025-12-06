import { Routes } from '@angular/router';

// --- Auth & Core ---
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/guards/auth-guard'; // 👈 تأكد من مسار الجارد

// --- Inventory Components ---
import { MaterialListComponent } from './features/inventory/components/material-list/material-list';
import { CreateMaterialComponent } from './features/inventory/components/create-material/create-material';
import { EditMaterialComponent } from './features/inventory/components/edit-material/edit-material';

// --- Purchasing Components ---
import { SupplierListComponent } from './features/purchasing/components/supplier-list/supplier-list';
import { CreateSupplierComponent } from './features/purchasing/components/create-supplier/create-supplier';
import { CreateOrderComponent as PurchasingCreateOrder } from './features/purchasing/components/create-order/create-order';
import { OrderListComponent as PurchasingOrderList } from './features/purchasing/components/order-list/order-list';
import { CreateReceiptComponent } from './features/purchasing/components/create-receipt/create-receipt';

// --- Sales Components ---
import { CustomerListComponent } from './features/sales/components/customer-list/customer-list';
import { CreateCustomerComponent } from './features/sales/components/create-customer/create-customer';
import { CreateOrderComponent as SalesCreateOrder } from './features/sales/components/create-order/create-order';
import { OrderListComponent as SalesOrderList } from './features/sales/components/order-list/order-list';

// --- Production Components ---
import { CreateBomComponent } from './features/production/components/create-bom/create-bom';
import { CreateOrderComponent as ProductionCreateOrder } from './features/production/components/create-order/create-order';
import { OrderListComponent as ProductionOrderList } from './features/production/components/order-list/order-list';

// --- Dashboard & HR & Expenses & Tasks ---
import { DashboardHomeComponent } from './features/dashboard/components/dashboard-home/dashboard-home';
import { CreateDepartmentComponent } from './features/hr/components/create-department/create-department';
import { CreateEmployeeComponent } from './features/hr/components/create-employee/create-employee';
import { EmployeeListComponent } from './features/hr/components/employee-list/employee-list';
import { CreateExpenseComponent } from './features/expenses/components/create-expense/create-expense';
import { ExpenseListComponent } from './features/expenses/components/expense-list/expense-list';
import { PerformanceDashboardComponent } from './features/tasks/components/performance-dashboard/performance-dashboard';
import { TaskListComponent } from './features/tasks/components/task-list/task-list';
import { CreateTaskComponent } from './features/tasks/components/create-task/create-task';

export const routes: Routes = [
  // 1. صفحة الدخول (بدون حماية)
  { path: 'login', component: LoginComponent },

  // 2. باقي الصفحات (محمية بـ authGuard)
  // 👇 لاحظ إضافة canActivate: [authGuard] لكل الصفحات

  // --- Dashboard ---
  { path: 'dashboard', component: DashboardHomeComponent, canActivate: [authGuard] },

  // --- Inventory ---
  { path: 'inventory', component: MaterialListComponent, canActivate: [authGuard] },
  { path: 'inventory/create', component: CreateMaterialComponent, canActivate: [authGuard] },
  { path: 'inventory/edit/:id', component: EditMaterialComponent, canActivate: [authGuard] },

  // --- Purchasing ---
  { path: 'purchasing', component: SupplierListComponent, canActivate: [authGuard] },
  { path: 'purchasing/create', component: CreateSupplierComponent, canActivate: [authGuard] },
  { path: 'purchasing/orders', component: PurchasingOrderList, canActivate: [authGuard] },
  { path: 'purchasing/create-order', component: PurchasingCreateOrder, canActivate: [authGuard] },
  { path: 'purchasing/receive/:id', component: CreateReceiptComponent, canActivate: [authGuard] },

  // --- Sales ---
  { path: 'sales', component: CustomerListComponent, canActivate: [authGuard] },
  { path: 'sales/create-customer', component: CreateCustomerComponent, canActivate: [authGuard] },
  { path: 'sales/orders', component: SalesOrderList, canActivate: [authGuard] },
  { path: 'sales/create-order', component: SalesCreateOrder, canActivate: [authGuard] },

  // --- Production ---
  { path: 'production/bom', component: CreateBomComponent, canActivate: [authGuard] },
  { path: 'production/create-order', component: ProductionCreateOrder, canActivate: [authGuard] },
  { path: 'production/orders', component: ProductionOrderList, canActivate: [authGuard] },

  // --- HR ---
  { path: 'hr', component: EmployeeListComponent, canActivate: [authGuard] },
  { path: 'hr/create-department', component: CreateDepartmentComponent, canActivate: [authGuard] },
  { path: 'hr/create-employee', component: CreateEmployeeComponent, canActivate: [authGuard] },

  // --- Expenses ---
  { path: 'expenses', component: ExpenseListComponent, canActivate: [authGuard] },
  { path: 'expenses/create', component: CreateExpenseComponent, canActivate: [authGuard] },

  // --- Tasks ---
  { path: 'tasks', component: TaskListComponent, canActivate: [authGuard] },
  { path: 'tasks/create', component: CreateTaskComponent, canActivate: [authGuard] },
  { path: 'tasks/performance', component: PerformanceDashboardComponent, canActivate: [authGuard] },

  // 3. التوجيه الافتراضي (Default Route)
  // يذهب للداشبورد (والحارس سيقرر: لو مسجل يدخل، لو لا يروح login)
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  
  // 4. (اختياري) أي رابط خطأ يذهب للرئيسية
  { path: '**', redirectTo: 'dashboard' }
];