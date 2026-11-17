-- Update profile_image column to LONGTEXT to handle large base64 image data
ALTER TABLE provider MODIFY COLUMN profile_image LONGTEXT;
