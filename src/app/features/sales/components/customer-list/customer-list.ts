import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SalesService } from '../../services/sales';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerListComponent implements OnInit {
  private salesService = inject(SalesService);

  customers = signal<Customer[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.salesService.getCustomers().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Load Customers Error:', err);
        console.error('📄 Error Details:', err.error);
        
        let errorMsg = 'Failed to load customers.';
        if (typeof err.error === 'string') {
          const exceptionMatch = err.error.match(/Exception:\s*(.+?)(?:\r?\n|$)/);
          if (exceptionMatch) {
            errorMsg = exceptionMatch[1].trim();
          } else {
            errorMsg = err.error.split('\n')[0];
          }
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        }
        
        alert(`❌ ${errorMsg}`);
        this.isLoading.set(false);
      }
    });
  }
}