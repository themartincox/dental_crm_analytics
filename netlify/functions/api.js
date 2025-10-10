// Netlify Function: Unified API for public endpoints
// Routes handled:
//  - POST /api/public/waitlist
//  - POST /api/public/tenants/signup
//
// Requires env vars on Netlify site:
//  - SUPABASE_URL
//  - SUPABASE_SERVICE_ROLE_KEY
//
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const json = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});

const text = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extraHeaders,
  },
  body,
});

const DEBUG = process.env.DEBUG_API_ERRORS === '1';
function makeClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const msg = 'Supabase env vars missing (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)';
    if (DEBUG) console.error(msg, { urlPresent: !!url, keyPresent: !!key });
  }
  return createClient(url, key);
}
const supabase = makeClient();

const fail = (msg, err) => {
  if (DEBUG && err) {
    return json(500, { error: msg, details: err?.message || err, code: err?.code });
  }
  return json(500, { error: msg });
};

const parseBody = (event) => {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch (_) {
    return {};
  }
};

const pathAfter = (path, marker) => {
  const idx = path.indexOf(marker);
  if (idx === -1) return '';
  return path.slice(idx + marker.length);
};

// Handlers
async function handleWaitlist(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const body = parseBody(event);
  const required = ['firstName', 'lastName', 'email'];
  for (const r of required) {
    if (!body[r]) return json(400, { error: `Missing ${r}` });
  }

  const leadNumber = `AES-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const payload = {
    id: randomUUID(),
    lead_number: leadNumber,
    first_name: body.firstName,
    last_name: body.lastName,
    email: body.email,
    phone: body.phone || null,
    source: 'website',
    status: 'new',
    treatment_interest: body.interest || null,
    notes: `Waitlist signup${body.practiceName ? ` - Practice: ${body.practiceName}` : ''}`,
    utm_source: body.utm_source || 'aescrm_landing',
    utm_medium: body.utm_medium || 'waitlist_form',
    utm_campaign: body.utm_campaign || 'pre_launch_waitlist',
  };

  const { data, error } = await supabase.from('leads').insert(payload).select().single();
  if (error) return fail('Failed to submit waitlist', error);

  // Best-effort logs
  try {
    await supabase.rpc('log_security_event', {
      action_type: 'public_waitlist_signup',
      resource_type: 'marketing',
      risk_level: 'low',
      additional_metadata: { lead_number: leadNumber, email: body.email },
    });
  } catch (_) {}

  try {
    await supabase.from('email_logs').insert([
      {
        to_email: 'martin@postino.cc',
        subject: `New Waitlist Signup - ${leadNumber}`,
        template: 'waitlist_notification',
        data: payload,
        status: 'pending',
      },
      {
        to_email: body.email,
        subject: "Welcome to AES CRM Waitlist - You're In!",
        template: 'waitlist_welcome',
        data: { lead_number: leadNumber, first_name: body.firstName, last_name: body.lastName },
        status: 'pending',
      },
    ]);
  } catch (_) {}

  return json(201, { ok: true, data });
}

async function handleTenantSignup(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const body = parseBody(event);
  if (!body.organization_name || !body.contact_email) return json(400, { error: 'Missing organization_name or contact_email' });

  const insert = {
    id: randomUUID(),
    organization_name: body.organization_name,
    contact_email: body.contact_email,
    contact_phone: body.contact_phone || null,
    status: 'pending_approval',
    subscription_tier: body.subscription_tier || 'basic',
  };

  const { data, error } = await supabase
    .from('client_organizations')
    .insert(insert)
    .select('id, organization_name, status, subscription_tier, contact_email, contact_phone, created_at')
    .single();
  if (error) return fail('Failed to submit tenant signup', error);

  try {
    await supabase.rpc('log_security_event', {
      action_type: 'public_tenant_signup',
      resource_type: 'client_organizations',
      risk_level: 'low',
      additional_metadata: { id: data.id, email: data.contact_email },
    });
  } catch (_) {}

  try {
    await supabase.from('email_logs').insert([
      {
        to_email: 'martin@postino.cc',
        subject: `New Clinic Signup - ${data.organization_name}`,
        template: 'tenant_signup_notification',
        data,
        status: 'pending',
      },
      {
        to_email: data.contact_email,
        subject: 'Thanks for signing up — pending approval',
        template: 'tenant_signup_thanks',
        data: { organization_name: data.organization_name },
        status: 'pending',
      },
    ]);
  } catch (_) {}

  return json(201, { ok: true, data });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return text(200, 'OK');

// Support both redirected path (/api/...) and direct function path (/\.netlify/functions/api/...)
let subpath = '';
if (event.path.startsWith('/.netlify/functions/api')) {
  subpath = pathAfter(event.path, '/.netlify/functions/api');
} else if (event.path.startsWith('/api')) {
  subpath = pathAfter(event.path, '/api');
} else {
  subpath = event.path || ''; // fallback
}
if (subpath.endsWith('/')) subpath = subpath.slice(0, -1);

const rawUrl = event.rawUrl || '';
if (subpath.startsWith('/public/waitlist') || rawUrl.includes('/public/waitlist')) {
  return handleWaitlist(event);
}
if (subpath.startsWith('/public/tenants/signup') || rawUrl.includes('/public/tenants/signup')) {
  return handleTenantSignup(event);
}

  return json(404, { error: 'Not found' });
};
