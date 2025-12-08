import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { RegistrationRequest } from '../../models/registration-request.model';

/**
 * Register Component
 * Provides user registration interface with password strength validation
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  errorMessage = signal('');

  // Password strength signals
  passwordStrength = signal(0);
  passwordStrengthText = computed(() => {
    const strength = this.passwordStrength();
    if (strength === 0) return '';
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
    this.initForm();
  }

  /**
   * Initialize registration form with validators
   */
  private initForm(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator()]],
      confirmPassword: ['', [Validators.required]],
      employeeId: [null]
    }, {
      validators: [this.passwordMatchValidator()]
    });

    // Watch password changes for strength calculation
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.calculatePasswordStrength(password);
    });
  }

  /**
   * Custom password validator
   */
  private passwordValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (!password) return null;

      const errors: any = {};

      // Minimum 8 characters
      if (password.length < 8) {
        errors.minLength = true;
      }

      // At least one uppercase letter
      if (!/[A-Z]/.test(password)) {
        errors.uppercase = true;
      }

      // At least one lowercase letter
      if (!/[a-z]/.test(password)) {
        errors.lowercase = true;
      }

      // At least one digit
      if (!/\d/.test(password)) {
        errors.digit = true;
      }

      // At least one special character
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.special = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Password match validator
   */
  private passwordMatchValidator() {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  /**
   * Calculate password strength (0-100)
   */
  private calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength.set(0);
      return;
    }

    let strength = 0;

    // Length contribution (max 30 points)
    strength += Math.min(password.length * 3, 30);

    // Uppercase letters (10 points)
    if (/[A-Z]/.test(password)) strength += 10;

    // Lowercase letters (10 points)
    if (/[a-z]/.test(password)) strength += 10;

    // Numbers (15 points)
    if (/\d/.test(password)) strength += 15;

    // Special characters (20 points)
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

    // Mix of characters (15 points)
    const hasUpperAndLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
    const hasLetterAndNumber = /[a-zA-Z]/.test(password) && /\d/.test(password);
    if (hasUpperAndLower && hasLetterAndNumber) strength += 15;

    this.passwordStrength.set(Math.min(strength, 100));
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(value => !value);
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: RegistrationRequest = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      employeeId: this.registerForm.value.employeeId || undefined
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        console.log('✅ Registration successful');
        this.isLoading.set(false);
        
        // Navigate to dashboard after successful registration
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('❌ Registration error:', error);
        this.isLoading.set(false);
        
        // Extract error message
        let message = 'Registration failed. Please try again.';
        
        if (error.userMessage) {
          message = error.userMessage;
        } else if (error.error?.message) {
          message = error.error.message;
        } else if (error.status === 400) {
          message = 'Invalid registration data. Please check your input.';
        } else if (error.status === 409) {
          message = 'Email already exists. Please use a different email.';
        }

        this.errorMessage.set(message);
      }
    });
  }

  /**
   * Check if form control has error
   */
  hasError(controlName: string, errorName?: string): boolean {
    const control = this.registerForm.get(controlName);
    if (!control) return false;

    if (errorName) {
      return !!(control.hasError(errorName) && control.touched);
    }
    return !!(control.invalid && control.touched);
  }

  /**
   * Check if form has specific error
   */
  hasFormError(errorName: string): boolean {
    return !!(this.registerForm.hasError(errorName) && 
             this.registerForm.get('confirmPassword')?.touched);
  }
}
