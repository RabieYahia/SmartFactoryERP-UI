export interface AccountSecurityResponse {
  userName: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  accessFailedCount: number;
  isLocked: boolean;
  lockoutEnd?: string | Date;
  lastPasswordChange?: string | Date;
  lastSuccessfulLogin?: string | Date;
}
