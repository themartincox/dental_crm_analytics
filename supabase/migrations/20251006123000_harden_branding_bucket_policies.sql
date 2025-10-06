-- Harden branding bucket: make private and scope by tenant path

-- Ensure bucket exists then make it private
insert into storage.buckets (id, name, public)
values ('branding','branding', false)
on conflict (id) do update set public = false;

-- Drop permissive policies if they exist
do $$ begin
  drop policy if exists "branding_public_read" on storage.objects;
  drop policy if exists "branding_authenticated_insert" on storage.objects;
  drop policy if exists "branding_authenticated_update" on storage.objects;
  drop policy if exists "branding_authenticated_delete" on storage.objects;
exception when undefined_object then null; end $$;

-- Helper condition repeated in policies:
-- Allow access when bucket is 'branding' and object path starts with the caller's client_organization_id
-- or the caller is super_admin.

-- SELECT
do $$ begin
  create policy branding_select_scoped on storage.objects
    for select to authenticated using (
      bucket_id = 'branding' and (
        exists (
          select 1 from public.user_profiles up
          where up.id = auth.uid()
            and (
              up.role = 'super_admin' or
              name like (up.client_organization_id::text || '/%')
            )
        )
      )
    );
exception when duplicate_object then null; end $$;

-- INSERT
do $$ begin
  create policy branding_insert_scoped on storage.objects
    for insert to authenticated with check (
      bucket_id = 'branding' and (
        exists (
          select 1 from public.user_profiles up
          where up.id = auth.uid()
            and (
              up.role = 'super_admin' or
              name like (up.client_organization_id::text || '/%')
            )
        )
      )
    );
exception when duplicate_object then null; end $$;

-- UPDATE
do $$ begin
  create policy branding_update_scoped on storage.objects
    for update to authenticated using (
      bucket_id = 'branding' and (
        exists (
          select 1 from public.user_profiles up
          where up.id = auth.uid()
            and (
              up.role = 'super_admin' or
              name like (up.client_organization_id::text || '/%')
            )
        )
      )
    ) with check (
      bucket_id = 'branding' and (
        exists (
          select 1 from public.user_profiles up
          where up.id = auth.uid()
            and (
              up.role = 'super_admin' or
              name like (up.client_organization_id::text || '/%')
            )
        )
      )
    );
exception when duplicate_object then null; end $$;

-- DELETE
do $$ begin
  create policy branding_delete_scoped on storage.objects
    for delete to authenticated using (
      bucket_id = 'branding' and (
        exists (
          select 1 from public.user_profiles up
          where up.id = auth.uid()
            and (
              up.role = 'super_admin' or
              name like (up.client_organization_id::text || '/%')
            )
        )
      )
    );
exception when duplicate_object then null; end $$;

