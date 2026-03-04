-- Attendance System Migration
-- Date: 2026-03-03
-- Purpose: Add attendance tracking for staff check-in/check-out

-- ================================================================
-- 1. Create attendance_logs table
-- ================================================================

CREATE TABLE IF NOT EXISTS attendance_logs (
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

    -- Calculated fields (updated on check-out)
    hours_worked DECIMAL(5, 2),
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    break_minutes INTEGER DEFAULT 0,

    -- Status and notes
    status VARCHAR(20) DEFAULT 'checked_in',
    notes TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_attendance_status CHECK (
        status IN ('checked_in', 'checked_out', 'on_break', 'absent', 'late', 'early_leave')
    ),
    CONSTRAINT valid_hours CHECK (hours_worked IS NULL OR hours_worked >= 0),
    CONSTRAINT valid_overtime CHECK (overtime_hours >= 0),
    CONSTRAINT checkout_after_checkin CHECK (
        check_out_time IS NULL OR check_out_time > check_in_time
    )
);

-- ================================================================
-- 2. Create indexes for performance
-- ================================================================

-- Fast lookup for user's attendance by check-in time
CREATE INDEX idx_attendance_user_checkin
ON attendance_logs(user_id, check_in_time DESC);

-- Fast lookup for restaurant's attendance by check-in time
CREATE INDEX idx_attendance_restaurant_checkin
ON attendance_logs(restaurant_id, check_in_time DESC);

-- Find active check-ins (not yet checked out)
CREATE INDEX idx_attendance_active
ON attendance_logs(user_id, restaurant_id)
WHERE check_out_time IS NULL;

-- Status-based queries
CREATE INDEX idx_attendance_status
ON attendance_logs(restaurant_id, status, check_in_time DESC);

-- ================================================================
-- 3. Create updated_at trigger
-- ================================================================

CREATE TRIGGER update_attendance_logs_updated_at
BEFORE UPDATE ON attendance_logs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 4. Enable Row Level Security
-- ================================================================

ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- Service role can manage all attendance records
CREATE POLICY "Service role can manage attendance" ON attendance_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own attendance
CREATE POLICY "Users can view own attendance" ON attendance_logs
    FOR SELECT USING (
        user_id::text = (auth.jwt() ->> 'sub')
    );

-- Restaurant admins can view all attendance in their restaurant
CREATE POLICY "Admins can view restaurant attendance" ON attendance_logs
    FOR SELECT USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
    );

-- ================================================================
-- 5. Grant permissions
-- ================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON attendance_logs TO authenticated;
GRANT ALL ON attendance_logs TO service_role;

-- ================================================================
-- 6. Create helper function to calculate hours worked
-- ================================================================

CREATE OR REPLACE FUNCTION calculate_hours_worked(
    p_check_in TIMESTAMP WITH TIME ZONE,
    p_check_out TIMESTAMP WITH TIME ZONE,
    p_break_minutes INTEGER DEFAULT 0
) RETURNS DECIMAL(5, 2) AS $$
BEGIN
    IF p_check_out IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculate hours, subtract break time
    RETURN ROUND(
        (EXTRACT(EPOCH FROM (p_check_out - p_check_in)) / 3600) - (p_break_minutes / 60.0),
        2
    );
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 7. Create function to auto-calculate hours on checkout
-- ================================================================

CREATE OR REPLACE FUNCTION attendance_checkout_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Only calculate when check_out_time is being set
    IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
        NEW.hours_worked := calculate_hours_worked(
            NEW.check_in_time,
            NEW.check_out_time,
            COALESCE(NEW.break_minutes, 0)
        );
        NEW.status := 'checked_out';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attendance_auto_calculate_hours
BEFORE UPDATE ON attendance_logs
FOR EACH ROW EXECUTE FUNCTION attendance_checkout_trigger();

-- ================================================================
-- 8. Add comments for documentation
-- ================================================================

COMMENT ON TABLE attendance_logs IS 'Staff attendance records for check-in/check-out tracking';
COMMENT ON COLUMN attendance_logs.hours_worked IS 'Total hours worked (auto-calculated on checkout)';
COMMENT ON COLUMN attendance_logs.overtime_hours IS 'Hours worked beyond standard shift';
COMMENT ON COLUMN attendance_logs.status IS 'Current status: checked_in, checked_out, on_break, absent, late, early_leave';

-- Success message
SELECT 'Attendance system migration completed!' as message;
