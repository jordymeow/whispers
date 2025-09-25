# Whispers API Documentation

## Quick Reference

### Authentication
- `GET /api/auth/check` - Check system status
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-email` - Change email address
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

### Users
- `GET /api/users` - List all users (with search/pagination)
- `GET /api/users/search` - Search users by username/name
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `DELETE /api/users/me` - Delete account
- `GET /api/users/[username]` - Get user by username

### Posts (Whispers)
- `GET /api/posts` - Get posts (with filters)
- `POST /api/posts` - Create new post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### Settings & Admin
- `GET /api/settings` - Get site settings
- `PUT /api/settings` - Update site settings (admin only)
- `GET /api/admin/stats` - Get admin statistics (admin only)

## Base URL
```
Development: http://localhost:3000/api
Production: https://whispers.cloud/api
```

## Authentication

The API uses JWT tokens stored in cookies for web clients. For mobile apps, you can send the token in the Authorization header.

### Cookie Authentication (Web)
```
Cookie: midnight-auth=<jwt_token>
```

### Bearer Token Authentication (Mobile)
```
Authorization: Bearer <jwt_token>
```

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not logged in)
- `404` - Not Found
- `409` - Conflict (e.g., username already taken)
- `500` - Internal Server Error

---

## Authentication Endpoints

### 1. Check System Status
Checks if the system has been set up with at least one user.

**Endpoint:** `GET /api/auth/check`

**Response:**
```json
{
  "hasUsers": true,
  "requiresSetup": false
}
```

---

### 2. Register
Creates a new user account. First user becomes admin automatically.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Validation:**
- Username: lowercase letters, numbers, hyphens only, starts with letter, min 3 chars
- Password: minimum 6 characters
- Email: valid email format

**Response (First User - Admin):**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "redirectTo": "/dashboard"
}
```

**Response (Regular User):**
```json
{
  "success": true,
  "message": "Account created. Please check your email for verification code.",
  "requiresVerification": true,
  "userId": "user_id",
  "email": "john@example.com",
  "_testCode": 246912  // Testing only: actual code * 2 (divide by 2 to get real code)
}
```

---

### 3. Verify Email
Verifies email with 6-digit code sent to user's email.

**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 4. Resend Verification Code
Resends the email verification code.

**Endpoint:** `POST /api/auth/resend-verification`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New verification code sent to your email"
}
```

---

### 5. Forgot Password
Initiates password reset process by sending email with reset token.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link."
}
```

**Note:** Always returns success for security (doesn't reveal if email exists)

---

### 6. Reset Password
Resets password using token from forgot-password email.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "newSecurePassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 7. Change Email
Changes email address for authenticated user.

**Endpoint:** `POST /api/auth/change-email`

**Request Body:**
```json
{
  "newEmail": "newemail@example.com",
  "password": "currentPassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to new email address",
  "requiresVerification": true
}
```

---

### 8. Login
Authenticates a user and returns a session token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "redirectTo": "/dashboard",
  "token": "eyJhbGciOiJIUzI1NiIs...",  // JWT token for mobile apps
  "user": {
    "userId": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "role": "user"
  }
}
```

---

### 9. Logout
Ends the user session.

**Endpoint:** `POST /api/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 10. Get Session
Returns current user session information.

**Endpoint:** `GET /api/auth/session`

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "userId": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "role": "user"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false
}
```

---

## User Endpoints

### 1. Get Current User Profile
Returns detailed profile information for the authenticated user.

**Endpoint:** `GET /api/users/me`

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "bio": "Software developer and whisper enthusiast",
    "backgroundTheme": "gradient",
    "backgroundTint": "purple",
    "asciiArtBanner": " /\\_/\\\n( •.• )",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Update User Profile
Updates the current user's profile information.

**Endpoint:** `PUT /api/users/me`

**Request Body:**
```json
{
  "displayName": "John Doe",
  "username": "johndoe",
  "bio": "Updated bio text",
  "backgroundTheme": "gradient",
  "backgroundTint": "blue",
  "asciiArtBanner": "custom ascii art"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    // Updated user object
  }
}
```

---

### 3. Delete Account
Deletes the current user's account and all associated data.

**Endpoint:** `DELETE /api/users/me`

**Request Body:**
```json
{
  "password": "currentpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### 4. Get User by Username
Gets public profile information for a user.

**Endpoint:** `GET /api/users/[username]`

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "displayName": "John Doe",
    "bio": "Software developer",
    "backgroundTheme": "gradient",
    "backgroundTint": "purple",
    "asciiArtBanner": " /\\_/\\\n( •.• )",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. List Users
Gets a list of all users with optional pagination and stats.

**Endpoint:** `GET /api/users`

**Query Parameters:**
- `search` - Search users by username or display name
- `limit=20` - Number of users to return (max 100)
- `offset=0` - Offset for pagination
- `includeStats=true` - Include post count for each user

**Response:**
```json
{
  "users": [
    {
      "username": "johndoe",
      "displayName": "John Doe",
      "bio": "Software developer",
      "backgroundTheme": "gradient",
      "backgroundTint": "purple",
      "asciiArtBanner": " /\\_/\\\n( •.• )",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "postCount": 15
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 42,
    "hasMore": true
  }
}
```

---

### 6. Search Users
Search for users by username or display name.

**Endpoint:** `GET /api/users/search`

**Query Parameters:**
- `q` - Search query (minimum 2 characters, required)
- `limit=10` - Number of results to return (max 50)

**Response:**
```json
{
  "query": "john",
  "results": [
    {
      "username": "johndoe",
      "displayName": "John Doe",
      "bio": "Software developer",
      "backgroundTint": "purple",
      "profileUrl": "/u/johndoe"
    }
  ],
  "count": 1
}
```

---

## Posts (Whispers) Endpoints

### 1. Get Posts
Retrieves posts/whispers with optional filtering.

**Endpoint:** `GET /api/posts`

**Query Parameters:**
- `includeDrafts=true` - Include draft posts (requires auth, only shows user's own drafts)
- `author=username` - Filter posts by author username (e.g., `author=johndoe`)

**Examples:**
- Get all public posts: `GET /api/posts`
- Get posts by specific user: `GET /api/posts?author=johndoe`
- Get your posts including drafts: `GET /api/posts?includeDrafts=true` (requires auth)

**Response:**
```json
[
  {
    "_id": "post_id",
    "content": "This is my whisper content",
    "date": "2024-01-01T00:00:00.000Z",
    "icon": "Heart",
    "color": "red",
    "isDraft": false,
    "author": {
      "displayName": "John Doe",
      "username": "johndoe"
    }
  }
]
```

---

### 2. Create Post
Creates a new post/whisper.

**Endpoint:** `POST /api/posts`

**Request Body:**
```json
{
  "content": "This is my whisper content",
  "icon": "Heart",
  "color": "red",
  "isDraft": false,
  "date": "2024-01-01T00:00:00.000Z"
}
```

**Validation:**
- Content: required, max 1000 characters
- Icon: optional, must be valid Lucide icon name
- Color: optional, must be valid color (red, orange, yellow, green, blue, purple, pink)
- isDraft: optional, defaults to false

**Response:**
```json
{
  "_id": "post_id",
  "content": "This is my whisper content",
  "date": "2024-01-01T00:00:00.000Z",
  "icon": "Heart",
  "color": "red",
  "isDraft": false,
  "author": {
    "displayName": "John Doe",
    "username": "johndoe"
  }
}
```

---

### 3. Update Post
Updates an existing post.

**Endpoint:** `PUT /api/posts/[id]`

**Request Body:**
```json
{
  "content": "Updated whisper content",
  "icon": "Star",
  "color": "blue",
  "isDraft": true
}
```

**Response:**
```json
{
  "_id": "post_id",
  "content": "Updated whisper content",
  "date": "2024-01-01T00:00:00.000Z",
  "icon": "Star",
  "color": "blue",
  "isDraft": true,
  "author": {
    "displayName": "John Doe",
    "username": "johndoe"
  }
}
```

---

### 4. Delete Post
Deletes a post.

**Endpoint:** `DELETE /api/posts/[id]`

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

## Settings Endpoints

### 1. Get Site Settings
Returns public site settings.

**Endpoint:** `GET /api/settings`

**Response:**
```json
{
  "title": "My Whispers",
  "backgroundTheme": "gradient",
  "backgroundTint": "purple",
  "asciiArt": "site ascii art",
  "trackingSnippet": ""
}
```

---

### 2. Update Site Settings (Admin Only)
Updates site-wide settings.

**Endpoint:** `PUT /api/settings`

**Request Body:**
```json
{
  "title": "My Whispers",
  "backgroundTheme": "gradient",
  "backgroundTint": "blue",
  "asciiArt": "new ascii art",
  "trackingSnippet": "<script>analytics</script>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    // Updated settings object
  }
}
```

---

## Admin Endpoints

### 1. Get Admin Statistics (Admin Only)
Returns user and post statistics.

**Endpoint:** `GET /api/admin/stats`

**Response:**
```json
{
  "totalUsers": 42,
  "topActive": [
    {
      "userId": "user_id",
      "postCount": 25,
      "username": "johndoe",
      "displayName": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "recentUsers": [
    {
      "username": "newuser",
      "displayName": "New User",
      "email": "new@example.com",
      "emailVerified": true,
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## Rate Limiting

The API currently does not implement rate limiting, but it's recommended to add for production:
- Authentication endpoints: 5 requests per minute
- Post creation: 10 posts per hour
- General API calls: 100 requests per minute

---

## Mobile App Integration Tips

### 1. Token Management
Store the JWT token securely on the device (iOS Keychain, Android Keystore) and include it in the Authorization header:

```swift
// iOS Swift Example
let token = KeychainService.getToken()
request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
```

### 2. Handle Token Expiration
Tokens expire after 7 days. Handle 401 responses by redirecting to login:

```swift
if response.statusCode == 401 {
    // Token expired, redirect to login
    navigateToLogin()
}
```

### 3. Image Handling
Profile avatars and whisper icons use Lucide icon names. You'll need to map these to iOS SF Symbols or include the Lucide icon set.

### 4. Real-time Updates
Currently, the API doesn't support WebSockets. Implement polling or pull-to-refresh for updates.

### 5. Offline Support
Consider caching posts locally and syncing when online.

---

## Testing Endpoints

For testing, you can use the following flow:
1. Check if setup is needed (`GET /api/auth/check`)
2. Register first user as admin
3. Register additional test users
4. Create posts for each user
5. Update user profiles
6. Delete test data

See `scripts/test-api.js` for a complete automated test suite.