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

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Gmail account (for email service)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)
- Cloudinary account (optional, for profile pictures)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Auth_API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE auth_api_db;
   ```

4. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your credentials.

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Key variables to configure in `.env`:

- `API_URL` - Your hosted domain (e.g., https://api.yourdomain.com)
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `DB_*` - PostgreSQL database credentials
- `EMAIL_USER` & `EMAIL_PASSWORD` - Gmail credentials
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - GitHub OAuth

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
- ✅ Input validation and sanitization
- ✅ Flexible CORS configuration
- ✅ Account status checks (banned, inactive)

## Deployment

**Important:** When deploying, update `.env`:
- Set `API_URL` to your hosted domain (e.g., https://your-api.herokuapp.com)
- Set `NODE_ENV=production`
- Update OAuth callback URLs in provider settings

## License

ISC
