import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'https://localhost:7093/api/v1/auth'; // تأكد من البورت

  // إشارة لمعرفة هل المستخدم مسجل دخول أم لا
  isLoggedIn = signal<boolean>(this.hasToken());

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // عند نجاح الدخول، نحفظ التوكن
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response)); // حفظ بيانات المستخدم
          this.isLoggedIn.set(true);
        }
      })
    );
  }

  /**
   * دالة تسجيل الخروج (محدثة)
   * تبلغ السيرفر لإبطال الـ Refresh Token ثم تمسح البيانات المحلية
   */
  logout(): void {
    console.log('🚪 Logging out user...');
    
    // مسح البيانات المحلية أولاً
    this.clearLocalData();
    
    // إبلاغ السيرفر (في الخلفية، بدون انتظار)
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        console.log('✅ Server notified of logout');
      },
      error: (err) => {
        console.warn('⚠️ Server logout failed (already cleared locally)', err);
      }
    });
  }

  /**
   * دالة مساعدة لمسح الداتا والتوجيه
   */
  private clearLocalData(): void {
    console.log('🧹 Clearing local data...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn.set(false);
    console.log('🔄 Navigating to /login');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}