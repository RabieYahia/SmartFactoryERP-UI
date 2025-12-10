import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';

export interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'warning' | 'danger' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * ConfirmService: Modal confirmation dialogs
 * Replaces browser's confirm() with professional Bootstrap modals
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  dialogs = signal<ConfirmDialog[]>([]);
  private dialogIdCounter = 0;

  /**
   * Show a warning confirmation dialog
   */
  warning(message: string, onConfirm: () => void, onCancel?: () => void) {
    this.show({
      title: 'Confirm Action',
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm,
      onCancel
    });
  }

  /**
   * Show a danger confirmation dialog
   */
  danger(message: string, onConfirm: () => void, onCancel?: () => void) {
    this.show({
      title: 'Confirm Deletion',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm,
      onCancel
    });
  }

  /**
   * Show an info confirmation dialog
   */
  info(message: string, onConfirm: () => void, onCancel?: () => void) {
    this.show({
      title: 'Confirm',
      message,
      confirmText: 'OK',
      cancelText: 'Cancel',
      type: 'info',
      onConfirm,
      onCancel
    });
  }

  /**
   * Generic show method
   */
  show(config: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'warning' | 'danger' | 'info';
    onConfirm: () => void;
    onCancel?: () => void;
  }) {
    const id = `dialog-${++this.dialogIdCounter}`;
    const dialog: ConfirmDialog = {
      id,
      ...config
    };

    this.dialogs.update(list => [...list, dialog]);
  }

  /**
   * Handle confirmation
   */
  confirm(id: string) {
    const dialog = this.dialogs().find(d => d.id === id);
    if (dialog) {
      this.dismiss(id);
      dialog.onConfirm();
    }
  }

  /**
   * Handle cancellation
   */
  cancel(id: string) {
    const dialog = this.dialogs().find(d => d.id === id);
    if (dialog) {
      this.dismiss(id);
      dialog.onCancel?.();
    }
  }

  /**
   * Dismiss dialog
   */
  dismiss(id: string) {
    this.dialogs.update(list => list.filter(d => d.id !== id));
  }
}
