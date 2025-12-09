import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth';

/**
 * Directive لإظهار أو إخفاء عناصر HTML حسب دور المستخدم
 * 
 * الاستخدام:
 * <button *appHasRole="'Admin'">Delete</button>
 * <div *appHasRole="['Admin', 'Manager']">Admin Panel</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() appHasRole: string | string[] = [];

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const roles = Array.isArray(this.appHasRole) ? this.appHasRole : [this.appHasRole];
    
    if (this.authService.hasAnyRole(roles)) {
      // المستخدم لديه الصلاحية - إظهار العنصر
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // المستخدم ليس لديه الصلاحية - إخفاء العنصر
      this.viewContainer.clear();
    }
  }
}
