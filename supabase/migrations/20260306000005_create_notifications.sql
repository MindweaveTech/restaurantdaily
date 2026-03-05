-- Notifications Table Migration
-- Date: 2026-03-06
-- Purpose: In-app notifications for users

-- ================================================================
-- 1. Create notifications table
-- ================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,

    -- Notification content
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(50),  -- Icon name for UI

    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    archived BOOLEAN DEFAULT FALSE,

    -- Action
    action_url TEXT,  -- URL to navigate to when clicked
    action_label VARCHAR(100),  -- Button text
    action_data JSONB,  -- Additional data for the action

    -- Related entity
    entity_type VARCHAR(50),  -- voucher, session, payment, etc.
    entity_id UUID,

    -- Priority and scheduling
    priority VARCHAR(20) DEFAULT 'normal',
    scheduled_at TIMESTAMP WITH TIME ZONE,  -- For scheduled notifications
    expires_at TIMESTAMP WITH TIME ZONE,  -- Auto-delete expired notifications

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_notification_type CHECK (
        type IN (
            'info', 'success', 'warning', 'error',
            'voucher_pending', 'voucher_approved', 'voucher_rejected',
            'session_reminder', 'session_closed',
            'payment_due', 'payment_overdue', 'payment_received',
            'attendance_checkin', 'attendance_checkout',
            'staff_invited', 'staff_joined',
            'report_ready', 'system_update',
            'other'
        )
    ),
    CONSTRAINT valid_notification_priority CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    )
);

-- ================================================================
-- 2. Create indexes for performance
-- ================================================================

-- User's unread notifications (most common query)
CREATE INDEX idx_notifications_user_unread
ON notifications(user_id, read, created_at DESC)
WHERE read = FALSE AND archived = FALSE;

-- User's all notifications
CREATE INDEX idx_notifications_user
ON notifications(user_id, created_at DESC)
WHERE archived = FALSE;

-- Restaurant notifications
CREATE INDEX idx_notifications_restaurant
ON notifications(restaurant_id, created_at DESC)
WHERE restaurant_id IS NOT NULL;

-- Type-based queries
CREATE INDEX idx_notifications_type
ON notifications(type, created_at DESC);

-- Scheduled notifications (for background job)
CREATE INDEX idx_notifications_scheduled
ON notifications(scheduled_at)
WHERE scheduled_at IS NOT NULL AND scheduled_at > NOW();

-- Expired notifications (for cleanup job)
CREATE INDEX idx_notifications_expired
ON notifications(expires_at)
WHERE expires_at IS NOT NULL AND expires_at < NOW();

-- ================================================================
-- 3. Enable Row Level Security
-- ================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Service role can manage all notifications
CREATE POLICY "Service role can manage notifications" ON notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (
        user_id::text = (auth.jwt() ->> 'sub')
    );

-- Users can update their own notifications (mark as read/archived)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (
        user_id::text = (auth.jwt() ->> 'sub')
    );

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (
        user_id::text = (auth.jwt() ->> 'sub')
    );

-- ================================================================
-- 4. Grant permissions
-- ================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE, DELETE ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- ================================================================
-- 5. Helper function to create notifications
-- ================================================================

CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_restaurant_id UUID DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_action_label VARCHAR(100) DEFAULT NULL,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_priority VARCHAR(20) DEFAULT 'normal',
    p_icon VARCHAR(50) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id, restaurant_id, type, title, message,
        action_url, action_label, entity_type, entity_id,
        priority, icon
    ) VALUES (
        p_user_id, p_restaurant_id, p_type, p_title, p_message,
        p_action_url, p_action_label, p_entity_type, p_entity_id,
        p_priority, p_icon
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 6. Function to mark notifications as read
-- ================================================================

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications
    SET read = TRUE, read_at = NOW()
    WHERE id = p_notification_id
    AND user_id::text = (auth.jwt() ->> 'sub');

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE notifications
    SET read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id
    AND read = FALSE
    AND archived = FALSE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. Function to cleanup expired notifications
-- ================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service role
GRANT EXECUTE ON FUNCTION create_notification TO service_role;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications TO service_role;

-- ================================================================
-- 8. Add comments for documentation
-- ================================================================

COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.type IS 'Notification type for categorization and icon selection';
COMMENT ON COLUMN notifications.priority IS 'Display priority: low, normal, high, urgent';
COMMENT ON COLUMN notifications.scheduled_at IS 'For delayed notifications, when to show';
COMMENT ON COLUMN notifications.expires_at IS 'Auto-delete notification after this time';
COMMENT ON FUNCTION create_notification IS 'Helper to create notifications from API';

-- Success message
SELECT 'Notifications table created successfully!' as message;
