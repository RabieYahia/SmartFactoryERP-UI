import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AccountSecurityResponse } from '../models/account-security-response.model';

@Component({
  selector: 'app-profile-security',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-security.html',
  styleUrl: './profile-security.css'
})
export class ProfileSecurityComponent implements OnInit {
  private authService = inject(AuthService);

  accountData = signal<AccountSecurityResponse | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.authService.getAccountSecurity().subscribe({
      next: (data) => {
        this.accountData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * الحصول على أدوار المستخدم من localStorage
   */
  getUserRoles(): string[] {
    return this.authService.getUserRoles();
  }
}