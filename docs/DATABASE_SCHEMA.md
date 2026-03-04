# Restaurant Daily - Database Schema

## Overview
Multi-restaurant architecture with role-based access control and data isolation using Supabase PostgreSQL with Row Level Security (RLS).

**Supabase Project**: `hukaqbgfmerutzhtchiu`
**Supabase URL**: `https://hukaqbgfmerutzhtchiu.supabase.co`

## Role Hierarchy

| Role | Description | Scope |
|------|-------------|-------|
| `superadmin` | Platform administrator | All restaurants |
| `business_admin` | Restaurant owner/manager | Single restaurant |
| `employee` | Restaurant staff | Single restaurant |

---

## Core Tables

### 1. system_admins
Platform superadmins who manage the entire system.

```sql
CREATE TABLE system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,  -- Optional phone for OTP login
  name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',  -- active, inactive, suspended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

**Initial Data**: `gaurav18115@gmail.com` (Gaurav Rao)

---

### 2. restaurants
Primary table for restaurant information and settings.

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  google_maps_link TEXT,
  phone VARCHAR(20) NOT NULL UNIQUE, -- Admin's phone (E.164 format)
  logo_url TEXT,

  -- KYC Fields
  gst_number VARCHAR(15) UNIQUE,     -- 15-char GSTIN
  fssai_number VARCHAR(14),           -- 14-digit FSSAI license
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_at TIMESTAMP WITH TIME ZONE,

  settings JSONB DEFAULT '{}', -- Restaurant-specific settings
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended')),
  CONSTRAINT chk_gst_format CHECK (gst_number IS NULL OR gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  CONSTRAINT chk_fssai_format CHECK (fssai_number IS NULL OR fssai_number ~ '^\d{14}$')
);
```

### 3. users
All system users with restaurant associations and role hierarchy.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE, -- E.164 format
  email VARCHAR(255) UNIQUE,          -- Optional email
  name VARCHAR(255),                   -- User's display name
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'employee', -- 'superadmin', 'business_admin', 'employee'
  permissions JSONB DEFAULT '[]', -- Array of specific permissions
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, inactive
  invited_by UUID REFERENCES users(id), -- Who invited this user
  first_login TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('superadmin', 'business_admin', 'employee')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'inactive')),
  CONSTRAINT admin_must_have_restaurant CHECK (
    role != 'business_admin' OR restaurant_id IS NOT NULL
  )
);
```

### 4. attendance_logs
Staff check-in/check-out tracking with location and hours calculation.

```sql
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Check-in/out times
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMP WITH TIME ZONE,

  -- Optional location tracking
  check_in_lat DECIMAL(10, 8),
  check_in_lng DECIMAL(11, 8),
  check_out_lat DECIMAL(10, 8),
  check_out_lng DECIMAL(11, 8),

  -- Calculated fields (auto-updated on check-out)
  hours_worked DECIMAL(5, 2),
  overtime_hours DECIMAL(5, 2) DEFAULT 0,
  break_minutes INTEGER DEFAULT 0,

  -- Status and notes
  status VARCHAR(20) DEFAULT 'checked_in', -- checked_in, checked_out, on_break, absent, late, early_leave
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_attendance_status CHECK (status IN ('checked_in', 'checked_out', 'on_break', 'absent', 'late', 'early_leave')),
  CONSTRAINT checkout_after_checkin CHECK (check_out_time IS NULL OR check_out_time > check_in_time)
);
```

**Triggers**:
- `attendance_auto_calculate_hours`: Auto-calculates `hours_worked` when check_out_time is set

---

### 5. staff_invitations
Track staff invitation process and status.

```sql
CREATE TABLE staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL, -- E.164 format
  invited_by UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) NOT NULL DEFAULT 'employee',  -- Always 'employee'
  permissions JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired, cancelled
  invitation_token VARCHAR(255) UNIQUE, -- For secure invitation links
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_invitation_role CHECK (role = 'employee'),
  CONSTRAINT valid_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- Unique index for pending invitations
CREATE UNIQUE INDEX idx_unique_pending_invitations
ON staff_invitations (restaurant_id, phone)
WHERE status = 'pending';
```

---

### 6. business_invitations
Invitations sent by superadmins to potential business owners.

```sql
CREATE TABLE business_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_by UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,  -- Phone is required for OTP auth
  restaurant_name VARCHAR(255) NOT NULL,  -- Pre-fill restaurant name
  role VARCHAR(20) DEFAULT 'business_admin',  -- Always 'business_admin'
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired, cancelled
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_business_invitation_role CHECK (role = 'business_admin'),
  CONSTRAINT valid_business_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);
```

### 4. auth_sessions
JWT session management with restaurant context.

```sql
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL, -- Hashed JWT token
  refresh_token_hash VARCHAR(255), -- Hashed refresh token
  device_info JSONB, -- User agent, IP, etc.
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for performance
  INDEX idx_auth_sessions_user_id (user_id),
  INDEX idx_auth_sessions_token_hash (token_hash)
);
```

### 5. otp_attempts
OTP verification tracking and rate limiting.

```sql
CREATE TABLE otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL, -- E.164 format
  otp_hash VARCHAR(255) NOT NULL, -- Hashed OTP for security
  attempts_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for rate limiting queries
  INDEX idx_otp_attempts_phone_created (phone, created_at)
);
```

### 6. audit_logs
Comprehensive activity tracking for security and compliance.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  action VARCHAR(100) NOT NULL, -- login, logout, create_voucher, etc.
  resource_type VARCHAR(50), -- user, restaurant, voucher, etc.
  resource_id UUID, -- ID of the affected resource
  details JSONB, -- Additional action details
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for querying
  INDEX idx_audit_logs_user_id (user_id),
  INDEX idx_audit_logs_restaurant_id (restaurant_id),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_logs_created_at (created_at)
);
```

## Row Level Security (RLS) Policies

### Restaurant Data Isolation
```sql
-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Restaurant admins can manage their restaurant
CREATE POLICY restaurant_admin_policy ON restaurants
  FOR ALL USING (
    phone = auth.jwt() ->> 'phone' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.phone = auth.jwt() ->> 'phone'
      AND users.role = 'admin'
      AND users.restaurant_id = restaurants.id
    )
  );

-- Users can only access their own data
CREATE POLICY users_self_policy ON users
  FOR ALL USING (phone = auth.jwt() ->> 'phone');

-- Restaurant staff can only see users from their restaurant
CREATE POLICY restaurant_users_policy ON users
  FOR SELECT USING (
    restaurant_id = (auth.jwt() ->> 'restaurant_id')::UUID
  );

-- Staff invitations restricted to restaurant
CREATE POLICY staff_invitations_policy ON staff_invitations
  FOR ALL USING (
    restaurant_id = (auth.jwt() ->> 'restaurant_id')::UUID
  );

-- Sessions belong to user
CREATE POLICY auth_sessions_policy ON auth_sessions
  FOR ALL USING (
    user_id = (auth.jwt() ->> 'user_id')::UUID
  );

-- Audit logs restricted to restaurant
CREATE POLICY audit_logs_policy ON audit_logs
  FOR ALL USING (
    restaurant_id = (auth.jwt() ->> 'restaurant_id')::UUID OR
    user_id = (auth.jwt() ->> 'user_id')::UUID
  );
```

## Future Tables (Phase 4+)

### Cash Sessions
```sql
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  opening_balance DECIMAL(10,2) NOT NULL,
  closing_balance DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'open', -- open, closed
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Petty Vouchers
```sql
CREATE TABLE petty_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Electricity Payments
```sql
CREATE TABLE electricity_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  vendor_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue
  reference_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Migration Strategy

### Phase 1: Core Tables
1. Create restaurants, users, staff_invitations tables
2. Set up RLS policies for data isolation
3. Migrate existing user data to new schema

### Phase 2: Authentication Enhancement
1. Create auth_sessions and otp_attempts tables
2. Update JWT tokens to include restaurant context
3. Implement session management

### Phase 3: Audit and Monitoring
1. Create audit_logs table
2. Implement comprehensive activity tracking
3. Set up monitoring and alerting

### Phase 4: Business Logic Tables
1. Add cash_sessions, petty_vouchers, electricity_payments
2. Implement business logic and workflows
3. Add reporting and analytics tables

## Indexes and Performance

### Primary Indexes
- All foreign keys are automatically indexed
- Phone numbers are indexed for authentication queries
- Timestamps are indexed for audit and session queries

### Additional Indexes
```sql
-- Fast restaurant lookups
CREATE INDEX idx_users_restaurant_role ON users(restaurant_id, role);

-- Staff invitation queries
CREATE INDEX idx_staff_invitations_restaurant_status ON staff_invitations(restaurant_id, status);

-- Audit log performance
CREATE INDEX idx_audit_logs_restaurant_created ON audit_logs(restaurant_id, created_at);

-- OTP rate limiting
CREATE INDEX idx_otp_attempts_phone_expires ON otp_attempts(phone, expires_at);
```

## Security Considerations

### Data Protection
- All passwords and OTPs are hashed using bcrypt or similar
- JWT tokens are properly signed and validated
- Sensitive data is encrypted at rest (Supabase default)

### Access Control
- Row Level Security ensures data isolation
- JWT tokens include restaurant context
- API endpoints validate restaurant access

### Rate Limiting
- OTP requests limited per phone number
- API endpoints have rate limiting
- Failed authentication attempts are tracked

### Audit Trail
- All user actions are logged
- IP addresses and user agents tracked
- Compliance-ready audit logs