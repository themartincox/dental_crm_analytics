-- Schema Analysis: Existing user_profiles table with unique email constraint
-- Integration Type: modificative - improving existing trigger function
-- Dependencies: existing user_profiles table and handle_new_user function

-- 1. Update the handle_new_user trigger function to handle duplicate emails properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $func$
BEGIN
  -- Check if user profile already exists for this user ID
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = NEW.id) THEN
    -- User profile already exists, just return NEW without inserting
    RAISE LOG 'User profile already exists for user ID: %', NEW.id;
    RETURN NEW;
  END IF;

  -- Ensure we have required data with better fallbacks
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, 'unknown@email.com'), 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'fullName', 
      split_part(COALESCE(NEW.email, 'unknown@email.com'), '@', 1),
      'Unknown User'
    ),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IN ('super_admin', 'practice_admin', 'dentist', 'hygienist', 'receptionist', 'manager') 
      THEN (NEW.raw_user_meta_data->>'role')::public.user_role
      ELSE 'receptionist'::public.user_role
    END
  )
  ON CONFLICT (email) DO UPDATE SET
    -- If email conflict, update the existing record with the new user ID
    id = NEW.id,
    full_name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'fullName',
      EXCLUDED.full_name
    ),
    role = CASE 
      WHEN NEW.raw_user_meta_data->>'role' IN ('super_admin', 'practice_admin', 'dentist', 'hygienist', 'receptionist', 'manager') 
      THEN (NEW.raw_user_meta_data->>'role')::public.user_role
      ELSE EXCLUDED.role
    END,
    updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and still return NEW to prevent auth failure
    RAISE LOG 'Error in handle_new_user: %, SQLSTATE: %, User ID: %, Email: %', 
              SQLERRM, SQLSTATE, NEW.id, COALESCE(NEW.email, 'NULL');
    RETURN NEW;
END;
$func$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add a helper function to safely create or retrieve user profiles
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  user_id UUID,
  user_email TEXT DEFAULT NULL,
  user_full_name TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'receptionist'
)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  profile_record public.user_profiles;
BEGIN
  -- Try to get existing profile
  SELECT * INTO profile_record 
  FROM public.user_profiles 
  WHERE id = user_id;
  
  -- If profile exists, return it
  IF FOUND THEN
    RETURN profile_record;
  END IF;
  
  -- If profile doesn't exist, create it
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    user_id,
    COALESCE(user_email, 'unknown@email.com'),
    COALESCE(user_full_name, 'Unknown User'),
    COALESCE(user_role::public.user_role, 'receptionist'::public.user_role)
  )
  ON CONFLICT (email) DO UPDATE SET
    id = user_id,
    full_name = COALESCE(user_full_name, EXCLUDED.full_name),
    role = COALESCE(user_role::public.user_role, EXCLUDED.role),
    updated_at = CURRENT_TIMESTAMP
  RETURNING * INTO profile_record;
  
  RETURN profile_record;
EXCEPTION
  WHEN OTHERS THEN
    -- If still failing, try to return existing profile by email
    SELECT * INTO profile_record 
    FROM public.user_profiles 
    WHERE email = COALESCE(user_email, 'unknown@email.com')
    LIMIT 1;
    
    IF FOUND THEN
      RETURN profile_record;
    END IF;
    
    -- Last resort: raise the error
    RAISE EXCEPTION 'Failed to ensure user profile: %, SQLSTATE: %', SQLERRM, SQLSTATE;
END;
$func$;

-- 3. Add a cleanup function to remove duplicate profiles (maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Remove profiles where the auth user no longer exists
  DELETE FROM public.user_profiles 
  WHERE id NOT IN (SELECT id FROM auth.users);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE LOG 'Cleaned up % orphaned user profiles', deleted_count;
  
  RETURN deleted_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in cleanup_duplicate_profiles: %', SQLERRM;
    RETURN 0;
END;
$func$;