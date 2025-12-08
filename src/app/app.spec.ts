import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
// 👇 1. التأكد من استيراد السيرفس من المسار الصحيح الذي أنشأناه
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'SmartFactory-UI';
  
  // 👇 2. حقن السيرفس
  private authService = inject(AuthService);

  // 👇 3. دالة الخروج (يجب أن يكون اسمها مطابقاً لما كتبناه في HTML)
  onLogout() {
    this.authService.logout();
  }
}