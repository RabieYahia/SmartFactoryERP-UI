export interface UserListDto {
  id: string;
  fullName: string;
  email: string;
  employeeId: number | null;
  roles: string[];
  isLocked: boolean;
  lockoutEnd: string | null;
  emailConfirmed: boolean;
  accessFailedCount: number;
}

export interface UserDetailsDto extends UserListDto {
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lastLoginDate: string | null;
}

export interface UpdateUserCommand {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  employeeId?: number;
}

export interface AssignRoleRequest {
  userId: string;
  roleName: string;
}

export interface LockUserCommand {
  userId: string;
  lockoutDurationInDays?: number;
}

export interface RegisterUserCommand {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  employeeId?: number;
  roles: string[];
  sendWelcomeEmail?: boolean;
}

export interface RegisterUserResponse {
  userId: string;
  fullName: string;
  email: string;
  employeeId?: number;
  roles: string[];
  isSuccess: boolean;
  message: string;
}
