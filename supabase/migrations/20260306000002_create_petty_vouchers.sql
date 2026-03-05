-- Petty Vouchers Table Migration
-- Date: 2026-03-06
-- Purpose: Track petty cash expenses and reimbursements

-- ================================================================
-- 1. Create petty_vouchers table
-- ================================================================

CREATE TABLE IF NOT EXISTS petty_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

    -- Voucher details
    voucher_number VARCHAR(50),  -- Auto-generated reference number
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Vendor/payee info
    vendor_name VARCHAR(255),
    vendor_contact VARCHAR(50),

    -- Status and approval
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,

    -- Receipts and documents
    receipt_url TEXT,
    receipt_urls JSONB DEFAULT '[]',  -- Multiple receipts

    -- Payment tracking
    paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_by UUID REFERENCES users(id),
    payment_method VARCHAR(50),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_voucher_status CHECK (
        status IN ('pending', 'approved', 'rejected', 'paid', 'void')
    ),
    CONSTRAINT valid_voucher_amount CHECK (amount > 0),
    CONSTRAINT valid_voucher_category CHECK (
        category IN (
            'supplies', 'cleaning', 'repairs', 'transport', 'utilities',
            'food_ingredients', 'packaging', 'marketing', 'staff_welfare',
            'office_supplies', 'miscellaneous', 'other'
        )
    )
);

-- ================================================================
-- 2. Create indexes for performance
-- ================================================================

-- User's vouchers by date
CREATE INDEX idx_petty_vouchers_user
ON petty_vouchers(user_id, date DESC);

-- Restaurant's vouchers by date
CREATE INDEX idx_petty_vouchers_restaurant
ON petty_vouchers(restaurant_id, date DESC);

-- Status-based queries
CREATE INDEX idx_petty_vouchers_status
ON petty_vouchers(restaurant_id, status, date DESC);

-- Category-based queries
CREATE INDEX idx_petty_vouchers_category
ON petty_vouchers(restaurant_id, category, date DESC);

-- Pending approvals
CREATE INDEX idx_petty_vouchers_pending
ON petty_vouchers(restaurant_id)
WHERE status = 'pending';

-- ================================================================
-- 3. Create voucher number sequence and trigger
-- ================================================================

CREATE SEQUENCE IF NOT EXISTS petty_voucher_seq START 1001;

CREATE OR REPLACE FUNCTION generate_voucher_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.voucher_number IS NULL THEN
        NEW.voucher_number := 'PV-' || TO_CHAR(NEW.date, 'YYYYMM') || '-' || LPAD(nextval('petty_voucher_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER petty_voucher_number_trigger
BEFORE INSERT ON petty_vouchers
FOR EACH ROW EXECUTE FUNCTION generate_voucher_number();

-- ================================================================
-- 4. Create updated_at trigger
-- ================================================================

CREATE TRIGGER update_petty_vouchers_updated_at
BEFORE UPDATE ON petty_vouchers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 5. Enable Row Level Security
-- ================================================================

ALTER TABLE petty_vouchers ENABLE ROW LEVEL SECURITY;

-- Service role can manage all vouchers
CREATE POLICY "Service role can manage petty_vouchers" ON petty_vouchers
    FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own vouchers
CREATE POLICY "Users can view own petty_vouchers" ON petty_vouchers
    FOR SELECT USING (
        user_id::text = (auth.jwt() ->> 'sub')
    );

-- Users can create vouchers
CREATE POLICY "Users can create petty_vouchers" ON petty_vouchers
    FOR INSERT WITH CHECK (
        user_id::text = (auth.jwt() ->> 'sub')
    );

-- Users can update their own pending vouchers
CREATE POLICY "Users can update own pending petty_vouchers" ON petty_vouchers
    FOR UPDATE USING (
        user_id::text = (auth.jwt() ->> 'sub')
        AND status = 'pending'
    );

-- Restaurant admins can view all vouchers in their restaurant
CREATE POLICY "Admins can view restaurant petty_vouchers" ON petty_vouchers
    FOR SELECT USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
    );

-- Restaurant admins can update vouchers (for approval/rejection)
CREATE POLICY "Admins can update restaurant petty_vouchers" ON petty_vouchers
    FOR UPDATE USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'business_admin'
        )
    );

-- ================================================================
-- 6. Grant permissions
-- ================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON petty_vouchers TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE petty_voucher_seq TO authenticated;
GRANT ALL ON petty_vouchers TO service_role;
GRANT ALL ON SEQUENCE petty_voucher_seq TO service_role;

-- ================================================================
-- 7. Add comments for documentation
-- ================================================================

COMMENT ON TABLE petty_vouchers IS 'Petty cash expense vouchers for tracking small operational expenses';
COMMENT ON COLUMN petty_vouchers.voucher_number IS 'Auto-generated reference (format: PV-YYYYMM-XXXX)';
COMMENT ON COLUMN petty_vouchers.status IS 'Voucher status: pending, approved, rejected, paid, void';
COMMENT ON COLUMN petty_vouchers.category IS 'Expense category for reporting and budgeting';

-- Success message
SELECT 'Petty vouchers table created successfully!' as message;
