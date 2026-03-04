# User Journey: Staff Invitation Acceptance

## Overview
This document describes the complete user journey for a staff member accepting an invitation to join a restaurant team on Restaurant Daily.

## Prerequisites
- SMS invitation from restaurant admin
- Mobile phone that received the invitation

---

## Journey Steps

### Step 1: Receiving the Invitation
**Medium**: SMS

Staff member receives an SMS with:
- Restaurant name
- Invitation message
- Unique invitation link: `https://restaurant-daily.mindweave.tech/staff/accept-invitation?token=xxx`

**SMS Format**:
```
You've been invited to join [Restaurant Name] on Restaurant Daily!
Accept your invitation: https://restaurant-daily.mindweave.tech/staff/accept-invitation?token=abc123
This link expires in 7 days.
```

### Step 2: Opening the Invitation Link
**Page**: `/staff/accept-invitation?token=xxx`

1. User clicks the invitation link in SMS
2. Page loads with animated glassmorphism background
3. System validates the invitation token

**Validation Checks**:
- Token exists in database
- Token not expired (7-day default)
- Invitation status is "pending"

**Loading State**:
- Premium loading screen with spinner
- Message: "Validating invitation..."

### Step 3: Viewing Invitation Details
**Page**: `/staff/accept-invitation` (valid invitation)

User sees:
1. Restaurant name (with Building icon)
2. Role being offered (with UserCheck icon)
3. Expiration date (with Clock icon)
4. Info notice about phone verification

**UI Components**:
- GlassCard with blue variant (info theme)
- Nested GlassCard for restaurant details
- GlassNotice explaining next steps

### Step 4: Phone Number Verification
**Same Page**: Form section

1. User enters the phone number where they received the invitation
2. Clicks "Accept Invitation"
3. System verifies:
   - Phone number matches invitation record
   - Invitation is still valid

**Validation**:
- Phone number format validation
- Match against stored invitation phone

### Step 5: Acceptance & Account Creation
**On Success**:

1. User account created/updated with:
   - Role: staff
   - Restaurant ID association
   - Status: active

2. JWT token issued containing:
   - User phone
   - Role: staff
   - Restaurant ID
   - Restaurant name

3. Success animation displayed
4. Auto-redirect to staff dashboard (2 seconds)

### Step 6: Staff Dashboard
**Page**: `/dashboard/staff`

Staff member lands on their dashboard with:
- Welcome message with restaurant name
- Check-in card for attendance
- Quick stats (hours, sessions, vouchers)
- Action cards for daily tasks

---

## Error Handling

### Invalid Token
**Displayed when**: Token not found or malformed

- Error icon with red glow
- Message: "Invalid Invitation"
- Explanation: Link not valid or expired
- CTA: "Go to Homepage"

### Expired Invitation
**Displayed when**: Token past expiry date

- Same error UI as invalid token
- Instruction to contact restaurant admin

### Phone Mismatch
**Displayed when**: Entered phone doesn't match invitation

- Inline error message
- Helper text reminder about matching phone
- No redirect, allows retry

### Already Accepted
**Displayed when**: Invitation already used

- Error message explaining status
- Link to login if already have account

---

## Technical Flow

```
[SMS with Link]
      |
      v
[Open Link] --> [Validate Token API]
      |
      +--> [Invalid] --> [Error Screen]
      |
      v
[Show Invitation Details]
      |
      v
[Enter Phone Number]
      |
      v
[Accept Invitation API]
      |
      +--> [Phone Mismatch] --> [Error Message]
      |
      v
[Create/Update User]
      |
      v
[Issue JWT Token]
      |
      v
[Staff Dashboard]
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/staff/validate-invitation` | POST | Check if invitation token is valid |
| `/api/staff/accept-invitation` | POST | Accept invitation and create account |

## Request/Response Examples

### Validate Invitation
```json
// Request
POST /api/staff/validate-invitation
{
  "invitation_token": "abc123xyz"
}

// Success Response
{
  "invitation": {
    "restaurant_name": "The Golden Fork",
    "role": "staff",
    "expires_at": "2025-03-15T00:00:00Z",
    "status": "pending"
  }
}
```

### Accept Invitation
```json
// Request
POST /api/staff/accept-invitation
{
  "invitation_token": "abc123xyz",
  "phone": "+918826175074"
}

// Success Response
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "phone": "+918826175074",
    "role": "staff",
    "restaurant_id": "rest_123",
    "restaurant_name": "The Golden Fork"
  }
}
```

---

## State Management

- **Token from URL**: `useSearchParams()` hook
- **Form State**: Local React state
- **Auth Token**: Stored in `localStorage`
- **Message State**: Success/error messages

## Security Considerations

1. **Token Expiry**: 7-day default expiration
2. **Phone Verification**: Must match invitation record
3. **Single Use**: Token invalidated after acceptance
4. **HTTPS Only**: All links use HTTPS

## Design Tokens

- **Primary Color**: Blue (#3B82F6) for staff theme
- **Background**: Dark glassmorphism
- **Success**: Emerald (#10B981)
- **Error**: Red (#EF4444)

## Mobile Optimization

- Full-screen layout on mobile
- Touch-friendly input fields
- Large tap targets for buttons
- Clear error messages
- Loading states for slow connections
