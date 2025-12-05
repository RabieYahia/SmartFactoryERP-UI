import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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
 * 
 * No functional changes - styling and layout only.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  // Application title (used in browser tab and metadata)
  title = 'SmartFactory-UI';
}