-- Location: supabase/migrations/20250905082000_membership_program_management.sql
-- Schema Analysis: Existing dental CRM with patients, payments, user_profiles, practice_locations
-- Integration Type: Addition - New membership module extending existing schema
-- Dependencies: patients, user_profiles, practice_locations

-- 1. TYPES - Membership specific enums
CREATE TYPE public.membership_tier AS ENUM ('basic', 'standard', 'premium', 'family');
CREATE TYPE public.membership_status AS ENUM ('active', 'inactive', 'suspended', 'cancelled', 'pending');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');
CREATE TYPE public.billing_frequency AS ENUM ('monthly', 'quarterly', 'annually');

-- 2. CORE TABLES - Membership program structure

-- Membership Plans (Template/Configuration)
CREATE TABLE public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tier public.membership_tier NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    quarterly_price DECIMAL(10,2),
    annual_price DECIMAL(10,2),
    benefits JSONB DEFAULT '[]'::jsonb,
    service_inclusions JSONB DEFAULT '{}'::jsonb,
    max_family_members INTEGER DEFAULT 1,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Membership Applications (The table mentioned by user)
CREATE TABLE public.membership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE CASCADE,
    status public.application_status DEFAULT 'pending'::public.application_status,
    billing_frequency public.billing_frequency DEFAULT 'monthly'::public.billing_frequency,
    requested_start_date DATE,
    approved_date DATE,
    rejected_reason TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    additional_notes TEXT,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE CASCADE,
    processed_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Active Memberships (Approved applications become active memberships)
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.membership_applications(id) ON DELETE SET NULL,
    status public.membership_status DEFAULT 'active'::public.membership_status,
    billing_frequency public.billing_frequency NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_billing_date DATE NOT NULL,
    monthly_amount DECIMAL(10,2) NOT NULL,
    family_members_count INTEGER DEFAULT 1,
    benefits_used JSONB DEFAULT '{}'::jsonb,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE CASCADE,
    managed_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Membership Payments (Extends existing payments for membership tracking)
CREATE TABLE public.membership_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    due_date DATE NOT NULL,
    paid_date DATE,
    late_fee_applied DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES for performance
CREATE INDEX idx_membership_plans_tier ON public.membership_plans(tier);
CREATE INDEX idx_membership_plans_practice_location ON public.membership_plans(practice_location_id);
CREATE INDEX idx_membership_applications_patient ON public.membership_applications(patient_id);
CREATE INDEX idx_membership_applications_status ON public.membership_applications(status);
CREATE INDEX idx_membership_applications_practice_location ON public.membership_applications(practice_location_id);
CREATE INDEX idx_memberships_patient ON public.memberships(patient_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_memberships_next_billing ON public.memberships(next_billing_date);
CREATE INDEX idx_membership_payments_membership ON public.membership_payments(membership_id);
CREATE INDEX idx_membership_payments_due_date ON public.membership_payments(due_date);

-- 4. FUNCTIONS (Must come before RLS policies)
CREATE OR REPLACE FUNCTION public.generate_membership_application_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_number TEXT;
    sequence_num INTEGER;
BEGIN
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 4) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.membership_applications
    WHERE application_number ~ '^MEM[0-9]+$';
    
    new_number := 'MEM' || LPAD(sequence_num::TEXT, 6, '0');
    RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_membership_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_number TEXT;
    sequence_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(membership_number FROM 3) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.memberships
    WHERE membership_number ~ '^MB[0-9]+$';
    
    new_number := 'MB' || LPAD(sequence_num::TEXT, 8, '0');
    RETURN new_number;
END;
$$;

-- Auto-generate numbers on insert
CREATE OR REPLACE FUNCTION public.set_membership_application_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.application_number IS NULL THEN
        NEW.application_number := public.generate_membership_application_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_membership_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.membership_number IS NULL THEN
        NEW.membership_number := public.generate_membership_number();
    END IF;
    RETURN NEW;
END;
$$;

-- 5. ENABLE RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES - Using Pattern 6 (Role-based access)

-- Function for role-based access (queries different table than protected one)
CREATE OR REPLACE FUNCTION public.has_membership_access(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role::TEXT = required_role
    AND up.is_active = true
)
$$;

CREATE OR REPLACE FUNCTION public.can_manage_memberships()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role::TEXT IN ('super_admin', 'practice_admin', 'manager', 'receptionist')
    AND up.is_active = true
)
$$;

-- Membership Plans - Admin/Manager access
CREATE POLICY "admin_manage_membership_plans"
ON public.membership_plans
FOR ALL
TO authenticated
USING (public.has_membership_access('super_admin') OR public.has_membership_access('practice_admin'))
WITH CHECK (public.has_membership_access('super_admin') OR public.has_membership_access('practice_admin'));

CREATE POLICY "staff_view_membership_plans"
ON public.membership_plans
FOR SELECT
TO authenticated
USING (public.can_manage_memberships());

-- Membership Applications - Staff can manage
CREATE POLICY "staff_manage_membership_applications"
ON public.membership_applications
FOR ALL
TO authenticated
USING (public.can_manage_memberships())
WITH CHECK (public.can_manage_memberships());

-- Active Memberships - Staff can manage
CREATE POLICY "staff_manage_memberships"
ON public.memberships
FOR ALL
TO authenticated
USING (public.can_manage_memberships())
WITH CHECK (public.can_manage_memberships());

-- Membership Payments - Staff can manage
CREATE POLICY "staff_manage_membership_payments"
ON public.membership_payments
FOR ALL
TO authenticated
USING (public.can_manage_memberships())
WITH CHECK (public.can_manage_memberships());

-- 7. TRIGGERS
CREATE TRIGGER set_membership_application_number_trigger
    BEFORE INSERT ON public.membership_applications
    FOR EACH ROW EXECUTE FUNCTION public.set_membership_application_number();

CREATE TRIGGER set_membership_number_trigger
    BEFORE INSERT ON public.memberships
    FOR EACH ROW EXECUTE FUNCTION public.set_membership_number();

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

-- 8. MOCK DATA - Reference existing schema objects
DO $$
DECLARE
    admin_user_id UUID;
    dentist_user_id UUID;
    practice_location_id UUID;
    patient1_id UUID;
    patient2_id UUID;
    basic_plan_id UUID := gen_random_uuid();
    premium_plan_id UUID := gen_random_uuid();
    application1_id UUID := gen_random_uuid();
    application2_id UUID := gen_random_uuid();
    membership1_id UUID := gen_random_uuid();
    payment_id UUID := gen_random_uuid();
BEGIN
    -- Get existing records
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'practice_admin' LIMIT 1;
    SELECT id INTO dentist_user_id FROM public.user_profiles WHERE role = 'dentist' LIMIT 1;
    SELECT id INTO practice_location_id FROM public.practice_locations LIMIT 1;
    SELECT id INTO patient1_id FROM public.patients LIMIT 1;
    SELECT id INTO patient2_id FROM public.patients OFFSET 1 LIMIT 1;
    
    -- If no existing data found, use first available user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM public.user_profiles LIMIT 1;
    END IF;
    
    IF patient1_id IS NULL OR patient2_id IS NULL THEN
        RAISE NOTICE 'Warning: No patient records found. Please ensure patients exist before running membership applications.';
        RETURN;
    END IF;

    -- Create membership plans
    INSERT INTO public.membership_plans (id, name, description, tier, monthly_price, quarterly_price, annual_price, benefits, service_inclusions, practice_location_id, created_by_id)
    VALUES 
        (basic_plan_id, 'Basic Care Plan', 'Essential dental care with regular checkups', 'basic'::public.membership_tier, 29.99, 85.00, 320.00, 
         '["2 routine checkups per year", "10% discount on treatments", "Emergency dental hotline"]'::jsonb,
         '{"checkups": 2, "cleanings": 2, "xrays": 1}'::jsonb, practice_location_id, admin_user_id),
        (premium_plan_id, 'Premium Care Plan', 'Comprehensive dental care with enhanced benefits', 'premium'::public.membership_tier, 59.99, 170.00, 640.00,
         '["4 routine checkups per year", "20% discount on treatments", "Free teeth whitening annually", "Emergency dental hotline", "Specialist referrals"]'::jsonb,
         '{"checkups": 4, "cleanings": 4, "xrays": 2, "whitening": 1}'::jsonb, practice_location_id, admin_user_id);

    -- Create membership applications (the table user mentioned)
    INSERT INTO public.membership_applications (id, patient_id, membership_plan_id, status, billing_frequency, requested_start_date, emergency_contact_name, emergency_contact_phone, practice_location_id, processed_by_id)
    VALUES 
        (application1_id, patient1_id, basic_plan_id, 'approved'::public.application_status, 'monthly'::public.billing_frequency, 
         CURRENT_DATE, 'John Smith Emergency', '+44 7700 900999', practice_location_id, admin_user_id),
        (application2_id, patient2_id, premium_plan_id, 'pending'::public.application_status, 'annually'::public.billing_frequency,
         CURRENT_DATE + INTERVAL '7 days', 'Emergency Contact', '+44 7700 900888', practice_location_id, admin_user_id);

    -- Create active membership (from approved application)
    INSERT INTO public.memberships (id, patient_id, membership_plan_id, application_id, status, billing_frequency, start_date, next_billing_date, monthly_amount, practice_location_id, managed_by_id)
    VALUES 
        (membership1_id, patient1_id, basic_plan_id, application1_id, 'active'::public.membership_status, 'monthly'::public.billing_frequency,
         CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', 29.99, practice_location_id, admin_user_id);

    -- Create payment record linking to existing payments table
    INSERT INTO public.payments (id, patient_id, amount, status, payment_method, description, processed_by_id, created_at)
    VALUES 
        (payment_id, patient1_id, 29.99, 'paid'::public.payment_status, 'direct_debit'::public.payment_method, 
         'Basic Care Plan - Monthly membership fee', admin_user_id, CURRENT_TIMESTAMP);

    -- Link membership payment
    INSERT INTO public.membership_payments (membership_id, payment_id, billing_period_start, billing_period_end, amount_due, amount_paid, due_date, paid_date)
    VALUES 
        (membership1_id, payment_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', 29.99, 29.99, CURRENT_DATE + INTERVAL '1 month', CURRENT_DATE);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating membership mock data: %', SQLERRM;
END $$;

-- 9. CLEANUP FUNCTION for development
CREATE OR REPLACE FUNCTION public.cleanup_membership_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.membership_payments WHERE membership_id IN (SELECT id FROM public.memberships);
    DELETE FROM public.memberships;
    DELETE FROM public.membership_applications;
    DELETE FROM public.membership_plans;
    RAISE NOTICE 'Membership test data cleaned up successfully.';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;