import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../../core/services/alert.service';
import { ConfirmService } from '../../../core/services/confirm.service';

interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  isActive: boolean;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private confirmService = inject(ConfirmService);
  private apiUrl = 'https://sfe.runasp.net/api/v1/users';

  users = signal<User[]>([]);
  isLoading = signal(true);
  availableRoles = ['Admin', 'Manager', 'Employee', 'Viewer'];

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * تحميل قائمة المستخدمين
   */
  loadUsers(): void {
    this.isLoading.set(true);
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * إضافة دور لمستخدم
   */
  addRole(userId: string, role: string): void {
    this.http.post(`${this.apiUrl}/${userId}/roles`, { role }).subscribe({
      next: () => {
        console.log(`✅ Role ${role} added to user ${userId}`);
        this.alertService.success(`Role ${role} added successfully`);
        this.loadUsers(); // إعادة تحميل القائمة
      },
      error: (err) => {
        console.error('Error adding role:', err);
        this.alertService.error('Failed to add role');
      }
    });
  }

  /**
   * حذف دور من مستخدم
   */
  removeRole(userId: string, role: string): void {
    this.confirmService.danger(
      `Are you sure you want to remove ${role} role?`,
      () => this.proceedRemoveRole(userId, role)
    );
  }

  private proceedRemoveRole(userId: string, role: string): void {
    this.http.delete(`${this.apiUrl}/${userId}/roles/${role}`).subscribe({
      next: () => {
        console.log(`✅ Role ${role} removed from user ${userId}`);
        this.alertService.success(`Role ${role} removed successfully`);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error removing role:', err);
        this.alertService.error('Failed to remove role');
      }
    });
  }

  /**
   * التحقق إذا المستخدم عنده دور معين
   */
  hasRole(user: User, role: string): boolean {
    return user.roles.includes(role);
  }

  /**
   * تبديل دور (إضافة أو حذف)
   */
  toggleRole(user: User, role: string): void {
    if (this.hasRole(user, role)) {
      this.removeRole(user.id, role);
    } else {
      this.addRole(user.id, role);
    }
  }

  /**
   * تفعيل/تعطيل المستخدم
   */
  toggleUserStatus(user: User): void {
    this.http.patch(`${this.apiUrl}/${user.id}/status`, { 
      isActive: !user.isActive 
    }).subscribe({
      next: () => {
        console.log(`✅ User ${user.id} status updated`);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error updating status:', err);
      }
    });
  }

  /**
   * الحصول على لون الـ badge حسب الدور
   */
  getRoleBadgeClass(role: string): string {
    switch(role) {
      case 'Admin': return 'bg-danger';
      case 'Manager': return 'bg-primary';
      case 'Employee': return 'bg-info';
      case 'Viewer': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }
}
