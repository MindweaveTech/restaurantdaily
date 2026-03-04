-- Migration: Add KYC fields (GST and FSSAI) to restaurants table
-- Date: 2026-03-04
-- Description: Add GST number and FSSAI license number for business verification

-- Add KYC columns to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(15),
ADD COLUMN IF NOT EXISTS fssai_number VARCHAR(14),
ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN restaurants.gst_number IS '15-character GST Identification Number (GSTIN)';
COMMENT ON COLUMN restaurants.fssai_number IS '14-digit FSSAI license number (mandatory for food businesses)';
COMMENT ON COLUMN restaurants.kyc_verified IS 'Whether the KYC documents have been verified';
COMMENT ON COLUMN restaurants.kyc_verified_at IS 'Timestamp when KYC was verified';

-- Create index on GST number for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_gst_number ON restaurants(gst_number) WHERE gst_number IS NOT NULL;

-- Create index on FSSAI number for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_fssai_number ON restaurants(fssai_number) WHERE fssai_number IS NOT NULL;

-- Add check constraint for GST format (basic validation)
-- GST format: 2 state digits + 10 PAN chars + 1 entity code + 1 default Z + 1 checksum
-- Example: 22AAAAA0000A1Z5
ALTER TABLE restaurants
ADD CONSTRAINT chk_gst_format CHECK (
  gst_number IS NULL OR
  gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
);

-- Add check constraint for FSSAI format (14 digits)
ALTER TABLE restaurants
ADD CONSTRAINT chk_fssai_format CHECK (
  fssai_number IS NULL OR
  fssai_number ~ '^\d{14}$'
);

-- Add unique constraint on GST number (one restaurant per GST)
ALTER TABLE restaurants
ADD CONSTRAINT uq_gst_number UNIQUE (gst_number);

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20260304000000_add_kyc_fields completed successfully';
END $$;
