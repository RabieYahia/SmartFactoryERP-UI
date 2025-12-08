# Smart Factory ERP - Security Module Documentation

## 🎉 Module Status: COMPLETE

Complete authentication and authorization module for Angular 18+ with ASP.NET Core 9 backend integration.

## ✅ All Components Completed

### Models (All Created)
- ✅ auth-request.model.ts
- ✅ auth-response.model.ts
- ✅ registration-request.model.ts
- ✅ token-response.model.ts
- ✅ refresh-token-request.model.ts
- ✅ change-password-request.model.ts
- ✅ forgot-password-request.model.ts
- ✅ reset-password-request.model.ts
- ✅ account-security-response.model.ts
- ✅ user-roles-response.model.ts

### Services (All Created)
- ✅ token.service.ts - Token management with localStorage
- ✅ auth.service.ts - Authentication operations

### Interceptors (All Created)
- ✅ jwt.interceptor.ts - JWT token injection and refresh
- ✅ error.interceptor.ts - Global error handling

### Guards (All Created)
- ✅ auth.guard.ts - Route protection
- ✅ role.guard.ts - Role-based access control

### Components (All Completed)
- ✅ Login Component (with full styling)
- ✅ Register Component (with password strength indicator)
- ✅ Forgot Password Component (with countdown timer)
- ✅ Reset Password Component (with token validation)
- ✅ Change Password Component (with 3 password fields)
### 1. Install Required Dependencies

```bash
npm install jwt-decode
```

### 2. Add Bootstrap Icons to index.html

If not already added, include Bootstrap Icons in your `src/index.html`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
```

### 3. Configuration is Already Complete! ✅

The following files have been automatically configured:

#### ✅ app.config.ts
- JWT interceptor added for automatic token injection
- Error interceptor added for global error handling
- Both work alongside your existing legacy auth interceptor

#### ✅ app.routes.ts
- All auth module routes added:
  - `/auth/login` - Login page
  - `/auth/register` - Registration page
  - `/auth/forgot-password` - Password reset request
  - `/auth/reset-password` - Password reset with token
  - `/change-password` - Change password (protected)
  - `/profile-security` - Security dashboard (protected)
  - `/unauthorized` - 403 error page
- Auth guards integrated with new routes
- Role guards ready for use

## 📋 Available Routes,
  
  { path: 'unauthorized', loadComponent: () => import('./shared/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
  { path: '**', redirectTo: '/dashboard' }
];
```

### 3. Install Dependencies

```bash
npm install jwt-decode
npm install @angular/material
npm install bootstrap-icons
```

### 4. Add Bootstrap Icons to index.html

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
```

## 🎨 Styling Guidelines

All components use:
- Gradient backgrounds: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Border radius: 8-16px
- Box shadows for depth
- Smooth transitions (0.3s ease)
- Responsive design (mobile-first)

## 🔐 Security Features Implemented

1. ✅ JWT token storage in localStorage
2. ✅ Automatic token refresh on 401
3. ✅ Token expiration checking
4. ✅ Password strength validation
5. ✅ Role-based access control
6. ✅ Return URL preservation
7. ✅ Auto-logout on password change
8. ✅ Comprehensive error handling

## 📝 API Endpoints

Base URL: `https://localhost:7093/api/v1/auth`

- POST `/login` - User login
- POST `/register` - User registration
- POST `/refresh-token` - Refresh access token
- POST `/forgot-password` - Send password reset link
- POST `/reset-password` - Reset password with token
- POST `/change-password` - Change password (authenticated)
- GET `/account-security` - Get security info (authenticated)

## 🚀 Next Steps

1. Create remaining password management components
2. Create profile security component
3. Add unauthorized component
4. Test all authentication flows
5. Configure backend CORS settings
6. Deploy and test in production

## 📞 Support

For issues or questions, check:
- Console logs (all operations are logged)
- Network tab (inspect API calls)
- LocalStorage (check token storage)

### Public Routes (No Authentication Required)
- `/auth/login` - User login
- `/auth/register` - New user registration  
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password?email=xxx&token=xxx` - Reset password with token

### Protected Routes (Authentication Required)
- `/change-password` - Change current password
- `/profile-security` - View account security information
- `/unauthorized` - Access denied page

## 🔒 Using Guards in Your Routes

### Basic Authentication Protection

```typescript
{
  path: 'your-route',
  component: YourComponent,
  canActivate: [newAuthGuard]  // Requires login
}
```

### Role-Based Protection

```typescript
{
  path: 'admin-only',
  component: AdminComponent,
  canActivate: [newAuthGuard, roleGuard],
  data: { roles: ['Admin', 'SuperAdmin'] }  // Requires specific roles
}
```

## 📝 Code Examples

### Check if User is Logged In

```typescript
import { AuthService } from './modules/auth/services/auth.service';

export class YourComponent {
  private authService = inject(AuthService);
  
  ngOnInit() {
    if (this.authService.isAuthenticatedUser()) {
      console.log('User is logged in');
    }
  }
}
```

### Get Current User Information

```typescript
const currentUser = this.authService.getCurrentUser();
console.log(currentUser?.email);
console.log(currentUser?.fullName);
console.log(currentUser?.roles);
```

### Check User Roles

```typescript
// Check if user has specific role
if (this.authService.hasRole('Admin')) {
  // Show admin features
}

// Check if user has any of multiple roles
if (this.authService.hasAnyRole(['Admin', 'Manager'])) {
  // Show management features
}
```

### Subscribe to Auth State Changes

```typescript
this.authService.isAuthenticated$.subscribe(isAuth => {
  if (isAuth) {
    console.log('User logged in');
  } else {
    console.log('User logged out');
  }
});
## 🧪 Testing the Security Module

### 1. Test Login Flow
1. Navigate to `/auth/login`
2. Enter credentials
3. Should redirect to dashboard with token stored
4. Try accessing protected routes - should work

### 2. Test Registration
1. Navigate to `/auth/register`
2. Fill form with strong password
3. Watch password strength indicator
4. Submit and verify account creation

### 3. Test Password Reset
1. Navigate to `/auth/forgot-password`
2. Enter email address
3. Check for reset email (backend required)
4. Click reset link → redirects to `/auth/reset-password?email=xxx&token=xxx`
5. Set new password

### 4. Test Change Password
1. Login first
2. Navigate to `/change-password`
3. Enter current and new passwords
4. Should auto-logout after 2 seconds

### 5. Test Profile Security
1. Login first
2. Navigate to `/profile-security`
3. View security information cards
4. Check failed login attempts counter

### 6. Test Role-Based Access
1. Add role guard to a route with specific roles
2. Login with user lacking required role
3. Should redirect to `/unauthorized`

## 🔧 Backend API Requirements

Your ASP.NET Core 9 backend should implement these endpoints:

### Authentication Endpoints

```
POST   /api/v1/auth/login              - User login
POST   /api/v1/auth/register           - New user registration
POST   /api/v1/auth/refresh-token      - Refresh access token
POST   /api/v1/auth/forgot-password    - Send password reset email
POST   /api/v1/auth/reset-password     - Reset password with token
POST   /api/v1/auth/change-password    - Change password (authenticated)
GET    /api/v1/auth/account-security   - Get security info (authenticated)
```

### CORS Configuration

Ensure your backend allows requests from your Angular app:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowAngularApp");
```

## 🎨 Component Features

### Login Component
- Email and password validation
- Password visibility toggle
- Remember me checkbox
- Error message display
- Loading state
- Return URL handling

### Register Component  
- Real-time password strength meter (Weak/Medium/Strong)
- Password requirements checklist with live validation
- Dual password visibility toggles
- Employee ID optional field
- Animated strength bar with color coding

### Forgot Password Component
- Email validation
- Success message (doesn't reveal if email exists)
- 60-second countdown before allowing resend
- Link to login page

### Reset Password Component
- Token validation from query params
- Password strength indicator (reused from register)
- Requirements checklist
- Auto-redirect to login after success
- Token expiration handling

### Change Password Component
- Three password fields (current, new, confirm)
- Validates new password differs from current
- Password strength indicator
- Auto-logout after successful change (2-second delay)
- Cancel button returns to profile

### Profile Security Component
- User profile information card
- Email verification status
- Two-factor authentication status (with enable button placeholder)
- Account lock status with countdown timer
- Failed login attempts counter
- Last login date
- Password management with change button
- Security tips section
- Refresh button to reload data

### Unauthorized Component
- 403 error display
- Shield icon with animation
- Links to dashboard and profile
- Explanation of access denial

## 🚀 Next Steps

1. ✅ All components created
2. ✅ Routing configured
3. ✅ Interceptors integrated
4. 🔄 Install jwt-decode: `npm install jwt-decode`
5. 🔄 Test authentication flows
6. 🔄 Configure backend CORS settings
7. 🔄 Test role-based access control
8. 🔄 Deploy and test in production