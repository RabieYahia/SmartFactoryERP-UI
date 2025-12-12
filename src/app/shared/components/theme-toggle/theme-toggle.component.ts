import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleService } from '../../../core/services/theme-toggle.service';

/**
 * COMPONENT: ThemeToggleComponent
 * 
 * Purpose:
 * - Display a button that allows users to switch between light and dark modes
 * - Show icon reflecting current theme (sun for light, moon for dark)
 * - Persist user's theme choice to localStorage
 * 
 * Usage:
 * Add to your header/navbar:
 * <app-theme-toggle></app-theme-toggle>
 * 
 * Styling:
 * - Uses Bootstrap Icons for sun/moon icons
 * - Button follows app's theme colors
 * - Icon changes based on current mode
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn btn-sm btn-outline-secondary theme-toggle-btn"
      (click)="toggleTheme()"
      title="{{ isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}"
      [attr.aria-label]="isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    >
      @if (isDarkMode()) {
        <!-- Moon icon for dark mode (show to switch to light) -->
        <i class="bi bi-moon-stars-fill"></i>
      } @else {
        <!-- Sun icon for light mode (show to switch to dark) -->
        <i class="bi bi-sun-fill"></i>
      }
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      transition: all 0.3s ease;
      padding: 0.5rem 0.75rem;
    }

    .theme-toggle-btn:hover {
      background-color: var(--surface-hover);
      border-color: var(--primary);
      color: var(--primary);
      transform: scale(1.05);
    }

    .theme-toggle-btn:active {
      transform: scale(0.95);
    }

    i {
      font-size: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeToggleService);

  // Expose isDarkMode signal for template
  isDarkMode = this.themeService.isDarkMode;

  /**
   * Toggle between dark and light mode
   */
  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }
}
