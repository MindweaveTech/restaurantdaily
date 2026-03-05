-- Add Write RLS Policies Migration
-- Date: 2026-03-06
-- Purpose: Add missing INSERT/UPDATE/DELETE policies for existing tables

-- ================================================================
-- 1. Add write policies for restaurants table
-- ================================================================

-- Business admins can update their own restaurant
CREATE POLICY "Business admins can update restaurant" ON restaurants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.restaurant_id = restaurants.id
            AND users.role = 'business_admin'
        )
    );

-- ================================================================
-- 2. Add write policies for users table
-- ================================================================

-- Users can update their own profile (name, email)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        id::text = (auth.jwt() ->> 'sub')
    )
    WITH CHECK (
        -- Can only update own record
        id::text = (auth.jwt() ->> 'sub')
        -- Cannot change own role
        AND role = (SELECT role FROM users WHERE id::text = (auth.jwt() ->> 'sub'))
    );

-- Business admins can update staff in their restaurant
CREATE POLICY "Admins can update restaurant staff" ON users
    FOR UPDATE USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users AS admin
            WHERE admin.id::text = (auth.jwt() ->> 'sub')
            AND admin.role = 'business_admin'
        )
        -- Cannot modify other admins
        AND role = 'employee'
    );

-- Business admins can soft-delete (set status=inactive) staff
CREATE POLICY "Admins can deactivate restaurant staff" ON users
    FOR UPDATE USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users AS admin
            WHERE admin.id::text = (auth.jwt() ->> 'sub')
            AND admin.role = 'business_admin'
        )
        AND role = 'employee'
    );

-- ================================================================
-- 3. Add write policies for staff_invitations table
-- ================================================================

-- Business admins can create invitations for their restaurant
CREATE POLICY "Admins can create staff invitations" ON staff_invitations
    FOR INSERT WITH CHECK (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'business_admin'
        )
    );

-- Business admins can update invitations (cancel, etc.)
CREATE POLICY "Admins can update staff invitations" ON staff_invitations
    FOR UPDATE USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'business_admin'
        )
    );

-- Business admins can delete invitations
CREATE POLICY "Admins can delete staff invitations" ON staff_invitations
    FOR DELETE USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'business_admin'
        )
    );

-- ================================================================
-- 4. Add write policies for attendance_logs table
-- ================================================================

-- Employees can create their own check-in records
CREATE POLICY "Employees can check in" ON attendance_logs
    FOR INSERT WITH CHECK (
        user_id::text = (auth.jwt() ->> 'sub')
        AND restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
    );

-- Employees can update their own check-in (for check-out)
CREATE POLICY "Employees can check out" ON attendance_logs
    FOR UPDATE USING (
        user_id::text = (auth.jwt() ->> 'sub')
        AND check_out_time IS NULL  -- Only update active check-ins
    );

-- Business admins can update any attendance in their restaurant
CREATE POLICY "Admins can update restaurant attendance" ON attendance_logs
    FOR UPDATE USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'business_admin'
        )
    );

-- Business admins can delete attendance records (corrections)
CREATE POLICY "Admins can delete restaurant attendance" ON attendance_logs
    FOR DELETE USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'business_admin'
        )
    );

-- ================================================================
-- 5. Update grants for write operations
-- ================================================================

-- Grant INSERT, UPDATE to authenticated users (RLS controls access)
GRANT INSERT, UPDATE ON restaurants TO authenticated;
GRANT INSERT, UPDATE ON users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON staff_invitations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON attendance_logs TO authenticated;

-- ================================================================
-- 6. Add superadmin policies
-- ================================================================

-- Superadmins can read all restaurants
CREATE POLICY "Superadmins can read all restaurants" ON restaurants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'superadmin'
        )
    );

-- Superadmins can read all users
CREATE POLICY "Superadmins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.id::text = (auth.jwt() ->> 'sub')
            AND u.role = 'superadmin'
        )
    );

-- Superadmins can read all attendance
CREATE POLICY "Superadmins can read all attendance" ON attendance_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'superadmin'
        )
    );

-- ================================================================
-- 7. Add comments for documentation
-- ================================================================

COMMENT ON POLICY "Business admins can update restaurant" ON restaurants IS
    'Allows business_admin to update their own restaurant details';

COMMENT ON POLICY "Users can update own profile" ON users IS
    'Allows users to update their name and email, but not role';

COMMENT ON POLICY "Admins can update restaurant staff" ON users IS
    'Allows business_admin to update employee records in their restaurant';

-- Success message
SELECT 'Write RLS policies added successfully!' as message;
