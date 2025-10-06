-- Create a public branding bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

-- Enable RLS (Supabase enables by default for storage.objects)
-- Policies for branding bucket
do $$ begin
  create policy "branding_public_read" on storage.objects
    for select using (bucket_id = 'branding');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "branding_authenticated_insert" on storage.objects
    for insert to authenticated with check (bucket_id = 'branding');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "branding_authenticated_update" on storage.objects
    for update to authenticated using (bucket_id = 'branding') with check (bucket_id = 'branding');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "branding_authenticated_delete" on storage.objects
    for delete to authenticated using (bucket_id = 'branding');
exception when duplicate_object then null; end $$;

-- NOTE: This policy set allows any authenticated user to write to the branding bucket.
-- For stricter multitenancy, consider path-based checks and a storage function to enforce
-- paths like 'branding/<client_organization_id>/*' based on the caller's tenant from user_profiles.

