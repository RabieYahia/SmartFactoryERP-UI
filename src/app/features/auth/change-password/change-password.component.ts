import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ChangePasswordRequest } from '../../models/change-password-request.model';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  changePasswordForm!: FormGroup;
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  passwordStrength = computed(() => {
    const password = this.changePasswordForm?.get('newPassword')?.value || '';
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
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: [this.passwordMatchValidator, this.passwordDifferentValidator] });
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
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private passwordDifferentValidator(control: AbstractControl): ValidationErrors | null {
    const currentPassword = control.get('currentPassword')?.value;
    const newPassword = control.get('newPassword')?.value;

    if (currentPassword && newPassword && currentPassword === newPassword) {
      return { passwordSame: true };
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
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: ChangePasswordRequest = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      confirmPassword: this.changePasswordForm.value.confirmPassword
    };

    this.authService.changePassword(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.successMessage.set('Password changed successfully! You will be logged out in 3 seconds...');
        // Auth service handles logout after 2 seconds
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.userMessage || 'Failed to change password. Please check your current password.');
      }
    });
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.update(v => !v);
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  cancel(): void {
    this.router.navigate(['/profile-security']);
  }

  get currentPassword() {
    return this.changePasswordForm.get('currentPassword');
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }

  hasSpecialChar(password: string): boolean {
    return /[@$!%*?&#]/.test(password);
  }
}
