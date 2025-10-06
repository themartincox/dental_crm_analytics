AES CRM — Product Overview and Demo Guide

1. What The App Does
- AES CRM is a React + Vite dental practice CRM with role-based access control and a secure Node/Express API backed by Supabase. It covers:
  - Patient and lead management, appointment scheduling, payments
  - Marketing and operational analytics dashboards
  - Membership program management (applications, plans, active members)
  - System Owner (multi-tenant) admin: client organizations, module permissions, audit log
  - Embeddable booking widget + public booking interface

2. Security Model (High Level)
- Auth: Supabase JWT; client attaches token automatically via secureApiService.
- API: Express server validates JWT and enforces roles (RBAC) on every request.
- CSP + CORS hardened; sensitive endpoints set Cache-Control: no-store.
- Service Worker: never caches authenticated/API/Supabase requests.
- Realtime: Server-Sent Events (SSE) relays membership and appointment changes from Supabase to the browser (no direct Supabase on client).

3. How To Run (Local Demo)
- Requirements: Node 18+, Supabase project (or use mocked pages)
- Env: Copy .env.example to .env and fill:
  - Frontend: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL (e.g., http://localhost:3001/api)
  - Server: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FRONTEND_URL (http://localhost:4028 for dev or http://localhost:4173 for preview)
- Dev: npm run dev (frontend) and start server (node server/index.js) with .env present
- Build + Preview: npm run build && npm run serve (preview at http://localhost:4173)

4. Routes and Access
- Public: / (marketing), /pricing, /contact, /booking-widget, /public-booking, /ai-usage-policy
- Auth required (ProtectedRoute):
  - /dashboard — practice KPIs + recent appointments
  - /patients — patient management
  - /appointments — scheduler/calendar + booking
  - /leads — lead pipeline
  - /memberships — membership program management
  - /widgets — widget configuration dashboard
  - /analytics/* — analytics dashboards (leads, practice overview, cross-site, patient journey)
  - /compliance — compliance & ops monitoring
  - /admin — System Owner Admin (super_admin only)

5. Dashboards and What To Look For
- Dashboard (/dashboard)
  - Cards: total patients, appointments, leads, revenue
  - Recent Appointments list with status badges and locations
  - Quick Actions to navigate to Patients/Leads/Scheduler
- Patients (/patients)
  - Directory of patients; CRUD via secure API
  - Typical fields: name, contact info, status, insurer, assigned dentist
- Appointments (/appointments)
  - Calendar: day/week/month views; drag-and-drop; mock dataset by default
  - SSE endpoint available for live updates (appointments)
  - Flows: create/edit appointment, detect conflicts, propose alternative times
- Leads (/leads)
  - Pipeline metrics, lead cards with filters (source/status), team performance
- Analytics (/analytics/*)
  - Leads: funnel, source rankings, geography, conversion scores
  - Practice overview: key metrics, trends, revenue charts
  - Cross-site (for marketing teams): performance charts, A/B results, site health
  - Patient journey revenue optimization: lifecycle analytics, predictive insights
- Compliance (/compliance)
  - Integration health, status cards, compliance score, audit visualization
- Memberships (/memberships)
  - Applications, Members Directory, Plan Configuration, Analytics
  - Realtime via SSE (applications + memberships)
- Widget Configuration (/widgets)
  - Build and theme a booking widget; preview and deployment analytics
- System Owner Admin (/admin)
  - Clients: organizations, seats/modules, pricing
  - Permissions: module permission levels per client; audit log (read-only)

6. Data Flows (Now Routed Through Secure API)
- Patients
  - Routes: GET/POST/PUT/DELETE /api/patients
  - Validation: Zod schema on POST/PUT
- Appointments
  - Routes: GET/POST/PUT/DELETE /api/appointments (+ summary/conflicts/availability/status helpers)
  - Realtime: SSE /api/events/appointments/stream; client helper in appointmentsRealtimeService
- Leads
  - Routes: GET/POST/PUT /api/leads
  - Validation: Zod schema on POST/PUT
- Payments
  - Routes: GET/POST /api/payments
  - Validation: Zod schema on POST
- Memberships
  - Routes: /api/memberships/* (applications, plans, memberships, analytics)
  - Realtime: SSE /api/events/memberships/stream
- System Owner Admin
  - Routes: /api/admin/* (clients, modules, bulk actions, permissions, logs)

7. Realtime Usage (Examples)
- Memberships: subscribe via membershipRealtimeService in src/services/membershipService.js
  - subscribeToApplications(cb) or subscribeToMemberships(cb) — listens to server SSE stream
- Appointments: subscribe via appointmentsRealtimeService in src/services/dentalCrmService.js
  - appointmentsRealtimeService.subscribe(cb) — receive appointment_update events

8. Security and Compliance Notes
- JWT checked server-side on every request, role enforced per-route
- CSP and CORS locked down to FRONTEND_URL and Supabase URL
- Sensitive responses set Cache-Control: no-store
- Service Worker bypasses caching for /api and any Authorization-bearing requests

9. Demo Expectations and Seed Data
- To make dashboards meaningful, seed:
  - Patients: ~50
  - Appointments: 2–3 weeks of data (mix of statuses)
  - Leads: ~25 (multiple sources and statuses)
  - Payments: several ‘paid’ entries to populate revenue
  - Memberships: a few plans, pending/approved applications, active members

10. Troubleshooting
- 401/403 errors
  - Ensure Supabase keys/envs are correct and user_profiles has an active role
- Blank dashboards
  - Confirm API is running and FRONTEND_URL matches; seed data in tables
- Realtime not firing
  - SSE requires open connection; check browser console and network tab for event-stream
  - Ensure Supabase Realtime is enabled and Postgres changes are allowed on those tables

11. Extensibility Checklist
- Add validators to remaining endpoints (appointments create/update, etc.)
- Replace mocked scheduler data with actual API-backed data + SSE
- Add strict Content-Security-Policy without 'unsafe-inline' (move inline CSS)
- Add server tests for critical endpoints and roles

This guide should help you navigate the app, verify data paths, and operate a clinic demo with realistic data and guardrails in place.

