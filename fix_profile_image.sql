-- Fix for profile_image column data truncation issue
-- Run this in your MySQL database

USE online_appointment_booking_system;

-- Update the profile_image column to LONGTEXT
ALTER TABLE provider MODIFY COLUMN profile_image LONGTEXT;

-- Verify the change
DESCRIBE provider;
