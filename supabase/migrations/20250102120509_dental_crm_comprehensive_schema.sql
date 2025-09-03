-- Location: supabase/migrations/20250102120509_dental_crm_comprehensive_schema.sql
-- Schema Analysis: Empty database - creating comprehensive dental CRM schema
-- Integration Type: Full schema creation for dental practice management
-- Dependencies: None - fresh schema creation

-- 1. Types and Enums
CREATE TYPE public.user_role AS ENUM ('super_admin', 'practice_admin', 'dentist', 'hygienist', 'receptionist', 'manager');
CREATE TYPE public.patient_status AS ENUM ('active', 'inactive', 'prospective', 'discharged');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.treatment_type AS ENUM ('general', 'orthodontics', 'implants', 'cosmetic', 'endodontics', 'periodontics', 'oral_surgery', 'pediatric');
CREATE TYPE public.insurance_provider AS ENUM ('NHS', 'Bupa', 'Denplan', 'Private', 'AXA', 'Vitality', 'Simply_Health', 'WPA');
CREATE TYPE public.communication_preference AS ENUM ('email', 'phone', 'sms', 'post', 'app_notification');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'consultation_booked', 'consultation_completed', 'treatment_planned', 'converted', 'lost');
CREATE TYPE public.lead_source AS ENUM ('website', 'google_ads', 'facebook', 'referral', 'walk_in', 'phone', 'email', 'instagram', 'linkedin', 'bing', 'yellow_pages');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled', 'refunded', 'partial');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'direct_debit', 'finance', 'insurance_claim');
CREATE TYPE public.compliance_status AS ENUM ('compliant', 'warning', 'non_compliant', 'under_review');
CREATE TYPE public.activity_type AS ENUM ('patient_registration', 'appointment_booking', 'treatment_completion', 'payment_received', 'lead_conversion', 'consultation', 'follow_up', 'cancellation');

-- 2. Core Tables (no foreign keys)

-- Critical intermediary table for PostgREST compatibility
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'receptionist'::public.user_role,
    practice_location TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Practice locations/branches
CREATE TABLE public.practice_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    postcode TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Dependent Tables (with foreign keys)

-- Patients - core entity
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    address TEXT,
    postcode TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    status public.patient_status DEFAULT 'prospective'::public.patient_status,
    treatment_type public.treatment_type DEFAULT 'general'::public.treatment_type,
    insurance_provider public.insurance_provider DEFAULT 'NHS'::public.insurance_provider,
    insurance_number TEXT,
    communication_preference public.communication_preference DEFAULT 'email'::public.communication_preference,
    notes TEXT,
    profile_image_url TEXT,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE SET NULL,
    assigned_dentist_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Appointments
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    treatment_type public.treatment_type NOT NULL,
    status public.appointment_status DEFAULT 'scheduled'::public.appointment_status,
    notes TEXT,
    estimated_cost DECIMAL(10,2),
    deposit_required DECIMAL(10,2),
    deposit_paid DECIMAL(10,2) DEFAULT 0,
    reminder_sent_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Leads and marketing data
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    postcode TEXT,
    source public.lead_source NOT NULL,
    status public.lead_status DEFAULT 'new'::public.lead_status,
    treatment_interest public.treatment_type,
    estimated_value DECIMAL(10,2),
    notes TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    first_contact_date TIMESTAMPTZ,
    last_contact_date TIMESTAMPTZ,
    conversion_date TIMESTAMPTZ,
    assigned_to_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    converted_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Treatments and procedures
CREATE TABLE public.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    treatment_type public.treatment_type NOT NULL,
    procedure_name TEXT NOT NULL,
    description TEXT,
    tooth_numbers TEXT[],
    status TEXT DEFAULT 'planned',
    start_date DATE,
    completion_date DATE,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    insurance_claim_amount DECIMAL(10,2),
    patient_portion DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payments and billing
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES public.treatments(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method public.payment_method NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    payment_date DATE,
    due_date DATE,
    description TEXT,
    invoice_number TEXT,
    processed_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Lead activities and communications
CREATE TABLE public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    outcome TEXT,
    next_action TEXT,
    next_action_date DATE,
    performed_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Patient communication history
CREATE TABLE public.patient_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    communication_type public.communication_preference NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sent_by_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL
);

-- Compliance and audit data
CREATE TABLE public.compliance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type TEXT NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    dentist_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    compliance_date DATE NOT NULL,
    status public.compliance_status DEFAULT 'compliant'::public.compliance_status,
    details JSONB,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- System activity log
CREATE TABLE public.system_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type public.activity_type NOT NULL,
    description TEXT NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    treatment_id UUID REFERENCES public.treatments(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Revenue tracking for analytics
CREATE TABLE public.revenue_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_date DATE NOT NULL,
    practice_location_id UUID REFERENCES public.practice_locations(id) ON DELETE SET NULL,
    treatment_type public.treatment_type,
    revenue_amount DECIMAL(10,2) NOT NULL,
    patient_count INTEGER DEFAULT 0,
    appointment_count INTEGER DEFAULT 0,
    new_patient_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

CREATE INDEX idx_patients_email ON public.patients(email);
CREATE INDEX idx_patients_phone ON public.patients(phone);
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_practice_location ON public.patients(practice_location_id);
CREATE INDEX idx_patients_assigned_dentist ON public.patients(assigned_dentist_id);
CREATE INDEX idx_patients_created_at ON public.patients(created_at);

CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_dentist ON public.appointments(dentist_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_practice_location ON public.appointments(practice_location_id);

CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_source ON public.leads(source);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);

CREATE INDEX idx_treatments_patient ON public.treatments(patient_id);
CREATE INDEX idx_treatments_dentist ON public.treatments(dentist_id);
CREATE INDEX idx_treatments_status ON public.treatments(status);

CREATE INDEX idx_payments_patient ON public.payments(patient_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_due_date ON public.payments(due_date);

CREATE INDEX idx_system_activities_type ON public.system_activities(activity_type);
CREATE INDEX idx_system_activities_patient ON public.system_activities(patient_id);
CREATE INDEX idx_system_activities_created_at ON public.system_activities(created_at);

CREATE INDEX idx_revenue_records_date ON public.revenue_records(record_date);
CREATE INDEX idx_revenue_records_location ON public.revenue_records(practice_location_id);

-- 5. Functions for statistics and analytics
CREATE OR REPLACE FUNCTION public.get_practice_stats(location_id UUID DEFAULT NULL)
RETURNS TABLE(
    total_patients INTEGER,
    active_patients INTEGER,
    total_revenue DECIMAL,
    monthly_revenue DECIMAL,
    avg_patient_value DECIMAL,
    conversion_rate DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.patients p WHERE (location_id IS NULL OR p.practice_location_id = location_id)),
        (SELECT COUNT(*)::INTEGER FROM public.patients p WHERE p.status = 'active' AND (location_id IS NULL OR p.practice_location_id = location_id)),
        COALESCE((SELECT SUM(amount) FROM public.payments pay 
                  JOIN public.patients p ON pay.patient_id = p.id 
                  WHERE pay.status = 'paid' AND (location_id IS NULL OR p.practice_location_id = location_id)), 0),
        COALESCE((SELECT SUM(amount) FROM public.payments pay 
                  JOIN public.patients p ON pay.patient_id = p.id 
                  WHERE pay.status = 'paid' AND pay.payment_date >= DATE_TRUNC('month', CURRENT_DATE) 
                  AND (location_id IS NULL OR p.practice_location_id = location_id)), 0),
        COALESCE((SELECT AVG(amount) FROM public.payments pay 
                  JOIN public.patients p ON pay.patient_id = p.id 
                  WHERE pay.status = 'paid' AND (location_id IS NULL OR p.practice_location_id = location_id)), 0),
        COALESCE((
            SELECT 
                CASE 
                    WHEN COUNT(*) = 0 THEN 0
                    ELSE (COUNT(*) FILTER (WHERE status = 'converted')::DECIMAL / COUNT(*) * 100)
                END
            FROM public.leads l 
            WHERE (location_id IS NULL OR l.practice_location_id = location_id)
        ), 0);
END;
$$;

-- 6. RLS Setup
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies - Using Pattern 1 for user_profiles, Pattern 2 for others

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for most tables
CREATE POLICY "users_view_practice_locations"
ON public.practice_locations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_manage_practice_locations"
ON public.practice_locations
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('super_admin', 'practice_admin')
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('super_admin', 'practice_admin')
));

-- Patients - accessible by practice staff
CREATE POLICY "staff_access_patients"
ON public.patients
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- Appointments - accessible by practice staff
CREATE POLICY "staff_access_appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- Leads - accessible by practice staff
CREATE POLICY "staff_access_leads"
ON public.leads
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- Treatments - accessible by practice staff
CREATE POLICY "staff_access_treatments"
ON public.treatments
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- Payments - accessible by practice staff
CREATE POLICY "staff_access_payments"
ON public.payments
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- Lead activities - accessible by practice staff
CREATE POLICY "staff_access_lead_activities"
ON public.lead_activities
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- Patient communications - accessible by practice staff
CREATE POLICY "staff_access_patient_communications"
ON public.patient_communications
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- Compliance records - accessible by practice staff
CREATE POLICY "staff_access_compliance_records"
ON public.compliance_records
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- System activities - read-only for staff
CREATE POLICY "staff_view_system_activities"
ON public.system_activities
FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- Revenue records - read-only for staff
CREATE POLICY "staff_view_revenue_records"
ON public.revenue_records
FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.is_active = true
));

-- 8. Triggers and Functions

-- Function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'receptionist')::public.user_role
  );  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER treatments_updated_at BEFORE UPDATE ON public.treatments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    dentist_uuid UUID := gen_random_uuid();
    receptionist_uuid UUID := gen_random_uuid();
    location_uuid UUID := gen_random_uuid();
    patient1_uuid UUID := gen_random_uuid();
    patient2_uuid UUID := gen_random_uuid();
    patient3_uuid UUID := gen_random_uuid();
    patient4_uuid UUID := gen_random_uuid();
    patient5_uuid UUID := gen_random_uuid();
    lead1_uuid UUID := gen_random_uuid();
    lead2_uuid UUID := gen_random_uuid();
    appointment1_uuid UUID := gen_random_uuid();
    appointment2_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@dentalcrm.com', crypt('AdminPass123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Dr. Sarah Smith", "role": "practice_admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (dentist_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'dentist@dentalcrm.com', crypt('DentistPass123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Dr. Michael Johnson", "role": "dentist"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (receptionist_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'reception@dentalcrm.com', crypt('ReceptionPass123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Emma Wilson", "role": "receptionist"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create practice location
    INSERT INTO public.practice_locations (id, name, address, postcode, phone, email) VALUES
        (location_uuid, 'Central Dental Practice', '123 High Street, London', 'SW1A 1AA', '+44 20 7123 4567', 'info@centraldental.co.uk');

    -- Create patients
    INSERT INTO public.patients (
        id, patient_number, first_name, last_name, email, phone, date_of_birth, 
        address, postcode, status, treatment_type, insurance_provider, 
        communication_preference, notes, practice_location_id, assigned_dentist_id
    ) VALUES
        (patient1_uuid, 'P001', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+44 7700 900123', 
         '1985-03-15', '45 Oak Avenue, London', 'SW2 3BB', 'active', 'orthodontics', 'Bupa', 
         'email', 'Regular checkups, good oral hygiene', location_uuid, dentist_uuid),
        (patient2_uuid, 'P002', 'Michael', 'Brown', 'michael.brown@email.com', '+44 7700 900456',
         '1978-08-22', '78 Pine Road, London', 'SW3 4CC', 'active', 'implants', 'Denplan',
         'phone', 'Needs follow-up for implant healing', location_uuid, dentist_uuid),
        (patient3_uuid, 'P003', 'Emma', 'Wilson', 'emma.wilson@email.com', '+44 7700 900789',
         '1992-11-08', '12 Cedar Close, London', 'SW4 5DD', 'inactive', 'general', 'NHS',
         'sms', 'Completed treatment, schedule follow-up', location_uuid, dentist_uuid),
        (patient4_uuid, 'P004', 'James', 'Thompson', 'james.thompson@email.com', '+44 7700 900012',
         '1965-05-30', '89 Maple Street, London', 'SW5 6EE', 'active', 'cosmetic', 'Private',
         'email', 'Whitening treatment in progress', location_uuid, dentist_uuid),
        (patient5_uuid, 'P005', 'Lisa', 'Davis', 'lisa.davis@email.com', '+44 7700 900345',
         '1990-12-12', '56 Birch Lane, London', 'SW6 7FF', 'prospective', 'orthodontics', 'Bupa',
         'email', 'New consultation scheduled', location_uuid, dentist_uuid);

    -- Create leads
    INSERT INTO public.leads (
        id, lead_number, first_name, last_name, email, phone, postcode, source, status,
        treatment_interest, estimated_value, notes, assigned_to_id, practice_location_id
    ) VALUES
        (lead1_uuid, 'L001', 'David', 'Roberts', 'david.roberts@email.com', '+44 7700 900999',
         'SW7 8GG', 'google_ads', 'qualified', 'implants', 8500.00, 
         'Interested in dental implants, high value lead', receptionist_uuid, location_uuid),
        (lead2_uuid, 'L002', 'Sophie', 'Taylor', 'sophie.taylor@email.com', '+44 7700 900888',
         'SW8 9HH', 'website', 'new', 'cosmetic', 3200.00,
         'Inquiry about teeth whitening', receptionist_uuid, location_uuid);

    -- Create appointments
    INSERT INTO public.appointments (
        id, appointment_number, patient_id, dentist_id, practice_location_id,
        appointment_date, start_time, end_time, treatment_type, status,
        notes, estimated_cost, deposit_required, deposit_paid
    ) VALUES
        (appointment1_uuid, 'A001', patient1_uuid, dentist_uuid, location_uuid,
         '2025-01-15', '09:00', '10:00', 'orthodontics', 'scheduled',
         'Routine orthodontic adjustment', 150.00, 0.00, 0.00),
        (appointment2_uuid, 'A002', patient2_uuid, dentist_uuid, location_uuid,
         '2025-01-10', '14:00', '15:30', 'implants', 'confirmed',
         'Implant follow-up consultation', 200.00, 50.00, 50.00);

    -- Create treatments
    INSERT INTO public.treatments (
        patient_id, dentist_id, appointment_id, treatment_type, procedure_name,
        description, status, estimated_cost, actual_cost
    ) VALUES
        (patient1_uuid, dentist_uuid, appointment1_uuid, 'orthodontics', 'Braces Adjustment',
         'Monthly orthodontic adjustment and monitoring', 'in_progress', 150.00, 150.00),
        (patient4_uuid, dentist_uuid, null, 'cosmetic', 'Teeth Whitening',
         'Professional teeth whitening treatment', 'completed', 400.00, 400.00);

    -- Create payments
    INSERT INTO public.payments (
        payment_reference, patient_id, amount, payment_method, status,
        payment_date, description, processed_by_id
    ) VALUES
        ('PAY001', patient4_uuid, 400.00, 'card', 'paid', CURRENT_DATE - INTERVAL '5 days',
         'Teeth whitening treatment payment', receptionist_uuid),
        ('PAY002', patient1_uuid, 150.00, 'direct_debit', 'paid', CURRENT_DATE - INTERVAL '2 days',
         'Monthly orthodontic payment', receptionist_uuid),
        ('PAY003', patient2_uuid, 50.00, 'card', 'paid', CURRENT_DATE - INTERVAL '1 day',
         'Appointment deposit', receptionist_uuid);

    -- Create system activities for dashboard
    INSERT INTO public.system_activities (
        activity_type, description, patient_id, user_id, appointment_id
    ) VALUES
        ('patient_registration', 'New patient registered: Sarah Johnson', patient1_uuid, receptionist_uuid, null),
        ('appointment_booking', 'Appointment booked for Michael Brown', patient2_uuid, receptionist_uuid, appointment2_uuid),
        ('payment_received', 'Payment received from James Thompson', patient4_uuid, receptionist_uuid, null),
        ('treatment_completion', 'Teeth whitening completed for James Thompson', patient4_uuid, dentist_uuid, null),
        ('lead_conversion', 'Lead converted to patient: Lisa Davis', patient5_uuid, receptionist_uuid, null);

    -- Create revenue records for analytics
    INSERT INTO public.revenue_records (
        record_date, practice_location_id, treatment_type, revenue_amount, 
        patient_count, appointment_count, new_patient_count
    ) VALUES
        (CURRENT_DATE - INTERVAL '30 days', location_uuid, 'orthodontics', 4500.00, 15, 18, 3),
        (CURRENT_DATE - INTERVAL '29 days', location_uuid, 'implants', 8500.00, 5, 6, 1),
        (CURRENT_DATE - INTERVAL '28 days', location_uuid, 'cosmetic', 3200.00, 8, 10, 2),
        (CURRENT_DATE - INTERVAL '27 days', location_uuid, 'general', 2800.00, 12, 15, 1),
        (CURRENT_DATE - INTERVAL '26 days', location_uuid, 'orthodontics', 3900.00, 13, 16, 2),
        (CURRENT_DATE - INTERVAL '25 days', location_uuid, 'implants', 12000.00, 7, 8, 2),
        (CURRENT_DATE - INTERVAL '24 days', location_uuid, 'cosmetic', 4100.00, 9, 12, 1),
        (CURRENT_DATE - INTERVAL '23 days', location_uuid, 'general', 3600.00, 14, 18, 3);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;

-- 10. Create cleanup function for development
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs for test data
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email IN ('admin@dentalcrm.com', 'dentist@dentalcrm.com', 'reception@dentalcrm.com');

    -- Delete in dependency order (children first, then auth.users last)
    DELETE FROM public.system_activities WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.revenue_records WHERE practice_location_id IN (
        SELECT id FROM public.practice_locations WHERE name = 'Central Dental Practice'
    );
    DELETE FROM public.payments WHERE processed_by_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.lead_activities WHERE performed_by_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.treatments;
    DELETE FROM public.appointments WHERE dentist_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.leads WHERE assigned_to_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.patients WHERE assigned_dentist_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.practice_locations WHERE name = 'Central Dental Practice';
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);

    -- Delete auth.users last (after all references are removed)
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);

    RAISE NOTICE 'Test data cleanup completed successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;