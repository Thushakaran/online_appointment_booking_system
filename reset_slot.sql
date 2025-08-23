-- Reset availability slot for testing
UPDATE availability SET is_booked = false WHERE id = 1;

-- Also clear any existing appointments for this slot
DELETE FROM appointment WHERE availability_id = 1;
