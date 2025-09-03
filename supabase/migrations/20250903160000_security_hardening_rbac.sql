-- Location: supabase/migrations/20250903160000_security_hardening_rbac.sql
-- Schema Analysis: Existing dental CRM with user_profiles, patients, appointments, leads, etc.
-- Integration Type: Security enhancement - adding RBAC and data retention policies
-- Dependencies: Existing user_profiles, patients, appointments, leads tables

-- 1. Add security tracking columns to existing tables (for F5 - data retention)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_access_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS data_retention_category TEXT DEFAULT 'user_data',
ADD COLUMN IF NOT EXISTS scheduled_deletion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS data_retention_category TEXT DEFAULT 'clinical_data',
ADD COLUMN IF NOT EXISTS scheduled_deletion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consent_withdrawn_date TIMESTAMPTZ;

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS data_retention_category TEXT DEFAULT 'marketing_data',
ADD COLUMN IF NOT EXISTS scheduled_deletion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consent_withdrawn_date TIMESTAMPTZ;

-- 2. Create audit trail table for security compliance (F4 - DPIA requirements)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    risk_level TEXT DEFAULT 'low',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create data retention schedule table (F5 - retention logic)
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT UNIQUE NOT NULL,
    retention_period_days INTEGER NOT NULL,
    description TEXT NOT NULL,
    legal_basis TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert default retention policies (NHS guidance compliance)
INSERT INTO public.data_retention_policies (category, retention_period_days, description, legal_basis)
VALUES
    ('clinical_data', 4015, 'Dental records - 11 years retention (NHS guidance)', 'Healthcare Records Management Code of Practice'),
    ('marketing_data', 730, 'Marketing consent data - 2 years maximum', 'GDPR Article 5(1)(e) - storage limitation'),
    ('user_data', 2555, 'User account data - 7 years for business records', 'Companies Act 2006'),
    ('audit_logs', 2190, 'Security audit logs - 6 years retention', 'GDPR Article 30 - records of processing');

-- 5. Enhanced RLS functions for role-based access (F3 - server-side RBAC)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(up.role::TEXT, 'anonymous')
FROM public.user_profiles up
WHERE up.id = auth.uid()
AND up.is_active = true;
$$;

-- 6. Audit logging function (F4 - security monitoring)
CREATE OR REPLACE FUNCTION public.log_security_event(
    action_type TEXT,
    resource_type TEXT,
    resource_id UUID DEFAULT NULL,
    risk_level TEXT DEFAULT 'low',
    additional_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.security_audit_logs (
        id,
        user_id,
        action,
        resource_type,
        resource_id,
        risk_level,
        metadata
    ) VALUES (
        log_id,
        auth.uid(),
        action_type,
        resource_type,
        resource_id,
        risk_level,
        additional_metadata
    );
    
    RETURN log_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail operations due to audit logging issues
        RETURN NULL;
END;
$$;

-- 7. Data retention helper functions (F5)
CREATE OR REPLACE FUNCTION public.calculate_retention_date(category TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT CURRENT_TIMESTAMP + (drp.retention_period_days || ' days')::INTERVAL
FROM public.data_retention_policies drp
WHERE drp.category = calculate_retention_date.category;
$$;

CREATE OR REPLACE FUNCTION public.mark_for_deletion()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    marked_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Mark expired clinical data
    UPDATE public.patients
    SET scheduled_deletion_date = CURRENT_TIMESTAMP + INTERVAL '30 days'
    WHERE scheduled_deletion_date IS NULL
    AND (
        consent_withdrawn_date IS NOT NULL 
        OR created_at < (CURRENT_TIMESTAMP - (SELECT retention_period_days || ' days' FROM public.data_retention_policies WHERE category = 'clinical_data')::INTERVAL)
    );
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    marked_count := marked_count + temp_count;
    
    -- Mark expired marketing data
    UPDATE public.leads
    SET scheduled_deletion_date = CURRENT_TIMESTAMP + INTERVAL '30 days'
    WHERE scheduled_deletion_date IS NULL
    AND (
        consent_withdrawn_date IS NOT NULL 
        OR created_at < (CURRENT_TIMESTAMP - (SELECT retention_period_days || ' days' FROM public.data_retention_policies WHERE category = 'marketing_data')::INTERVAL)
    );
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    marked_count := marked_count + temp_count;
    
    RETURN marked_count;
END;
$$;

-- 8. Update existing RLS policies to use proper patterns (F2 - secure database access)

-- Drop existing policies to recreate with proper security
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_view_patients" ON public.patients;
DROP POLICY IF EXISTS "users_manage_patients" ON public.patients;

-- Pattern 1: Core user table - simple direct access
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 6: Role-based access for patients (clinical data)
CREATE OR REPLACE FUNCTION public.can_access_clinical_data()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (
        au.raw_user_meta_data->>'role' IN ('super_admin', 'practice_admin', 'dentist') 
        OR au.raw_app_meta_data->>'role' IN ('super_admin', 'practice_admin', 'dentist')
    )
)
OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('super_admin', 'practice_admin', 'dentist')
    AND up.is_active = true
);
$$;

CREATE POLICY "clinical_staff_access_patients"
ON public.patients
FOR ALL
TO authenticated
USING (public.can_access_clinical_data())
WITH CHECK (public.can_access_clinical_data());

-- Pattern 2: Simple ownership for leads (marketing data)
CREATE POLICY "users_manage_assigned_leads"
ON public.leads
FOR ALL
TO authenticated
USING (assigned_to_id = auth.uid() OR public.can_access_clinical_data())
WITH CHECK (assigned_to_id = auth.uid() OR public.can_access_clinical_data());

-- 9. Enable RLS on new security tables
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Admin-only access to security tables
CREATE POLICY "admin_access_audit_logs"
ON public.security_audit_logs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'super_admin'
        AND up.is_active = true
    )
);

CREATE POLICY "admin_access_retention_policies"
ON public.data_retention_policies
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'super_admin'
        AND up.is_active = true
    )
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON public.security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_retention_date ON public.patients(scheduled_deletion_date) WHERE scheduled_deletion_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_retention_date ON public.leads(scheduled_deletion_date) WHERE scheduled_deletion_date IS NOT NULL;

-- 11. Create update triggers for last access tracking
CREATE OR REPLACE FUNCTION public.update_last_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.last_access_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_profiles_last_access
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_access();