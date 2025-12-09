import { Injectable, signal } from '@angular/core';

/**
 * SERVICE: ThemeToggleService
 * 
 * Purpose:
 * - Manage dark mode / light mode state globally
 * - Persist theme preference to localStorage
 * - Apply theme by adding/removing 'dark' class to document.documentElement
 * - Sync with system preference (prefers-color-scheme)
 * 
 * Usage:
 * 1. Inject the service: `private themeService = inject(ThemeToggleService)`
 * 2. Call toggleDarkMode() to switch themes
 * 3. Subscribe to isDarkMode$ to react to theme changes
 * 4. CSS uses :root and :root.dark for styling
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeToggleService {
  // Signal to track dark mode state - true = dark, false = light
  isDarkMode = signal<boolean>(this.initDarkMode());

  constructor() {
    // Apply initial theme on service instantiation
    this.applyTheme(this.isDarkMode());
  }

  /**
   * Initialize dark mode state from localStorage or system preference
   * Priority: localStorage > system preference > default (light)
   */
  private initDarkMode(): boolean {
    // Check if user has a saved preference in localStorage
    const saved = localStorage.getItem('theme-mode');
    if (saved !== null) {
      return saved === 'dark';
    }

    // If no saved preference, check system preference (prefers-color-scheme)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark;
  }

  /**
   * Toggle between dark and light mode
   */
  toggleDarkMode(): void {
    const newMode = !this.isDarkMode();
    this.isDarkMode.set(newMode);
    this.applyTheme(newMode);
    this.persistTheme(newMode);
  }

  /**
   * Set a specific theme mode
   */
  setDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);
    this.persistTheme(isDark);
  }

  /**
   * Apply theme by adding/removing 'dark' class to root element
   * CSS will use :root and :root.dark selectors for styling
   */
  private applyTheme(isDark: boolean): void {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  /**
   * Persist theme preference to localStorage
   */
  private persistTheme(isDark: boolean): void {
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
  }

  /**
   * Get current theme mode as string
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.isDarkMode() ? 'dark' : 'light';
  }
}
