-- Create client_ui_settings for per-tenant UI footers and variants
create table if not exists public.client_ui_settings (
  client_organization_id uuid primary key references public.client_organizations(id) on delete cascade,
  public_footer_enabled boolean default true,
  public_footer_variant text check (public_footer_variant in ('full','compact')) default 'compact',
  internal_footer_enabled boolean default true,
  updated_at timestamp with time zone default now()
);

-- Create client_branding for per-tenant branding and practice details
create table if not exists public.client_branding (
  client_organization_id uuid primary key references public.client_organizations(id) on delete cascade,
  practice_name text,
  logo_url text,
  primary_color text,
  secondary_color_1 text,
  secondary_color_2 text,
  secondary_color_3 text,
  font_family text,
  updated_at timestamp with time zone default now()
);

-- Simple RLS model (optional - adjust as needed)
alter table public.client_ui_settings enable row level security;
alter table public.client_branding enable row level security;

do $$ begin
  create policy client_ui_settings_tenant_select on public.client_ui_settings
    for select using (
      exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.client_organization_id = client_ui_settings.client_organization_id)
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy client_branding_tenant_select on public.client_branding
    for select using (
      exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.client_organization_id = client_branding.client_organization_id)
    );
exception when duplicate_object then null; end $$;

-- Admin can manage via service role; tenant writes guarded by API layer
