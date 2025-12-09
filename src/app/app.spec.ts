import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'SmartFactory-UI';
  
  private authService = inject(AuthService);
  private router = inject(Router); // 👈 إضافة Router

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.authService.logout();
  }

  // 👇 دالة للتحقق من صفحة Login
  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/register';
  }
}