import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/services/alert.service';

/**
 * AlertContainerComponent: Global alert display
 * Shows all active alerts in a fixed position at the top-right
 */
@Component({
  selector: 'app-alert-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert-container">
      @for (alert of alertService.alerts(); track alert.id) {
        <div 
          class="alert alert-{{ alert.type }} alert-dismissible fade show shadow-lg"
          role="alert"
        >
          <i [class]="'bi ' + alert.icon + ' me-2'"></i>
          <span>{{ alert.message }}</span>
          @if (alert.dismissible) {
            <button 
              type="button" 
              class="btn-close" 
              (click)="alertService.dismiss(alert.id)"
              aria-label="Close"
            ></button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .alert-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .alert {
      min-width: 300px;
      animation: slideInRight 0.3s ease-out;
      border-radius: 10px;
      padding: 1rem;
      font-weight: 500;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .alert-success {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .alert-danger {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .alert-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
      color: #b45309;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .alert-info {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%);
      color: #0ea5e9;
      border: 1px solid rgba(14, 165, 233, 0.2);
    }

    @media (max-width: 576px) {
      .alert-container {
        left: 10px;
        right: 10px;
        max-width: none;
      }

      .alert {
        min-width: auto;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertContainerComponent {
  alertService = inject(AlertService);
}

