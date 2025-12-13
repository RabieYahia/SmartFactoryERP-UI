import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, map, catchError, of } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // تأكد إن البورت هو نفس بورت الباك إند
  private apiUrl = 'https://sfe.runasp.net/api/v1/auth';

  // الـ Signals
  currentUser = signal<AuthResponse | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  // ✅ تسجيل الدخول
  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.saveUserSession(response))
    );
  }

  // ✅ إنشاء حساب جديد
  register(data: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.saveUserSession(response))
    );
  }

  // ✅ تسجيل الخروج
  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    this.clearSession();
  }

  // ✅ تجديد التوكن
  refreshToken() {
    const user = this.currentUser();
    if (!user) return of(null);

    const payload: RefreshTokenRequest = {
      token: user.token,
      refreshToken: user.refreshToken
    };

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, payload).pipe(
      tap((res) => {
        // بنحافظ على الرولز القديمة ونحدث التوكن بس
        const updatedUser = { ...user, token: res.token, refreshToken: res.refreshToken };
        this.saveUserSession(updatedUser);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  // =========================================================
  // 👇👇 الدالة الناقصة رقم 1: التحقق هل مسجل دخول أم لا 👇👇
  // =========================================================
  isLoggedIn(): boolean {
    // ببساطة لو المتغير فيه داتا، يبقى مسجل دخول
    return !!this.currentUser();
  }

  // =========================================================
  // 👇👇 الدالة الناقصة رقم 2: التحقق من الصلاحيات (الأهم) 👇👇
  // =========================================================
  hasAnyRole(requiredRoles: string[]): boolean {
    const user = this.currentUser();

    // لو مفيش يوزر أو اليوزر مفيهوش رولز، نرجعه
    if (!user || !user.roles) return false;

    // 🔥 تعديل سحري: لو اليوزر SuperAdmin دايماً قوله "نعم"
    // ده هيحميك لو نسيت تكتب SuperAdmin في أي راوت مستقبلاً
    if (user.roles.includes('SuperAdmin')) {
      return true;
    }

    // الطريقة العادية: هل اليوزر يمتلك أي صلاحية من الصلاحيات المطلوبة؟
    // بنشوف التقاطع بين مصفوفة رولز اليوزر ومصفوفة المطلوب
    return requiredRoles.some(role => user.roles.includes(role));
  }

  // 💾 دوال مساعدة للتخزين
  private saveUserSession(user: AuthResponse) {
    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadUserFromStorage() {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  private clearSession() {
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
