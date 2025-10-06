-- Seed: Demo Clinic with data
insert into public.client_organizations (id, organization_name, organization_type, status, subscription_tier, contact_email, contact_phone, created_at)
values ('22222222-2222-2222-2222-222222222222','Demo Clinic','clinic','active','pro','hello@democlinic.co.uk','020 7111 1111', now())
on conflict (id) do update set organization_name = excluded.organization_name;

insert into public.user_profiles (id, email, full_name, role, is_active, client_organization_id, created_at)
values 
  ('22222222-2222-2222-2222-222222222223','owner@democlinic.co.uk','Demo Clinic Owner','practice_admin',true,'22222222-2222-2222-2222-222222222222', now()),
  ('22222222-2222-2222-2222-222222222224','manager@democlinic.co.uk','Demo Manager','manager',true,'22222222-2222-2222-2222-222222222222', now()),
  ('22222222-2222-2222-2222-222222222225','reception@democlinic.co.uk','Demo Reception','receptionist',true,'22222222-2222-2222-2222-222222222222', now())
on conflict (id) do update set email = excluded.email;

insert into public.client_module_permissions (id, client_organization_id, module_name, permission_level, is_enabled, granted_at)
values
  (gen_random_uuid(),'22222222-2222-2222-2222-222222222222','finance','read',true, now())
on conflict do nothing;

insert into public.client_ui_settings (client_organization_id, public_footer_enabled, public_footer_variant, internal_footer_enabled)
values ('22222222-2222-2222-2222-222222222222', true, 'full', true)
on conflict (client_organization_id) do nothing;

insert into public.client_branding (client_organization_id, practice_name, logo_url, primary_color, secondary_color_1, secondary_color_2, secondary_color_3, font_family)
values ('22222222-2222-2222-2222-222222222222','Demo Clinic','', '#0ea5e9', '#10b981', '#f97316', '#ef4444', 'Poppins')
on conflict (client_organization_id) do nothing;

-- Seed patients
insert into public.patients (id, first_name, last_name, email, phone, date_of_birth, patient_status, client_organization_id, created_at)
values
  (gen_random_uuid(),'Sarah','Johnson','sarah.johnson@example.com','07700 900123','1990-03-12','active','22222222-2222-2222-2222-222222222222', now()),
  (gen_random_uuid(),'Michael','Brown','michael.brown@example.com','07700 900456','1985-07-21','active','22222222-2222-2222-2222-222222222222', now()),
  (gen_random_uuid(),'Emma','Wilson','emma.wilson@example.com','07700 900789','1992-11-05','inactive','22222222-2222-2222-2222-222222222222', now());

-- Seed leads
insert into public.leads (id, first_name, last_name, email, phone, lead_source, lead_status, interest_level, estimated_value, client_organization_id, created_at)
values
  (gen_random_uuid(),'James','Thompson','james.t@example.com','07700 900012','google-ads','qualified','high',1200,'22222222-2222-2222-2222-222222222222', now()),
  (gen_random_uuid(),'Lisa','Davis','lisa.d@example.com','07700 900345','referral','new','medium',800,'22222222-2222-2222-2222-222222222222', now());

-- Seed appointments (dates relative to now not supported in SQL here; using static demo)
insert into public.appointments (id, appointment_date, start_time, end_time, status, treatment_type, patient_id, dentist_id, practice_location_id, client_organization_id, created_at)
select gen_random_uuid(), current_date + 1, '09:00','10:00','confirmed','consultation', p.id, null, null, '22222222-2222-2222-2222-222222222222', now() from public.patients p where p.email='sarah.johnson@example.com';
insert into public.appointments (id, appointment_date, start_time, end_time, status, treatment_type, patient_id, dentist_id, practice_location_id, client_organization_id, created_at)
select gen_random_uuid(), current_date + 2, '10:30','12:00','confirmed','treatment', p.id, null, null, '22222222-2222-2222-2222-222222222222', now() from public.patients p where p.email='michael.brown@example.com';

-- Seed payments
insert into public.payments (id, amount, payment_method, status, payment_date, description, patient_id, client_organization_id, created_at)
select gen_random_uuid(), 150.00, 'card','paid', current_date - 5, 'Deposit for consultation', p.id, '22222222-2222-2222-2222-222222222222', now() from public.patients p where p.email='sarah.johnson@example.com';

