-- Update profile_image column to LONGTEXT to handle large base64 image data
ALTER TABLE provider MODIFY COLUMN profile_image LONGTEXT;

-- Appointment status values are strings; VARCHAR allows new statuses such as COMPLETED.
ALTER TABLE appointment MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
