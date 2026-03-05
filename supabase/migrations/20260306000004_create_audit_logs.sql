-- Audit Logs Table Migration
-- Date: 2026-03-06
-- Purpose: Track all important actions for compliance and debugging

-- ================================================================
-- 1. Create audit_logs table
-- ================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,

    -- Action details
    action VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,  -- create, read, update, delete, login, etc.
    table_name VARCHAR(100),
    record_id UUID,

    -- Data tracking
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],

    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path TEXT,

    -- Result
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_action_type CHECK (
        action_type IN (
            'create', 'read', 'update', 'delete',
            'login', 'logout', 'failed_login',
            'password_reset', 'role_change',
            'permission_change', 'export',
            'approve', 'reject', 'void',
            'system', 'other'
        )
    )
);

-- ================================================================
-- 2. Create indexes for performance
-- ================================================================

-- Restaurant's audit logs by date (most common query)
CREATE INDEX idx_audit_logs_restaurant
ON audit_logs(restaurant_id, created_at DESC);

-- User's audit logs
CREATE INDEX idx_audit_logs_user
ON audit_logs(user_id, created_at DESC);

-- Action type queries
CREATE INDEX idx_audit_logs_action_type
ON audit_logs(action_type, created_at DESC);

-- Table-specific queries
CREATE INDEX idx_audit_logs_table
ON audit_logs(table_name, created_at DESC);

-- Record-specific queries
CREATE INDEX idx_audit_logs_record
ON audit_logs(table_name, record_id)
WHERE record_id IS NOT NULL;

-- Failed actions
CREATE INDEX idx_audit_logs_failures
ON audit_logs(restaurant_id, created_at DESC)
WHERE success = FALSE;

-- Time-based partitioning hint (for future optimization)
CREATE INDEX idx_audit_logs_created_at
ON audit_logs(created_at DESC);

-- ================================================================
-- 3. Create helper function for logging
-- ================================================================

CREATE OR REPLACE FUNCTION log_audit(
    p_user_id UUID,
    p_restaurant_id UUID,
    p_action VARCHAR(100),
    p_action_type VARCHAR(50),
    p_table_name VARCHAR(100) DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_changed_fields TEXT[];
BEGIN
    -- Calculate changed fields if both old and new values provided
    IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
        SELECT ARRAY_AGG(key)
        INTO v_changed_fields
        FROM (
            SELECT key
            FROM jsonb_each(p_new_values)
            WHERE p_old_values->key IS DISTINCT FROM p_new_values->key
        ) AS changed;
    END IF;

    INSERT INTO audit_logs (
        user_id, restaurant_id, action, action_type,
        table_name, record_id, old_values, new_values,
        changed_fields, ip_address, user_agent,
        success, error_message
    ) VALUES (
        p_user_id, p_restaurant_id, p_action, p_action_type,
        p_table_name, p_record_id, p_old_values, p_new_values,
        v_changed_fields, p_ip_address, p_user_agent,
        p_success, p_error_message
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 4. Enable Row Level Security
-- ================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role can manage all logs
CREATE POLICY "Service role can manage audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Business admins can view their restaurant's audit logs
CREATE POLICY "Admins can view restaurant audit_logs" ON audit_logs
    FOR SELECT USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'business_admin'
        )
    );

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit_logs" ON audit_logs
    FOR SELECT USING (
        user_id::text = (auth.jwt() ->> 'sub')
    );

-- No direct insert/update/delete for authenticated users
-- All logging should go through service role API

-- ================================================================
-- 5. Grant permissions
-- ================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT ALL ON audit_logs TO service_role;
GRANT EXECUTE ON FUNCTION log_audit TO service_role;

-- ================================================================
-- 6. Create automatic audit triggers for critical tables
-- ================================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_action_type VARCHAR(50);
    v_old_values JSONB;
    v_new_values JSONB;
    v_user_id UUID;
    v_restaurant_id UUID;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        v_action_type := 'create';
        v_new_values := to_jsonb(NEW);
        v_user_id := NEW.user_id;
        v_restaurant_id := NEW.restaurant_id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_action_type := 'update';
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        v_user_id := COALESCE(NEW.user_id, OLD.user_id);
        v_restaurant_id := COALESCE(NEW.restaurant_id, OLD.restaurant_id);
    ELSIF TG_OP = 'DELETE' THEN
        v_action_type := 'delete';
        v_old_values := to_jsonb(OLD);
        v_user_id := OLD.user_id;
        v_restaurant_id := OLD.restaurant_id;
    END IF;

    -- Insert audit log (bypass RLS using security definer)
    INSERT INTO audit_logs (
        user_id, restaurant_id, action, action_type,
        table_name, record_id, old_values, new_values
    ) VALUES (
        v_user_id, v_restaurant_id,
        TG_OP || ' on ' || TG_TABLE_NAME,
        v_action_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        v_old_values,
        v_new_values
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to critical tables
CREATE TRIGGER audit_cash_sessions
AFTER INSERT OR UPDATE OR DELETE ON cash_sessions
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_petty_vouchers
AFTER INSERT OR UPDATE OR DELETE ON petty_vouchers
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_electricity_payments
AFTER INSERT OR UPDATE OR DELETE ON electricity_payments
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ================================================================
-- 7. Add comments for documentation
-- ================================================================

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for compliance and debugging';
COMMENT ON COLUMN audit_logs.action IS 'Human-readable description of the action';
COMMENT ON COLUMN audit_logs.action_type IS 'Categorized action type for filtering';
COMMENT ON COLUMN audit_logs.changed_fields IS 'Array of field names that were modified';
COMMENT ON FUNCTION log_audit IS 'Helper function to create audit log entries';

-- Success message
SELECT 'Audit logs table created successfully!' as message;
