# Restaurant Daily - Business Rules & Workflows

## Overview

This document describes the business rules, workflows, and validation logic for the Restaurant Daily application.

---

## 1. Authentication Workflows

### 1.1 Phone OTP Login Flow

```
User enters phone → Request OTP → SMS sent → User enters OTP → Verify → JWT issued
```

**Rules:**
- Phone must be in E.164 format (e.g., `+918826175074`)
- OTP is 6 digits, expires in 5 minutes
- Rate limit: 3 OTP requests per hour per phone
- Max 3 verification attempts per OTP
- Failed attempts increment counter, block after 3

**API Flow:**
1. `POST /api/auth/request-otp` - Generate and send OTP
2. `POST /api/auth/verify-otp` - Verify OTP, return JWT token

### 1.2 Role Selection Flow (First-time Users)

```
OTP verified → Check if user exists → No → Role Selection → Create user
```

**Rules:**
- New phone numbers go to role selection
- User chooses: `business_admin` or `employee`
- `business_admin` → Restaurant onboarding
- `employee` → Staff welcome (needs invitation or existing restaurant)

---

## 2. Restaurant Onboarding (Business Admin)

### 2.1 Self-Registration Flow

```
Role = business_admin → Enter restaurant details → GST verification → FSSAI validation → Create restaurant
```

**Steps:**
1. Enter restaurant name
2. Enter full address
3. Enter GST number (15 characters)
4. Click "Verify GST" → API call to GSTINCheck
5. Auto-fill business name/address from GST data
6. Enter FSSAI number (14 digits)
7. Upload GST document (optional)
8. Upload FSSAI document (optional)
9. Submit → Create restaurant + user

### 2.2 GST Verification Rules

**Format:** `22AAAAA0000A1Z5` (15 characters)
- Positions 1-2: State code (01-37)
- Positions 3-12: PAN number
- Position 13: Entity number (1-9, A-Z)
- Position 14: Always 'Z'
- Position 15: Checksum digit

**Verification:**
- Call GSTINCheck API with GSTIN
- Returns: legal name, trade name, address, registration date, status
- Auto-fill form fields on success
- Show error on invalid GST

### 2.3 FSSAI Validation Rules

**Format:** 14 digits (e.g., `12720052000784`)
- Position 1: License type (1=Central, 2=State, 3=Registration)
- Positions 2-3: State code
- Positions 4-5: Year of issue
- Positions 6-14: Sequential number

**Validation:**
- Must be exactly 14 digits
- First digit must be 1, 2, or 3
- No API verification (manual check required)

---

## 3. Staff Invitation Workflow

### 3.1 Invite Staff (Business Admin)

```
Admin → Staff page → Invite → Enter phone → Send SMS → Staff receives link
```

**Rules:**
- Only `business_admin` can invite staff
- Cannot invite to different restaurant
- Invitation token valid for 7 days
- Duplicate pending invitations not allowed
- Staff role is always `employee`

**Invitation SMS:**
```
You've been invited to join [Restaurant Name] on Restaurant Daily.
Click to accept: https://restaurant-daily.mindweave.tech/staff/accept-invitation?token=xxx
```

### 3.2 Accept Invitation (Staff)

```
Staff clicks link → Verify token → Login/Register → Accept → Join restaurant
```

**Rules:**
- Token must be valid and not expired
- If phone already has account, link to restaurant
- If new phone, create user with `employee` role
- Mark invitation as `accepted`

---

## 4. Attendance Tracking

### 4.1 Check-In Flow

```
Staff → Dashboard → Check In → Capture location → Create attendance record
```

**Rules:**
- One active check-in per user per restaurant
- Cannot check-in if already checked in
- Location is optional but recommended
- Status set to `checked_in`
- Records check-in timestamp

### 4.2 Check-Out Flow

```
Staff → Dashboard → Check Out → Capture location → Calculate hours → Update record
```

**Rules:**
- Must have active check-in to check-out
- Auto-calculates hours worked
- Deducts break time if recorded
- Updates status to `checked_out`
- Records check-out timestamp

### 4.3 Hours Calculation

```sql
hours_worked = (check_out_time - check_in_time) / 3600 - (break_minutes / 60)
```

**Overtime Rules:**
- Standard shift: 8 hours
- Hours > 8 = overtime
- Overtime rate: 1.5x (configurable per role)

### 4.4 Attendance Status Values

| Status | Description |
|--------|-------------|
| `checked_in` | Currently working |
| `checked_out` | Completed shift |
| `on_break` | Taking break |
| `absent` | Did not show up |
| `late` | Arrived after shift start |
| `early_leave` | Left before shift end |

---

## 5. Payroll Rules

### 5.1 Salary Structure

Each role has configurable:
- Base salary (monthly)
- Overtime rate (per hour)
- Allowances (food, transport, etc.)

### 5.2 Pay Calculation

```
Net Pay = Base Salary + Overtime Pay + Allowances - Deductions
```

**Overtime Pay:**
```
Overtime Pay = Overtime Hours × Overtime Rate
```

**Deductions:**
- PF (Provident Fund): 12% of base
- ESI (if applicable): 0.75% of gross
- Tax (TDS): Based on slab

### 5.3 Pay Cycle

- Default: Monthly
- Pay day: 1st of month (configurable)
- Cycle options: Monthly, Bi-weekly, Weekly

---

## 6. Permission Rules

### 6.1 Role Permissions Matrix

| Action | Superadmin | Business Admin | Employee |
|--------|------------|----------------|----------|
| View all restaurants | Yes | No | No |
| Create restaurant | Yes | No | No |
| Manage restaurant settings | No | Yes | No |
| Invite staff | No | Yes | No |
| View attendance (all) | No | Yes | No |
| View attendance (own) | N/A | Yes | Yes |
| Check-in/out | No | No | Yes |
| View payroll | No | Yes | No |
| Configure salary | No | Yes | No |

### 6.2 Data Isolation (RLS)

- Each user can only access their restaurant's data
- Superadmin has platform-wide access
- Business admin sees all staff in their restaurant
- Employee only sees own attendance/profile

---

## 7. API Rate Limiting

### 7.1 Authentication Endpoints

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/request-otp` | 3 | 1 hour |
| `/api/auth/verify-otp` | 10 | 1 hour |
| `/api/auth/demo-login` | 100 | 1 hour |

### 7.2 General API Endpoints

| Category | Limit | Window |
|----------|-------|--------|
| Read operations | 1000 | 1 hour |
| Write operations | 100 | 1 hour |
| File uploads | 10 | 1 hour |

---

## 8. Validation Rules

### 8.1 Phone Number

- Must start with `+`
- Must have country code
- Indian numbers: `+91` followed by 10 digits
- E.164 format required

```regex
^\+[1-9]\d{6,14}$
```

### 8.2 GST Number

```regex
^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
```

### 8.3 FSSAI Number

```regex
^\d{14}$
```

### 8.4 File Uploads

| Field | Allowed Types | Max Size |
|-------|---------------|----------|
| GST Document | PDF, JPG, PNG | 5 MB |
| FSSAI Document | PDF, JPG, PNG | 5 MB |
| Restaurant Logo | JPG, PNG | 2 MB |

---

## 9. Session Management

### 9.1 JWT Token

- Expires: 24 hours
- Contains: userId, phone, role, restaurantId
- Signed with HS256 algorithm
- Stored in localStorage (client)

### 9.2 Session Rules

- One active session per device
- Logout clears token
- Token refresh on app startup
- Force logout after password change

---

## 10. Audit Logging

### 10.1 Logged Events

| Event | Description |
|-------|-------------|
| `auth.login` | User logged in |
| `auth.logout` | User logged out |
| `auth.otp_request` | OTP requested |
| `auth.otp_verify` | OTP verified |
| `user.create` | User created |
| `user.update` | User updated |
| `restaurant.create` | Restaurant created |
| `attendance.checkin` | Staff checked in |
| `attendance.checkout` | Staff checked out |
| `invitation.send` | Invitation sent |
| `invitation.accept` | Invitation accepted |

### 10.2 Audit Log Fields

- `timestamp` - When the event occurred
- `user_id` - Who performed the action
- `restaurant_id` - Which restaurant
- `action` - Event type
- `resource_type` - Affected resource type
- `resource_id` - Affected resource ID
- `details` - Additional JSON data
- `ip_address` - Client IP
- `user_agent` - Browser/device info
