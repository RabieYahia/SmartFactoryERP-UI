import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // لو معاه توكن، اتفضل ادخل
  if (authService.getToken()) {
    return true;
  }

  // لو مش معاه، اطرده على صفحة الـ Login
  router.navigate(['/login']);
  return false;
};