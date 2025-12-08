import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AccountSecurityResponse } from '../../models/account-security-response.model';

@Component({
  selector: 'app-profile-security',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-security.component.html',
  styleUrl: './profile-security.component.css'
})
export class ProfileSecurityComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  securityInfo = signal<AccountSecurityResponse | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  lockoutCountdown = signal('');

  ngOnInit(): void {
    this.loadSecurityInfo();
  }

  private loadSecurityInfo(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.getAccountSecurity().subscribe({
      next: (data) => {
        this.securityInfo.set(data);
        this.isLoading.set(false);
        
        if (data.isLocked && data.lockoutEnd) {
          this.calculateLockoutCountdown(typeof data.lockoutEnd === 'string' ? data.lockoutEnd : data.lockoutEnd.toISOString());
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.userMessage || 'Failed to load security information');
      }
    });
  }

  private calculateLockoutCountdown(lockoutEnd: string): void {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(lockoutEnd).getTime();
      const distance = end - now;

      if (distance < 0) {
        this.lockoutCountdown.set('Account unlocked');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.lockoutCountdown.set(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  navigateToChangePassword(): void {
    this.router.navigate(['/change-password']);
  }

  refreshSecurityInfo(): void {
    this.loadSecurityInfo();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}
