import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 👇 1. استيراد أدوات التوجيه
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  // 👇 2. إضافتها هنا ضروري جداً عشان اللينكات تشتغل
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'SmartFactory-UI';
}