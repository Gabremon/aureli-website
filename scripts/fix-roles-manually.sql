-- Quick fix script to manually update roles if the migration script had issues
-- Run this BEFORE running the main migration script, or if the role updates failed

-- Step 1: Drop and recreate constraint to allow both old and new role names
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('business', 'applicant', 'admin', 'business_owner', 'employee'));

-- Step 2: Manually update roles
UPDATE users SET role = 'business' WHERE role = 'business_owner';
UPDATE users SET role = 'applicant' WHERE role = 'employee';

-- Step 3: Verify updates
SELECT id, email, name, role FROM users ORDER BY id;

-- Step 4: Drop and recreate constraint with only new role names
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('business', 'applicant', 'admin'));

SELECT 'Roles fixed successfully!' as status;

