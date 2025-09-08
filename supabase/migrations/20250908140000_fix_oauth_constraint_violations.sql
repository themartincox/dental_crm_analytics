-- Fix OAuth constraint violations and improve signup robustness
-- Migration: 20250908140000_fix_oauth_constraint_violations.sql
-- Note: This migration focuses on fixes that can be applied without superuser permissions

-- First, let's make the user_profiles table more tolerant during OAuth signup
-- Make full_name nullable to prevent constraint violations during signup
ALTER TABLE public.user_profiles 
ALTER COLUMN full_name DROP NOT NULL;

-- Add a default value for full_name to prevent null violations
ALTER TABLE public.user_profiles 
ALTER COLUMN full_name SET DEFAULT 'New User';

-- Improve the handle_new_user function with better error handling and fallbacks
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    profile_exists BOOLEAN := false;
    user_email TEXT;
    user_full_name TEXT;
    user_role public.user_role;
    computed_name TEXT;
BEGIN
    -- Safely extract email with multiple fallbacks
    user_email := COALESCE(
        NEW.email,
        NEW.raw_user_meta_data->>'email',
        NEW.raw_user_meta_data->>'email_verified',
        'no-email@placeholder.com'
    );
    
    -- Safely extract full name with comprehensive fallbacks
    computed_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'fullName',
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'displayName',
        -- For Google OAuth
        NEW.raw_user_meta_data->>'given_name' || ' ' || NEW.raw_user_meta_data->>'family_name',
        -- For other providers
        NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
        -- Extract from email
        split_part(user_email, '@', 1),
        'New User'
    );
    
    -- Clean up the computed name (remove extra spaces, handle null concatenations)
    user_full_name := TRIM(REGEXP_REPLACE(computed_name, '\s+', ' ', 'g'));
    IF user_full_name = '' OR user_full_name IS NULL THEN
        user_full_name := 'New User';
    END IF;
    
    -- Safely extract role with fallback
    BEGIN
        user_role := COALESCE(
            (NEW.raw_user_meta_data->>'role')::public.user_role,
            'receptionist'::public.user_role
        );
    EXCEPTION WHEN OTHERS THEN
        user_role := 'receptionist'::public.user_role;
    END;
    
    -- Check if profile already exists to prevent duplicates
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles 
        WHERE id = NEW.id
    ) INTO profile_exists;
    
    -- Only create profile if it doesn't exist
    IF NOT profile_exists THEN
        -- Use UPSERT to handle any race conditions
        INSERT INTO public.user_profiles (
            id,
            email,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            user_email,
            user_full_name,
            user_role,
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            updated_at = NOW();
        
        -- Only attempt to log if the security event function exists
        BEGIN
            PERFORM public.log_security_event(
                'user_created',
                'user_profiles',
                NEW.id,
                'low',
                jsonb_build_object(
                    'provider', COALESCE(NEW.app_metadata->>'provider', 'email'),
                    'email_confirmed', NEW.email_confirmed_at IS NOT NULL,
                    'oauth_signup', NEW.app_metadata->>'provider' != 'email',
                    'extracted_name', user_full_name,
                    'extracted_email', user_email
                )
            );
        EXCEPTION WHEN OTHERS THEN
            -- Ignore logging errors - don't fail the signup
            NULL;
        END;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Handle unique constraint violations (email duplicates)
        -- Try to update existing record instead of creating new one
        BEGIN
            UPDATE public.user_profiles 
            SET 
                id = NEW.id,
                full_name = user_full_name,
                updated_at = NOW(),
                is_active = true
            WHERE email = user_email;
            
            -- If no rows were updated, the email doesn't exist yet, re-raise error
            IF NOT FOUND THEN
                RAISE;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Log the error but don't fail the auth process completely
            BEGIN
                PERFORM public.log_security_event(
                    'user_creation_failed',
                    'user_profiles',
                    NEW.id,
                    'high',
                    jsonb_build_object(
                        'error', SQLERRM,
                        'error_code', SQLSTATE,
                        'provider', COALESCE(NEW.app_metadata->>'provider', 'email'),
                        'attempted_email', user_email,
                        'attempted_name', user_full_name
                    )
                );
            EXCEPTION WHEN OTHERS THEN
                -- Even logging failed, but don't crash auth
                NULL;
            END;
        END;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Handle any other errors gracefully
        BEGIN
            PERFORM public.log_security_event(
                'user_creation_failed',
                'user_profiles',
                NEW.id,
                'high',
                jsonb_build_object(
                    'error', SQLERRM,
                    'error_code', SQLSTATE,
                    'provider', COALESCE(NEW.app_metadata->>'provider', 'email'),
                    'attempted_email', user_email,
                    'attempted_name', user_full_name
                )
            );
        EXCEPTION WHEN OTHERS THEN
            -- Even logging failed, but don't crash auth
            NULL;
        END;
        -- Return NEW to allow auth to proceed even if profile creation fails
        RETURN NEW;
END;
$$;

-- Create a cleanup function for duplicate profiles that might have been created
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_oauth_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    duplicates_cleaned INTEGER := 0;
    duplicate_record RECORD;
BEGIN
    -- Find and merge duplicate profiles by email
    FOR duplicate_record IN (
        SELECT email, MIN(created_at) as earliest_created
        FROM public.user_profiles 
        WHERE email LIKE '%@%'
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) LOOP
        -- Keep the earliest record, remove others
        WITH oldest_profile AS (
            SELECT id 
            FROM public.user_profiles 
            WHERE email = duplicate_record.email 
            ORDER BY created_at ASC 
            LIMIT 1
        )
        DELETE FROM public.user_profiles 
        WHERE email = duplicate_record.email 
        AND id NOT IN (SELECT id FROM oldest_profile);
        
        duplicates_cleaned := duplicates_cleaned + 1;
    END LOOP;
    
    RETURN duplicates_cleaned;
END;
$$;

-- Add helpful indexes for OAuth lookups if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_oauth_lookup ON public.user_profiles(email, is_active);

-- Update RLS policies to ensure OAuth users can create their profiles
-- The existing policies should work, but let's ensure they're optimal
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles" ON public.user_profiles
FOR ALL USING (
    auth.uid() = id OR 
    -- Allow service role (used by triggers)
    auth.jwt()->>'role' = 'service_role'
) WITH CHECK (
    auth.uid() = id OR 
    auth.jwt()->>'role' = 'service_role'
);

-- Ensure service role can always manage profiles (needed for triggers)
-- Note: Fixed syntax - cannot use IF NOT EXISTS with CREATE POLICY
DROP POLICY IF EXISTS "service_role_manage_user_profiles" ON public.user_profiles;
CREATE POLICY "service_role_manage_user_profiles" ON public.user_profiles
FOR ALL TO service_role
USING (true) 
WITH CHECK (true);

-- Create a diagnostic function to help debug future issues
CREATE OR REPLACE FUNCTION public.diagnose_oauth_setup()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if trigger exists
    RETURN QUERY
    SELECT 
        'trigger_exists'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created'
            AND event_object_table = 'users'
            AND event_object_schema = 'auth'
        ) THEN 'OK' ELSE 'MISSING' END::TEXT,
        'handle_new_user trigger on auth.users - REQUIRES MANUAL SETUP'::TEXT;
    
    -- Check user_profiles constraints
    RETURN QUERY
    SELECT 
        'email_constraint'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'user_profiles'
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%email%'
        ) THEN 'OK' ELSE 'MISSING' END::TEXT,
        'Email uniqueness constraint'::TEXT;
    
    -- Check RLS policies
    RETURN QUERY
    SELECT 
        'rls_policies'::TEXT,
        CASE WHEN (
            SELECT COUNT(*) FROM pg_policies 
            WHERE tablename = 'user_profiles'
            AND policyname IN ('users_manage_own_user_profiles', 'service_role_manage_user_profiles')
        ) >= 2 THEN 'OK' ELSE 'INCOMPLETE' END::TEXT,
        'RLS policies for profile access'::TEXT;
        
    RETURN;
END;
$$;

-- Create a helper function to manually run the user profile creation
-- This can be used to backfill profiles for users who signed up during the broken period
CREATE OR REPLACE FUNCTION public.create_missing_user_profiles()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user RECORD;
    user_email TEXT;
    user_full_name TEXT;
    computed_name TEXT;
BEGIN
    -- Find auth users without profiles
    FOR auth_user IN (
        SELECT au.id, au.email, au.raw_user_meta_data, au.app_metadata
        FROM auth.users au
        LEFT JOIN public.user_profiles up ON au.id = up.id
        WHERE up.id IS NULL
        ORDER BY au.created_at DESC
    ) LOOP
        -- Extract email safely
        user_email := COALESCE(
            auth_user.email,
            auth_user.raw_user_meta_data->>'email',
            'no-email@placeholder.com'
        );
        
        -- Extract full name safely
        computed_name := COALESCE(
            auth_user.raw_user_meta_data->>'full_name',
            auth_user.raw_user_meta_data->>'name',
            auth_user.raw_user_meta_data->>'fullName',
            auth_user.raw_user_meta_data->>'given_name' || ' ' || auth_user.raw_user_meta_data->>'family_name',
            split_part(user_email, '@', 1),
            'New User'
        );
        
        user_full_name := TRIM(REGEXP_REPLACE(computed_name, '\s+', ' ', 'g'));
        IF user_full_name = '' OR user_full_name IS NULL THEN
            user_full_name := 'New User';
        END IF;
        
        BEGIN
            -- Create the missing profile
            INSERT INTO public.user_profiles (
                id,
                email,
                full_name,
                role,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                auth_user.id,
                user_email,
                user_full_name,
                'receptionist'::public.user_role,
                true,
                NOW(),
                NOW()
            );
            
            RETURN QUERY SELECT auth_user.id, user_email, 'CREATED'::TEXT;
            
        EXCEPTION WHEN unique_violation THEN
            RETURN QUERY SELECT auth_user.id, user_email, 'DUPLICATE_EMAIL'::TEXT;
        WHEN OTHERS THEN
            RETURN QUERY SELECT auth_user.id, user_email, 'ERROR'::TEXT;
        END;
    END LOOP;
    
    RETURN;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Improved OAuth signup handler with comprehensive fallbacks and error handling';
COMMENT ON FUNCTION public.cleanup_duplicate_oauth_profiles() IS 'Cleanup function for duplicate profiles created during OAuth edge cases';
COMMENT ON FUNCTION public.diagnose_oauth_setup() IS 'Diagnostic function to verify OAuth setup is working correctly';
COMMENT ON FUNCTION public.create_missing_user_profiles() IS 'Helper function to create profiles for existing auth users who lack them';

-- Add a comment about manual steps required
COMMENT ON TABLE public.user_profiles IS 'User profiles table - OAuth trigger must be manually created on auth.users';