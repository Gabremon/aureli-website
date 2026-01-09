# Authentication Setup Guide

This guide explains how to set up and use the authentication system with role-based access control.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations:**
   ```bash
   npm run migrate
   ```

4. **Create a test user:**
   ```bash
   npm run seed:user <email> <password> <name> <role>
   ```
   
   Example:
   ```bash
   npm run seed:user admin@example.com password123 "Admin User" admin
   npm run seed:user owner@example.com password123 "Business Owner" business_owner
   npm run seed:user employee@example.com password123 "Employee User" employee
   ```

5. **Start the backend server** (in one terminal):
   ```bash
   npm run server
   ```
   Or with auto-reload:
   ```bash
   npm run dev:server
   ```

6. **Start the frontend** (in another terminal):
   ```bash
   npm run dev
   ```

7. **Visit the login page:**
   ```
   http://localhost:5173/login
   ```

## User Roles

The system supports three user roles:

- **`admin`** - Full system access, user management, system settings
- **`business_owner`** - Business management, hiring, employee management
- **`employee`** - Personal profile, documents, schedule access

## Routes

### Public Routes
- `/` - Home page
- `/hire` - Hire page
- `/referrals` - Referrals page
- `/i9-center` - I-9 Center page
- `/onboard` - Onboard page
- `/compliance` - Compliance page
- `/login` - Login page

### Protected Routes (Requires Authentication)
- `/admin` - Admin dashboard (admin only)
- `/business-owner` - Business owner dashboard (business_owner only)
- `/employee` - Employee dashboard (employee only)

## Creating Users

### Using the Seed Script

```bash
npm run seed:user <email> <password> <name> <role>
```

Examples:
```bash
# Create an admin user
npm run seed:user admin@aureli.com admin123 "Admin User" admin

# Create a business owner
npm run seed:user owner@company.com owner123 "John Doe" business_owner

# Create an employee
npm run seed:user employee@company.com emp123 "Jane Smith" employee
```

### Programmatically

You can also create users directly in your application using bcrypt to hash passwords:

```javascript
const bcrypt = require('bcryptjs');
const passwordHash = await bcrypt.hash('password', 10);
// Then insert into database
```

## Authentication Flow

1. User visits `/login`
2. Enters email and password
3. Frontend sends credentials to `/api/auth/login`
4. Backend verifies credentials against database
5. Backend returns user data and session token
6. Frontend stores token and redirects based on role:
   - Admin → `/admin`
   - Business Owner → `/business-owner`
   - Employee → `/employee`

## Protected Routes

Protected routes use the `ProtectedRoute` component:

```tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## API Endpoints

### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "session_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

### GET `/api/auth/me`
Verify token and get current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

### POST `/api/auth/logout`
Logout and invalidate session.

**Headers:**
```
Authorization: Bearer <token>
```

## Session Management

Sessions are currently stored in-memory on the server. In production, you should:

- Use Redis for session storage
- Or use JWT tokens with refresh tokens
- Implement session expiration
- Add rate limiting to login endpoint

## Security Notes

- Passwords are hashed using bcrypt with 10 rounds
- Session tokens are stored in localStorage (consider httpOnly cookies for production)
- All API endpoints should use HTTPS in production
- Implement rate limiting on login endpoint
- Add CSRF protection for state-changing operations
- Validate and sanitize all user inputs

## Troubleshooting

### "Invalid email or password"
- Check that the user exists in the database
- Verify the password is correct
- Check that migrations have been run

### "Cannot connect to database"
- Ensure Docker is running
- Check that `docker-compose up -d` was executed
- Verify `.env` file has correct database credentials

### "Connection refused" on API calls
- Make sure the backend server is running (`npm run server`)
- Check that SERVER_PORT in `.env` matches (default: 3001)
- Verify the proxy configuration in `vite.config.ts`

### Token not persisting
- Check browser console for errors
- Verify localStorage is not disabled
- Check that token is being saved in AuthContext

## Next Steps

- [ ] Implement password reset functionality
- [ ] Add email verification
- [ ] Implement role-based permissions at the API level
- [ ] Add audit logging for authentication events
- [ ] Set up proper session management (Redis/JWT)
- [ ] Add multi-factor authentication (MFA)

