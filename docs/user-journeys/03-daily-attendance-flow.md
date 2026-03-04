# User Journey: Daily Attendance Flow

## Overview
This document describes the complete user journey for a staff member checking in and out of their shift using Restaurant Daily.

## Prerequisites
- Active staff account
- Associated with a restaurant
- Logged into the app

---

## Journey Steps

### Step 1: Opening the App
**Page**: `/dashboard/staff`

1. Staff member opens Restaurant Daily
2. If logged in, lands directly on staff dashboard
3. If not logged in, redirected to phone auth

**Dashboard Elements**:
- Header with restaurant name
- Role badge (Staff)
- Logout button
- Check-in card (primary action)
- Quick stats grid
- Action cards

### Step 2: Check-In Process
**Component**: `CheckInCard`

#### Before Check-In:
- Card shows "Not Checked In" status
- Green "Check In" button prominent
- Current date and time displayed

#### Check-In Action:
1. Staff clicks "Check In" button
2. System captures:
   - Current timestamp
   - User ID
   - Restaurant ID
3. Check-in record created in database
4. UI updates to show active session

**Check-In Confirmation**:
- Card changes to active state (green glow)
- Shows check-in time
- "Check Out" button appears
- Timer starts counting duration

### Step 3: Active Shift
**Page**: `/dashboard/staff` (active session)

While checked in, staff sees:
- Active session indicator (green badge)
- Check-in timestamp
- Running duration counter
- "Check Out" button

**Available Actions**:
1. Submit petty voucher
2. Record electricity payment
3. View their profile
4. View restaurant info

### Step 4: Check-Out Process
**Component**: `CheckInCard`

#### Check-Out Action:
1. Staff clicks "Check Out" button
2. Confirmation dialog appears (optional)
3. System captures:
   - Check-out timestamp
   - Total duration
   - Updates session record
4. UI updates to show completed session

**Check-Out Confirmation**:
- Card shows "Session Completed"
- Total hours worked displayed
- Ready for next check-in

### Step 5: Viewing Session History
**Page**: `/dashboard/staff` (Recent Activity section)

Staff can see:
- Today's sessions
- Total hours worked today
- Recent activity log

---

## Check-In Card States

### State 1: Not Checked In
```
+------------------------+
|   Not Checked In       |
|   Ready to start       |
|                        |
|   [Check In Button]    |
+------------------------+
```

### State 2: Checked In (Active)
```
+------------------------+
|   Checked In           |
|   Started: 9:00 AM     |
|   Duration: 2h 30m     |
|                        |
|   [Check Out Button]   |
+------------------------+
```

### State 3: Session Completed
```
+------------------------+
|   Session Completed    |
|   9:00 AM - 5:30 PM    |
|   Total: 8h 30m        |
|                        |
|   [Check In Again]     |
+------------------------+
```

---

## Technical Flow

```
[Staff Dashboard]
      |
      v
[Check-In Card] --> [No Session?] --> [Show Check-In Button]
      |                                      |
      |                                      v
      |                              [Click Check In]
      |                                      |
      |                                      v
      |                              [Create Session API]
      |                                      |
      v                                      v
[Active Session?] --> [Show Timer + Check Out]
      |                                      |
      |                                      v
      |                              [Click Check Out]
      |                                      |
      |                                      v
      |                              [End Session API]
      |                                      |
      v                                      v
[Session Complete] --> [Show Summary]
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/attendance/check-in` | POST | Start a new shift session |
| `/api/attendance/check-out` | POST | End current shift session |
| `/api/attendance/current` | GET | Get active session status |
| `/api/attendance/history` | GET | Get past sessions |

## Request/Response Examples

### Check-In
```json
// Request
POST /api/attendance/check-in
Authorization: Bearer <token>
{
  "timestamp": "2025-03-04T09:00:00Z"
}

// Response
{
  "session_id": "sess_123",
  "check_in_time": "2025-03-04T09:00:00Z",
  "status": "active"
}
```

### Check-Out
```json
// Request
POST /api/attendance/check-out
Authorization: Bearer <token>
{
  "session_id": "sess_123",
  "timestamp": "2025-03-04T17:30:00Z"
}

// Response
{
  "session_id": "sess_123",
  "check_in_time": "2025-03-04T09:00:00Z",
  "check_out_time": "2025-03-04T17:30:00Z",
  "duration_minutes": 510,
  "status": "completed"
}
```

---

## Data Model

### Attendance Session
```typescript
interface AttendanceSession {
  id: string;
  user_id: string;
  restaurant_id: string;
  check_in_time: Date;
  check_out_time?: Date;
  duration_minutes?: number;
  status: 'active' | 'completed' | 'auto_closed';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
```

## Edge Cases

### Auto Check-Out
- If session exceeds 24 hours, auto-close at midnight
- Admin notification sent
- Session marked as 'auto_closed'

### Multiple Devices
- Check-in state synced via API
- Polling every 30 seconds for state updates
- WebSocket for real-time updates (future)

### Offline Mode (Future)
- Local storage of check-in/out attempts
- Sync when back online
- Conflict resolution by timestamp

---

## Stats Tracking

### Today's Stats
```
+------------------+------------------+------------------+
| Today's Hours    | Active Sessions  | My Vouchers      |
|     6.5          |       0          |      2           |
+------------------+------------------+------------------+
```

### Data Sources
- `Today's Hours`: Sum of all sessions today
- `Active Sessions`: Count of currently active sessions
- `My Vouchers`: Count of vouchers submitted by user

## Design Tokens

- **Check-In Button**: Green gradient (#10B981)
- **Check-Out Button**: Orange gradient (#F97316)
- **Active State**: Green border glow
- **Completed State**: Gray/neutral

## Mobile Optimization

- Large check-in button (full width on mobile)
- Swipe gestures for quick actions
- Pull-to-refresh for status update
- Haptic feedback on check-in/out
