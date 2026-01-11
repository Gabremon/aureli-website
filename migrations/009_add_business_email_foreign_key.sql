-- Migration: Add foreign key constraint for businesses.email to users.email
-- Ensures business email matches the logged-in user's email and cannot be changed independently

-- First, update any existing businesses to have email set from their associated user
-- This syncs business.email with the email of the user who owns the business
UPDATE businesses b
SET email = u.email
FROM users u
WHERE u.business_id = b.id 
  AND u.business_id IS NOT NULL
  AND (b.email IS NULL OR b.email != u.email);

-- Add foreign key constraint
-- Note: PostgreSQL requires the referenced column to be unique (which email is in users table)
DO $$
BEGIN
    -- Drop the constraint if it already exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'businesses_email_fkey'
        AND table_name = 'businesses'
    ) THEN
        ALTER TABLE businesses DROP CONSTRAINT businesses_email_fkey;
    END IF;

    -- Add the foreign key constraint
    ALTER TABLE businesses
    ADD CONSTRAINT businesses_email_fkey
    FOREIGN KEY (email) 
    REFERENCES users(email)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Foreign key constraint added: businesses.email -> users.email';
END $$;

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);

