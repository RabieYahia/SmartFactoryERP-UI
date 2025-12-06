import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.value).subscribe({
      next: () => {
        // توجيه للرئيسية بعد النجاح
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Invalid email or password');
        this.isSubmitting.set(false);
      }
    });
  }
}