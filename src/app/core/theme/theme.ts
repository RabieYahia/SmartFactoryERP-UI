/**
 * THEME: Professional Factory ERP Color System
 * Modern, cohesive design with industrial blue as primary
 * Supports both light and dark modes
 */

export const THEME = {
  // Primary Colors - Industrial Blue (Professional & Trustworthy)
  primary: {
    50: '#f0f8ff',
    100: '#e6f2ff',
    200: '#bfe0ff',
    300: '#85c1ff',
    400: '#4a9cff',
    500: '#1e7cff', // PRIMARY
    600: '#0055cc',
    700: '#003fa3',
    800: '#002d7a',
    900: '#001a4d'
  },

  // Secondary Colors - Teal (Innovation & Progress)
  secondary: {
    50: '#f0fdfb',
    100: '#d3faf6',
    200: '#a5f3f1',
    300: '#74e8e5',
    400: '#14d8ce',
    500: '#06b6b6', // SECONDARY
    600: '#04999a',
    700: '#037a7d',
    800: '#055f63',
    900: '#064e52'
  },

  // Success Colors - Green (Completion & Positive)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // SUCCESS
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231'
  },

  // Warning Colors - Amber (Caution & Attention)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // WARNING
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  // Danger Colors - Red (Errors & Critical)
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // DANGER
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  // Info Colors - Sky (Information & Help)
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // INFO
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d6e'
  },

  // Neutral Colors - Grayscale
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

export const BADGE_COLORS = {
  planned: { bg: 'badge-info', text: 'text-info-emphasis' },
  inprogress: { bg: 'badge-warning', text: 'text-warning-emphasis' },
  pending: { bg: 'badge-warning', text: 'text-warning-emphasis' },
  completed: { bg: 'badge-success', text: 'text-success-emphasis' },
  failed: { bg: 'badge-danger', text: 'text-danger-emphasis' },
  canceled: { bg: 'badge-secondary', text: 'text-secondary-emphasis' }
};

