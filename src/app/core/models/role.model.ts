/**
 * User Roles in the system
 */
export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
  Employee = 'Employee',
  Viewer = 'Viewer'
}

/**
 * Role permissions mapping
 */
export const RolePermissions = {
  [UserRole.Admin]: ['*'], // Full access
  [UserRole.Manager]: [
    'dashboard.view',
    'inventory.view', 'inventory.create', 'inventory.edit',
    'purchasing.view', 'purchasing.create', 'purchasing.edit',
    'sales.view', 'sales.create', 'sales.edit',
    'production.view', 'production.create', 'production.edit',
    'hr.view', 'hr.edit',
    'expenses.view', 'expenses.create',
    'tasks.view', 'tasks.create', 'tasks.edit'
  ],
  [UserRole.Employee]: [
    'dashboard.view',
    'inventory.view',
    'tasks.view', 'tasks.create',
    'expenses.view', 'expenses.create'
  ],
  [UserRole.Viewer]: [
    'dashboard.view',
    'inventory.view',
    'sales.view',
    'production.view',
    'tasks.view'
  ]
};

/**
 * Check if role has permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = RolePermissions[role];
  return permissions.includes('*') || permissions.includes(permission);
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
