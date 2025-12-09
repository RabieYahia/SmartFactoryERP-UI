import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'SmartFactory-UI';
  showLayout = false; // ← بدلاً من isLoginPage()
  
  authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // تتبع تغيير الصفحات
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showLayout = !['/login', '/register'].includes(event.url);
    });
  }

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.authService.logout();
  }

  /**
   * الحصول على اسم المستخدم
   */
  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user?.fullName || user?.email || 'User';
  }

  /**
   * الحصول على أدوار المستخدم كنص
   */
  get userRoles(): string {
    const roles = this.authService.getUserRoles();
    return roles.length > 0 ? roles.join(', ') : 'No Role';
  }

  /**
   * الحصول على أول دور للمستخدم
   */
  get primaryRole(): string {
    const roles = this.authService.getUserRoles();
    return roles.length > 0 ? roles[0] : 'User';
  }

  /**
   * التحقق إذا المستخدم Admin
   */
  get isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }
}