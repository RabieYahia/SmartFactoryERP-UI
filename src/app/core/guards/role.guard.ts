import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth'; // ⚠️ تأكد إن المسار ده صح حسب مشروعك

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. التحقق من تسجيل الدخول
  if (!authService.isLoggedIn()) {
    console.warn('❌ User not logged in -> Redirecting to Login');
    router.navigate(['/login']);
    return false;
  }
  // 2. دعم نوعين من تعريفات الوصول في routes:
  //    - data.roles: مصفوفة أدوار صريحة (مثلاً ['Admin'])
  //    - data.policy: اسم سياسة من الـ backend (مثلاً 'CanManageHR')
  // خريطة السياسات إلى الأدوار المستخدمة في الـ backend
  const policyMap: Record<string, string[]> = {
    CanManageHR: ['SuperAdmin', 'Admin', 'HRManager'],
    CanViewHR: ['SuperAdmin', 'Admin', 'HRManager', 'Manager', 'Employee'],
    CanManageAttendance: ['SuperAdmin', 'Admin', 'HRManager', 'Manager']
  };

  // 3. جلب أي تعريف وصول من الـ route
  const requiredRoles = route.data['roles'] as string[] | undefined;
  const policyName = route.data['policy'] as string | undefined;

  // 4. إذا عرفنا policy، حللها إلى أدوار
  let rolesToCheck: string[] | undefined = requiredRoles;
  if (policyName) {
    rolesToCheck = policyMap[policyName] || [];
  }

  // 5. إذا لم تكن هناك أدوار محددة، السماح بالدخول
  if (!rolesToCheck || rolesToCheck.length === 0) {
    return true;
  }

  // 6. التحقق من وجود أي من الأدوار المطلوبة
  if (authService.hasAnyRole(rolesToCheck)) {
    return true;
  }
  // 5. إذا لم يكن لديه الصلاحية، توجيه لصفحة Unauthorized
  console.warn('⛔ Access denied. Required roles:', requiredRoles);
  router.navigate(['/unauthorized']);
  return false;
};
