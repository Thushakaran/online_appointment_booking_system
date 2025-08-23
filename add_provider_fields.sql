-- Migration script to add new fields to the provider table
-- Run this script to update your existing database

ALTER TABLE provider ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS address VARCHAR(255);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS business_hours VARCHAR(255);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS specializations TEXT;
ALTER TABLE provider ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE provider ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE provider ADD COLUMN IF NOT EXISTS experience VARCHAR(100);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS twitter VARCHAR(255);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS service_pricing TEXT;
ALTER TABLE provider ADD COLUMN IF NOT EXISTS accepted_insurance VARCHAR(255);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS languages VARCHAR(255);
ALTER TABLE provider ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Add comments to document the new fields
COMMENT ON COLUMN provider.profile_image IS 'Base64 encoded profile image';
COMMENT ON COLUMN provider.phone_number IS 'Contact phone number';
COMMENT ON COLUMN provider.address IS 'Street address';
COMMENT ON COLUMN provider.city IS 'City name';
COMMENT ON COLUMN provider.state IS 'State or province';
COMMENT ON COLUMN provider.zip_code IS 'ZIP or postal code';
COMMENT ON COLUMN provider.country IS 'Country name';
COMMENT ON COLUMN provider.business_hours IS 'Business operating hours';
COMMENT ON COLUMN provider.specializations IS 'Professional specializations';
COMMENT ON COLUMN provider.education IS 'Educational background';
COMMENT ON COLUMN provider.certifications IS 'Professional certifications and licenses';
COMMENT ON COLUMN provider.experience IS 'Years of experience';
COMMENT ON COLUMN provider.website IS 'Professional website URL';
COMMENT ON COLUMN provider.linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN provider.twitter IS 'Twitter profile URL';
COMMENT ON COLUMN provider.facebook IS 'Facebook page URL';
COMMENT ON COLUMN provider.service_pricing IS 'Service pricing information';
COMMENT ON COLUMN provider.accepted_insurance IS 'Accepted insurance providers';
COMMENT ON COLUMN provider.languages IS 'Languages spoken';
COMMENT ON COLUMN provider.profile_completed IS 'Profile completion status';
