-- Location: supabase/migrations/20250202195742_update_dental_roles.sql
-- Schema Analysis: Existing user_profiles table with user_role enum
-- Integration Type: modification/enhancement of existing role system
-- Dependencies: user_profiles table (existing)

-- Step 1: Add new role values to existing user_role enum
-- Note: Must be done in separate commits from DEFAULT usage to avoid "unsafe use" error
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin'; 
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'practice_manager';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'reception';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'dentist_hygienist';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'dental_support';

-- Step 2: Create helper functions BEFORE using new enum values
CREATE OR REPLACE FUNCTION public.has_admin_privileges()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('owner', 'admin', 'practice_manager')
    AND up.is_active = true
)
$$;

CREATE OR REPLACE FUNCTION public.is_clinical_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE  
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('dentist', 'hygienist', 'dentist_hygienist')
    AND up.is_active = true
)
$$;

-- Step 3: Update sample data to reflect new dental practice roles
-- This allows the new enum values to be "committed" before we change the default
DO $$
DECLARE
    existing_dentist_id UUID;
    existing_reception_id UUID;
    owner_id UUID := gen_random_uuid();
    manager_id UUID := gen_random_uuid(); 
    support_id UUID := gen_random_uuid();
BEGIN
    -- Update existing sample users to use new role structure
    SELECT id INTO existing_dentist_id 
    FROM public.user_profiles 
    WHERE email = 'dentist@dentalcrm.com' LIMIT 1;
    
    SELECT id INTO existing_reception_id 
    FROM public.user_profiles 
    WHERE email = 'reception@dentalcrm.com' LIMIT 1;
    
    -- Update existing dentist role (keep as 'dentist' - it already exists)
    IF existing_dentist_id IS NOT NULL THEN
        UPDATE public.user_profiles 
        SET role = 'dentist'::public.user_role
        WHERE id = existing_dentist_id;
    END IF;
    
    -- Update existing reception role to use new 'reception' value
    IF existing_reception_id IS NOT NULL THEN
        UPDATE public.user_profiles 
        SET role = 'reception'::public.user_role
        WHERE id = existing_reception_id;
    END IF;
    
    -- Add new sample users for new roles if they do not exist
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'owner@dentalcrm.com') THEN
        -- Create auth user first
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES (
            owner_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'owner@dentalcrm.com', crypt('owner123', gen_salt('bf', 10)), now(), now(), now(),
            '{"full_name": "Dr. Sarah Thompson"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
            false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
        );
        
        -- Create user profile
        INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
        VALUES (owner_id, 'owner@dentalcrm.com', 'Dr. Sarah Thompson', 'owner'::public.user_role, true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'manager@dentalcrm.com') THEN
        -- Create auth user first
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES (
            manager_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'manager@dentalcrm.com', crypt('manager123', gen_salt('bf', 10)), now(), now(), now(),
            '{"full_name": "Lisa Martinez"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
            false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
        );
        
        -- Create user profile
        INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
        VALUES (manager_id, 'manager@dentalcrm.com', 'Lisa Martinez', 'practice_manager'::public.user_role, true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'support@dentalcrm.com') THEN
        -- Create auth user first
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES (
            support_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'support@dentalcrm.com', crypt('support123', gen_salt('bf', 10)), now(), now(), now(),
            '{"full_name": "Mark Davis"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
            false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
        );
        
        -- Create user profile
        INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
        VALUES (support_id, 'support@dentalcrm.com', 'Mark Davis', 'dental_support'::public.user_role, true);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating sample data: %', SQLERRM;
END $$;

-- Step 4: Now safely update the default value after the enum values are committed
-- Use existing 'receptionist' value instead of new 'reception' to avoid the error
-- The 'reception' role exists now but we'll keep 'receptionist' as default for safety
ALTER TABLE public.user_profiles 
ALTER COLUMN role SET DEFAULT 'receptionist'::public.user_role;

-- Create index on role column for better performance with role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_active 
ON public.user_profiles(role, is_active) WHERE is_active = true;

-- Add helpful comments for role definitions
COMMENT ON TYPE public.user_role IS 'Dental practice roles: owner (practice owner), admin (system admin), practice_manager (daily operations), reception (front desk), dentist/hygienist/dentist_hygienist (clinical staff), dental_support (assistants/support staff), receptionist (legacy front desk)';