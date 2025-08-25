# Two-Step Signup Flow Implementation

## Overview

This implementation provides a robust, secure two-step signup flow with OTP verification using Node.js/Express, MongoDB, and Mongoose. The flow ensures user verification before account creation while maintaining security and user experience.

## Flow Architecture

### Step 1: Request OTP

1. User enters email and username
2. Backend validates input
3. Backend checks for existing users
4. If valid, generates OTP and sends via email
5. OTP stored in database with expiry (10 minutes)

### Step 2: Complete Signup

1. User enters OTP + remaining signup data
2. Backend verifies OTP
3. If valid, creates user account
4. User marked as verified
5. JWT token generated and returned

## API Endpoints

### 1. Request Signup OTP

```
POST /signup/request-otp
Content-Type: application/json

{
    "userName": "johndoe",
    "email": "john@example.com"
}
```

**Response:**

```json
{
  "message": "OTP sent successfully to your email",
  "data": {
    "email": "john@example.com",
    "userName": "johndoe"
  }
}
```

### 2. Complete Signup

```
POST /signup/complete
Content-Type: application/json

{
    "userName": "johndoe",
    "email": "john@example.com",
    "otpCode": "123456",
    "name": "John Doe",
    "password": "SecurePassword123!",
    "phoneNumber": "+1234567890",
    "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id_here",
    "userName": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": ["viewer"],
    "isVerified": true
  },
  "token": "jwt_token_here"
}
```

### 3. Password Reset Flow

#### Request Password Reset OTP

```
POST /forgot-password
Content-Type: application/json

{
    "email": "john@example.com"
}
```

#### Reset Password

```
POST /reset-password
Content-Type: application/json

{
    "email": "john@example.com",
    "otpCode": "123456",
    "newPassword": "NewSecurePassword123!"
}
```

## Security Features

### OTP Security

- **6-digit numeric OTPs** with 10-minute expiry
- **One-time use**: OTPs marked as used after verification
- **Auto-cleanup**: Expired OTPs automatically deleted
- **Rate limiting**: Existing OTPs deleted before generating new ones

### User Verification

- Users marked as `isVerified: true` after OTP verification
- **Race condition protection**: Double-check for existing users
- **Secure password handling**: Passwords hashed using bcrypt

### JWT Security

- **HttpOnly cookies** for token storage
- **24-hour expiry** for authentication tokens
- **Secure token generation** with user ID

## Database Schema

### OTP Model

```typescript
interface OtpDocument {
  email: string;
  userName: string;
  otpCode: string;
  otpExpiry: Date;
  otpPurpose: "signup" | "resetPassword";
  isUsed: boolean;
  createdAt: Date;
}
```

### User Model

```typescript
interface IUser {
  userName: string;
  name: string;
  email: string;
  phoneNumber: string;
  passwordHashed: string;
  avatarUrl?: string;
  isVerified: boolean;
  role: string[];
  permissions: {
    canDraw: boolean;
    canType: boolean;
    canAudio: boolean;
    canInvite: boolean;
  };
  isBlocked: boolean;
  lastLogin?: Date;
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "errors": {
    "userName": "Username must be 3-20 characters...",
    "email": "Email is not valid."
  }
}
```

#### 409 Conflict

```json
{
  "message": "User with this email or username already exists"
}
```

#### 400 Bad Request (OTP)

```json
{
  "message": "Invalid or expired OTP"
}
```

## Implementation Benefits

### 1. **Security**

- Prevents fake email registrations
- Ensures user owns the email address
- Reduces spam accounts

### 2. **User Experience**

- Clear two-step process
- Immediate feedback on email/username availability
- Secure without being cumbersome

### 3. **Scalability**

- Efficient database indexing
- Auto-cleanup of expired OTPs
- Rate limiting through OTP replacement

### 4. **Maintainability**

- Clean separation of concerns
- Comprehensive validation
- Consistent error handling

## Frontend Integration

### Step 1 UI

```typescript
// Collect email and username
const step1Data = {
  email: "user@example.com",
  userName: "username",
};

// Send to backend
const response = await fetch("/signup/request-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(step1Data),
});
```

### Step 2 UI

```typescript
// Collect remaining data + OTP
const step2Data = {
  email: "user@example.com",
  userName: "username",
  otpCode: "123456",
  name: "User Name",
  password: "SecurePassword123!",
  phoneNumber: "+1234567890",
};

// Complete signup
const response = await fetch("/signup/complete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(step2Data),
});
```

## Alternative Approaches Considered

### 1. **Email Link Verification**

- **Pros**: No OTP input required
- **Cons**: More complex, email client dependencies

### 2. **SMS OTP**

- **Pros**: Faster delivery
- **Cons**: Cost, phone number requirement

### 3. **Magic Links**

- **Pros**: Seamless UX
- **Cons**: Security concerns, email client issues

## Current Choice Rationale

The **Email OTP approach** was chosen because it:

- Provides immediate verification
- Works across all email clients
- Offers good security without complexity
- Allows for rate limiting and abuse prevention
- Provides clear user feedback

## Future Enhancements

### 1. **Rate Limiting**

- Implement per-IP rate limiting
- Add cooldown periods between OTP requests

### 2. **OTP Resend**

- Allow users to request new OTP after expiry
- Implement exponential backoff for repeated requests

### 3. **Multi-factor Authentication**

- Add SMS OTP as second factor
- Implement backup codes

### 4. **Analytics**

- Track OTP delivery success rates
- Monitor signup completion rates
- Identify potential abuse patterns

## Testing Considerations

### Unit Tests

- OTP generation and validation
- User creation flow
- Error handling scenarios

### Integration Tests

- End-to-end signup flow
- Email delivery verification
- Database consistency checks

### Security Tests

- OTP brute force protection
- Rate limiting effectiveness
- Token security validation

## Deployment Notes

### Environment Variables

```bash
JWT_SECRET=your_jwt_secret_here
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Database Indexes

The OTP model includes optimized indexes for:

- Email + username + purpose queries
- OTP code verification
- Expiry-based cleanup operations

### Monitoring

- Set up alerts for OTP generation failures
- Monitor email delivery success rates
- Track signup completion metrics
