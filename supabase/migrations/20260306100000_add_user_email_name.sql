-- Add email and name columns to users table
-- Also update role constraint to support new role types

-- Add email column
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add name column
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Drop existing role constraint and add new one with updated roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_role;
ALTER TABLE users ADD CONSTRAINT valid_role CHECK (
  role IN ('admin', 'staff', 'business_admin', 'employee', 'superadmin', 'team_member')
);

-- Update the admin_must_have_restaurant constraint to also include business_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS admin_must_have_restaurant;
-- Note: Removing this constraint for freemium model - admins can exist without restaurant initially
-- They create their restaurant during onboarding

-- Success message
SELECT 'Added email, name columns and updated role constraints!' as message;
