-- Fix handle_new_user function to be more robust and handle edge cases
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
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
  );  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and still return NEW to prevent auth failure
    RAISE LOG 'Error in handle_new_user: %, SQLSTATE: %, User ID: %, Email: %', 
              SQLERRM, SQLSTATE, NEW.id, NEW.email;
    RETURN NEW;
END;
$$;