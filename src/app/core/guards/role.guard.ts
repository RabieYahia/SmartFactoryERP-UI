import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Role Guard - للتحقق من صلاحيات المستخدم
 * 
 * الاستخدام في Routes:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [roleGuard],
 *   data: { roles: ['Admin'] }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. التحقق من تسجيل الدخول
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. الحصول على الأدوار المطلوبة من route data
  const requiredRoles = route.data['roles'] as string[];
  
  // 3. إذا لم تكن هناك أدوار محددة، السماح بالدخول
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // 4. التحقق من وجود أي من الأدوار المطلوبة
  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // 5. إذا لم يكن لديه الصلاحية، توجيه لصفحة Unauthorized
  console.warn('⛔ Access denied. Required roles:', requiredRoles);
  router.navigate(['/unauthorized']);
  return false;
};
