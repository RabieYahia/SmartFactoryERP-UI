import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from '../../services/user-management.service';
import { UserListDto } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserManagementService);

  users = signal<UserListDto[]>([]);
  allRoles = signal<string[]>([]);
  isLoading = signal(false);
  
  // Filters - متغيرات عادية للـ two-way binding
  searchTerm = '';
  selectedRole = '';
  selectedLockStatus: boolean | null = null;

  // Role Management Modal
  showRoleModal = false;
  selectedUser: UserListDto | null = null;
  userRoles: string[] = [];
  availableRoles: string[] = [];
  selectedNewRole = '';

  // Create User Modal
  showCreateModal = false;
  newUser = {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    employeeId: undefined as number | undefined,
    roles: [] as string[],
    sendWelcomeEmail: true
  };

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    this.isLoading.set(true);
    const search = this.searchTerm || undefined;
    const role = this.selectedRole || undefined;
    const isLocked = this.selectedLockStatus;

    this.userService.getUsers(search, role, isLocked ?? undefined).subscribe({
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

  loadRoles() {
    this.userService.getAllRoles().subscribe({
      next: (roles) => this.allRoles.set(roles),
      error: (err) => console.error('Error loading roles:', err)
    });
  }

  applyFilters() {
    this.loadUsers();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedLockStatus = null;
    this.loadUsers();
  }

  lockUser(userId: string, userName: string) {
    if (!confirm(`Lock user "${userName}" for 30 days?`)) return;

    this.userService.lockUser(userId, 30).subscribe({
      next: () => {
        alert(`✅ User "${userName}" locked successfully`);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error locking user:', err);
        alert('❌ Failed to lock user');
      }
    });
  }

  unlockUser(userId: string, userName: string) {
    if (!confirm(`Unlock user "${userName}"?`)) return;

    this.userService.unlockUser(userId).subscribe({
      next: () => {
        alert(`✅ User "${userName}" unlocked successfully`);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error unlocking user:', err);
        alert('❌ Failed to unlock user');
      }
    });
  }

  deleteUser(userId: string, userName: string) {
    if (!confirm(`⚠️ DELETE user "${userName}"? This cannot be undone!`)) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        alert(`✅ User "${userName}" deleted successfully`);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        alert('❌ Failed to delete user');
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'superadmin': return 'bg-danger';
      case 'admin': return 'bg-warning text-dark';
      case 'hr': return 'bg-info';
      case 'manager': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  // Open Role Management Modal
  openRoleModal(user: UserListDto) {
    this.selectedUser = user;
    this.userRoles = [...user.roles];
    this.availableRoles = this.allRoles().filter(role => !user.roles.includes(role));
    this.selectedNewRole = '';
    this.showRoleModal = true;
  }

  // Close Modal
  closeRoleModal() {
    this.showRoleModal = false;
    this.selectedUser = null;
    this.userRoles = [];
    this.availableRoles = [];
    this.selectedNewRole = '';
  }

  // Assign Role
  assignRole() {
    if (!this.selectedUser || !this.selectedNewRole) return;

    this.userService.assignRole(this.selectedUser.id, this.selectedNewRole).subscribe({
      next: () => {
        alert(`✅ Role "${this.selectedNewRole}" assigned successfully`);
        this.userRoles.push(this.selectedNewRole);
        this.availableRoles = this.availableRoles.filter(r => r !== this.selectedNewRole);
        this.selectedNewRole = '';
        this.loadUsers(); // Refresh list
      },
      error: (err) => {
        console.error('Error assigning role:', err);
        alert('❌ Failed to assign role');
      }
    });
  }

  // Remove Role
  removeRole(roleName: string) {
    if (!this.selectedUser) return;
    if (!confirm(`Remove role "${roleName}" from ${this.selectedUser.fullName}?`)) return;

    this.userService.removeRole(this.selectedUser.id, roleName).subscribe({
      next: () => {
        alert(`✅ Role "${roleName}" removed successfully`);
        this.userRoles = this.userRoles.filter(r => r !== roleName);
        this.availableRoles.push(roleName);
        this.loadUsers(); // Refresh list
      },
      error: (err) => {
        console.error('Error removing role:', err);
        alert('❌ Failed to remove role');
      }
    });
  }

  // Open Create User Modal
  openCreateModal() {
    this.newUser = {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      employeeId: undefined,
      roles: [],
      sendWelcomeEmail: true
    };
    this.showCreateModal = true;
  }

  // Close Create User Modal
  closeCreateModal() {
    this.showCreateModal = false;
  }

  // Toggle role selection
  toggleRole(role: string) {
    const index = this.newUser.roles.indexOf(role);
    if (index > -1) {
      this.newUser.roles.splice(index, 1);
    } else {
      this.newUser.roles.push(role);
    }
  }

  // Resend Confirmation Email
  resendConfirmationEmail(userId: string, userName: string) {
    if (!confirm(`Resend confirmation email to "${userName}"?`)) return;

    this.userService.resendConfirmationEmail(userId).subscribe({
      next: () => {
        alert(`✅ Confirmation email sent to ${userName}`);
      },
      error: (err) => {
        console.error('Error sending confirmation email:', err);
        const errorMsg = err.error?.message || 'Failed to send confirmation email';
        alert(`❌ ${errorMsg}`);
      }
    });
  }

  // Create User
  createUser() {
    if (!this.newUser.fullName || !this.newUser.email || !this.newUser.password) {
      alert('⚠️ Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email)) {
      alert('⚠️ Invalid email format');
      return;
    }

    // Password validation
    if (this.newUser.password.length < 8) {
      alert('⚠️ Password must be at least 8 characters');
      return;
    }

    this.isLoading.set(true);

    this.userService.registerUser(this.newUser).subscribe({
      next: (response) => {
        alert(`✅ ${response.message}`);
        this.closeCreateModal();
        this.loadUsers();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error creating user:', err);
        const errorMsg = err.error?.message || 'Failed to create user';
        alert(`❌ ${errorMsg}`);
        this.isLoading.set(false);
      }
    });
  }
}
