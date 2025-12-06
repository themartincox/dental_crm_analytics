-- Super Admin "God Mode" Account Setup
-- Run this in your Supabase SQL Editor to create a super admin account

-- Step 1: Create the super admin user in auth.users
-- You'll need to do this through Supabase Dashboard > Authentication > Users > Add User
-- OR use this SQL (requires service_role key):

-- Email: admin@aescrm.local
-- Password: SuperAdmin123!
-- (Change this password immediately after first login)

-- Step 2: Create the user profile with super_admin role
INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name, 
    role, 
    is_active,
    client_organization_id,
    created_at
)
VALUES (
    gen_random_uuid(),  -- Will be replaced with actual auth.uid() after user creation
    'admin@aescrm.local',
    'System Administrator',
    'super_admin',
    true,
    NULL,  -- Super admin doesn't belong to a specific organization
    NOW()
)
ON CONFLICT (email) DO UPDATE 
SET 
    role = 'super_admin',
    is_active = true,
    full_name = 'System Administrator';

-- Step 3: Grant all permissions
-- The super_admin role already has full access via the RBAC system

-- Verification query - run this to confirm the account was created:
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM public.user_profiles
WHERE email = 'admin@aescrm.local';
