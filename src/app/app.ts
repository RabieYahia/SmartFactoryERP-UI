import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth';
import { AlertContainerComponent } from './shared/components/alert-container/alert-container.component';
import { ConfirmDialogContainerComponent } from './shared/components/confirm-dialog-container/confirm-dialog-container.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, AlertContainerComponent, ConfirmDialogContainerComponent, ThemeToggleComponent], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'SmartFactory-UI';
  showLayout = false; // ← بدلاً من isLoginPage()
  
  authService = inject(AuthService);
  private router = inject(Router);

  // Global Search
  searchTerm = '';
  searchResults: any[] = [];
  showSearchResults = false;
  isSearching = false;

  constructor() {
    // تتبع تغيير الصفحات
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showLayout = !['/login', '/register'].includes(event.url);
    });
  }

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.authService.logout();
  }

  /**
   * الحصول على اسم المستخدم
   */
  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user?.fullName || user?.email || 'User';
  }

  /**
   * الحصول على أدوار المستخدم كنص
   */
  get userRoles(): string {
    const roles = this.authService.getUserRoles();
    return roles.length > 0 ? roles.join(', ') : 'No Role';
  }

  /**
   * الحصول على أول دور للمستخدم
   */
  get primaryRole(): string {
    const roles = this.authService.getUserRoles();
    return roles.length > 0 ? roles[0] : 'User';
  }

  /**
   * التحقق إذا المستخدم Admin أو SuperAdmin
   */
  get isAdmin(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('SuperAdmin');
  }

  /**
   * التحقق إذا المستخدم InventoryManager
   */
  get isInventoryManager(): boolean {
    return this.authService.hasRole('InventoryManager');
  }

  /**
   * Global Search
   */
  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    
    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    this.isSearching = true;
    this.performSearch();
  }

  performSearch() {
    const term = this.searchTerm.toLowerCase();
    this.searchResults = [];

    // Search in modules/pages
    const modules = [
      { name: 'Dashboard', icon: 'speedometer2', route: '/dashboard' },
      { name: 'Inventory', icon: 'box-seam', route: '/inventory' },
      { name: 'Materials', icon: 'boxes', route: '/inventory' },
      { name: 'Purchasing', icon: 'truck', route: '/purchasing' },
      { name: 'Suppliers', icon: 'building', route: '/purchasing/suppliers' },
      { name: 'Purchase Orders', icon: 'receipt', route: '/purchasing/orders' },
      { name: 'Sales', icon: 'cash-coin', route: '/sales' },
      { name: 'Customers', icon: 'people', route: '/sales/customers' },
      { name: 'Sales Orders', icon: 'cart', route: '/sales/orders' },
      { name: 'Production', icon: 'gear', route: '/production' },
      { name: 'Production Orders', icon: 'list-task', route: '/production/orders' },
      { name: 'BOM Management', icon: 'diagram-3', route: '/production/bom' },
      { name: 'IoT Monitoring', icon: 'cpu', route: '/iot' },
      { name: 'Machines', icon: 'hdd', route: '/iot' },
      { name: 'Expenses', icon: 'receipt', route: '/expenses' },
      { name: 'HR & Departments', icon: 'people', route: '/hr' },
      { name: 'Employees', icon: 'person-badge', route: '/hr/employees' },
      { name: 'Attendance', icon: 'clock-history', route: '/hr/attendance' },
      { name: 'Tasks', icon: 'list-check', route: '/tasks' },
      { name: 'Performance', icon: 'graph-up', route: '/tasks' },
      { name: 'AI Insights', icon: 'robot', route: '/ai' },
      { name: 'User Management', icon: 'shield-lock', route: '/admin/users' }
    ];

    // Filter modules by search term
    const matchedModules = modules.filter(m => 
      m.name.toLowerCase().includes(term)
    ).slice(0, 8);

    this.searchResults = matchedModules.map(m => ({
      type: 'module',
      ...m
    }));

    this.showSearchResults = this.searchResults.length > 0;
    this.isSearching = false;
  }

  navigateToResult(result: any) {
    this.router.navigate([result.route]);
    this.clearSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  onSearchBlur() {
    // Delay to allow click on result
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }
}