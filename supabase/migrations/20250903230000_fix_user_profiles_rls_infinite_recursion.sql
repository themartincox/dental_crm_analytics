-- Fix infinite recursion in user_profiles RLS policy and syntax errors
-- This migration addresses:
-- 1. The 42P17 error: "infinite recursion detected in policy for relation 'user_profiles'"
-- 2. The 42601 error: "syntax error at or near 'ON'" due to multiple ON CONFLICT clauses

-- Step 1: Drop the problematic RLS policy to prevent recursion
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;

-- Step 2: Ensure the table has RLS enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create a simple, safe RLS policy using direct auth.uid() comparison
-- This follows Pattern 1: Core User Tables (HIGHEST PRIORITY)
-- NEVER use functions or EXISTS clauses on core user tables that could cause recursion
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Step 4: Add a separate policy for service role and system functions
-- This allows system operations to bypass user-level restrictions
CREATE POLICY "system_manage_user_profiles"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 5: Update the ensure_user_profile function with proper conflict handling
-- Fix the syntax error by using a single ON CONFLICT clause and proper upsert logic
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
    user_id uuid,
    user_email text,
    user_full_name text DEFAULT NULL,
    user_role text DEFAULT 'receptionist'
)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS to prevent recursion
SET search_path = public
AS $$
DECLARE
    profile_record public.user_profiles;
    computed_full_name TEXT;
BEGIN
    -- Compute full name with fallbacks
    computed_full_name := COALESCE(
        user_full_name,
        split_part(user_email, '@', 1),
        'Unknown User'
    );
    
    -- First, try to get existing profile by ID (bypasses RLS due to SECURITY DEFINER)
    SELECT * INTO profile_record
    FROM public.user_profiles
    WHERE id = user_id;
    
    -- If profile exists, update it and return
    IF FOUND THEN
        UPDATE public.user_profiles 
        SET 
            email = user_email,
            full_name = computed_full_name,
            updated_at = NOW()
        WHERE id = user_id
        RETURNING * INTO profile_record;
        
        RETURN profile_record;
    END IF;
    
    -- Check if email already exists with different ID (edge case handling)
    SELECT * INTO profile_record
    FROM public.user_profiles
    WHERE email = user_email AND id != user_id;
    
    -- If email exists with different ID, update the existing record with new ID
    IF FOUND THEN
        UPDATE public.user_profiles 
        SET 
            id = user_id,
            full_name = computed_full_name,
            updated_at = NOW()
        WHERE email = user_email
        RETURNING * INTO profile_record;
        
        RETURN profile_record;
    END IF;
    
    -- Create new profile with single conflict resolution on primary key
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        computed_full_name,
        user_role::public.user_role,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = EXCLUDED.updated_at
    RETURNING * INTO profile_record;
    
    RETURN profile_record;
EXCEPTION
    WHEN unique_violation THEN
        -- Handle unique constraint violations gracefully
        -- This catches email uniqueness violations
        SELECT * INTO profile_record
        FROM public.user_profiles
        WHERE email = user_email;
        
        IF FOUND THEN
            -- Update existing record with new ID if email already exists
            UPDATE public.user_profiles 
            SET 
                id = user_id,
                full_name = computed_full_name,
                updated_at = NOW()
            WHERE email = user_email
            RETURNING * INTO profile_record;
            
            RETURN profile_record;
        END IF;
        
        -- If we still can't resolve, re-raise the error
        RAISE;
    WHEN OTHERS THEN
        -- Log error but don't call functions that might cause recursion
        RAISE NOTICE 'Error in ensure_user_profile: %', SQLERRM;
        RAISE;
END;
$$;

-- Step 6: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid, text, text, text) TO anon;

-- Step 7: Add helpful comments for documentation
COMMENT ON POLICY "users_manage_own_user_profiles" ON public.user_profiles IS 
'Simple RLS policy using direct auth.uid() comparison to prevent infinite recursion. Users can only access their own profiles.';

COMMENT ON POLICY "system_manage_user_profiles" ON public.user_profiles IS 
'Allows system operations and service role to manage all user profiles without restrictions.';

COMMENT ON FUNCTION public.ensure_user_profile(uuid, text, text, text) IS 
'Safely creates or retrieves user profiles with SECURITY DEFINER to bypass RLS and prevent recursion issues. Fixed syntax error by using proper conflict resolution logic.';