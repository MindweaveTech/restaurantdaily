-- Electricity Payments Table Migration
-- Date: 2026-03-06
-- Purpose: Track electricity bills and payments for the restaurant

-- ================================================================
-- 1. Create electricity_payments table
-- ================================================================

CREATE TABLE IF NOT EXISTS electricity_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),

    -- Bill details
    bill_number VARCHAR(100),
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,

    -- Amount details
    amount DECIMAL(10, 2) NOT NULL,
    units_consumed DECIMAL(10, 2),
    rate_per_unit DECIMAL(6, 4),
    fixed_charges DECIMAL(10, 2) DEFAULT 0,
    taxes DECIMAL(10, 2) DEFAULT 0,
    late_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2),

    -- Vendor info
    vendor_name VARCHAR(255) NOT NULL,
    vendor_account_number VARCHAR(100),
    meter_number VARCHAR(100),

    -- Payment tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_date DATE,
    paid_amount DECIMAL(10, 2),
    paid_by UUID REFERENCES users(id),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),

    -- Documents
    bill_url TEXT,
    receipt_url TEXT,

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_payment_status CHECK (
        status IN ('pending', 'paid', 'overdue', 'partial', 'disputed', 'void')
    ),
    CONSTRAINT valid_bill_amount CHECK (amount > 0),
    CONSTRAINT valid_due_after_bill CHECK (due_date >= bill_date)
);

-- ================================================================
-- 2. Create indexes for performance
-- ================================================================

-- Restaurant's bills by due date
CREATE INDEX idx_electricity_restaurant_due
ON electricity_payments(restaurant_id, due_date DESC);

-- Status-based queries
CREATE INDEX idx_electricity_status
ON electricity_payments(restaurant_id, status);

-- Pending/overdue bills
CREATE INDEX idx_electricity_pending
ON electricity_payments(restaurant_id, due_date)
WHERE status IN ('pending', 'overdue');

-- Bill number lookup
CREATE INDEX idx_electricity_bill_number
ON electricity_payments(bill_number);

-- ================================================================
-- 3. Create function to auto-update overdue status
-- ================================================================

CREATE OR REPLACE FUNCTION update_electricity_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark as overdue if past due date and not paid
    IF NEW.status = 'pending' AND NEW.due_date < CURRENT_DATE THEN
        NEW.status := 'overdue';
    END IF;

    -- Calculate total amount if not set
    IF NEW.total_amount IS NULL THEN
        NEW.total_amount := COALESCE(NEW.amount, 0)
            + COALESCE(NEW.fixed_charges, 0)
            + COALESCE(NEW.taxes, 0)
            + COALESCE(NEW.late_fee, 0);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER electricity_status_check
BEFORE INSERT OR UPDATE ON electricity_payments
FOR EACH ROW EXECUTE FUNCTION update_electricity_overdue_status();

-- ================================================================
-- 4. Create updated_at trigger
-- ================================================================

CREATE TRIGGER update_electricity_payments_updated_at
BEFORE UPDATE ON electricity_payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 5. Enable Row Level Security
-- ================================================================

ALTER TABLE electricity_payments ENABLE ROW LEVEL SECURITY;

-- Service role can manage all payments
CREATE POLICY "Service role can manage electricity_payments" ON electricity_payments
    FOR ALL USING (auth.role() = 'service_role');

-- Restaurant members can view their restaurant's bills
CREATE POLICY "Restaurant members can view electricity_payments" ON electricity_payments
    FOR SELECT USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
    );

-- Business admins can insert bills
CREATE POLICY "Admins can create electricity_payments" ON electricity_payments
    FOR INSERT WITH CHECK (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'business_admin'
        )
    );

-- Business admins can update bills
CREATE POLICY "Admins can update electricity_payments" ON electricity_payments
    FOR UPDATE USING (
        restaurant_id::text = (auth.jwt() ->> 'restaurant_id')
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = (auth.jwt() ->> 'sub')
            AND users.role = 'business_admin'
        )
    );

-- Business admins can delete bills
CREATE POLICY "Admins can delete electricity_payments" ON electricity_payments
    FOR DELETE USING (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON electricity_payments TO authenticated;
GRANT ALL ON electricity_payments TO service_role;

-- ================================================================
-- 7. Add comments for documentation
-- ================================================================

COMMENT ON TABLE electricity_payments IS 'Electricity bills and payment tracking for restaurants';
COMMENT ON COLUMN electricity_payments.status IS 'Payment status: pending, paid, overdue, partial, disputed, void';
COMMENT ON COLUMN electricity_payments.total_amount IS 'Total bill amount (auto-calculated from components)';

-- Success message
SELECT 'Electricity payments table created successfully!' as message;
