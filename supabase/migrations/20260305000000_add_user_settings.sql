-- Add settings column to users table for salary/payroll configuration
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Add comment explaining the settings structure
COMMENT ON COLUMN users.settings IS 'User settings including monthly_salary, shift_hours, paid_leaves, job_title';
