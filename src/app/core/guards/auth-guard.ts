import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  // 1. حقن السيرفس والراوتر
  const authService = inject(AuthService);
  const router = inject(Router);

  // 2. التحقق من حالة تسجيل الدخول
  // نستخدم الدالة isLoggedIn() التي أنشأناها في السيرفس (وهي signal)
  if (authService.isLoggedIn()) {
    return true; // ✅ مسموح بالمرور
  }

  // 3. إذا لم يكن مسجلاً، نطرده لصفحة الدخول
  console.warn('⛔ Access Denied! Redirecting to login...');
  router.navigate(['/login']);
  return false; // ❌ ممنوع المرور
};