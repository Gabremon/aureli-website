-- Verification script to check and fix business user connections
-- This ensures test@business.com is properly connected to a business

-- Check current state
SELECT 
    'Current State' as check_type,
    u.id as user_id,
    u.email,
    u.name,
    u.role,
    u.business_id,
    b.id as business_id_check,
    b.name as business_name
FROM users u
LEFT JOIN businesses b ON u.business_id = b.id
WHERE u.email = 'test@business.com';

-- Fix: Ensure test@business.com has a business_id
DO $$
DECLARE
    user_id_val INTEGER;
    user_business_id INTEGER;
    business_id_val INTEGER;
BEGIN
    -- Get the user ID
    SELECT id, business_id INTO user_id_val, user_business_id
    FROM users
    WHERE email = 'test@business.com';
    
    IF user_id_val IS NULL THEN
        RAISE EXCEPTION 'User test@business.com not found';
    END IF;
    
    -- If user already has a business_id, use it
    IF user_business_id IS NOT NULL THEN
        -- Verify the business exists
        IF EXISTS (SELECT 1 FROM businesses WHERE id = user_business_id) THEN
            RAISE NOTICE 'User test@business.com already has business_id: %', user_business_id;
            RETURN;
        ELSE
            RAISE NOTICE 'User has invalid business_id: %. Creating new business.', user_business_id;
            user_business_id := NULL;
        END IF;
    END IF;
    
    -- If no business_id, create or find a business
    IF user_business_id IS NULL THEN
        -- Try to find an existing business for this user by name
        SELECT b.id INTO business_id_val
        FROM businesses b
        WHERE b.name LIKE '%test@business.com%' OR b.name LIKE '%Test Business%'
        LIMIT 1;
        
        IF business_id_val IS NULL THEN
            -- Create a new business
            INSERT INTO businesses (name, created_at, updated_at)
            VALUES ('Test Business', NOW(), NOW())
            RETURNING id INTO business_id_val;
            RAISE NOTICE 'Created new business with id: %', business_id_val;
        ELSE
            RAISE NOTICE 'Found existing business with id: %', business_id_val;
        END IF;
        
        -- Link user to business
        UPDATE users
        SET business_id = business_id_val
        WHERE id = user_id_val;
        
        RAISE NOTICE 'Linked user test@business.com to business %', business_id_val;
    END IF;
END $$;

-- Verify the fix
SELECT 
    'After Fix' as check_type,
    u.id as user_id,
    u.email,
    u.name,
    u.role,
    u.business_id,
    b.id as business_id_verified,
    b.name as business_name
FROM users u
LEFT JOIN businesses b ON u.business_id = b.id
WHERE u.email = 'test@business.com';

-- Show all business users and their businesses
SELECT 
    'All Business Users' as info,
    u.email,
    u.name as user_name,
    u.role,
    b.id as business_id,
    b.name as business_name
FROM users u
LEFT JOIN businesses b ON u.business_id = b.id
WHERE u.role = 'business'
ORDER BY u.id;

