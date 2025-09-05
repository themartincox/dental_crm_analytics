-- Location: supabase/migrations/20250905181800_system_owner_multi_tenant_client_permissions.sql
-- Schema Analysis: Building upon existing user_profiles, practice_locations tables
-- Integration Type: Addition - Adding multi-tenant client permission system
-- Dependencies: user_profiles, practice_locations

-- 1. Create client tenant system types
CREATE TYPE public.client_status AS ENUM ('active', 'inactive', 'suspended', 'pending_approval', 'trial');

CREATE TYPE public.module_permission AS ENUM (
    'embeddable_widget', 
    'membership_management', 
    'patient_management', 
    'appointment_scheduling',
    'lead_management',
    'analytics_dashboard',
    'compliance_monitoring',
    'payment_processing',
    'widget_configuration',
    'cross_site_analytics'
);

CREATE TYPE public.permission_level AS ENUM ('none', 'read', 'write', 'admin');

-- 2. Core tables (no foreign keys initially)

-- Client organizations table
CREATE TABLE public.client_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    organization_type TEXT DEFAULT 'dental_practice',
    status public.client_status DEFAULT 'pending_approval'::public.client_status,
    subscription_tier TEXT DEFAULT 'basic',
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    billing_address JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    trial_expires_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_users INTEGER DEFAULT 0,
    max_users INTEGER DEFAULT 10
);

-- System modules registry
CREATE TABLE public.system_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name public.module_permission NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) DEFAULT 0.00,
    tier_availability TEXT[] DEFAULT ARRAY['basic', 'professional', 'enterprise'],
    is_core_module BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Dependent tables (with foreign keys to existing and new tables)

-- Client module permissions junction table
CREATE TABLE public.client_module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_organization_id UUID REFERENCES public.client_organizations(id) ON DELETE CASCADE,
    module_name public.module_permission NOT NULL,
    permission_level public.permission_level DEFAULT 'none'::public.permission_level,
    is_enabled BOOLEAN DEFAULT false,
    granted_by UUID REFERENCES public.user_profiles(id),
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    usage_quota INTEGER,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Client practice locations relationship
CREATE TABLE public.client_practice_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_organization_id UUID REFERENCES public.client_organizations(id) ON DELETE CASCADE,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE CASCADE,
    is_primary_location BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- System owner audit log
CREATE TABLE public.system_owner_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performed_by UUID REFERENCES public.user_profiles(id),
    action_type TEXT NOT NULL,
    target_client_id UUID REFERENCES public.client_organizations(id),
    target_user_id UUID REFERENCES public.user_profiles(id),
    action_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Essential Indexes
CREATE INDEX idx_client_organizations_status ON public.client_organizations(status);
CREATE INDEX idx_client_organizations_tier ON public.client_organizations(subscription_tier);
CREATE INDEX idx_client_organizations_created_at ON public.client_organizations(created_at);
CREATE INDEX idx_client_module_permissions_client_id ON public.client_module_permissions(client_organization_id);
CREATE INDEX idx_client_module_permissions_module ON public.client_module_permissions(module_name);
CREATE INDEX idx_client_practice_mappings_client_id ON public.client_practice_mappings(client_organization_id);
CREATE INDEX idx_client_practice_mappings_practice_id ON public.client_practice_mappings(practice_location_id);
CREATE INDEX idx_system_owner_audit_log_performed_by ON public.system_owner_audit_log(performed_by);
CREATE INDEX idx_system_owner_audit_log_target_client ON public.system_owner_audit_log(target_client_id);

-- 5. Helper functions (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.is_system_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'super_admin'
)
$$;

CREATE OR REPLACE FUNCTION public.is_client_admin_for_organization(org_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.client_practice_mappings cpm ON cpm.practice_location_id = (
        SELECT id FROM public.practice_locations pl WHERE pl.name = up.practice_location LIMIT 1
    )
    WHERE up.id = auth.uid() 
    AND up.role IN ('practice_admin', 'manager')
    AND cpm.client_organization_id = org_uuid
)
$$;

CREATE OR REPLACE FUNCTION public.log_system_owner_action(
    action_type_param TEXT,
    target_client_param UUID DEFAULT NULL,
    target_user_param UUID DEFAULT NULL,
    details_param JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO public.system_owner_audit_log (
        performed_by,
        action_type,
        target_client_id,
        target_user_id,
        action_details
    ) VALUES (
        auth.uid(),
        action_type_param,
        target_client_param,
        target_user_param,
        details_param
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;

-- 6. Enable RLS
ALTER TABLE public.client_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_practice_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_owner_audit_log ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- Pattern 6 Option B: Role-based access for non-user tables
CREATE POLICY "system_owners_manage_client_organizations"
ON public.client_organizations
FOR ALL
TO authenticated
USING (public.is_system_owner())
WITH CHECK (public.is_system_owner());

CREATE POLICY "admins_view_own_client_organizations"
ON public.client_organizations
FOR SELECT
TO authenticated
USING (public.is_client_admin_for_organization(id));

-- System modules accessible to system owners only
CREATE POLICY "system_owners_manage_system_modules"
ON public.system_modules
FOR ALL
TO authenticated
USING (public.is_system_owner())
WITH CHECK (public.is_system_owner());

-- Client module permissions
CREATE POLICY "system_owners_manage_client_module_permissions"
ON public.client_module_permissions
FOR ALL
TO authenticated
USING (public.is_system_owner())
WITH CHECK (public.is_system_owner());

CREATE POLICY "admins_view_own_client_module_permissions"
ON public.client_module_permissions
FOR SELECT
TO authenticated
USING (public.is_client_admin_for_organization(client_organization_id));

-- Client practice mappings
CREATE POLICY "system_owners_manage_client_practice_mappings"
ON public.client_practice_mappings
FOR ALL
TO authenticated
USING (public.is_system_owner())
WITH CHECK (public.is_system_owner());

CREATE POLICY "admins_view_own_client_practice_mappings"
ON public.client_practice_mappings
FOR SELECT
TO authenticated
USING (public.is_client_admin_for_organization(client_organization_id));

-- Audit logs
CREATE POLICY "system_owners_view_all_audit_logs"
ON public.system_owner_audit_log
FOR SELECT
TO authenticated
USING (public.is_system_owner());

CREATE POLICY "system_owners_create_audit_logs"
ON public.system_owner_audit_log
FOR INSERT
TO authenticated
WITH CHECK (public.is_system_owner());

-- 8. Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_client_organizations_updated_at
    BEFORE UPDATE ON public.client_organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_system_modules_updated_at
    BEFORE UPDATE ON public.system_modules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_client_module_permissions_updated_at
    BEFORE UPDATE ON public.client_module_permissions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Insert initial system modules
INSERT INTO public.system_modules (module_name, display_name, description, base_price, tier_availability, is_core_module) VALUES
('embeddable_widget', 'Embeddable Booking Widget', 'Customizable booking widget for client websites', 29.99, ARRAY['basic', 'professional', 'enterprise'], true),
('membership_management', 'Membership Management', 'Manage dental practice membership programs', 49.99, ARRAY['professional', 'enterprise'], false),
('patient_management', 'Patient Management', 'Comprehensive patient records and management', 79.99, ARRAY['basic', 'professional', 'enterprise'], true),
('appointment_scheduling', 'Appointment Scheduling', 'Advanced appointment booking and management', 39.99, ARRAY['basic', 'professional', 'enterprise'], true),
('lead_management', 'Lead Management', 'Track and convert potential patients', 59.99, ARRAY['professional', 'enterprise'], false),
('analytics_dashboard', 'Analytics Dashboard', 'Business intelligence and reporting tools', 99.99, ARRAY['enterprise'], false),
('compliance_monitoring', 'Compliance Monitoring', 'GDPR and healthcare compliance tracking', 149.99, ARRAY['professional', 'enterprise'], false),
('payment_processing', 'Payment Processing', 'Integrated payment and billing solutions', 69.99, ARRAY['basic', 'professional', 'enterprise'], false),
('widget_configuration', 'Widget Configuration', 'Advanced widget customization tools', 19.99, ARRAY['basic', 'professional', 'enterprise'], false),
('cross_site_analytics', 'Cross-Site Analytics', 'Multi-site performance analytics', 199.99, ARRAY['enterprise'], false);

-- 10. Mock data for testing
DO $$
DECLARE
    system_owner_id UUID;
    client1_id UUID := gen_random_uuid();
    client2_id UUID := gen_random_uuid();
    practice_id UUID;
BEGIN
    -- Get existing system owner and practice
    SELECT id INTO system_owner_id FROM public.user_profiles WHERE role = 'super_admin' LIMIT 1;
    SELECT id INTO practice_id FROM public.practice_locations LIMIT 1;

    -- Insert sample client organizations
    INSERT INTO public.client_organizations (
        id, organization_name, status, subscription_tier, contact_email, contact_phone, total_users
    ) VALUES
        (client1_id, 'Smile Dental Clinic', 'active', 'professional', 'admin@smiledental.com', '+44 20 7123 4567', 5),
        (client2_id, 'Family Dentistry Plus', 'trial', 'basic', 'info@familydentistry.com', '+44 161 123 4567', 2);

    -- Map clients to practice locations
    INSERT INTO public.client_practice_mappings (client_organization_id, practice_location_id, is_primary_location)
    VALUES 
        (client1_id, practice_id, true),
        (client2_id, practice_id, false);

    -- Grant module permissions to client 1 (professional tier)
    INSERT INTO public.client_module_permissions (
        client_organization_id, module_name, permission_level, is_enabled, granted_by
    ) VALUES
        (client1_id, 'embeddable_widget', 'admin', true, system_owner_id),
        (client1_id, 'membership_management', 'write', true, system_owner_id),
        (client1_id, 'patient_management', 'admin', false, system_owner_id),
        (client1_id, 'appointment_scheduling', 'write', true, system_owner_id),
        (client1_id, 'lead_management', 'read', true, system_owner_id);

    -- Grant basic permissions to client 2 (trial tier)
    INSERT INTO public.client_module_permissions (
        client_organization_id, module_name, permission_level, is_enabled, granted_by
    ) VALUES
        (client2_id, 'embeddable_widget', 'read', true, system_owner_id),
        (client2_id, 'patient_management', 'read', false, system_owner_id),
        (client2_id, 'appointment_scheduling', 'read', true, system_owner_id);

    -- Log initial setup actions
    PERFORM public.log_system_owner_action(
        'client_organization_created',
        client1_id,
        NULL,
        '{"organization_name": "Smile Dental Clinic", "tier": "professional"}'::JSONB
    );
    
    PERFORM public.log_system_owner_action(
        'client_organization_created', 
        client2_id,
        NULL,
        '{"organization_name": "Family Dentistry Plus", "tier": "basic"}'::JSONB
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data setup encountered error: %', SQLERRM;
END $$;