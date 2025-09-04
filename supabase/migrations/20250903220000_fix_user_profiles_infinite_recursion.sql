-- Fix infinite recursion in user_profiles RLS policy
-- Remove the problematic policy with complex EXISTS clause
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;

-- Create a simple, safe policy using direct column comparison
-- This follows Pattern 1: Core User Tables (HIGHEST PRIORITY)
-- NEVER use functions or EXISTS clauses on core user tables
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Optional: Add comment explaining the fix
COMMENT ON POLICY "users_manage_own_user_profiles" ON public.user_profiles IS 
'Fixed infinite recursion by using simple direct column comparison instead of EXISTS clause. Core user tables must use Pattern 1: direct auth.uid() comparison only.';