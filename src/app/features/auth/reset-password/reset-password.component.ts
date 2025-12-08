import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ResetPasswordRequest } from '../../models/reset-password-request.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resetForm!: FormGroup;
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  
  email = signal('');
  token = signal('');
  isValidatingToken = signal(true);
  isTokenValid = signal(false);

  passwordStrength = computed(() => {
    const password = this.resetForm?.get('password')?.value || '';
    return this.calculatePasswordStrength(password);
  });

  passwordStrengthText = computed(() => {
    const strength = this.passwordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  });

  passwordStrengthColor = computed(() => {
    const strength = this.passwordStrength();
    if (strength < 40) return 'danger';
    if (strength < 70) return 'warning';
    return 'success';
  });

  ngOnInit(): void {
    // Get token and email from query params
    this.route.queryParams.subscribe(params => {
      this.email.set(params['email'] || '');
      this.token.set(params['token'] || '');

      if (!this.email() || !this.token()) {
        this.errorMessage.set('Invalid reset link. Please request a new password reset.');
        this.isValidatingToken.set(false);
        this.isTokenValid.set(false);
      } else {
        this.isValidatingToken.set(false);
        this.isTokenValid.set(true);
      }
    });

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const errors: ValidationErrors = {};

    if (password.length < 8) {
      errors['minLength'] = true;
    }
    if (!/[A-Z]/.test(password)) {
      errors['uppercase'] = true;
    }
    if (!/[a-z]/.test(password)) {
      errors['lowercase'] = true;
    }
    if (!/\d/.test(password)) {
      errors['digit'] = true;
    }
    if (!/[@$!%*?&#]/.test(password)) {
      errors['specialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private calculatePasswordStrength(password: string): number {
    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[@$!%*?&#]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) strength += 10;

    return Math.min(strength, 100);
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: ResetPasswordRequest = {
      email: this.email(),
      token: this.token(),
      newPassword: this.resetForm.value.password,
      confirmPassword: this.resetForm.value.confirmPassword
    };

    this.authService.resetPassword(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.userMessage || 'Failed to reset password. The link may have expired.');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  get password() {
    return this.resetForm.get('password');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  hasSpecialChar(password: string): boolean {
    return /[@$!%*?&#]/.test(password);
  }
}
