import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 text-center">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-5">
              <i class="bi bi-shield-exclamation text-danger" style="font-size: 5rem;"></i>
              <h1 class="mt-4 mb-3">Access Denied</h1>
              <p class="text-muted mb-4">
                You don't have permission to access this page.
                <br>
                Please contact your administrator if you believe this is an error.
              </p>
              <div class="d-flex gap-2 justify-content-center">
                <button class="btn btn-primary" (click)="goBack()">
                  <i class="bi bi-arrow-left me-2"></i>Go Back
                </button>
                <a routerLink="/dashboard" class="btn btn-outline-primary">
                  <i class="bi bi-house me-2"></i>Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-100 {
      min-height: 100vh;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack(): void {
    window.history.back();
  }
}
