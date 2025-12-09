import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { RegisterRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  data: RegisterRequest = { fullName: '', email: '', password: '', employeeId: null };
  
  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.data).subscribe({
      next: (res) => {
        console.log('Registration Success:', res);
        this.isLoading.set(false);
        // توجيه مباشر للداشبورد (لأن الـ API بيعمل Login أوتوماتيك)
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        // عرض رسالة الخطأ اللي جاية من الباك إند
        this.errorMessage.set(err.error?.message || '❌ Registration Failed');
      }
    });
  }
}