import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sales-dashboard.html',
  styleUrl: './sales-dashboard.css'
})
export class SalesDashboardComponent {
  modules = [
    {
      title: 'Customers',
      description: 'Manage customer information and contacts',
      icon: 'bi-people',
      route: '/sales/customers',
      color: '#3b82f6'
    },
    {
      title: 'Sales Orders',
      description: 'View and manage all sales orders',
      icon: 'bi-cart-check',
      route: '/sales/orders',
      color: '#10b981'
    },
    {
      title: 'New Sale',
      description: 'Create a new sales order',
      icon: 'bi-cart-plus',
      route: '/sales/create-order',
      color: '#8b5cf6'
    }
  ];
}
