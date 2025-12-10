import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth'; // ⚠️ تأكد إن المسار ده صح حسب مشروعك

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ============================================================
  // 👇👇 ضيفنا الجزء ده عشان يكشف المشكلة 👇👇
  // ============================================================
  const currentUser = authService.currentUser();
  const requiredRoles = route.data['roles'] as string[];

  console.log('🔍 GUARD DEBUG START 🔍');
  console.log('👤 User Object:', currentUser);
  console.log('🔑 User Roles:', currentUser?.roles);
  console.log('🛡️ Page Requires:', requiredRoles);
  // ============================================================

  // 1. التحقق من تسجيل الدخول
  if (!authService.isLoggedIn()) {
    console.warn('❌ User not logged in -> Redirecting to Login');
    router.navigate(['/login']);
    return false;
  }

  // 2. إذا لم تكن هناك أدوار محددة، السماح بالدخول
  if (!requiredRoles || requiredRoles.length === 0) {
    console.log('✅ No roles required -> Access Granted');
    return true;
  }

  // 3. التحقق من وجود أي من الأدوار المطلوبة
  if (authService.hasAnyRole(requiredRoles)) {
    console.log('✅ Role Matched -> Access Granted');
    return true;
  }

  // 4. إذا لم يكن لديه الصلاحية
  console.error('⛔ Access Denied! Roles mismatch.');
  router.navigate(['/unauthorized']);
  return false;
};
