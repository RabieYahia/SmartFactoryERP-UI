import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
// تأكد من استيراد الموديلات الصحيحة
import { AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'https://sfe.runasp.net/api/v1/auth';

  // إشارة لمعرفة هل المستخدم مسجل دخول أم لا
  isLoggedIn = signal<boolean>(this.hasToken());
  
  // إشارة لتخزين بيانات المستخدم الحالية
  currentUser = signal<AuthResponse | null>(this.getCurrentUser());

  // ✅ تسجيل الدخول
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          // حفظ البيانات بمفتاح موحد 'user_data' عشان الـ Interceptor يشوفها
          localStorage.setItem('user_data', JSON.stringify(response));
          
          this.isLoggedIn.set(true);
          this.currentUser.set(response);
        }
      })
    );
  }

  // ✅ تسجيل مستخدم جديد
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('user_data', JSON.stringify(response));
          this.isLoggedIn.set(true);
          this.currentUser.set(response);
        }
      })
    );
  }

  // ✅ جلب بيانات أمان الحساب
  getAccountSecurity(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account-security`);
  }

  // ✅ تغيير كلمة المرور
  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }

  // ✅ نسيت كلمة المرور
  forgotPassword(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, request);
  }

  // ✅ إعادة تعيين كلمة المرور
  resetPassword(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, request);
  }

  // ✅ تأكيد البريد الإلكتروني
  confirmEmail(request: { userId: string; token: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirm-email`, request);
  }

  // ✅ تسجيل الخروج
  logout(): void {
    console.log('🚪 Logging out user...');
    
    // 1. إبلاغ السيرفر (محاولة)
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => console.log('✅ Server notified of logout'),
      error: (err) => console.warn('⚠️ Server logout warning', err),
      complete: () => this.clearLocalData() // التنظيف في كل الأحوال
    });

    // احتياطي: لو السيرفر مردش، نظف وامشي
    this.clearLocalData();
  }

  // 🧹 دالة التنظيف
  private clearLocalData(): void {
    localStorage.removeItem('user_data'); // مفتاح واحد شامل
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // 🛠️ دوال مساعدة
  getToken(): string | null {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('user_data');
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user_data');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ✅ التحقق من دور المستخدم
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  // ✅ التحقق من أي من الأدوار
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return roles.some(role => user?.roles?.includes(role)) || false;
  }

  // ✅ التحقق من جميع الأدوار
  hasAllRoles(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return roles.every(role => user?.roles?.includes(role)) || false;
  }

  // ✅ الحصول على أدوار المستخدم
  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.roles || [];
  }
}