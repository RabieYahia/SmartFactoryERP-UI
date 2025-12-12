import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.css'
})
export class ConfirmEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  ngOnInit() {
    // Get userId and token from URL query params
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!userId || !token) {
      this.isLoading = false;
      this.errorMessage = 'Invalid confirmation link. Please check your email and try again.';
      return;
    }

    // Confirm email
    this.confirmEmail(userId, token);
  }

  confirmEmail(userId: string, token: string) {
    this.authService.confirmEmail({ userId, token }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.errorMessage = err.error?.message || 'Failed to confirm email. The link may be expired or invalid.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
