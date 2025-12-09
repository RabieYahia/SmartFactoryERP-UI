import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. تحسينات الأداء (موجودة في النسخ الحديثة من Angular)
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // 2. التوجيه (Routing)
    provideRouter(routes),
    
    // 3. الاتصال بالسيرفر مع المصادقة (HTTP + Interceptors)
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // 4. تفعيل الأنيميشن (مهم للمكتبات زي Bootstrap أو Material)
    provideAnimations()
  ]
};