import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

export interface Alert {
  id: string;
  message: string;
  type: AlertType;
  icon: string;
  dismissible: boolean;
}

/**
 * AlertService: Centralized notification management
 * Replaces alert() and console messages with professional Bootstrap alerts
 */
@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alerts = signal<Alert[]>([]);
  private alertIdCounter = 0;

  private iconMap: Record<AlertType, string> = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill'
  };

  /**
   * Show success alert
   */
  success(message: string, duration = 5000) {
    this.show(message, 'success', duration);
  }

  /**
   * Show error/danger alert
   */
  error(message: string, duration = 6000) {
    this.show(message, 'danger', duration);
  }

  /**
   * Show warning alert
   */
  warning(message: string, duration = 5000) {
    this.show(message, 'warning', duration);
  }

  /**
   * Show info alert
   */
  info(message: string, duration = 4000) {
    this.show(message, 'info', duration);
  }

  /**
   * Generic alert method
   */
  show(message: string, type: AlertType = 'info', duration = 5000) {
    const id = `alert-${++this.alertIdCounter}`;
    const alert: Alert = {
      id,
      message,
      type,
      icon: this.iconMap[type],
      dismissible: true
    };

    this.alerts.update(list => [...list, alert]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  /**
   * Dismiss alert by ID
   */
  dismiss(id: string) {
    this.alerts.update(list => list.filter(a => a.id !== id));
  }

  /**
   * Clear all alerts
   */
  clear() {
    this.alerts.set([]);
  }
}
