import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 مهم عشان الـ ngModel
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { LoginRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // بيانات النموذج
  credentials: LoginRequest = { email: '', password: '' };
  
  // حالة التحميل والخطأ
  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        console.log('Login Success:', res);
        this.isLoading.set(false);
        // توجيه للداشبورد بعد النجاح
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Login Error:', err);
        console.error('📄 Error Details:', err.error);
        
        this.isLoading.set(false);
        
        let errorMsg = '❌ Login failed.';
        if (err.status === 401) {
          errorMsg = '❌ Invalid Email or Password';
        } else if (typeof err.error === 'string') {
          const exceptionMatch = err.error.match(/Exception:\s*(.+?)(?:\r?\n|$)/);
          if (exceptionMatch) {
            errorMsg = `❌ ${exceptionMatch[1].trim()}`;
          } else {
            errorMsg = `❌ ${err.error.split('\n')[0]}`;
          }
        } else if (err.error?.message) {
          errorMsg = `❌ ${err.error.message}`;
        }
        
        this.errorMessage.set(errorMsg);
      }
    });
  }
}