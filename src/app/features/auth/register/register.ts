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

  data: RegisterRequest = { 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    employeeId: null 
  };
  
  isLoading = signal(false);
  errorMessage = signal('');
  
  // Field error messages
  fieldErrors = signal<{[key: string]: string}>({});

  onSubmit() {
    // Clear previous errors
    this.errorMessage.set('');
    this.fieldErrors.set({});

    // Validate form data
    if (!this.validateForm()) {
      return;
    }

    this.isLoading.set(true);

    this.authService.register(this.data).subscribe({
      next: (res) => {
        console.log('Registration Success:', res);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || '❌ Registration failed. Please try again.');
      }
    });
  }

  validateForm(): boolean {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    // Validate full name
    if (!this.data.fullName || this.data.fullName.trim() === '') {
      errors['fullName'] = '❌ Full name is required';
      isValid = false;
    } else if (this.data.fullName.trim().length < 3) {
      errors['fullName'] = '❌ Full name must be at least 3 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(this.data.fullName)) {
      errors['fullName'] = '❌ Full name must contain only letters';
      isValid = false;
    }

    // Validate email
    if (!this.data.email || this.data.email.trim() === '') {
      errors['email'] = '❌ Email address is required';
      isValid = false;
    } else if (!this.isValidEmail(this.data.email)) {
      errors['email'] = '❌ Invalid email address';
      isValid = false;
    }

    // Validate password
    if (!this.data.password) {
      errors['password'] = '❌ Password is required';
      isValid = false;
    } else {
      const passwordValidation = this.validatePassword(this.data.password);
      if (!passwordValidation.isValid) {
        errors['password'] = passwordValidation.message;
        isValid = false;
      }
    }

    // Validate confirm password
    if (!this.data.confirmPassword) {
      errors['confirmPassword'] = '❌ Confirm password is required';
      isValid = false;
    } else if (this.data.password !== this.data.confirmPassword) {
      errors['confirmPassword'] = '❌ Passwords do not match';
      isValid = false;
    }

    // Validate employee ID (optional)
    if (this.data.employeeId !== null && this.data.employeeId !== undefined) {
      const empId = Number(this.data.employeeId);
      if (isNaN(empId) || empId <= 0) {
        errors['employeeId'] = '❌ Employee ID must be a positive number';
        isValid = false;
      }
    }

    this.fieldErrors.set(errors);
    
    if (!isValid) {
      this.errorMessage.set('❌ Please correct the errors in the form');
    }

    return isValid;
  }

  validatePassword(password: string): {isValid: boolean, message: string} {
    if (password.length < 8) {
      return {
        isValid: false,
        message: '❌ Password must be at least 8 characters'
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: '❌ Password must include an uppercase letter (A-Z)'
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: '❌ Password must include a lowercase letter (a-z)'
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: '❌ Password must include a digit (0-9)'
      };
    }

    if (!/[@$!%*?&#]/.test(password)) {
      return {
        isValid: false,
        message: '❌ Password must include a special character (@$!%*?&#)'
      };
    }

    return { isValid: true, message: '' };
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Clear field error when user starts typing
  clearFieldError(fieldName: string) {
    const errors = {...this.fieldErrors()};
    delete errors[fieldName];
    this.fieldErrors.set(errors);
    
    // If no errors left, clear general error message
    if (Object.keys(errors).length === 0) {
      this.errorMessage.set('');
    }
  }
}