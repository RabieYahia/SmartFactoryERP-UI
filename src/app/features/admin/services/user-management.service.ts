import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserListDto, UserDetailsDto, UpdateUserCommand, AssignRoleRequest, LockUserCommand } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7093/api/v1/usermanagement';

  // Get all users with optional filters
  getUsers(searchTerm?: string, role?: string, isLocked?: boolean): Observable<UserListDto[]> {
    let params = new HttpParams();
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (role) params = params.set('role', role);
    if (isLocked !== undefined) params = params.set('isLocked', isLocked.toString());
    
    return this.http.get<UserListDto[]>(this.apiUrl, { params });
  }

  // Get user by ID
  getUserById(id: string): Observable<UserDetailsDto> {
    return this.http.get<UserDetailsDto>(`${this.apiUrl}/${id}`);
  }

  // Update user
  updateUser(id: string, command: UpdateUserCommand): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, command);
  }

  // Delete user
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Lock user
  lockUser(id: string, durationInDays: number = 30): Observable<any> {
    const command: LockUserCommand = { userId: id, lockoutDurationInDays: durationInDays };
    return this.http.post(`${this.apiUrl}/${id}/lock`, command);
  }

  // Unlock user
  unlockUser(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/unlock`, {});
  }

  // Assign role
  assignRole(userId: string, roleName: string): Observable<any> {
    const request: AssignRoleRequest = { userId, roleName };
    return this.http.post(`${this.apiUrl}/${userId}/roles/assign`, request);
  }

  // Remove role
  removeRole(userId: string, roleName: string): Observable<any> {
    const request: AssignRoleRequest = { userId, roleName };
    return this.http.post(`${this.apiUrl}/${userId}/roles/remove`, request);
  }

  // Get user roles
  getUserRoles(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/roles`);
  }

  // Get all roles
  getAllRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/roles`);
  }

  // Get account security
  getAccountSecurity(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/security`);
  }
}
