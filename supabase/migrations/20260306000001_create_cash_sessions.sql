-- Cash Sessions Table Migration
-- Date: 2026-03-06
-- Purpose: Track cash drawer sessions for each shift

-- ================================================================
-- 1. Create cash_sessions table
-- ================================================================

CREATE TABLE IF NOT EXISTS cash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

    -- Session timing
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,

    -- Financial data
    opening_balance DECIMAL(10, 2) NOT NULL,
    closing_balance DECIMAL(10, 2),
    total_sales DECIMAL(10, 2) DEFAULT 0,
    total_refunds DECIMAL(10, 2) DEFAULT 0,
    cash_difference DECIMAL(10, 2),  -- Calculated: closing - (opening + sales - refunds)

    -- Payment method breakdowns
    cash_payments DECIMAL(10, 2) DEFAULT 0,
    card_payments DECIMAL(10, 2) DEFAULT 0,
    upi_payments DECIMAL(10, 2) DEFAULT 0,
    other_payments DECIMAL(10, 2) DEFAULT 0,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    notes TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_session_status CHECK (status IN ('active', 'closed', 'void')),
    CONSTRAINT valid_opening_balance CHECK (opening_balance >= 0),
    CONSTRAINT valid_closing_balance CHECK (closing_balance IS NULL OR closing_balance >= 0),
    CONSTRAINT session_end_after_start CHECK (end_time IS NULL OR end_time > start_time)
);

-- ================================================================
-- 2. Create indexes for performance
-- ================================================================

-- User's sessions by date
CREATE INDEX idx_cash_sessions_user
ON cash_sessions(user_id, start_time DESC);

-- Restaurant's sessions by date
CREATE INDEX idx_cash_sessions_restaurant
ON cash_sessions(restaurant_id, start_time DESC);

-- Find active sessions
CREATE INDEX idx_cash_sessions_active
ON cash_sessions(user_id, restaurant_id)
WHERE status = 'active';

-- Status-based queries
CREATE INDEX idx_cash_sessions_status
ON cash_sessions(restaurant_id, status, start_time DESC);

-- ================================================================
-- 3. Create updated_at trigger
-- ================================================================

CREATE TRIGGER update_cash_sessions_updated_at
BEFORE UPDATE ON cash_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 4. Enable Row Level Security
-- ================================================================

ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;

-- Service role can manage all sessions
CREATE POLICY "Service role can manage cash_sessions" ON cash_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own sessions
CREATE POLICY "Users can view own cash_sessions" ON cash_sessions
    FOR SELECT USING (
        user_id::text = (auth.jwt() ->> 'sub')
    );

-- Users can insert their own sessions
CREATE POLICY "Users can create own cash_sessions" ON cash_sessions
    FOR INSERT WITH CHECK (
        user_id::text = (auth.jwt() ->> 'sub')
    );

-- Users can update their own active sessions
CREATE POLICY "Users can update own cash_sessions" ON cash_sessions
    FOR UPDATE USING (
        user_id::text = (auth.jwt() ->> 'sub')
        AND status = 'active'
    );

-- Restaurant admins can view all sessions in their restaurant
CREATE POLICY "Admins can view restaurant cash_sessions" ON cash_sessions
    FOR SELECT USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
    );

-- ================================================================
-- 5. Grant permissions
-- ================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON cash_sessions TO authenticated;
GRANT ALL ON cash_sessions TO service_role;

-- ================================================================
-- 6. Create helper function to calculate cash difference
-- ================================================================

CREATE OR REPLACE FUNCTION calculate_cash_difference()
RETURNS TRIGGER AS $$
BEGIN
    -- Only calculate when closing a session
    IF NEW.status = 'closed' AND NEW.closing_balance IS NOT NULL THEN
        NEW.cash_difference := NEW.closing_balance - (
            NEW.opening_balance
            + COALESCE(NEW.cash_payments, 0)
            - COALESCE(NEW.total_refunds, 0)
        );

        -- Set end_time if not already set
        IF NEW.end_time IS NULL THEN
            NEW.end_time := NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cash_session_close_trigger
BEFORE UPDATE ON cash_sessions
FOR EACH ROW EXECUTE FUNCTION calculate_cash_difference();

-- ================================================================
-- 7. Add comments for documentation
-- ================================================================

COMMENT ON TABLE cash_sessions IS 'Cash drawer sessions tracking opening/closing balances and transactions';
COMMENT ON COLUMN cash_sessions.cash_difference IS 'Difference between expected and actual cash (auto-calculated on close)';
COMMENT ON COLUMN cash_sessions.status IS 'Session status: active (ongoing), closed (completed), void (cancelled)';

-- Success message
SELECT 'Cash sessions table created successfully!' as message;
