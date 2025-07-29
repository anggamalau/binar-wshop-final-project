# JWT Authentication API Usage

This document demonstrates how to use the JWT authentication system implemented for the Diary Book application.

## Setup

1. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

2. Update the `.env` file with your database credentials and JWT secret:
```env
JWT_SECRET=your_very_secure_jwt_secret_key_here_make_it_long_and_random_at_least_32_characters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=diary_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Validation Rules:**
- Email must be valid and unique
- Password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number
- Confirm password must match password

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password"
    }
  ]
}
```

### 2. User Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** The JWT token is also set as an HTTP-only cookie named `token`.

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 3. User Logout

**Endpoint:** `POST /auth/logout`

**Headers:** No authentication required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Using JWT Token for Protected Routes

### Method 1: HTTP-Only Cookie (Recommended)
The JWT token is automatically set as an HTTP-only cookie when you login. This cookie will be sent automatically with subsequent requests.

### Method 2: Authorization Header
Include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Example cURL Commands

### Register a new user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Access protected route (using cookie):
```bash
curl -X GET http://localhost:3000/protected-route \
  -b cookies.txt
```

### Access protected route (using Authorization header):
```bash
curl -X GET http://localhost:3000/protected-route \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Logout:
```bash
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt
```

## Security Features Implemented

1. **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
2. **JWT Expiration**: Tokens expire after 24 hours
3. **HTTP-Only Cookies**: Tokens stored in secure, HTTP-only cookies
4. **Rate Limiting**: Authentication endpoints limited to 5 requests per 15 minutes per IP
5. **Input Validation**: Comprehensive validation using express-validator
6. **Error Handling**: Proper error responses for invalid/expired tokens
7. **Security Headers**: Helmet.js for security headers
8. **CORS Protection**: Configured CORS for specific origins

## Token Payload

The JWT token contains the following payload:
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## Error Codes

- `400` - Bad Request (validation errors, duplicate email)
- `401` - Unauthorized (invalid credentials, expired/invalid token)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Integration with Diary Routes

To use the authentication middleware in your diary routes:

```javascript
const { authenticateToken } = require('../middlewares/authMiddleware');

// Protected route example
router.get('/diary', authenticateToken, diaryController.getAllEntries);
router.post('/diary', authenticateToken, validateDiaryEntry, diaryController.createEntry);
```

The authenticated user information will be available in `req.user`:
```javascript
{
  userId: 1,
  email: "user@example.com",
  iat: 1640995200,
  exp: 1641081600
}
```