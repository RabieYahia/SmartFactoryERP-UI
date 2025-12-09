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
  
  // ⚠️ تأكد إن البورت هو نفس بورت الباك إند بتاعك
  private apiUrl = 'https://localhost:7093/api/v1/auth';

  // الـ Signals عشان نحدث الواجهة فوراً
  currentUser = signal<AuthResponse | null>(null);

  constructor() {
    // أول ما الموقع يفتح، نجيب الداتا من التخزين
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
    // نبلغ السيرفر عشان يبطل الـ Refresh Token
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    
    // نمسح الداتا محلياً
    this.clearSession();
  }

  // ✅ تجديد التوكن (Refresh Token)
  refreshToken() {
    const user = this.currentUser();
    if (!user) return of(null);

    const payload: RefreshTokenRequest = {
      token: user.token,
      refreshToken: user.refreshToken
    };

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, payload).pipe(
      tap((res) => {
        // تحديث التوكن الجديد في التخزين
        const updatedUser = { ...user, token: res.token, refreshToken: res.refreshToken };
        this.saveUserSession(updatedUser);
      }),
      catchError(() => {
        // لو فشل التجديد، نخرج المستخدم
        this.logout();
        return of(null);
      })
    );
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