-- Location: supabase/migrations/20250903180000_f3_server_side_rbac_enforcement.sql
-- F3 Security Finding Resolution: Server-side RBAC enforcement
-- Schema Analysis: Existing user_profiles, security_audit_logs tables
-- Integration Type: Enhancement - Adding server-side validation functions
-- Dependencies: user_profiles, security_audit_logs

-- F3 Resolution: Enhanced server-side role validation functions
CREATE OR REPLACE FUNCTION public.validate_user_role_server_side(
    required_role TEXT,
    endpoint_path TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record public.user_profiles%ROWTYPE;
    validation_result JSONB;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Not authenticated',
            'timestamp', CURRENT_TIMESTAMP
        );
    END IF;
    
    -- Get user profile with role information
    SELECT * INTO user_record 
    FROM public.user_profiles 
    WHERE id = current_user_id AND is_active = true;
    
    IF NOT FOUND THEN
        -- Log failed validation attempt
        PERFORM public.log_security_event(
            'server_role_validation_failed'::TEXT,
            'user_validation'::TEXT,
            current_user_id,
            'high'::TEXT,
            jsonb_build_object(
                'reason', 'user_not_found',
                'required_role', required_role,
                'endpoint', endpoint_path
            )
        );
        
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'User profile not found',
            'timestamp', CURRENT_TIMESTAMP
        );
    END IF;
    
    -- Validate role hierarchy
    -- super_admin can access everything
    -- practice_admin can access most things except super_admin functions
    -- dentist can access clinical data
    -- hygienist can access limited clinical data
    -- receptionist/manager can access booking and basic patient info
    
    validation_result := CASE
        WHEN required_role = 'super_admin' AND user_record.role::TEXT = 'super_admin' THEN
            jsonb_build_object('valid', true, 'access_level', 'full')
        WHEN required_role = 'practice_admin' AND user_record.role::TEXT IN ('super_admin', 'practice_admin') THEN
            jsonb_build_object('valid', true, 'access_level', 'admin')
        WHEN required_role = 'dentist' AND user_record.role::TEXT IN ('super_admin', 'practice_admin', 'dentist') THEN
            jsonb_build_object('valid', true, 'access_level', 'clinical')
        WHEN required_role = 'hygienist' AND user_record.role::TEXT IN ('super_admin', 'practice_admin', 'dentist', 'hygienist') THEN
            jsonb_build_object('valid', true, 'access_level', 'clinical_limited')
        WHEN required_role IN ('receptionist', 'manager') AND user_record.role::TEXT IN ('super_admin', 'practice_admin', 'manager', 'receptionist') THEN
            jsonb_build_object('valid', true, 'access_level', 'operational')
        ELSE
            jsonb_build_object('valid', false, 'access_level', 'denied')
    END;
    
    -- Add user context to result
    validation_result := validation_result || jsonb_build_object(
        'userRole', user_record.role::TEXT,
        'userName', user_record.full_name,
        'userId', user_record.id,
        'timestamp', CURRENT_TIMESTAMP,
        'endpoint', endpoint_path
    );
    
    -- Log the validation attempt
    PERFORM public.log_security_event(
        'server_role_validation'::TEXT,
        'rbac_check'::TEXT,
        current_user_id,
        CASE WHEN (validation_result->>'valid')::BOOLEAN THEN 'low'::TEXT ELSE 'medium'::TEXT END,
        validation_result || jsonb_build_object(
            'required_role', required_role,
            'endpoint', endpoint_path
        )
    );
    
    RETURN validation_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        PERFORM public.log_security_event(
            'server_role_validation_error'::TEXT,
            'system_error'::TEXT,
            current_user_id,
            'high'::TEXT,
            jsonb_build_object(
                'error', SQLERRM,
                'required_role', required_role,
                'endpoint', endpoint_path
            )
        );
        
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Validation system error',
            'timestamp', CURRENT_TIMESTAMP
        );
END;
$$;

-- F3 Resolution: Endpoint-specific permission validation
CREATE OR REPLACE FUNCTION public.validate_endpoint_access(
    endpoint_path TEXT,
    http_method TEXT DEFAULT 'GET'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    user_role TEXT;
    validation_result JSONB;
    required_role TEXT;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Authentication required',
            'endpoint', endpoint_path
        );
    END IF;
    
    -- Get user role
    SELECT role::TEXT INTO user_role 
    FROM public.user_profiles 
    WHERE id = current_user_id AND is_active = true;
    
    -- Determine required role based on endpoint pattern
    required_role := CASE
        -- Super admin only endpoints
        WHEN endpoint_path ~ '/admin/system|/admin/users|/admin/audit' THEN 'super_admin'
        -- Practice admin endpoints
        WHEN endpoint_path ~ '/admin|/reports|/analytics' THEN 'practice_admin'
        -- Clinical data endpoints
        WHEN endpoint_path ~ '/patients|/appointments|/treatments|/clinical' THEN 'dentist'
        -- Operational endpoints
        WHEN endpoint_path ~ '/bookings|/scheduling|/basic' THEN 'receptionist'
        -- Public endpoints
        WHEN endpoint_path ~ '/public|/health|/status' THEN NULL
        ELSE 'receptionist' -- Default minimum role
    END;
    
    -- If no role required, allow access
    IF required_role IS NULL THEN
        RETURN jsonb_build_object(
            'valid', true,
            'access_level', 'public',
            'userRole', user_role,
            'endpoint', endpoint_path
        );
    END IF;
    
    -- Validate access using role validation function
    validation_result := public.validate_user_role_server_side(required_role, endpoint_path);
    
    -- Enhanced logging for endpoint access
    PERFORM public.log_security_event(
        'endpoint_access_check'::TEXT,
        'api_security'::TEXT,
        current_user_id,
        CASE WHEN (validation_result->>'valid')::BOOLEAN THEN 'low'::TEXT ELSE 'high'::TEXT END,
        validation_result || jsonb_build_object(
            'endpoint', endpoint_path,
            'method', http_method,
            'required_role', required_role,
            'user_role', user_role
        )
    );
    
    RETURN validation_result;
END;
$$;

-- F3 Resolution: API rate limiting and suspicious activity detection
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    requests_count INTEGER DEFAULT 1,
    time_window_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_user_endpoint ON public.api_rate_limits(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(time_window_start);

-- Enable RLS on rate limits table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own rate limit data
CREATE POLICY "users_view_own_rate_limits"
ON public.api_rate_limits
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- F3 Resolution: Non-recursive admin role check function 
-- This function bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role::TEXT IN ('super_admin', 'practice_admin')
    AND up.is_active = true
)
$$;

-- Create admin policy for rate limits using the non-recursive function
CREATE POLICY "admins_view_all_rate_limits"
ON public.api_rate_limits
FOR SELECT
TO authenticated
USING (public.is_admin_role());

-- F3 Resolution: Rate limiting function
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
    endpoint_path TEXT,
    max_requests INTEGER DEFAULT 100,
    time_window_minutes INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    current_requests INTEGER;
    window_start TIMESTAMPTZ;
    is_blocked BOOLEAN := false;
    result JSONB;
BEGIN
    current_user_id := auth.uid();
    window_start := CURRENT_TIMESTAMP - (time_window_minutes || ' minutes')::INTERVAL;
    
    -- Check if user is currently blocked
    SELECT blocked_until > CURRENT_TIMESTAMP INTO is_blocked
    FROM public.api_rate_limits
    WHERE user_id = current_user_id 
    AND endpoint = endpoint_path
    AND blocked_until IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF is_blocked THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'temporarily_blocked',
            'retry_after', '300'
        );
    END IF;
    
    -- Count recent requests
    SELECT COALESCE(SUM(requests_count), 0) INTO current_requests
    FROM public.api_rate_limits
    WHERE user_id = current_user_id
    AND endpoint = endpoint_path
    AND time_window_start > window_start;
    
    -- Check if limit exceeded
    IF current_requests >= max_requests THEN
        -- Block user temporarily
        INSERT INTO public.api_rate_limits (user_id, endpoint, requests_count, blocked_until)
        VALUES (current_user_id, endpoint_path, 1, CURRENT_TIMESTAMP + INTERVAL '5 minutes');
        
        -- Log security event
        PERFORM public.log_security_event(
            'rate_limit_exceeded'::TEXT,
            'api_security'::TEXT,
            current_user_id,
            'high'::TEXT,
            jsonb_build_object(
                'endpoint', endpoint_path,
                'requests_count', current_requests,
                'max_allowed', max_requests,
                'time_window', time_window_minutes
            )
        );
        
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'rate_limit_exceeded',
            'current_requests', current_requests,
            'max_requests', max_requests,
            'blocked_until', CURRENT_TIMESTAMP + INTERVAL '5 minutes'
        );
    END IF;
    
    -- Update or insert rate limit record
    INSERT INTO public.api_rate_limits (user_id, endpoint, requests_count)
    VALUES (current_user_id, endpoint_path, 1)
    ON CONFLICT (user_id, endpoint) 
    DO UPDATE SET 
        requests_count = api_rate_limits.requests_count + 1,
        created_at = CURRENT_TIMESTAMP;
    
    RETURN jsonb_build_object(
        'allowed', true,
        'current_requests', current_requests + 1,
        'max_requests', max_requests,
        'remaining_requests', max_requests - (current_requests + 1)
    );
END;
$$;

-- F3 Resolution: Enhanced security monitoring view
CREATE OR REPLACE VIEW public.security_monitoring_dashboard AS
SELECT 
    sal.created_at,
    sal.action,
    sal.resource_type,
    sal.risk_level,
    sal.success,
    sal.ip_address,
    sal.user_agent,
    up.full_name as user_name,
    up.role::TEXT as user_role,
    up.email,
    sal.metadata
FROM public.security_audit_logs sal
LEFT JOIN public.user_profiles up ON sal.user_id = up.id
WHERE sal.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY sal.created_at DESC;

-- Grant access to security monitoring view
GRANT SELECT ON public.security_monitoring_dashboard TO authenticated;

-- F3 Resolution: RLS policy for security monitoring (admin only)
-- Note: Views in PostgreSQL don't support RLS directly.
-- RLS is enforced through the underlying tables (security_audit_logs, user_profiles)
-- The existing admin_access_audit_logs policy on security_audit_logs table will control access

-- Comments for documentation
COMMENT ON FUNCTION public.validate_user_role_server_side IS 'F3 Resolution: Server-side RBAC validation with comprehensive role hierarchy checks';
COMMENT ON FUNCTION public.validate_endpoint_access IS 'F3 Resolution: Endpoint-specific permission validation based on URL patterns';
COMMENT ON FUNCTION public.check_api_rate_limit IS 'F3 Resolution: API rate limiting to prevent abuse and detect suspicious activity';
COMMENT ON FUNCTION public.is_admin_role IS 'F3 Resolution: Non-recursive admin role check function to prevent infinite RLS policy loops';
COMMENT ON TABLE public.api_rate_limits IS 'F3 Resolution: Rate limiting data to prevent API abuse';
COMMENT ON VIEW public.security_monitoring_dashboard IS 'F3 Resolution: Security monitoring dashboard for real-time threat detection';