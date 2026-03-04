# User Journey: Admin Dashboard Overview

## Overview
This document describes the admin dashboard experience and daily operations for restaurant administrators using Restaurant Daily.

## Prerequisites
- Active admin account
- Restaurant setup completed
- Logged into the app

---

## Dashboard Layout

### Desktop View
```
+------------------+------------------------------------------------+
|                  |  Header (Search, Notifications, Profile)       |
|     Sidebar      +------------------------------------------------+
|                  |                                                |
|   - Dashboard    |  Welcome Banner                                |
|   - Attendance   |                                                |
|   - Payroll      +------------------------------------------------+
|   - Staff        |  Stats Grid (4 cards)                          |
|   - Settings     |                                                |
|                  +------------------------------------------------+
|                  |  Main Content Grid                             |
|                  |  +----------------------+  +------------------+ |
|                  |  | Attendance Overview  |  | Quick Actions    | |
|                  |  |                      |  |                  | |
|                  |  |                      |  | Recent Activity  | |
|                  |  +----------------------+  +------------------+ |
+------------------+------------------------------------------------+
```

### Mobile View
```
+------------------------+
|  Header (Menu, Logo)   |
+------------------------+
|  Welcome Banner        |
+------------------------+
|  Stats Grid (2x2)      |
+------------------------+
|  Attendance Overview   |
+------------------------+
|  Quick Actions         |
+------------------------+
|  Recent Activity       |
+------------------------+
```

---

## Journey Steps

### Step 1: Login & Landing
**Page**: `/dashboard/admin`

1. Admin logs in via phone OTP
2. Lands on admin dashboard
3. Welcome banner displayed (dismissible)

### Step 2: Overview at a Glance

#### Stats Cards
| Card | Data | Update Frequency |
|------|------|------------------|
| Team Members | Total staff count | Real-time |
| Present Today | Currently checked-in | Real-time |
| Total Hours | Combined hours today | Every 5 min |
| Overtime | This month's OT cost | Daily |

#### Attendance Overview
- List of all staff with status
- Check-in times displayed
- Visual indicators (green=present, gray=absent)

### Step 3: Quick Actions
**Location**: Right sidebar / Bottom on mobile

Available actions:
1. **Invite Staff** - Opens invitation modal
2. **View Sessions** - Navigate to session management
3. **Manage Vouchers** - Review pending approvals
4. **View Reports** - Generate analytics

### Step 4: Staff Invitation Flow
**Trigger**: Click "Invite Staff"

1. Modal opens with invitation form
2. Enter staff phone number
3. Select role (staff/supervisor)
4. Click "Send Invitation"
5. SMS sent to staff member
6. Invitation status tracked

### Step 5: Navigation
**Sidebar Navigation**:

#### Overview
- Dashboard (home)

#### Attendance
- Today's Attendance
- History
- Calendar View

#### Payroll
- Pay Summary
- Salary Configuration
- Reports

#### Management
- Staff Directory
- Settings

---

## Key Features

### 1. Real-Time Attendance
- Live check-in/out status
- Duration tracking
- Late arrival indicators

### 2. Staff Management
- View all team members
- Invite new staff
- Manage roles and permissions

### 3. Voucher Management
- Review submitted vouchers
- Approve/reject with notes
- Track expense categories

### 4. Reports & Analytics
- Attendance reports
- Hours worked summaries
- Payroll calculations

---

## Data Flow

```
[Supabase Database]
        |
        v
[API Endpoints] --> [Real-time Subscriptions]
        |                     |
        v                     v
[React Components] <--- [State Updates]
        |
        v
[Dashboard UI]
```

## Component Structure

```
DashboardShell
├── Sidebar
│   ├── Logo & Brand
│   ├── Navigation Groups
│   │   ├── Overview
│   │   ├── Attendance
│   │   ├── Payroll
│   │   └── Management
│   └── Collapse Toggle
├── DashboardHeader
│   ├── Mobile Menu Button
│   ├── Search (future)
│   ├── Notifications (future)
│   └── Profile Menu
└── Main Content
    ├── Welcome Banner
    ├── StatCard Grid
    ├── AttendanceOverview
    ├── QuickActions
    └── RecentActivity
```

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard/stats` | GET | Fetch dashboard statistics |
| `/api/attendance/today` | GET | Get today's attendance |
| `/api/staff/list` | GET | List all staff members |
| `/api/staff/invite` | POST | Send staff invitation |
| `/api/vouchers/pending` | GET | Get pending vouchers |

## State Management

### Dashboard State
```typescript
interface DashboardState {
  stats: {
    teamMembers: number;
    presentToday: number;
    totalHours: number;
    overtime: number;
  };
  attendance: AttendanceRecord[];
  recentActivity: ActivityItem[];
  loading: boolean;
  error: string | null;
}
```

### Sidebar State
```typescript
interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  activeSection: string;
}
```

---

## Welcome Banner

### First Visit
- Shown to new admins
- Introduction to features
- Quick action buttons
- Dismissible (persisted in localStorage)

### Content
```
Welcome to Restaurant Daily

Your restaurant management hub. Track attendance, manage staff
schedules, and streamline payroll processing all in one place.

[Invite Staff]  [Configure Settings]
```

### Dismissal
- Click X button
- State saved to `localStorage`
- Key: `welcomeCardDismissed`

---

## Performance Considerations

### Data Fetching
- Initial load: Fetch all dashboard data
- Background refresh: Every 5 minutes
- Real-time: WebSocket for attendance updates

### Caching
- Stats cached for 1 minute
- Staff list cached for 5 minutes
- Cache invalidation on mutations

### Loading States
- Skeleton loaders for cards
- Spinner for full page loads
- Progressive enhancement

---

## Design Tokens

### Colors
- Primary: Orange (#F97316)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)
- Info: Blue (#3B82F6)

### Glassmorphism
- Background: rgba(255, 255, 255, 0.05)
- Backdrop blur: 40px
- Border: rgba(255, 255, 255, 0.1)

### Animation
- Animated background orbs (subtle)
- Hover lift on cards
- Smooth transitions (300ms)

---

## Mobile Responsiveness

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Adaptations
- Sidebar becomes slide-out drawer
- Stats grid: 2x2 instead of 4x1
- Stacked layout for content
- Touch-optimized interactions
