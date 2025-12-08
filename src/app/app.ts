import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth';

/**
 * COMPONENT: AppComponent (Root Component)
 * 
 * Purpose:
 * - Main application shell and entry point for the Smart Factory ERP UI
 * - Manages the top-level layout with navigation, sidebar, and main content area
 * - Routes all feature modules based on URL using Angular Router
 * 
 * Architecture:
 * - Standalone component (no NgModule needed)
 * - Uses Angular Router for SPA (Single Page Application) navigation
 * - Bootstrap framework for responsive design
 * - Responsive layout: Top navigation bar, left sidebar, main content area
 * 
 * Child Routes (defined in app.routes.ts):
 * - /dashboard: Dashboard overview with KPIs
 * - /inventory: Material management (list, create, edit)
 * - /purchasing: Purchase orders and supplier management
 * - /sales: Sales orders and customer management
 * - /production: Production orders and BOM management
 * - /expenses: Expense tracking
 * - /hr: Human resources (employees, departments)
 * - /tasks: Task management and performance
 * - /ai: AI-powered forecasting features
 * 
 * Layout Structure:
 * 1. app.html: Contains top navbar + sidebar + router-outlet
 * 2. app.css: Minimal overrides for responsive design
 * 3. styles.css: Global Bootstrap theme and utilities
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
[x: string]: any;
  authService = inject(AuthService);
  
  // Application title (used in browser tab and metadata)
  title = 'SmartFactory-UI';

  /**
   * Logout current user
   */
  logout(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('🔵 Logout button clicked');
    this.authService.logout();
    console.log('✅ Logout method called');
  }
}