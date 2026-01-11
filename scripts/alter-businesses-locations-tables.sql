-- Standalone script to alter existing businesses and locations tables
-- This is NOT a migration - it's a one-time script to update existing databases
-- 
-- This script:
-- 1. Adds email column to businesses table (if it doesn't exist)
-- 2. Removes phone and email columns from locations table (if they exist)
--
-- Usage: psql -U postgres -d aureli_db -f scripts/alter-businesses-locations-tables.sql

-- Step 1: Add email column to businesses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'businesses' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE businesses ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Added email column to businesses table';
    ELSE
        RAISE NOTICE 'Email column already exists in businesses table';
    END IF;
END $$;

-- Step 2: Remove phone column from locations table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'locations' 
        AND column_name = 'phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE locations DROP COLUMN phone;
        RAISE NOTICE 'Removed phone column from locations table';
    ELSE
        RAISE NOTICE 'Phone column does not exist in locations table';
    END IF;
END $$;

-- Step 3: Remove email column from locations table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'locations' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE locations DROP COLUMN email;
        RAISE NOTICE 'Removed email column from locations table';
    ELSE
        RAISE NOTICE 'Email column does not exist in locations table';
    END IF;
END $$;

-- Verification: Show current schema
SELECT 
    'Businesses table columns:' AS info,
    string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_name = 'businesses' AND table_schema = 'public'
UNION ALL
SELECT 
    'Locations table columns:' AS info,
    string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_name = 'locations' AND table_schema = 'public';

