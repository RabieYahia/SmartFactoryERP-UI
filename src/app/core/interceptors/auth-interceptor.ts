import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 1. قراءة التوكن من التخزين المحلي مباشرة (لتجنب مشاكل التداخل)
  const userData = localStorage.getItem('user_data');
  let token = null;
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      token = user.token;
    } catch (e) {
      console.error('Error parsing user data', e);
    }
  }

  // 2. لو في توكن، ضيفه في الهيدر
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 3. معالجة الأخطاء (زي انتهاء التوكن)
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // بس لو كان في توكن وفشل، يعني التوكن منتهي
      // لو مفيش توكن أصلاً، يبقى المستخدم مش logged in وده طبيعي
      if (error.status === 401 && token) {
        // لو التوكن منتهي أو غير صالح، نخرج المستخدم
        localStorage.removeItem('user_data');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};