import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';

/**
 * ConfirmDialogContainerComponent: Global confirmation modals
 * Displays confirmation dialogs using Bootstrap modals
 */
@Component({
  selector: 'app-confirm-dialog-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (dialog of confirmService.dialogs(); track dialog.id) {
      <div class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="background: var(--surface); color: var(--text-primary);">
            <div class="modal-header" [ngClass]="'bg-' + dialog.type" style="background: var(--primary) !important;">
              <h5 class="modal-title text-white">
                <i [class]="'bi ' + getIcon(dialog.type) + ' me-2'"></i>
                {{ dialog.title }}
              </h5>
            </div>
            <div class="modal-body py-4">
              <p class="mb-0" style="color: var(--text-primary);">{{ dialog.message }}</p>
            </div>
            <div class="modal-footer border-top">
              <button 
                type="button" 
                class="btn btn-outline-secondary"
                (click)="confirmService.cancel(dialog.id)"
              >
                {{ dialog.cancelText }}
              </button>
              <button 
                type="button" 
                [class]="'btn btn-' + dialog.type"
                (click)="confirmService.confirm(dialog.id)"
              >
                {{ dialog.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal.show {
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .bg-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .bg-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .bg-info {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogContainerComponent {
  confirmService = inject(ConfirmService);

  getIcon(type: string): string {
    switch (type) {
      case 'warning':
        return 'bi-exclamation-circle-fill';
      case 'danger':
        return 'bi-exclamation-triangle-fill';
      case 'info':
        return 'bi-info-circle-fill';
      default:
        return 'bi-question-circle-fill';
    }
  }
}
