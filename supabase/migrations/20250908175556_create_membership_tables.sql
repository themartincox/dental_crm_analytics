-- Location: supabase/migrations/20250908175556_create_membership_tables.sql
-- Schema Analysis: Dental CRM with user_profiles, patients, practice_locations, user_role enum exists
-- Integration Type: Addition - Creating missing membership program tables
-- Dependencies: user_profiles, patients, practice_locations tables

-- 1. Create required enums for membership functionality
CREATE TYPE public.membership_status AS ENUM ('pending', 'active', 'suspended', 'cancelled', 'expired');
CREATE TYPE public.membership_plan_tier AS ENUM ('basic', 'premium', 'vip');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
CREATE TYPE public.billing_frequency AS ENUM ('monthly', 'quarterly', 'annually');

-- 2. Create membership plans table
CREATE TABLE public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tier public.membership_plan_tier NOT NULL DEFAULT 'basic'::public.membership_plan_tier,
    monthly_price DECIMAL(10,2) NOT NULL,
    benefits JSONB DEFAULT '[]'::jsonb,
    service_inclusions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE CASCADE,
    created_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create membership applications table
CREATE TABLE public.membership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL DEFAULT 'APP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE CASCADE,
    status public.application_status DEFAULT 'pending'::public.application_status,
    billing_frequency public.billing_frequency DEFAULT 'monthly'::public.billing_frequency,
    requested_start_date DATE,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    additional_notes TEXT,
    approved_date TIMESTAMPTZ,
    rejected_reason TEXT,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE CASCADE,
    processed_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create active memberships table
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_number TEXT UNIQUE NOT NULL DEFAULT 'MEM-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.membership_applications(id) ON DELETE SET NULL,
    status public.membership_status DEFAULT 'active'::public.membership_status,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    billing_frequency public.billing_frequency DEFAULT 'monthly'::public.billing_frequency,
    next_billing_date DATE,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE CASCADE,
    managed_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create membership payments table
CREATE TABLE public.membership_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE,
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2),
    due_date DATE NOT NULL,
    paid_date TIMESTAMPTZ,
    payment_method public.payment_method,
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create essential indexes
CREATE INDEX idx_membership_plans_practice_location_id ON public.membership_plans(practice_location_id);
CREATE INDEX idx_membership_plans_tier ON public.membership_plans(tier);
CREATE INDEX idx_membership_applications_patient_id ON public.membership_applications(patient_id);
CREATE INDEX idx_membership_applications_status ON public.membership_applications(status);
CREATE INDEX idx_membership_applications_practice_location_id ON public.membership_applications(practice_location_id);
CREATE INDEX idx_memberships_patient_id ON public.memberships(patient_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_memberships_practice_location_id ON public.memberships(practice_location_id);
CREATE INDEX idx_membership_payments_membership_id ON public.membership_payments(membership_id);
CREATE INDEX idx_membership_payments_due_date ON public.membership_payments(due_date);

-- 7. Create helper functions
CREATE OR REPLACE FUNCTION public.has_admin_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role::TEXT = required_role
)
$$;

-- 8. Enable RLS on all tables
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies using safe patterns

-- Pattern 6: Role-based access for membership plans (admin/manager can manage)
CREATE POLICY "admin_manage_membership_plans"
ON public.membership_plans
FOR ALL
TO authenticated
USING (public.has_admin_role('super_admin') OR public.has_admin_role('practice_admin'))
WITH CHECK (public.has_admin_role('super_admin') OR public.has_admin_role('practice_admin'));

-- Pattern 4: Public read for membership plans (patients can view available plans)
CREATE POLICY "public_read_membership_plans"
ON public.membership_plans
FOR SELECT
TO public
USING (is_active = true);

-- Pattern 6: Role-based access for applications (admin/manager can view all)
CREATE POLICY "admin_view_all_membership_applications"
ON public.membership_applications
FOR SELECT
TO authenticated
USING (public.has_admin_role('super_admin') OR public.has_admin_role('practice_admin'));

-- Pattern 2: Simple user ownership for applications (patients can view their own)
CREATE POLICY "patients_view_own_membership_applications"
ON public.membership_applications
FOR SELECT
TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE created_by_id = auth.uid()));

-- Pattern 6: Role-based access for memberships (admin/manager can manage)
CREATE POLICY "admin_manage_memberships"
ON public.memberships
FOR ALL
TO authenticated
USING (public.has_admin_role('super_admin') OR public.has_admin_role('practice_admin'))
WITH CHECK (public.has_admin_role('super_admin') OR public.has_admin_role('practice_admin'));

-- Pattern 2: Simple user ownership for memberships (patients can view their own)
CREATE POLICY "patients_view_own_memberships"
ON public.memberships
FOR SELECT
TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE created_by_id = auth.uid()));

-- Pattern 6: Role-based access for payments (admin/manager can manage)
CREATE POLICY "admin_manage_membership_payments"
ON public.membership_payments
FOR ALL
TO authenticated
USING (public.has_admin_role('super_admin') OR public.has_admin_role('practice_admin'))
WITH CHECK (public.has_admin_role('super_admin') OR public.has_admin_role('practice_admin'));

-- 10. Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER membership_plans_updated_at
    BEFORE UPDATE ON public.membership_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER membership_applications_updated_at
    BEFORE UPDATE ON public.membership_applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER memberships_updated_at
    BEFORE UPDATE ON public.memberships
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER membership_payments_updated_at
    BEFORE UPDATE ON public.membership_payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 11. Create sample membership plans
DO $$
DECLARE
    location_id UUID;
    admin_user_id UUID;
    basic_plan_id UUID := gen_random_uuid();
    premium_plan_id UUID := gen_random_uuid();
    vip_plan_id UUID := gen_random_uuid();
BEGIN
    -- Get existing practice location and admin user
    SELECT id INTO location_id FROM public.practice_locations LIMIT 1;
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'super_admin' LIMIT 1;

    -- Create sample membership plans if location exists
    IF location_id IS NOT NULL THEN
        INSERT INTO public.membership_plans (id, name, description, tier, monthly_price, benefits, service_inclusions, practice_location_id, created_by_id)
        VALUES 
            (basic_plan_id, 'Basic Dental Care', 'Essential dental care with regular check-ups', 'basic'::public.membership_plan_tier, 29.99, 
             '["2 routine check-ups per year", "10% discount on treatments", "Free consultation"]'::jsonb,
             '["examination", "basic_cleaning", "x_rays"]'::jsonb, location_id, admin_user_id),
            (premium_plan_id, 'Premium Dental Care', 'Comprehensive dental care with additional benefits', 'premium'::public.membership_plan_tier, 59.99,
             '["4 routine check-ups per year", "20% discount on treatments", "Free emergency consultations", "Teeth whitening discount"]'::jsonb,
             '["examination", "deep_cleaning", "x_rays", "fluoride_treatment"]'::jsonb, location_id, admin_user_id),
            (vip_plan_id, 'VIP Dental Care', 'Premium dental care with luxury benefits', 'vip'::public.membership_plan_tier, 99.99,
             '["Unlimited check-ups", "30% discount on treatments", "Priority booking", "Free teeth whitening", "Cosmetic consultation"]'::jsonb,
             '["examination", "premium_cleaning", "x_rays", "fluoride_treatment", "cosmetic_consultation"]'::jsonb, location_id, admin_user_id);

        RAISE NOTICE 'Created sample membership plans for location: %', location_id;
    ELSE
        RAISE NOTICE 'No practice locations found. Skipping sample data creation.';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample membership plans: %', SQLERRM;
END $$;