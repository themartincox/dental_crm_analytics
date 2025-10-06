-- Seed: Pear Tree Dental (real instance skeleton)
-- Organization
insert into public.client_organizations (id, organization_name, organization_type, status, subscription_tier, contact_email, contact_phone, created_at)
values ('11111111-1111-1111-1111-111111111111','Pear Tree Dental','clinic','active','pro','hello@peartreedental.co.uk','020 7000 0000', now())
on conflict (id) do update set organization_name = excluded.organization_name;

-- Users
insert into public.user_profiles (id, email, full_name, role, is_active, client_organization_id, created_at)
values 
  ('11111111-1111-1111-1111-111111111112','owner@peartreedental.co.uk','Pear Tree Owner','practice_admin',true,'11111111-1111-1111-1111-111111111111', now()),
  ('11111111-1111-1111-1111-111111111113','manager@peartreedental.co.uk','Pear Tree Manager','manager',true,'11111111-1111-1111-1111-111111111111', now()),
  ('11111111-1111-1111-1111-111111111114','reception@peartreedental.co.uk','Pear Tree Reception','receptionist',true,'11111111-1111-1111-1111-111111111111', now())
on conflict (id) do update set email = excluded.email;

-- Permissions (finance: read for manager, write for admin, none for receptionist)
insert into public.client_module_permissions (id, client_organization_id, module_name, permission_level, is_enabled, granted_at)
values
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111111','finance','admin',true, now())
on conflict do nothing;

-- UI settings and branding defaults
insert into public.client_ui_settings (client_organization_id, public_footer_enabled, public_footer_variant, internal_footer_enabled)
values ('11111111-1111-1111-1111-111111111111', true, 'compact', true)
on conflict (client_organization_id) do nothing;

insert into public.client_branding (client_organization_id, practice_name, logo_url, primary_color, secondary_color_1, secondary_color_2, secondary_color_3, font_family)
values ('11111111-1111-1111-1111-111111111111','Pear Tree Dental','', '#2563eb', '#14b8a6', '#f59e0b', '#ef4444', 'Inter')
on conflict (client_organization_id) do nothing;

