# Restaurant Daily - App Documentation

## Overview

Restaurant Daily is a restaurant management ERP SaaS for tracking daily operations, staff attendance, and payroll. Built with Next.js 15, Supabase, and Tailwind CSS.

**Live URL**: https://restaurant-daily.mindweave.tech

---

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Superadmin** | Platform administrator (Mindweave) | Invite business admins, manage all restaurants |
| **Business Admin** | Restaurant owner/manager | Full access to their restaurant's data |
| **Employee** | Restaurant staff | Check-in/out, view own attendance |

---

## App Pages

### Public Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with app overview |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### Authentication Pages

| Route | Description |
|-------|-------------|
| `/auth/phone` | Phone number entry for OTP login |
| `/auth/verify` | OTP verification screen |
| `/auth/role-selection` | Role selection after first login (business_admin or employee) |

### Onboarding Pages

| Route | Description |
|-------|-------------|
| `/onboarding/restaurant-setup` | Business admin creates restaurant with KYC (GST/FSSAI) |
| `/onboarding/staff-welcome` | Welcome screen for new staff members |

### Dashboard Pages

#### Admin Dashboard (`/dashboard/admin/*`)

| Route | Description | Features |
|-------|-------------|----------|
| `/dashboard/admin` | Main dashboard | Stats cards, quick actions, recent activity |
| `/dashboard/admin/attendance` | Today's attendance | Staff status (checked-in, pending, on leave) |
| `/dashboard/admin/attendance/history` | Attendance history | Filterable table with date range |
| `/dashboard/admin/attendance/calendar` | Calendar view | Monthly calendar with attendance markers |
| `/dashboard/admin/payroll` | Pay summary | Monthly totals, per-staff breakdown |
| `/dashboard/admin/payroll/config` | Salary config | Role-based salary structure, overtime rates |
| `/dashboard/admin/payroll/reports` | Payroll reports | Generate and download reports |
| `/dashboard/admin/staff` | Staff management | List, search, invite staff |
| `/dashboard/admin/settings` | Settings | Restaurant info, notifications, security, appearance |

#### Staff Dashboard (`/dashboard/staff/*`)

| Route | Description | Features |
|-------|-------------|----------|
| `/dashboard/staff` | Staff home | Check-in/out, today's status, recent history |

### Staff Invitation

| Route | Description |
|-------|-------------|
| `/staff/accept-invitation` | Accept staff invitation via token |

---

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/request-otp` | POST | Request OTP via SMS |
| `/api/auth/verify-otp` | POST | Verify OTP and get JWT token |
| `/api/auth/demo-login` | POST | Demo login for development |
| `/api/auth/update-role` | POST | Set user role after first login |
| `/api/auth/clear-rate-limit` | POST | Clear OTP rate limit (dev only) |
| `/api/auth/test-messaging` | POST | Test Twilio connection |

### KYC Verification

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/kyc/verify-gst` | POST | Verify GST number via GSTINCheck API |

### Restaurant Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/restaurant/create` | POST | Create new restaurant with KYC |

### Staff Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/staff/invite` | POST | Send staff invitation |
| `/api/staff/invite/[id]` | GET | Get invitation details |
| `/api/staff/send-invitation` | POST | Send invitation SMS |
| `/api/staff/validate-invitation` | POST | Validate invitation token |
| `/api/staff/accept-invitation` | POST | Accept invitation and join restaurant |

### Admin Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/invite-business` | POST | Superadmin invites business admin |

### Attendance

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/attendance/check-in` | POST | Staff check-in with optional location |
| `/api/attendance/check-out` | POST | Staff check-out |
| `/api/attendance/status` | GET | Get current check-in status |
| `/api/attendance/today` | GET | Get today's attendance for restaurant |
| `/api/attendance/history` | GET | Get attendance history with filters |

---

## Features

### 1. Phone-based OTP Authentication
- E.164 format phone numbers
- SMS OTP via Twilio
- 6-digit OTP with 5-minute expiry
- Rate limiting (3 OTPs per hour)

### 2. GST Verification (KYC)
- Real-time GST verification via GSTINCheck API
- Auto-fills business name and address
- Validates GST format (15 characters)
- Document upload support

### 3. FSSAI Validation
- Format validation (14 digits)
- Decodes license type (Central/State/Registration)
- Extracts state code and year
- Document upload support

### 4. Attendance Tracking
- GPS-enabled check-in/check-out
- Automatic hours calculation
- Overtime tracking
- Break time management
- Calendar and history views

### 5. Payroll Management
- Role-based salary configuration
- Overtime rate settings
- Allowances management
- Report generation
- Export functionality

### 6. Staff Management
- Invite via phone number
- SMS invitation links
- Role-based permissions
- Active/inactive status

### 7. Settings
- Restaurant info (logo, name, contact)
- Notification preferences
- Security (2FA, session management)
- Appearance (theme, colors)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Phone OTP + JWT |
| SMS | Twilio |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Secrets | HashiCorp Vault |

---

## Design System

### Theme
- Dark glassmorphism design
- Primary color: Orange (#F97316)
- Background: Deep navy (#050510)
- Glass cards with backdrop blur

### CSS Classes
```css
.glass-card    /* Glassmorphic card with blur */
.animated-bg   /* Animated gradient background */
.gradient-orb  /* Floating colored circles */
```

### Color Palette
- Primary: `#F97316` (Orange)
- Background: `#050510` to `#0a0a1a`
- Text: White with opacity variants
- Success: Green-500
- Error: Red-500
- Warning: Yellow-500

---

## Mobile Responsiveness

All pages are optimized for:
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- Android devices (360px+)
- Tablets (768px+)
- Desktop (1024px+)

Navigation adapts from sidebar (desktop) to bottom nav (mobile).
