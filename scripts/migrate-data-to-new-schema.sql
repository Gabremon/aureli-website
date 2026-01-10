-- Data Migration Script: Update existing data to new schema
-- This script contains UPDATE commands to migrate data from old schema to new schema
-- Run this AFTER running all migrations (001-005)
-- 
-- Usage:
--   1. Connect to your database: psql -h localhost -p 5433 -U aureli_user -d aureli_db
--   2. Run this script: \i scripts/migrate-data-to-new-schema.sql
--   OR
--   node scripts/migrate-data-to-new-schema.js (if using Node.js script)

-- ============================================================================
-- STEP 0: Ensure businesses table exists (it should from migration 005)
-- ============================================================================

-- Create businesses table if it doesn't exist (should already exist from migration 005)
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    website VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STEP 1: Ensure users table has business_id column
-- ============================================================================

ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS business_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);

-- ============================================================================
-- STEP 2: Fix role constraint to allow both old and new role names temporarily
-- ============================================================================

-- Drop existing constraint and recreate with both old and new role names
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check CASCADE;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('business', 'applicant', 'admin', 'business_owner', 'employee'));

-- ============================================================================
-- STEP 3: Update user roles from old names to new names
-- ============================================================================

-- Update business_owner -> business
UPDATE users 
SET role = 'business' 
WHERE role = 'business_owner';

-- Update employee -> applicant
UPDATE users 
SET role = 'applicant' 
WHERE role = 'employee';

-- ============================================================================
-- STEP 4: Create businesses for existing business users and link them
-- ============================================================================

-- Create a business for each user with role 'business' that doesn't have a business_id
DO $$
DECLARE
    user_record RECORD;
    new_business_id INTEGER;
BEGIN
    FOR user_record IN 
        SELECT id, name, email
        FROM users 
        WHERE role = 'business' AND business_id IS NULL
    LOOP
        -- Create a business for this user
        INSERT INTO businesses (name, created_at, updated_at)
        VALUES (
            COALESCE(user_record.name || '''s Business', user_record.email || '''s Business'),
            NOW(),
            NOW()
        )
        RETURNING id INTO new_business_id;
        
        -- Link the user to the business
        UPDATE users
        SET business_id = new_business_id
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Created business % for user % (id: %)', new_business_id, user_record.email, user_record.id;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 5: Ensure columns exist and migrate applicants from business_owner_id to business_id
-- ============================================================================

-- Ensure business_id and business_owner_id columns exist in applicants table
ALTER TABLE IF EXISTS applicants 
ADD COLUMN IF NOT EXISTS business_id INTEGER;

ALTER TABLE IF EXISTS applicants 
ADD COLUMN IF NOT EXISTS business_owner_id INTEGER;

-- Migrate applicants from business_owner_id to business_id
DO $$
DECLARE
    owner_record RECORD;
    user_business_id INTEGER;
    updated_count INTEGER := 0;
BEGIN
    -- For each unique business_owner_id, get business_id from the user and update applicants
    FOR owner_record IN 
        SELECT DISTINCT business_owner_id
        FROM applicants 
        WHERE business_owner_id IS NOT NULL
    LOOP
        -- Get business_id from user
        SELECT business_id INTO user_business_id
        FROM users
        WHERE id = owner_record.business_owner_id;
        
        IF user_business_id IS NOT NULL THEN
            -- Update all applicants for this business_owner_id
            UPDATE applicants
            SET business_id = user_business_id
            WHERE business_owner_id = owner_record.business_owner_id
            AND (business_id IS NULL OR business_id != user_business_id);
            updated_count := updated_count + 1;
        ELSE
            RAISE NOTICE 'Warning: User % does not have a business_id. Cannot migrate applicants.', owner_record.business_owner_id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migrated applicants from % business_owner_ids to business_ids', updated_count;
END $$;

-- ============================================================================
-- STEP 6: Handle orphaned applicants (those without a business_id)
-- ============================================================================

-- If there are any applicants without a business_id, assign them to the first business
-- (or create a default business if none exists)
DO $$
DECLARE
    default_business_id INTEGER;
    orphaned_count INTEGER;
BEGIN
    -- Get the first business, or create a default one
    SELECT id INTO default_business_id FROM businesses LIMIT 1;
    
    IF default_business_id IS NULL THEN
        -- Create a default business
        INSERT INTO businesses (name, created_at, updated_at)
        VALUES ('Default Business', NOW(), NOW())
        RETURNING id INTO default_business_id;
        RAISE NOTICE 'Created default business with id: %', default_business_id;
    END IF;
    
    -- Count orphaned applicants
    SELECT COUNT(*) INTO orphaned_count 
    FROM applicants 
    WHERE business_id IS NULL;
    
    IF orphaned_count > 0 THEN
        -- Assign orphaned applicants to default business
        UPDATE applicants
        SET business_id = default_business_id
        WHERE business_id IS NULL;
        
        RAISE NOTICE 'Assigned % orphaned applicants to business %', orphaned_count, default_business_id;
    END IF;
END $$;

-- ============================================================================
-- STEP 7: Verify migration (before adding constraints)
-- ============================================================================

-- Check for any users still with old role names
DO $$
DECLARE
    old_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_role_count
    FROM users
    WHERE role IN ('business_owner', 'employee');
    
    IF old_role_count > 0 THEN
        RAISE WARNING 'Found % users still with old role names. Please review manually.', old_role_count;
    ELSE
        RAISE NOTICE '✓ All user roles have been migrated successfully.';
    END IF;
END $$;

-- Check for any applicants still using business_owner_id (if column exists)
DO $$
DECLARE
    old_ref_count INTEGER;
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'applicants' AND column_name = 'business_owner_id'
    ) THEN
        SELECT COUNT(*) INTO old_ref_count
        FROM applicants
        WHERE business_owner_id IS NOT NULL AND business_id IS NULL;
        
        IF old_ref_count > 0 THEN
            RAISE WARNING 'Found % applicants still using business_owner_id. Please review manually.', old_ref_count;
        ELSE
            RAISE NOTICE '✓ All applicants have been migrated to use business_id.';
        END IF;
    END IF;
END $$;

-- Check for any applicants without business_id
DO $$
DECLARE
    null_business_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_business_count
    FROM applicants
    WHERE business_id IS NULL;
    
    IF null_business_count > 0 THEN
        RAISE WARNING 'Found % applicants without business_id. Please review manually.', null_business_count;
    ELSE
        RAISE NOTICE '✓ All applicants have a business_id.';
    END IF;
END $$;

-- ============================================================================
-- STEP 8: Add foreign key constraints after data is migrated
-- ============================================================================

DO $$
BEGIN
    -- Verify business_id column exists before adding constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'business_id'
    ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_business_id_fkey;
        -- Add foreign key constraint for users.business_id
        ALTER TABLE users 
        ADD CONSTRAINT users_business_id_fkey 
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;
        RAISE NOTICE '✓ Added foreign key constraint for users.business_id';
    ELSE
        RAISE NOTICE '⚠️  users.business_id column does not exist, skipping foreign key';
    END IF;
    
    -- Verify business_id column exists in applicants before adding constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applicants' AND column_name = 'business_id'
    ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE applicants DROP CONSTRAINT IF EXISTS applicants_business_id_fkey;
        -- Add foreign key constraint for applicants.business_id
        ALTER TABLE applicants 
        ADD CONSTRAINT applicants_business_id_fkey 
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Added foreign key constraint for applicants.business_id';
    ELSE
        RAISE NOTICE '⚠️  applicants.business_id column does not exist, skipping foreign key';
    END IF;
END $$;

-- ============================================================================
-- STEP 9: Tighten role constraint to only allow new role names (after data migration)
-- ============================================================================

DO $$
DECLARE
    old_role_count INTEGER;
BEGIN
    -- Check if any users still have old role names
    SELECT COUNT(*) INTO old_role_count
    FROM users
    WHERE role IN ('business_owner', 'employee');
    
    IF old_role_count > 0 THEN
        RAISE WARNING 'Found % users still with old role names. Cannot tighten constraint yet.', old_role_count;
        RAISE NOTICE 'Please manually update these users or re-run this script after fixing the data.';
    ELSE
        -- Drop old constraint that allows both old and new role names
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
        -- Add new constraint with only new role names
        ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('business', 'applicant', 'admin'));
        RAISE NOTICE '✓ Updated role constraint to only allow new role names';
    END IF;
END $$;

-- ============================================================================
-- Summary
-- ============================================================================

SELECT 
    'Migration Summary' as status,
    (SELECT COUNT(*) FROM users WHERE role = 'business') as business_users,
    (SELECT COUNT(*) FROM users WHERE role = 'applicant') as applicant_users,
    (SELECT COUNT(*) FROM businesses) as total_businesses,
    (SELECT COUNT(*) FROM applicants WHERE business_id IS NOT NULL) as applicants_with_business;

