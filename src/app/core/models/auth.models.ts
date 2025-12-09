// ✅ 1. الرد الخاص بالمصادقة (Login/Register Response)
export interface AuthResponse {
  id: string;
  email: string;
  fullName: string;
  token: string;
  refreshToken: string;
  tokenExpiresAt: string;
  roles: string[];
}

// ✅ 2. طلبات الدخول والتسجيل
export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string;
  employeeId?: number | null;
}

// ✅ 3. تجديد التوكن
export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

// ✅ 4. إدارة كلمات المرور (Forgot, Reset, Change)
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ✅ 5. أمان الحساب (Profile Security) - 👈 هذا ما كنت تسأل عنه
export interface AccountSecurityResponse {
  userId: string;
  email: string;
  isLocked: boolean;
  lockoutEnd?: string;
  accessFailedCount: number;
  twoFactorEnabled: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
}