# Staff Management System - Implementation Plan

**Created**: 2026-03-03
**Status**: Planning
**Priority**: High

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        RESTAURANT DAILY - SYSTEM ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND (Next.js 15)                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │
│  │    HOMEPAGE      │  │  AUTH FLOW       │  │   ONBOARDING     │               │
│  │    /             │  │  /auth/phone     │  │  /onboarding/*   │               │
│  │                  │  │  /auth/verify    │  │                  │               │
│  │  • Feature Cards │  │  /auth/role-sel  │  │  • Restaurant    │               │
│  │  • CTA Buttons   │  │                  │  │    Setup         │               │
│  │  • Social Proof  │  │  • Phone Input   │  │  • Staff Welcome │               │
│  └────────┬─────────┘  │  • OTP Verify    │  └────────┬─────────┘               │
│           │            │  • Role Select   │           │                          │
│           │            └────────┬─────────┘           │                          │
│           │                     │                     │                          │
│           └─────────────────────┼─────────────────────┘                          │
│                                 ▼                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐       │
│  │                         DASHBOARDS                                    │       │
│  ├──────────────────────────────────────────────────────────────────────┤       │
│  │                                                                       │       │
│  │  ┌─────────────────────┐         ┌─────────────────────┐             │       │
│  │  │   ADMIN DASHBOARD   │         │   STAFF DASHBOARD   │             │       │
│  │  │   /dashboard/admin  │         │   /dashboard/staff  │             │       │
│  │  │                     │         │                     │             │       │
│  │  │  ✅ Quick Stats     │         │  ⬜ Check In/Out    │  ◄── NEEDED │       │
│  │  │  ✅ Invite Staff    │         │  ⬜ My Shifts       │  ◄── NEEDED │       │
│  │  │  ⬜ Cash Sessions   │         │  ⬜ My Hours        │  ◄── NEEDED │       │
│  │  │  ⬜ Vouchers        │         │  ⬜ My Payroll      │  ◄── NEEDED │       │
│  │  │  ⬜ Payroll         │ ◄─NEED  │                     │             │       │
│  │  │  ⬜ Shift Mgmt      │ ◄─NEED  │                     │             │       │
│  │  │  ⬜ Attendance      │ ◄─NEED  │                     │             │       │
│  │  └─────────────────────┘         └─────────────────────┘             │       │
│  └──────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (Next.js API Routes)                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ✅ IMPLEMENTED                           ⬜ NEEDED FOR STAFF MANAGEMENT          │
│  ─────────────                            ───────────────────────────             │
│  /api/auth/request-otp                    /api/attendance/check-in               │
│  /api/auth/verify-otp                     /api/attendance/check-out              │
│  /api/auth/update-role                    /api/attendance/history                │
│  /api/restaurant/create                   /api/shifts/create                     │
│  /api/staff/invite                        /api/shifts/assign                     │
│  /api/staff/send-invitation               /api/shifts/list                       │
│  /api/staff/accept-invitation             /api/payroll/calculate                 │
│  /api/admin/invite-business               /api/payroll/generate                  │
│                                           /api/payroll/history                   │
│                                           /api/reports/attendance                │
│                                           /api/reports/payroll                   │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
┌────────────────────────┐  ┌─────────────────────┐  ┌───────────────────────┐
│   HASHICORP VAULT      │  │     SUPABASE        │  │      TWILIO           │
│   (Secrets)            │  │   (PostgreSQL)      │  │   (WhatsApp/SMS)      │
├────────────────────────┤  ├─────────────────────┤  ├───────────────────────┤
│                        │  │                     │  │                       │
│  ✅ secret/supabase    │  │  ✅ EXISTING TABLES │  │  ✅ WhatsApp OTP      │
│  ✅ secret/jwt         │  │  ─────────────────  │  │  ✅ Staff Invites     │
│  ✅ secret/sms         │  │  • system_admins    │  │                       │
│  ✅ secret/otp         │  │  • users            │  │  ⬜ Shift Reminders   │
│                        │  │  • restaurants      │  │  ⬜ Payroll Alerts    │
│                        │  │  • staff_invites    │  │                       │
│                        │  │  • business_invites │  │                       │
│                        │  │                     │  │                       │
│                        │  │  ⬜ NEEDED TABLES   │  │                       │
│                        │  │  ─────────────────  │  │                       │
│                        │  │  • shifts           │  │                       │
│                        │  │  • attendance_logs  │  │                       │
│                        │  │  • payroll_periods  │  │                       │
│                        │  │  • payroll_entries  │  │                       │
│                        │  │  • salary_config    │  │                       │
│                        │  │                     │  │                       │
└────────────────────────┘  └─────────────────────┘  └───────────────────────┘
```

---

## Authentication & User Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AUTHENTICATION FLOW (✅ WORKING)                      │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
    │  USER   │────▶│ Enter Phone  │────▶│ WhatsApp    │────▶│ Enter OTP    │
    │ Opens   │     │ +91XXXXXXXX  │     │ Sends OTP   │     │ 6 digits     │
    │  App    │     └──────────────┘     └─────────────┘     └──────┬───────┘
    └─────────┘                                                      │
                                                                     ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                          ROLE SELECTION                                  │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                          │
    │    ┌────────────────────┐              ┌────────────────────┐           │
    │    │  RESTAURANT ADMIN  │              │   STAFF MEMBER     │           │
    │    │  (business_admin)  │              │    (employee)      │           │
    │    ├────────────────────┤              ├────────────────────┤           │
    │    │ • Create restaurant│              │ • Accept invite    │           │
    │    │ • Invite staff     │              │ • View schedules   │           │
    │    │ • Manage payroll   │              │ • Check in/out     │           │
    │    │ • View reports     │              │ • View pay stubs   │           │
    │    └─────────┬──────────┘              └─────────┬──────────┘           │
    │              │                                   │                       │
    │              ▼                                   ▼                       │
    │    ┌────────────────────┐              ┌────────────────────┐           │
    │    │  Admin Dashboard   │              │  Staff Dashboard   │           │
    │    │  /dashboard/admin  │              │  /dashboard/staff  │           │
    │    └────────────────────┘              └────────────────────┘           │
    │                                                                          │
    └──────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 1: Staff Check-In / Check-Out

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  STAFF CHECK-IN / CHECK-OUT                                                    ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║   STAFF VIEW                           ADMIN VIEW                              ║
║   ──────────                           ──────────                              ║
║   ┌─────────────────────┐              ┌─────────────────────┐                ║
║   │  ╔═══════════════╗  │              │  TODAY'S ATTENDANCE │                ║
║   │  ║   CHECK IN    ║  │              │  ─────────────────  │                ║
║   │  ║  ───────────  ║  │              │                     │                ║
║   │  ║  📍 Location  ║  │              │  👤 Ramesh   ✅ In  │                ║
║   │  ║  🕐 9:02 AM   ║  │              │     9:02 AM         │                ║
║   │  ║              ╔╝  │              │                     │                ║
║   │  ╚══════════════╝   │              │  👤 Suresh   ✅ In  │                ║
║   │                     │              │     9:15 AM         │                ║
║   │  [  CHECK IN  ]     │              │                     │                ║
║   │                     │              │  👤 Priya    ⬜ Out │                ║
║   └─────────────────────┘              │     Not checked in  │                ║
║                                        │                     │                ║
║   After Check-in:                      │  [Export Report]    │                ║
║   ┌─────────────────────┐              └─────────────────────┘                ║
║   │  CHECKED IN ✅       │                                                     ║
║   │  Since: 9:02 AM     │                                                     ║
║   │  Hours: 3h 24m      │                                                     ║
║   │                     │                                                     ║
║   │  [ CHECK OUT ]      │                                                     ║
║   └─────────────────────┘                                                     ║
║                                                                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/attendance/check-in` | Record staff check-in with timestamp |
| POST | `/api/attendance/check-out` | Record staff check-out, calculate hours |
| GET | `/api/attendance/status` | Get current check-in status for user |
| GET | `/api/attendance/today` | Get today's attendance for restaurant (admin) |
| GET | `/api/attendance/history` | Get attendance history with filters |

### UI Components Needed

- `CheckInCard.tsx` - Staff check-in/out button with status
- `AttendanceList.tsx` - Admin view of today's attendance
- `AttendanceHistory.tsx` - Historical attendance table

---

## Feature 2: Shift Management

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  SHIFT MANAGEMENT                                                              ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║   ADMIN: CREATE & ASSIGN SHIFTS        STAFF: VIEW MY SHIFTS                  ║
║   ─────────────────────────────        ─────────────────────                  ║
║   ┌─────────────────────────────┐      ┌─────────────────────────────┐       ║
║   │  CREATE SHIFT               │      │  MY SCHEDULE                 │       ║
║   │  ────────────               │      │  ───────────                 │       ║
║   │                             │      │                              │       ║
║   │  Name: [ Morning Shift   ]  │      │  ┌────────────────────────┐ │       ║
║   │  Start: [ 9:00 AM        ]  │      │  │ Mon, Mar 3             │ │       ║
║   │  End:   [ 5:00 PM        ]  │      │  │ Morning Shift          │ │       ║
║   │  Break: [ 1 hour         ]  │      │  │ 9:00 AM - 5:00 PM      │ │       ║
║   │                             │      │  │ Break: 1:00-2:00 PM    │ │       ║
║   │  Assign to:                 │      │  └────────────────────────┘ │       ║
║   │  ☑ Ramesh                   │      │                              │       ║
║   │  ☑ Suresh                   │      │  ┌────────────────────────┐ │       ║
║   │  ☐ Priya                    │      │  │ Tue, Mar 4             │ │       ║
║   │                             │      │  │ Evening Shift          │ │       ║
║   │  [ CREATE SHIFT ]           │      │  │ 2:00 PM - 10:00 PM     │ │       ║
║   └─────────────────────────────┘      │  └────────────────────────┘ │       ║
║                                        └─────────────────────────────┘       ║
║                                                                                ║
║   WEEKLY SCHEDULE VIEW (ADMIN)                                                 ║
║   ─────────────────────────────                                                ║
║   ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐           ║
║   │  Mon   │  Tue   │  Wed   │  Thu   │  Fri   │  Sat   │  Sun   │           ║
║   ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤           ║
║   │ Ramesh │ Ramesh │ Ramesh │  OFF   │ Ramesh │ Ramesh │  OFF   │           ║
║   │ 9-5    │ 9-5    │ 9-5    │        │ 9-5    │ 9-5    │        │           ║
║   ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤           ║
║   │ Suresh │  OFF   │ Suresh │ Suresh │ Suresh │  OFF   │ Suresh │           ║
║   │ 2-10   │        │ 2-10   │ 2-10   │ 2-10   │        │ 2-10   │           ║
║   └────────┴────────┴────────┴────────┴────────┴────────┴────────┘           ║
║                                                                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/shifts/create` | Create a new shift template |
| GET | `/api/shifts/list` | List all shifts for restaurant |
| PUT | `/api/shifts/[id]` | Update shift details |
| DELETE | `/api/shifts/[id]` | Delete a shift |
| POST | `/api/shifts/assign` | Assign staff to shift for specific dates |
| GET | `/api/shifts/schedule` | Get weekly/monthly schedule view |
| GET | `/api/shifts/my-schedule` | Get current user's schedule |

### UI Components Needed

- `ShiftForm.tsx` - Create/edit shift form
- `ShiftList.tsx` - List of shift templates
- `WeeklySchedule.tsx` - Calendar grid view for admin
- `MySchedule.tsx` - Staff's upcoming shifts
- `ShiftAssignModal.tsx` - Assign staff to shifts

---

## Feature 3: Payroll Management

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  PAYROLL MANAGEMENT                                                            ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║   ADMIN: SALARY CONFIGURATION          ADMIN: PAYROLL GENERATION              ║
║   ───────────────────────────          ────────────────────────               ║
║   ┌─────────────────────────────┐      ┌─────────────────────────────┐       ║
║   │  STAFF SALARY SETUP         │      │  MARCH 2026 PAYROLL         │       ║
║   │  ───────────────────        │      │  ───────────────────        │       ║
║   │                             │      │                              │       ║
║   │  👤 Ramesh                  │      │  Period: Mar 1-31, 2026     │       ║
║   │  Type: ○ Monthly ● Hourly   │      │                              │       ║
║   │  Rate: ₹ [ 150 ] /hour      │      │  ┌──────────────────────┐   │       ║
║   │  OT Rate: ₹ [ 225 ] /hour   │      │  │ Ramesh               │   │       ║
║   │                             │      │  │ Hours: 176h          │   │       ║
║   │  👤 Suresh                  │      │  │ OT: 12h              │   │       ║
║   │  Type: ● Monthly ○ Hourly   │      │  │ Base: ₹26,400        │   │       ║
║   │  Salary: ₹ [ 25000 ] /month │      │  │ OT Pay: ₹2,700       │   │       ║
║   │                             │      │  │ Deductions: -₹500    │   │       ║
║   │  [ SAVE CONFIG ]            │      │  │ ─────────────        │   │       ║
║   └─────────────────────────────┘      │  │ NET: ₹28,600         │   │       ║
║                                        │  └──────────────────────┘   │       ║
║   STAFF: VIEW MY PAY STUB              │                              │       ║
║   ───────────────────────              │  [ GENERATE PAYSLIPS ]       │       ║
║   ┌─────────────────────────────┐      │  [ EXPORT TO EXCEL ]         │       ║
║   │  MARCH 2026 PAY STUB        │      └─────────────────────────────┘       ║
║   │  ────────────────────       │                                             ║
║   │                             │                                             ║
║   │  Hours Worked:  176h        │                                             ║
║   │  Overtime:      12h         │                                             ║
║   │  ─────────────────          │                                             ║
║   │  Base Pay:      ₹26,400     │                                             ║
║   │  OT Pay:        ₹2,700      │                                             ║
║   │  Deductions:    -₹500       │                                             ║
║   │  ═════════════════          │                                             ║
║   │  NET PAY:       ₹28,600     │                                             ║
║   │                             │                                             ║
║   │  [ DOWNLOAD PDF ]           │                                             ║
║   └─────────────────────────────┘                                             ║
║                                                                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/salary/configure` | Set salary config for staff member |
| GET | `/api/salary/[userId]` | Get salary config for user |
| GET | `/api/salary/list` | List all salary configs (admin) |
| POST | `/api/payroll/generate` | Generate payroll for a period |
| GET | `/api/payroll/periods` | List payroll periods |
| GET | `/api/payroll/[periodId]` | Get payroll details for period |
| PUT | `/api/payroll/[periodId]/finalize` | Finalize payroll |
| GET | `/api/payroll/my-stubs` | Get current user's pay stubs |
| GET | `/api/payroll/export` | Export payroll to Excel |

### UI Components Needed

- `SalaryConfigForm.tsx` - Set hourly/monthly rate
- `SalaryConfigList.tsx` - List all staff salary configs
- `PayrollGenerator.tsx` - Generate payroll for period
- `PayrollSummary.tsx` - Overview of payroll period
- `PayrollEntryCard.tsx` - Individual staff payroll entry
- `PayStub.tsx` - Staff view of their pay stub
- `PayrollExport.tsx` - Export options

---

## Database Schema

### New Tables Required

```sql
-- 1. Shift Templates
CREATE TABLE shifts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    break_minutes   INTEGER DEFAULT 60,
    days_of_week    INTEGER[] DEFAULT '{1,2,3,4,5}',
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Shift Assignments (who works which shift on which day)
CREATE TABLE shift_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id        UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'scheduled',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by      UUID REFERENCES users(id),
    UNIQUE(shift_id, user_id, date)
);

-- 3. Attendance Logs (check-in/check-out records)
CREATE TABLE attendance_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    shift_id        UUID REFERENCES shifts(id),
    check_in_time   TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time  TIMESTAMP WITH TIME ZONE,
    check_in_lat    DECIMAL(10, 8),
    check_in_lng    DECIMAL(11, 8),
    hours_worked    DECIMAL(5, 2),
    overtime_hours  DECIMAL(5, 2) DEFAULT 0,
    notes           TEXT,
    status          VARCHAR(20) DEFAULT 'present',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Salary Configuration (per staff member)
CREATE TABLE salary_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    pay_type        VARCHAR(20) NOT NULL CHECK (pay_type IN ('hourly', 'monthly', 'daily')),
    base_rate       DECIMAL(10, 2) NOT NULL,
    overtime_rate   DECIMAL(10, 2),
    currency        VARCHAR(3) DEFAULT 'INR',
    effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to    DATE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, effective_from)
);

-- 5. Payroll Periods
CREATE TABLE payroll_periods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'draft',
    generated_at    TIMESTAMP WITH TIME ZONE,
    generated_by    UUID REFERENCES users(id),
    finalized_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, period_start, period_end)
);

-- 6. Payroll Entries (individual staff payroll records)
CREATE TABLE payroll_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_id      UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_hours     DECIMAL(6, 2) DEFAULT 0,
    overtime_hours  DECIMAL(5, 2) DEFAULT 0,
    base_pay        DECIMAL(10, 2) NOT NULL,
    overtime_pay    DECIMAL(10, 2) DEFAULT 0,
    deductions      DECIMAL(10, 2) DEFAULT 0,
    bonuses         DECIMAL(10, 2) DEFAULT 0,
    net_pay         DECIMAL(10, 2) NOT NULL,
    payment_status  VARCHAR(20) DEFAULT 'pending',
    paid_at         TIMESTAMP WITH TIME ZONE,
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(payroll_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_attendance_user_date ON attendance_logs(user_id, check_in_time);
CREATE INDEX idx_attendance_restaurant ON attendance_logs(restaurant_id, check_in_time);
CREATE INDEX idx_shift_assignments_date ON shift_assignments(date);
CREATE INDEX idx_payroll_entries_user ON payroll_entries(user_id);
CREATE INDEX idx_salary_config_user ON salary_config(user_id, effective_from);
```

### Row-Level Security Policies

```sql
-- Attendance: Users can see own, admins can see all in restaurant
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY attendance_select ON attendance_logs FOR SELECT
    USING (
        user_id = auth.uid() OR
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE id = auth.uid() AND role = 'business_admin'
        )
    );

-- Similar policies for other tables...
```

---

## Implementation Priority

| Priority | Feature | Effort | Dependencies |
|----------|---------|--------|--------------|
| 1 | Database Migration | Small | None |
| 2 | Staff Check-In/Out | Medium | Database |
| 3 | Attendance History/Reports | Small | Check-In/Out |
| 4 | Shift Templates | Medium | Database |
| 5 | Shift Assignments | Medium | Shifts |
| 6 | Salary Configuration | Small | Database |
| 7 | Payroll Generation | Large | Attendance, Salary Config |
| 8 | Pay Stubs & Export | Medium | Payroll |

---

## Current Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication (WhatsApp OTP) | ✅ Complete | Production ready |
| Restaurant Setup | ✅ Complete | Multi-tenant support |
| Staff Invitation | ✅ Complete | WhatsApp invites |
| Admin Dashboard (Basic) | ✅ Complete | Action cards UI |
| Staff Check-In/Out | ⬜ Not Built | Priority 1 |
| Shift Management | ⬜ Not Built | Priority 2 |
| Payroll Management | ⬜ Not Built | Priority 3 |
| Attendance Reports | ⬜ Not Built | Priority 4 |
| Payslip Generation | ⬜ Not Built | Priority 5 |

---

## Next Steps

1. **Phase 1**: Create database migration with all new tables
2. **Phase 2**: Implement check-in/check-out API and UI
3. **Phase 3**: Add shift management for admins
4. **Phase 4**: Build salary configuration
5. **Phase 5**: Implement payroll calculation and generation
6. **Phase 6**: Add export and reporting features

---

## File Structure (Proposed)

```
src/
├── app/
│   ├── api/
│   │   ├── attendance/
│   │   │   ├── check-in/route.ts
│   │   │   ├── check-out/route.ts
│   │   │   ├── status/route.ts
│   │   │   ├── today/route.ts
│   │   │   └── history/route.ts
│   │   ├── shifts/
│   │   │   ├── create/route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── assign/route.ts
│   │   │   ├── schedule/route.ts
│   │   │   └── my-schedule/route.ts
│   │   ├── salary/
│   │   │   ├── configure/route.ts
│   │   │   ├── [userId]/route.ts
│   │   │   └── list/route.ts
│   │   └── payroll/
│   │       ├── generate/route.ts
│   │       ├── periods/route.ts
│   │       ├── [periodId]/route.ts
│   │       ├── my-stubs/route.ts
│   │       └── export/route.ts
│   ├── dashboard/
│   │   ├── admin/
│   │   │   ├── attendance/page.tsx
│   │   │   ├── shifts/page.tsx
│   │   │   └── payroll/page.tsx
│   │   └── staff/
│   │       ├── page.tsx (with check-in card)
│   │       ├── schedule/page.tsx
│   │       └── payslips/page.tsx
├── components/
│   ├── attendance/
│   │   ├── CheckInCard.tsx
│   │   ├── AttendanceList.tsx
│   │   └── AttendanceHistory.tsx
│   ├── shifts/
│   │   ├── ShiftForm.tsx
│   │   ├── ShiftList.tsx
│   │   ├── WeeklySchedule.tsx
│   │   ├── MySchedule.tsx
│   │   └── ShiftAssignModal.tsx
│   └── payroll/
│       ├── SalaryConfigForm.tsx
│       ├── SalaryConfigList.tsx
│       ├── PayrollGenerator.tsx
│       ├── PayrollSummary.tsx
│       ├── PayStub.tsx
│       └── PayrollExport.tsx
├── lib/
│   ├── services/
│   │   ├── attendance-service.ts
│   │   ├── shift-service.ts
│   │   ├── salary-service.ts
│   │   └── payroll-service.ts
│   └── utils/
│       ├── time-calculations.ts
│       └── payroll-calculations.ts
└── types/
    └── staff-management.ts
```
