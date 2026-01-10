-- Seed script: Add a test location for the test business user
-- This creates a location linked to the business of test@business.com

DO $$
DECLARE
    test_business_id INTEGER;
    test_location_id INTEGER;
BEGIN
    -- Find the business_id for test@business.com user
    SELECT b.id INTO test_business_id
    FROM users u
    JOIN businesses b ON u.business_id = b.id
    WHERE u.email = 'test@business.com'
    LIMIT 1;

    IF test_business_id IS NULL THEN
        RAISE EXCEPTION 'Business for test@business.com not found. Please run fix-business-user-connection.js first.';
    END IF;

    -- Check if location already exists for this business
    SELECT id INTO test_location_id
    FROM locations
    WHERE business_id = test_business_id
    LIMIT 1;

    IF test_location_id IS NOT NULL THEN
        RAISE NOTICE 'Location already exists for this business (ID: %). Skipping seed.', test_location_id;
    ELSE
        -- Create a test location
        INSERT INTO locations (
            business_id,
            name,
            address,
            city,
            state,
            zip_code,
            country,
            phone,
            email,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            test_business_id,
            'Main Office',
            '123 Business Street',
            'San Francisco',
            'CA',
            '94102',
            'United States',
            '(555) 123-4567',
            'mainoffice@testbusiness.com',
            TRUE,
            NOW(),
            NOW()
        )
        RETURNING id INTO test_location_id;

        RAISE NOTICE 'Created test location "Main Office" (ID: %) for business %', test_location_id, test_business_id;
    END IF;
END $$;

-- Verify the location was created
SELECT 
    l.id as location_id,
    l.name as location_name,
    l.city,
    l.state,
    b.id as business_id,
    b.name as business_name,
    u.email as user_email
FROM locations l
JOIN businesses b ON l.business_id = b.id
LEFT JOIN users u ON u.business_id = b.id
WHERE u.email = 'test@business.com' OR b.id IN (
    SELECT business_id FROM users WHERE email = 'test@business.com'
);

