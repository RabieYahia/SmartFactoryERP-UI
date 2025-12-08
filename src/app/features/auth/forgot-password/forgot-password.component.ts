import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ForgotPasswordRequest } from '../../models/forgot-password-request.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotForm!: FormGroup;
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  countdown = signal(0);

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: ForgotPasswordRequest = {
      email: this.forgotForm.value.email
    };

    this.authService.forgotPassword(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.startCountdown();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.userMessage || 'Failed to send reset link');
      }
    });
  }

  private startCountdown(): void {
    this.countdown.set(60);
    const interval = setInterval(() => {
      this.countdown.update(c => c - 1);
      if (this.countdown() === 0) {
        clearInterval(interval);
        this.isSuccess.set(false);
      }
    }, 1000);
  }

  get email() {
    return this.forgotForm.get('email');
  }
}
