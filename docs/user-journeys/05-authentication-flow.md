# User Journey: Authentication Flow

## Overview
This document describes the complete phone OTP authentication flow used throughout Restaurant Daily.

## Authentication Method
**Phone-based OTP via SMS (Twilio)**

- No passwords required
- 6-digit OTP codes
- 5-minute expiry
- 3 attempts max per OTP
- 3 OTPs per hour rate limit

---

## Journey Steps

### Step 1: Phone Entry
**Page**: `/auth/phone`

#### UI Elements
- Premium dark glassmorphism background
- Animated gradient orbs
- Phone input with country code
- "Send OTP" button

#### User Actions
1. User enters phone number
2. Format: +91 XXXXX XXXXX (India) or international
3. Clicks "Send OTP"

#### Validation
- E.164 format validation
- Country code required
- 10-15 digit length

### Step 2: OTP Request
**API**: `POST /api/auth/request-otp`

#### Process
1. Server validates phone format
2. Generates 6-digit OTP
3. Stores OTP with expiry (5 min)
4. Sends SMS via Twilio
5. Returns success/error

#### SMS Content
```
Your Restaurant Daily verification code is: 123456

This code expires in 5 minutes.
```

### Step 3: OTP Verification
**Page**: `/auth/verify`

#### UI Elements
- 6-digit input field
- Timer showing expiry countdown
- "Verify" button
- "Resend OTP" link (60s cooldown)

#### User Actions
1. User receives SMS
2. Enters 6-digit code
3. Clicks "Verify"

#### Validation
- 6 digits required
- Numeric only
- Case insensitive (if alphanumeric in future)

### Step 4: Token Generation
**API**: `POST /api/auth/verify-otp`

#### On Success
1. OTP validated against stored hash
2. User record created/updated
3. JWT token generated with:
   - Phone number
   - User ID
   - Role (if set)
   - Restaurant ID (if associated)
   - Expiry (24 hours)
4. Token returned to client

#### JWT Payload
```json
{
  "sub": "user_123",
  "phone": "+918826175074",
  "role": "admin",
  "restaurant_id": "rest_456",
  "restaurant_name": "The Golden Fork",
  "iat": 1709553600,
  "exp": 1709640000
}
```

### Step 5: Post-Auth Routing
**Based on user state**:

```
[Token Received]
      |
      v
[Has Role?] --No--> [Role Selection Page]
      |
     Yes
      |
      v
[Role == Admin?]
      |
     +-- Yes --> [Has Restaurant?]
     |                 |
     |              +--+--+
     |              |     |
     |             Yes    No
     |              |     |
     |              v     v
     |          [Admin  [Restaurant
     |         Dashboard] Setup]
     |
     +-- No --> [Staff Dashboard]
```

---

## Security Features

### OTP Security
- SHA-256 hashed storage
- Time-based expiry (5 min)
- Attempt limiting (3 max)
- Rate limiting (3/hour)
- Secure random generation

### Token Security
- JWT with HS256 signing
- Server-side secret key
- 24-hour expiry
- Stored in localStorage
- Validated on each API call

### Rate Limiting
| Action | Limit | Window |
|--------|-------|--------|
| OTP Request | 3 | 1 hour |
| OTP Verify | 3 | Per OTP |
| Failed Login | 5 | 15 min |

---

## Error Handling

### Phone Entry Errors
| Error | Message | Action |
|-------|---------|--------|
| Invalid format | "Please enter a valid phone number" | Fix input |
| Too short | "Phone number is too short" | Add digits |
| Missing country | "Include country code (+91)" | Add code |

### OTP Request Errors
| Error | Message | Action |
|-------|---------|--------|
| Rate limited | "Too many requests. Try again in X minutes" | Wait |
| Network error | "Failed to send OTP. Check connection" | Retry |
| Server error | "Something went wrong. Please try again" | Retry |

### OTP Verify Errors
| Error | Message | Action |
|-------|---------|--------|
| Invalid OTP | "Invalid code. Please try again" | Re-enter |
| Expired OTP | "Code expired. Request a new one" | Resend |
| Max attempts | "Too many attempts. Request new code" | Resend |

---

## API Endpoints

### Request OTP
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "phoneNumber": "+918826175074",
  "preferredMethod": "sms"
}
```

**Response**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2025-03-04T12:05:00Z"
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+918826175074",
  "otp": "123456"
}
```

**Response**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "phone": "+918826175074",
    "role": "admin"
  }
}
```

### Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "phoneNumber": "+918826175074"
}
```

---

## Token Management

### Storage
```typescript
// On successful auth
localStorage.setItem('auth_token', token);

// On logout
localStorage.removeItem('auth_token');
```

### Validation
```typescript
// Client-side token check
const isTokenValid = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp > Date.now() / 1000;
};
```

### Refresh Strategy
- No refresh tokens currently
- Full re-authentication required after expiry
- 24-hour session length

---

## UI Components

### PhoneInput Component
```tsx
<GlassInput
  type="tel"
  placeholder="+91 XXXXX XXXXX"
  value={phone}
  onChange={setPhone}
  error={phoneError}
/>
```

### OTPInput Component
```tsx
<div className="flex gap-2">
  {[0,1,2,3,4,5].map(i => (
    <input
      key={i}
      type="text"
      maxLength={1}
      className="w-12 h-14 text-center text-2xl"
      value={otp[i]}
      onChange={handleOtpChange(i)}
    />
  ))}
</div>
```

### ResendTimer Component
```tsx
<button
  disabled={countdown > 0}
  onClick={handleResend}
>
  {countdown > 0
    ? `Resend in ${countdown}s`
    : 'Resend OTP'}
</button>
```

---

## Session States

### Unauthenticated
- No token in localStorage
- Redirected to `/auth/phone`

### Authenticated (No Role)
- Valid token
- No role in payload
- Redirected to `/auth/role-selection`

### Authenticated (Admin, No Restaurant)
- Valid token
- Role: admin
- No restaurant_id
- Redirected to `/onboarding/restaurant-setup`

### Authenticated (Admin, With Restaurant)
- Valid token
- Role: admin
- Has restaurant_id
- Access to `/dashboard/admin`

### Authenticated (Staff)
- Valid token
- Role: staff
- Access to `/dashboard/staff`

---

## Design Tokens

### Colors
- Input focus: Orange ring (#F97316)
- Error state: Red (#EF4444)
- Success state: Emerald (#10B981)
- Timer warning: Amber (#F59E0B)

### Typography
- Phone input: 2xl, tracking-wide
- OTP input: 3xl, font-bold
- Error messages: sm, text-red-400

### Animation
- Button loading spinner
- OTP input shake on error
- Success checkmark animation
- Background gradient orbs
