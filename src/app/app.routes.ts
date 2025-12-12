import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role.guard';

// --- Shared ---
import { UnauthorizedComponent } from './shared/unauthorized/unauthorized.component';

// --- Auth Components ---
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ProfileSecurityComponent } from './features/auth/profile-security/profile-security';
import { ChangePasswordComponent } from './features/auth/change-password/change-password';
import { ConfirmEmailComponent } from './features/auth/confirm-email/confirm-email';

// --- Admin ---
import { UserManagementComponent } from './features/admin/user-management/user-management';
import { UserListComponent } from './features/admin/components/user-list/user-list';

// --- Dashboard & HR ---
import { DashboardHomeComponent } from './features/dashboard/components/dashboard-home/dashboard-home';
import { CreateDepartmentComponent } from './features/hr/components/create-department/create-department';
import { CreateEmployeeComponent } from './features/hr/components/create-employee/create-employee';
import { EmployeeListComponent } from './features/hr/components/employee-list/employee-list';
import { AttendanceListComponent } from './features/hr/components/attendance-list/attendance-list';

// --- Inventory ---
import { MaterialListComponent } from './features/inventory/components/material-list/material-list';
import { CreateMaterialComponent } from './features/inventory/components/create-material/create-material';
import { EditMaterialComponent } from './features/inventory/components/edit-material/edit-material';

// --- Purchasing ---
import { SupplierListComponent } from './features/purchasing/components/supplier-list/supplier-list';
import { CreateSupplierComponent } from './features/purchasing/components/create-supplier/create-supplier';
import { CreateOrderComponent as PurchasingCreateOrder } from './features/purchasing/components/create-order/create-order';
import { OrderListComponent as PurchasingOrderList } from './features/purchasing/components/order-list/order-list';
import { CreateReceiptComponent } from './features/purchasing/components/create-receipt/create-receipt';

// --- Sales ---
import { SalesDashboardComponent } from './features/sales/components/sales-dashboard/sales-dashboard';
import { CustomerListComponent } from './features/sales/components/customer-list/customer-list';
import { CreateCustomerComponent } from './features/sales/components/create-customer/create-customer';
import { CreateOrderComponent as SalesCreateOrder } from './features/sales/components/create-order/create-order';
import { OrderListComponent as SalesOrderList } from './features/sales/components/order-list/order-list';

// --- Production ---
import { ProductionDashboardComponent } from './features/production/components/production-dashboard/production-dashboard';
import { ProductionWizardComponent } from './features/production/components/production-wizard/production-wizard';
import { CreateBomComponent } from './features/production/components/create-bom/create-bom';
import { CreateOrderComponent as ProductionCreateOrder } from './features/production/components/create-order/create-order';
import { OrderListComponent as ProductionOrderList } from './features/production/components/order-list/order-list';

// --- Expenses ---
import { CreateExpenseComponent } from './features/expenses/components/create-expense/create-expense';
import { ExpenseListComponent } from './features/expenses/components/expense-list/expense-list';

// --- Tasks & IoT ---
import { PerformanceDashboardComponent } from './features/tasks/components/performance-dashboard/performance-dashboard';
import { TaskListComponent } from './features/tasks/components/task-list/task-list';
import { CreateTaskComponent } from './features/tasks/components/create-task/create-task';
import { MachineDashboardComponent } from './features/iot/components/machine-dashboard/machine-dashboard';

// --- AI ---
import { AiDashboardComponent } from './features/ai/components/ai-dashboard/ai-dashboard';

export const routes: Routes = [
  // 1️⃣ المسارات العامة
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 2️⃣ المسارات المحمية
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardHomeComponent },

      // ✅ المسارات الخاصة بالملف الشخصي (كل المستخدمين)
      { path: 'profile-security', component: ProfileSecurityComponent },
      { path: 'change-password', component: ChangePasswordComponent },

      // --- Admin (Admin & SuperAdmin only) ---
      { 
        path: 'admin/users', 
        component: UserListComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] }
      },

      // --- Inventory (Admin & Manager only) ---
      { 
        path: 'inventory', 
        component: MaterialListComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Manager', 'Employee'] }
      },
      { 
        path: 'inventory/create', 
        component: CreateMaterialComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Manager'] }
      },
      { 
        path: 'inventory/edit/:id', 
        component: EditMaterialComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Manager'] }
      },

      // --- Purchasing ---
      { path: 'purchasing', component: SupplierListComponent },
      { path: 'purchasing/create', component: CreateSupplierComponent },
      { path: 'purchasing/orders', component: PurchasingOrderList },
      { path: 'purchasing/create-order', component: PurchasingCreateOrder },
      { path: 'purchasing/receive/:id', component: CreateReceiptComponent },

      // --- Sales ---
      { path: 'sales', component: SalesDashboardComponent },
      { path: 'sales/customers', component: CustomerListComponent },
      { path: 'sales/create-customer', component: CreateCustomerComponent },
      { path: 'sales/orders', component: SalesOrderList },
      { path: 'sales/create-order', component: SalesCreateOrder },

      // --- Production ---
      { path: 'production', component: ProductionDashboardComponent },
      { path: 'production/wizard', component: ProductionWizardComponent },
      { path: 'production/bom', component: CreateBomComponent },
      { path: 'production/create-order', component: ProductionCreateOrder },
      { path: 'production/orders', component: ProductionOrderList },

      // --- HR ---
      { path: 'hr', component: EmployeeListComponent },
      { path: 'hr/create-department', component: CreateDepartmentComponent, canActivate: [roleGuard], data: { policy: 'CanManageHR' } },
      { path: 'hr/create-employee', component: CreateEmployeeComponent, canActivate: [roleGuard], data: { policy: 'CanManageHR' } },
      { path: 'hr/edit-department/:id', component: CreateDepartmentComponent, canActivate: [roleGuard], data: { policy: 'CanManageHR' } },
      { path: 'hr/edit-employee/:id', component: CreateEmployeeComponent, canActivate: [roleGuard], data: { policy: 'CanManageHR' } },
      { path: 'hr/attendance', component: AttendanceListComponent },

      // --- Expenses ---
      { path: 'expenses', component: ExpenseListComponent },
      { path: 'expenses/create', component: CreateExpenseComponent },

      // --- Tasks ---
      { path: 'tasks', component: TaskListComponent },
      { path: 'tasks/create', component: CreateTaskComponent },
      { path: 'tasks/performance', component: PerformanceDashboardComponent },

      // --- IoT ---
      { path: 'iot', component: MachineDashboardComponent },

      // --- AI ---
      { path: 'ai', component: AiDashboardComponent },
    ]
  },

  // 3️⃣ Wildcard - redirect to dashboard if logged in, otherwise login
  { path: '**', redirectTo: 'dashboard' }
];