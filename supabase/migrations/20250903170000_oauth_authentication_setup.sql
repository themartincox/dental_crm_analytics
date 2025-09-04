-- Location: supabase/migrations/20250903170000_oauth_authentication_setup.sql
-- Schema Analysis: Existing dental CRM with OAuth authentication enhancement
-- Integration Type: OAuth provider configuration and user profile management
-- Dependencies: Existing user_profiles table and security audit logs

-- 1. Ensure OAuth user profiles are handled properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_exists BOOLEAN := false;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles 
        WHERE id = NEW.id
    ) INTO profile_exists;
    
    -- Only create profile if it doesn't exist
    IF NOT profile_exists THEN
        INSERT INTO public.user_profiles (
            id,
            email,
            full_name,
            role,
            is_active,
            created_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.email, ''),
            COALESCE(
                NEW.raw_user_meta_data->>'full_name',
                NEW.raw_user_meta_data->>'name', 
                NEW.raw_user_meta_data->>'fullName',
                split_part(COALESCE(NEW.email, ''), '@', 1),
                'Unknown User'
            ),
            COALESCE(
                NEW.raw_user_meta_data->>'role',
                'receptionist'
            )::public.user_role,
            true,
            NOW()
        );
        
        -- Log the user creation event
        PERFORM public.log_security_event(
            'user_created',
            'user_profiles',
            NEW.id,
            'low',
            jsonb_build_object(
                'provider', COALESCE(NEW.app_metadata->>'provider', 'email'),
                'email_confirmed', NEW.email_confirmed_at IS NOT NULL,
                'oauth_signup', NEW.app_metadata->>'provider' != 'email'
            )
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        PERFORM public.log_security_event(
            'user_creation_failed',
            'user_profiles',
            NEW.id,
            'high',
            jsonb_build_object(
                'error', SQLERRM,
                'provider', COALESCE(NEW.app_metadata->>'provider', 'email')
            )
        );
        RETURN NEW;
END;
$$;

-- 2. Create or replace trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. Drop and recreate ensure_user_profile function to fix parameter defaults conflict
DROP FUNCTION IF EXISTS public.ensure_user_profile(uuid, text, text, text);

-- Enhanced user profile management function for OAuth users
CREATE FUNCTION public.ensure_user_profile(
    user_id UUID,
    user_email TEXT,
    user_full_name TEXT DEFAULT NULL,
    user_role TEXT DEFAULT 'receptionist'
)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
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
    
    -- Try to get existing profile
    SELECT * INTO profile_record
    FROM public.user_profiles
    WHERE id = user_id;
    
    -- If profile exists, return it
    IF FOUND THEN
        RETURN profile_record;
    END IF;
    
    -- Create new profile with proper error handling
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
    ON CONFLICT (email) DO UPDATE SET
        id = EXCLUDED.id,
        full_name = EXCLUDED.full_name,
        updated_at = NOW()
    RETURNING * INTO profile_record;
    
    -- Log profile creation
    PERFORM public.log_security_event(
        'profile_ensured',
        'user_profiles',
        user_id,
        'low',
        jsonb_build_object(
            'method', 'ensure_user_profile',
            'email', user_email
        )
    );
    
    RETURN profile_record;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and re-raise
        PERFORM public.log_security_event(
            'profile_creation_error',
            'user_profiles',
            user_id,
            'high',
            jsonb_build_object(
                'error', SQLERRM,
                'email', user_email
            )
        );
        RAISE;
END;
$$;

-- 4. Function to handle duplicate profiles cleanup (for OAuth transitions)
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cleaned_count INTEGER := 0;
    duplicate_record RECORD;
BEGIN
    -- Find and merge duplicate profiles by email
    FOR duplicate_record IN
        SELECT email, array_agg(id ORDER BY created_at) AS profile_ids
        FROM public.user_profiles
        WHERE email IS NOT NULL AND email != ''
        GROUP BY email
        HAVING count(*) > 1
    LOOP
        -- Keep the first (oldest) profile, merge data from others if needed
        UPDATE public.user_profiles
        SET updated_at = NOW()
        WHERE id = duplicate_record.profile_ids[1];
        
        -- Delete duplicate profiles (keep only the first one)
        DELETE FROM public.user_profiles
        WHERE email = duplicate_record.email
        AND id != duplicate_record.profile_ids[1];
        
        GET DIAGNOSTICS cleaned_count = ROW_COUNT;
        
        -- Log the cleanup
        PERFORM public.log_security_event(
            'duplicate_profiles_cleaned',
            'user_profiles',
            duplicate_record.profile_ids[1],
            'medium',
            jsonb_build_object(
                'email', duplicate_record.email,
                'duplicates_removed', array_length(duplicate_record.profile_ids, 1) - 1
            )
        );
    END LOOP;
    
    RETURN cleaned_count;
END;
$$;

-- 5. Enhanced RLS policy for OAuth users (updates existing policy)
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (
    id = auth.uid() 
    OR 
    -- Allow super admins to manage all profiles
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'super_admin'
        AND up.is_active = true
    )
)
WITH CHECK (
    id = auth.uid()
    OR
    -- Allow super admins to create/update profiles
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'super_admin'
        AND up.is_active = true
    )
);

-- 6. Add OAuth provider tracking to audit logs (optional enhancement)
ALTER TABLE public.security_audit_logs 
ADD COLUMN IF NOT EXISTS oauth_provider TEXT;

-- 7. Create index for OAuth provider queries
CREATE INDEX IF NOT EXISTS idx_security_audit_oauth_provider 
ON public.security_audit_logs(oauth_provider) 
WHERE oauth_provider IS NOT NULL;

-- 8. Function to track OAuth login events
CREATE OR REPLACE FUNCTION public.track_oauth_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    provider_name TEXT;
BEGIN
    -- Extract provider from metadata
    provider_name := NEW.raw_app_meta_data->>'provider';
    
    -- Only track OAuth logins (not email/password)
    IF provider_name IS NOT NULL AND provider_name != 'email' THEN
        PERFORM public.log_security_event(
            'oauth_login',
            'auth_session',
            NEW.user_id,
            'low',
            jsonb_build_object(
                'provider', provider_name,
                'session_id', NEW.id,
                'ip', NEW.ip,
                'user_agent', NEW.user_agent
            )
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail auth process due to logging issues
        RETURN NEW;
END;
$$;

-- Note: The session tracking trigger would need to be applied to auth.sessions
-- This requires superuser privileges and should be done via Supabase Dashboard

-- 9. Create helper function for frontend OAuth state management
CREATE OR REPLACE FUNCTION public.get_user_oauth_providers(user_uuid UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    (SELECT jsonb_agg(provider_info ORDER BY last_used DESC) 
     FROM (
         SELECT DISTINCT 
             jsonb_build_object(
                 'provider', sal.oauth_provider,
                 'last_used', MAX(sal.created_at)
             ) AS provider_info,
             MAX(sal.created_at) AS last_used
         FROM public.security_audit_logs sal
         WHERE sal.user_id = user_uuid
         AND sal.action = 'oauth_login'
         AND sal.oauth_provider IS NOT NULL
         AND sal.created_at > NOW() - INTERVAL '30 days'
         GROUP BY sal.oauth_provider
     ) providers),
    '[]'::jsonb
);
$$;

-- 10. Run initial cleanup of any existing duplicate profiles
SELECT public.cleanup_duplicate_profiles();

-- 11. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_duplicate_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_oauth_providers(UUID) TO authenticated;

-- Migration complete - OAuth authentication setup ready