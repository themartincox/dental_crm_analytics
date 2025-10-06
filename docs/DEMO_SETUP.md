Demo Setup Guide

1) Apply migrations
- Ensure your Supabase project exists and SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set for the server.
- Run the SQL in supabase/migrations in order (or use Supabase CLI to apply migrations).
  - Includes tables for UI settings/branding and branding storage bucket policies.

2) Seed demo data
- Option A: Run the seed SQL files in supabase/seeds directly in Supabase SQL editor:
  - 20251006_seed_peartree_dental.sql (real tenant skeleton)
  - 20251006_seed_dummy_clinic.sql (demo tenant with sample data)
- Option B: Write your own seeds referencing these files.

3) Configure environment
- Frontend (.env):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_API_URL=http://localhost:3001/api
  - (Optional UI flags) VITE_SHOW_GDC_PUBLIC_FOOTER=true, VITE_SHOW_COMPACT_INTERNAL_FOOTER=true
- Server (.env):
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - FRONTEND_URL=http://localhost:4028 (dev) or http://localhost:4173 (preview)

4) Create users and assign roles
- In user_profiles, create rows with id matching Supabase auth users:
  - practice_admin, manager, receptionist for each tenant (client_organization_id)
  - super_admin for system owner
- Ensure is_active=true and client_organization_id set.

5) Launch
- Server: node server/index.js (or your process manager)
- Frontend Dev: npm run dev (http://localhost:4028)
- Frontend Preview: npm run build && npm run serve (http://localhost:4173)

6) Demo flow
- System Owner (/admin): KPIs + Feature Adoption, UI Settings (Tenant), Branding (Tenant), permissions.
- Tenant Admin: Dashboard KPIs, Patients/Leads CRUD, Memberships (apps/members/plans/analytics), Scheduler with cancel + SSE, Booking Confirmation (simulated payment).
- Branding: /settings/branding — logo upload, colors, font; confirm theme application across app.

7) Notes
- Payments are simulated (no Stripe integration yet).
- Scheduler supports cancel and now create/edit via API; realtime refresh via SSE.
- Branding bucket is public by default; restrict if needed and switch to signed URLs.

