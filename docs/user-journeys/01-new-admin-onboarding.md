# User Journey: New Admin Onboarding

## Overview
This document describes the complete user journey for a first-time restaurant owner or manager setting up their restaurant on Restaurant Daily.

## Prerequisites
- Mobile phone with SMS capability
- Restaurant details (name, address, contact information)

---

## Journey Steps

### Step 1: Landing & Authentication
**Page**: `/` -> `/auth/phone`

1. User lands on the Restaurant Daily homepage
2. Clicks "Get Started" or "Login"
3. Redirected to phone authentication page
4. Enters phone number in E.164 format (+91XXXXXXXXXX)
5. Clicks "Send OTP"

**UI Elements**:
- Dark glassmorphism design with animated background
- Phone input with country code detection
- Primary orange accent button

### Step 2: OTP Verification
**Page**: `/auth/verify`

1. User receives SMS with 6-digit OTP
2. Enters OTP code in verification page
3. System validates OTP (5-minute expiry)
4. On success, JWT token is generated and stored

**Error Handling**:
- Invalid OTP: Error message with retry option
- Expired OTP: Resend option available (60-second cooldown)
- Max attempts (3): Rate limiting message

### Step 3: Role Selection
**Page**: `/auth/role-selection`

1. User sees two role options:
   - **Restaurant Admin**: For owners/managers creating a new restaurant
   - **Staff Member**: For employees joining an existing restaurant

2. User selects "Restaurant Admin"
3. Clicks "Continue as Admin"
4. System updates user role in database
5. Redirected to restaurant setup

**Key UI Features**:
- Interactive card selection with glow effects
- Clear description of each role's capabilities
- Notice: "Choose Admin if you need to CREATE a new restaurant"

### Step 4: Restaurant Setup (3-Step Form)
**Page**: `/onboarding/restaurant-setup`

#### Step 4.1: Restaurant Details
- Restaurant name (required)
- Full address (required)
- Google Maps link (optional)

#### Step 4.2: Additional Information
- Cuisine type (dropdown selection)
- Phone number (optional, validated)
- Email address (optional, validated)
- Description (optional)

#### Step 4.3: Review & Confirm
- Summary of all entered information
- Edit option via back navigation
- "Complete Setup" button

**On Completion**:
1. Restaurant record created in database
2. Admin user associated with restaurant
3. New JWT token issued with restaurant_id
4. Redirect to admin dashboard

### Step 5: Admin Dashboard
**Page**: `/dashboard/admin`

1. Welcome banner with quick actions
2. Overview of restaurant stats
3. Quick action cards:
   - Invite Staff
   - View Sessions
   - Manage Vouchers
   - View Reports

---

## Technical Flow

```
[Landing Page]
      |
      v
[Phone Auth] --> [Send OTP API] --> [Twilio SMS]
      |
      v
[OTP Verify] --> [Verify OTP API] --> [JWT Token]
      |
      v
[Role Selection] --> [Update Role API]
      |
      v
[Restaurant Setup] --> [Create Restaurant API]
      |
      v
[Admin Dashboard]
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/request-otp` | POST | Send OTP via SMS |
| `/api/auth/verify-otp` | POST | Verify OTP and get token |
| `/api/auth/update-role` | POST | Set user role to admin |
| `/api/restaurant/create` | POST | Create restaurant record |

## State Management

- **Auth Token**: Stored in `localStorage` as `auth_token`
- **Form State**: React useState for multi-step form
- **Validation**: Client-side with Zod schemas

## Error States

1. **Network Error**: Toast notification with retry
2. **Invalid Token**: Redirect to phone auth
3. **Expired Session**: Clear token, redirect to login
4. **Duplicate Restaurant**: Error message with support link

---

## Design Tokens

- **Primary Color**: Orange (#F97316)
- **Background**: Deep navy gradient (#050510 -> #0a0a1a)
- **Glass Effect**: backdrop-blur(40px), bg-white/5
- **Text Hierarchy**: white, white/70, white/50

## Mobile Responsiveness

- Touch-friendly button sizes (min 44px tap target)
- Responsive grid layouts
- Bottom-anchored CTAs on mobile
- Swipe-friendly multi-step navigation
