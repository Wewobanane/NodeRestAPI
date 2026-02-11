# Auth API - Node.js Authentication REST API

A comprehensive authentication REST API built with Node.js, Express, PostgreSQL, and Passport.js. Supports local authentication (email/password) and OAuth 2.0 (Google & GitHub).

## Features

- ✅ **Local Authentication** - Email/password registration and login
- ✅ **OAuth 2.0 Integration** - Google and GitHub authentication
- ✅ **JWT Tokens** - Access and refresh token implementation
- ✅ **Email Verification** - Verify user email addresses
- ✅ **Password Reset** - Secure password reset with email tokens
- ✅ **Profile Management** - Update user profile and profile pictures
- ✅ **Cloudinary Integration** - Cloud-based image storage
- ✅ **Security Features** - Password hashing, JWT validation, account status checks
- ✅ **PostgreSQL Database** - Robust relational database
- ✅ **Input Validation** - Express-validator middleware

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** Passport.js (Local, Google, GitHub)
- **Token Management:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Email Service:** Nodemailer
- **File Upload:** Multer + Cloudinary
- **Validation:** express-validator

## Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up PostgreSQL database
4. Configure environment variables (see `.env.example`)
5. Run migrations with `npm run migrate`
6. Start the server with `npm run dev`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login with email/password | No |
| GET | `/api/auth/verify-email?token=` | Verify email address | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |
| POST | `/api/auth/request-password-reset` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| GET | `/api/auth/google` | Google OAuth login | No |
| GET | `/api/auth/github` | GitHub OAuth login | No |

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/profile` | Get user profile | Yes |
| PUT | `/api/user/profile` | Update user profile | Yes |
| POST | `/api/user/profile-picture` | Upload profile picture | Yes |
| PUT | `/api/user/change-password` | Change password | Yes |
| DELETE | `/api/user/account` | Delete account | Yes |

## Request Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get User Profile (Authenticated)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### Users Table
- `id` - UUID (Primary Key)
- `name` - VARCHAR(100)
- `email` - VARCHAR(150) (Unique)
- `password` - TEXT (hashed)
- `provider` - VARCHAR(20) (local/google/github)
- `provider_id` - VARCHAR(255)
- `profile_picture` - TEXT
- `is_email_verified` - BOOLEAN
- `is_active` - BOOLEAN
- `is_banned` - BOOLEAN
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT access and refresh tokens
- ✅ Email verification
- ✅ Password reset with expiring tokens
- ✅Security Features

- ✅ Password hashing
- ✅ JWT authentication
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Input validation
- ✅ CORS configuration