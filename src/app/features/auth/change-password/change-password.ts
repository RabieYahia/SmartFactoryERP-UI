import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ChangePasswordRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);

  // النموذج
  model: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  onSubmit() {
    // 1. تحقق بسيط في الفرونت
    if (this.model.newPassword !== this.model.confirmPassword) {
      this.errorMessage.set('New passwords do not match!');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // 2. إرسال الطلب
    this.authService.changePassword(this.model).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.successMessage.set('Password changed successfully! Please login again.');
        
        // 3. خروج المستخدم بعد 2 ثانية عشان يدخل بالباسورد الجديد
        setTimeout(() => this.authService.logout(), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to change password.');
      }
    });
  }
}