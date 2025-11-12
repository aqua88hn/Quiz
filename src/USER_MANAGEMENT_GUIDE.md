# User Management & Authentication Guide

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Hashed password
- `role` - admin, user, moderator
- `status` - active, inactive, suspended
- `created_at`, `updated_at`, `last_login` - Timestamps
- `is_deleted` - Soft delete flag

### Permissions Table
- `id` - Primary key
- `permission_name` - Unique permission name
- `description` - Description

### Role Permissions
- Junction table linking roles to permissions

### Audit Logs
- Tracks all user actions

## Setup Steps

### 1. Run Migration
```bash
psql -U quizmate_user -d quizmate -f scripts/migration-users-permissions.sql
psql -U quizmate_user -d quizmate -f scripts/seed-users.sql
```

### 2. Update .env.local
```env
DATABASE_URL="postgresql://quizmate_user:quizmate_pass_123@localhost:5432/quizmate"
JWT_SECRET="your-dev-secret-key-here"
```

### 3. Restart Dev Server
```bash
npm run dev
```

### 4. Test Login
- URL: http://localhost:3000/admin/login
- Username: `admin`
- Password: `admin123`

## API Endpoints

### POST /api/v1/auth/login
Login with username and password
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### GET /api/v1/admin/users
List all users (admin only)

### PATCH /api/v1/admin/users/:id
Update user (admin only)

## Permissions System

Permissions are assigned by role:
- **Admin**: All permissions
- **User**: view_quizzes, take_quiz, view_results
- **Moderator**: All user permissions + manage_quizzes, manage_questions

## Audit Logging

All user actions are logged automatically:
- Login attempts (success/failure)
- Quiz submissions
- User management actions
- Viewed in `/api/admin/audit-logs`
