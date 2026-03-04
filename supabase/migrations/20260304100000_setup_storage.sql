-- Migration: Setup Supabase Storage for document uploads
-- Date: 2026-03-04
-- Description: Create storage buckets for KYC documents and other files

-- Create storage bucket for KYC documents (GST, FSSAI certificates)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,  -- Private bucket, requires auth
  10485760,  -- 10MB max file size
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- Create storage bucket for restaurant assets (logos, photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-assets',
  'restaurant-assets',
  true,  -- Public bucket for logos and photos
  5242880,  -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Add columns to store file paths
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS gst_document_path TEXT,
ADD COLUMN IF NOT EXISTS fssai_document_path TEXT,
ADD COLUMN IF NOT EXISTS logo_path TEXT;

-- Add comments
COMMENT ON COLUMN restaurants.gst_document_path IS 'Path to uploaded GST certificate in kyc-documents bucket';
COMMENT ON COLUMN restaurants.fssai_document_path IS 'Path to uploaded FSSAI license in kyc-documents bucket';
COMMENT ON COLUMN restaurants.logo_path IS 'Path to restaurant logo in restaurant-assets bucket';

-- RLS Policies for kyc-documents bucket

-- Allow authenticated users to upload to their own restaurant folder
CREATE POLICY "Users can upload KYC documents to their restaurant folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id::text FROM restaurants r
    JOIN users u ON u.restaurant_id = r.id
    WHERE u.phone = auth.jwt() ->> 'phone'
    AND u.role IN ('business_admin', 'admin')
  )
);

-- Allow users to view their restaurant's KYC documents
CREATE POLICY "Users can view their restaurant KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id::text FROM restaurants r
    JOIN users u ON u.restaurant_id = r.id
    WHERE u.phone = auth.jwt() ->> 'phone'
  )
);

-- Allow business admins to delete their KYC documents
CREATE POLICY "Business admins can delete KYC documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id::text FROM restaurants r
    JOIN users u ON u.restaurant_id = r.id
    WHERE u.phone = auth.jwt() ->> 'phone'
    AND u.role IN ('business_admin', 'admin')
  )
);

-- RLS Policies for restaurant-assets bucket (public read)

-- Anyone can view restaurant assets
CREATE POLICY "Public read access for restaurant assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'restaurant-assets');

-- Only business admins can upload restaurant assets
CREATE POLICY "Business admins can upload restaurant assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id::text FROM restaurants r
    JOIN users u ON u.restaurant_id = r.id
    WHERE u.phone = auth.jwt() ->> 'phone'
    AND u.role IN ('business_admin', 'admin')
  )
);

-- Business admins can delete their restaurant assets
CREATE POLICY "Business admins can delete restaurant assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'restaurant-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id::text FROM restaurants r
    JOIN users u ON u.restaurant_id = r.id
    WHERE u.phone = auth.jwt() ->> 'phone'
    AND u.role IN ('business_admin', 'admin')
  )
);

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20260304100000_setup_storage completed successfully';
END $$;
