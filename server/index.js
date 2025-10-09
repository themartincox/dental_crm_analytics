// Server-side API layer to address F2 - protecting Supabase keys
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');
const cron = require('node-cron');
const { z } = require('zod');
require('dotenv')?.config();

const { createClient } = require('@supabase/supabase-js');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
const PORT = process.env?.PORT || 3001;

// F6 - Security headers
app?.use(helmet());
// Content Security Policy tuned for app + Supabase
const supabaseUrl = process.env?.SUPABASE_URL || '';
try {
    app?.use(helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "base-uri": ["'self'"],
            "font-src": ["'self'", "https:", "data:"],
            "img-src": ["'self'", "https:", "data:"],
            "script-src": ["'self'", "'unsafe-inline'", "https:"],
            "style-src": ["'self'", "'unsafe-inline'", "https:"],
            "connect-src": ["'self'", supabaseUrl || "https:"],
            "frame-ancestors": ["'none'"],
            "form-action": ["'self'"]
        }
    }));
} catch (_) {
    // If CSP fails to initialize, continue without it rather than crashing
}

// F2 - Server-side Supabase client with service key (secure)
const supabase = createClient(
    process.env?.SUPABASE_URL,
    process.env?.SUPABASE_SERVICE_ROLE_KEY // Server-side only key
);

// F6 - Encryption utility functions
const ENCRYPTION_KEY = process.env?.ENCRYPTION_KEY || crypto?.lib?.WordArray?.random(256/8)?.toString();

const encryptSensitiveData = (data) => {
    try {
        return crypto?.AES?.encrypt(JSON.stringify(data), ENCRYPTION_KEY)?.toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

const decryptSensitiveData = (encryptedData) => {
    try {
        const bytes = crypto?.AES?.decrypt(encryptedData, ENCRYPTION_KEY);
        return JSON.parse(bytes?.toString(crypto?.enc?.Utf8));
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

// Middleware
app?.use(cors({
    origin: process.env?.FRONTEND_URL || 'http://localhost:4028',
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Request-ID','X-Required-Role']
}));
app?.use(express?.json({ limit: '10mb' }));
// Additional security headers (server responses)
try {
    app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
    app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
    app.use((req, res, next) => { res.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()'); next(); });
} catch (_) {}
// Optional CSRF protection (feature-flagged)
if (process.env.ENABLE_CSRF === '1') {
    try {
        const cookieParser = require('cookie-parser');
        const csrf = require('csurf');
        app.use(cookieParser());
        const csrfProtection = csrf({
            cookie: {
                key: process.env.CSRF_COOKIE_NAME || '_csrf',
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            }
        });
        app.get('/api/csrf-token', csrfProtection, (req, res) => {
            res.json({ csrfToken: req.csrfToken() });
        });
        app.use('/api', (req, res, next) => {
            if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();
            return csrfProtection(req, res, next);
        });
    } catch (e) {
        console.warn('CSRF middleware not enabled (missing deps):', e?.message);
    }
}

// Basic server-side validation and rate limiting (no external deps)
const makeRateLimit = (windowMs = 15 * 60 * 1000, max = 300) => {
    const requests = new Map();
    return (req, res, next) => {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        for (const [key, ts] of requests.entries()) {
            if (ts < windowStart) requests.delete(key);
        }
        const count = Array.from(requests.keys()).filter(k => k.startsWith(ip) && requests.get(k) > windowStart).length;
        if (count >= max) {
            return res.status(429).json({ error: 'Too many requests', retryAfter: Math.ceil(windowMs / 1000) });
        }
        requests.set(`${ip}-${now}`, now);
        next();
    };
};

const sanitizeValue = (val) => {
    if (typeof val === 'string') {
        return val.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '').trim();
    }
    if (Array.isArray(val)) return val.map(sanitizeValue);
    if (val && typeof val === 'object') {
        const out = {}; Object.entries(val).forEach(([k, v]) => { out[k] = sanitizeValue(v); }); return out;
    }
    return val;
};

const sanitizeInput = (req, _res, next) => {
    req.body = sanitizeValue(req.body);
    req.query = sanitizeValue(req.query);
    req.params = sanitizeValue(req.params);
    next();
};

const validateJsonContentType = (req, res, next) => {
    if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();
    const ct = req.get('Content-Type') || '';
    if (!ct.includes('application/json')) {
        return res.status(415).json({ error: 'Unsupported media type', message: 'Content-Type must be application/json' });
    }
    next();
};

// Apply middleware before routes
app?.use(makeRateLimit());
app?.use(validateJsonContentType);
app?.use(sanitizeInput);
// Optional distributed rate limiting (feature-flagged)
try {
    const createRateLimiter = require('./middleware/rateLimit');
    const apiLimiter = createRateLimiter();
    app?.use('/api', apiLimiter);
} catch (_e) {
    // ignore if middleware is unavailable
}

// Simple Zod validation helper
const validateBody = (schema) => (req, res, next) => {
    if (!schema) return next();
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    }
    req.body = result.data;
    next();
};

// F3 - Server-side RBAC validation middleware
const validateAuth = async (req, res, next) => {
    try {
        const authHeader = req?.headers?.authorization;
        if (!authHeader) {
            return res?.status(401)?.json({ error: 'No authorization header' });
        }

        const token = authHeader?.replace('Bearer ', '');
        const { data: { user }, error } = await supabase?.auth?.getUser(token);

        if (error || !user) {
            return res?.status(401)?.json({ error: 'Invalid token' });
        }

        // Get user role from database
        const { data: profile, error: profileError } = await supabase
            ?.from('user_profiles')
            ?.select('role, is_active, client_organization_id')
            ?.eq('id', user?.id)
            ?.single();

        if (profileError || !profile || !profile?.is_active) {
            return res?.status(403)?.json({ error: 'User profile not found or inactive' });
        }

        req.user = { ...user, role: profile?.role, client_organization_id: profile?.client_organization_id };
        
        // Log access for security audit (F4)
        await supabase?.rpc('log_security_event', {
            action_type: 'api_access',
            resource_type: req?.path,
            risk_level: 'low',
            additional_metadata: {
                method: req?.method,
                ip: req?.ip,
                userAgent: req?.get('User-Agent')
            }
        });

        next();
    } catch (error) {
        console.error('Auth validation error:', error);
        res?.status(500)?.json({ error: 'Authentication failed' });
    }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req?.user || !allowedRoles?.includes(req?.user?.role)) {
            return res?.status(403)?.json({ 
                error: 'Insufficient permissions',
                required: allowedRoles,
                current: req?.user?.role 
            });
        }
        next();
    };
};

// Permission utilities
const PERMISSION_LEVELS = { none: 0, read: 1, write: 2, admin: 3 };

const getModulePermissionLevel = async (clientOrgId, moduleName) => {
    if (!clientOrgId || !moduleName) return 'none';
    const { data, error } = await supabase
        .from('client_module_permissions')
        .select('permission_level, is_enabled')
        .eq('client_organization_id', clientOrgId)
        .eq('module_name', moduleName)
        .maybeSingle();
    if (error || !data || data.is_enabled === false) return 'none';
    const level = (data.permission_level || 'none').toLowerCase();
    return ['none','read','write','admin'].includes(level) ? level : 'none';
};

const requireModulePermission = (moduleName, minLevel = 'read') => {
    return async (req, res, next) => {
        try {
            const clientOrgId = req?.user?.client_organization_id;
            const current = await getModulePermissionLevel(clientOrgId, moduleName);
            if (PERMISSION_LEVELS[current] >= PERMISSION_LEVELS[minLevel]) return next();
            return res.status(403).json({ error: 'Insufficient module permission', module: moduleName, required: minLevel, current });
        } catch (e) {
            return res.status(500).json({ error: 'Permission check failed' });
        }
    };
};

// F2 - Secure API endpoints replacing direct Supabase client calls

// Pagination helpers
const getPaging = (req) => {
    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '25', 10) || 25, 1), 200);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    return { page, pageSize, from, to };
};

const setPagingHeaders = (res, { page, pageSize }, totalCount) => {
    const lastPage = Math.max(Math.ceil((totalCount || 0) / (pageSize || 1)), 1);
    res.set('X-Total-Count', String(totalCount || 0));
    res.set('X-Page', String(page));
    res.set('X-Page-Size', String(pageSize));
    res.set('X-Last-Page', String(lastPage));
};

// Simple ETag + cache helper for safe GET responses
const sendCached = (req, res, payload, cacheControl) => {
    try {
        const body = JSON.stringify(payload);
        const etag = crypto.SHA1(body).toString();
        if (cacheControl) res.set('Cache-Control', cacheControl);
        res.set('ETag', etag);
        if ((req.headers['if-none-match'] || '') === etag) {
            return res.status(304).end();
        }
        return res.json(payload);
    } catch (_e) {
        return res.json(payload);
    }
};

// Patient management - restricted to clinical staff
app?.get('/api/patients', validateAuth, requireRole(['super_admin', 'practice_admin', 'dentist', 'hygienist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { page, pageSize, from, to } = getPaging(req);
        const q = (req.query.q || '').toString().trim();
        const allowedSort = ['created_at','last_name','first_name'];
        const sortField = allowedSort.includes((req.query.sortField || '').toString()) ? (req.query.sortField || '').toString() : 'created_at';
        const sortAsc = ((req.query.sortDir || 'desc').toString().toLowerCase() === 'asc');

        let query = supabase.from('patients').select(`
            id, patient_number, first_name, last_name, email, phone,
            date_of_birth, status, treatment_type, insurance_provider,
            created_at, updated_at,
            assigned_dentist:user_profiles!assigned_dentist_id(id, full_name)
        `, { count: 'exact' });

        if (q) {
            query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
        }

        const { data, error, count } = await query
            .order(sortField, { ascending: sortAsc })
            .range(from, to);

        if (error) throw error;

        // F6 - Encrypt sensitive data in transit
        const sanitizedData = (data || []).map(patient => ({
            ...patient,
            email: patient?.email ? encryptSensitiveData(patient?.email) : null,
            phone: patient?.phone ? encryptSensitiveData(patient?.phone) : null,
            date_of_birth: patient?.date_of_birth ? encryptSensitiveData(patient?.date_of_birth) : null
        }));

        const total = typeof count === 'number' ? count : (sanitizedData?.length || 0);
        setPagingHeaders(res, { page, pageSize }, total);
        res.json({ data: sanitizedData, page, pageSize, total, count: total });
    } catch (error) {
        console.error('Get patients error:', error);
        res?.status(500)?.json({ error: 'Failed to fetch patients' });
    }
});

// Lead management - separate from clinical data (F5)
app?.get('/api/leads', validateAuth, requireRole(['super_admin', 'practice_admin', 'manager', 'receptionist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { page, pageSize, from, to } = getPaging(req);
        const q = (req.query.q || '').toString().trim();
        const allowedSort = ['created_at','last_name','first_name','estimated_value'];
        const sortField = allowedSort.includes((req.query.sortField || '').toString()) ? (req.query.sortField || '').toString() : 'created_at';
        const sortAsc = ((req.query.sortDir || 'desc').toString().toLowerCase() === 'asc');

        let query = supabase.from('leads').select(`
            id, lead_number, first_name, last_name, email, phone,
            source, status, treatment_interest, estimated_value,
            created_at, consent_withdrawn_date,
            assigned_to:user_profiles!assigned_to_id(id, full_name)
        `, { count: 'exact' });

        if (q) {
            query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
        }

        const { data, error, count } = await query
            .order(sortField, { ascending: sortAsc })
            .range(from, to);

        if (error) throw error;

        const out = (data || []).map(l => ({
            ...l,
            email: l?.email ? encryptSensitiveData(l.email) : null,
            phone: l?.phone ? encryptSensitiveData(l.phone) : null
        }));

        const total = typeof count === 'number' ? count : (out?.length || 0);
        setPagingHeaders(res, { page, pageSize }, total);
        res.json({ data: out, page, pageSize, total, count: total });
    } catch (error) {
        console.error('Get leads error:', error);
        res?.status(500)?.json({ error: 'Failed to fetch leads' });
    }
});

// User profile management - self-service with admin override
app?.get('/api/profile', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { data, error } = await supabase?.from('user_profiles')?.select('id, email, full_name, role, created_at, last_access_date')?.eq('id', req?.user?.id)?.single();

        if (error) throw error;

        res?.json({ data });
    } catch (error) {
        console.error('Get profile error:', error);
        res?.status(500)?.json({ error: 'Failed to fetch profile' });
    }
});

// Analytics events ingestion (route protected)
app?.post('/api/analytics/events', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const events = Array.isArray(req.body) ? req.body : [];
        if (!events.length) return res.status(400).json({ error: 'No events provided' });

        const normalized = events.map(e => ({
            ...e,
            userId: req.user?.id,
        }));

        const { error } = await supabase
            ?.from('analytics_events')
            ?.insert(normalized);

        if (error) throw error;
        res.json({ ok: true, count: normalized.length });
    } catch (error) {
        console.error('Analytics ingest error:', error);
        res.status(500).json({ error: 'Failed to store analytics events' });
    }
});

// ===== Server-Sent Events for Membership Realtime =====
app?.get('/api/events/memberships/stream', validateAuth, async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders();

    const channel = supabase
        .channel(`sse_memberships_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'membership_applications' }, (payload) => {
            res.write(`event: membership_update\n`);
            res.write(`data: ${JSON.stringify({ table: 'membership_applications', payload })}\n\n`);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships' }, (payload) => {
            res.write(`event: membership_update\n`);
            res.write(`data: ${JSON.stringify({ table: 'memberships', payload })}\n\n`);
        })
        .subscribe();

    const heartbeat = setInterval(() => {
        res.write(`: heartbeat\n\n`);
    }, 25000);

    req.on('close', () => {
        clearInterval(heartbeat);
        try { supabase.removeChannel(channel); } catch (_) {}
        res.end();
    });
});

// F5 - Data retention endpoints (admin only)
app?.post('/api/admin/mark-for-deletion', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        const { data, error } = await supabase?.rpc('mark_for_deletion');

        if (error) throw error;

        await supabase?.rpc('log_security_event', {
            action_type: 'data_retention_mark',
            resource_type: 'bulk_data',
            risk_level: 'medium',
            additional_metadata: { marked_count: data }
        });

        res?.json({ marked_count: data, message: 'Data marked for deletion successfully' });
    } catch (error) {
        console.error('Mark for deletion error:', error);
        res?.status(500)?.json({ error: 'Failed to mark data for deletion' });
    }
});

// Security audit logs (admin only)
app?.get('/api/admin/audit-logs', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        const { data, error } = await supabase?.from('security_audit_logs')?.select(`
                id, user_id, action, resource_type, resource_id,
                success, risk_level, created_at,
                user_profiles!user_id(full_name, email)
            `)?.order('created_at', { ascending: false })?.limit(100);

        if (error) throw error;

        res?.json({ data });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res?.status(500)?.json({ error: 'Failed to fetch audit logs' });
    }
});

// Patients endpoints
app?.get('/api/patients/:id', validateAuth, requireRole(['super_admin','practice_admin','dentist','hygienist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { data, error } = await supabase
            .from('patients')
            .select(`*, practice_locations(id,name,address,phone), assigned_dentist:user_profiles!assigned_dentist_id(id,full_name,email,phone)`) 
            .eq('id', id)
            .single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
});

app?.post('/api/patients', validateAuth, requireRole(['super_admin','practice_admin','dentist']), async (req, res) => {
    const patientCreateSchema = z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        date_of_birth: z.string().optional(),
        patient_status: z.string().optional(),
        treatment_type: z.string().optional(),
        insurance_provider: z.string().optional(),
        practice_location_id: z.string().optional(),
        assigned_dentist_id: z.string().optional()
    }).passthrough();
    try {
        const parsed = patientCreateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        }
        res.set('Cache-Control', 'no-store');
        const { data, error } = await supabase
            .from('patients')
            .insert(parsed.data)
            .select()
            .single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Create patient error:', error);
        res.status(500).json({ error: 'Failed to create patient' });
    }
});

app?.put('/api/patients/:id', validateAuth, requireRole(['super_admin','practice_admin','dentist']), async (req, res) => {
    const patientUpdateSchema = z.object({
        first_name: z.string().min(1).optional(),
        last_name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        date_of_birth: z.string().optional(),
        patient_status: z.string().optional(),
        treatment_type: z.string().optional(),
        insurance_provider: z.string().optional(),
        practice_location_id: z.string().optional(),
        assigned_dentist_id: z.string().optional()
    }).passthrough();
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const parsed = patientUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        }
        const { data, error } = await supabase
            .from('patients')
            .update(parsed.data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

app?.delete('/api/patients/:id', validateAuth, requireRole(['super_admin','practice_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});

// Booking/Payment helpers
app?.get('/api/appointments/:id/summary', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { data: appointment, error } = await supabase.from('appointments').select(`
            *,
            patient:patients(id, first_name, last_name, email, phone),
            dentist:user_profiles!dentist_id(id, full_name),
            practice_location:practice_locations(id, name, address)
        `).eq('id', id).single();
        if (error) throw error;
        const { data: payments } = await supabase.from('payments').select('payment_method, payment_reference').eq('patient_id', appointment?.patient?.id).eq('status', 'paid').limit(3);
        const { data: treatments } = await supabase.from('treatments').select('description, notes').eq('appointment_id', id).limit(10);
        res.json({ data: { appointment, payments: payments || [], treatments: treatments || [] } });
    } catch (error) {
        console.error('Get appointment summary error:', error);
        res.status(500).json({ error: 'Failed to fetch appointment summary' });
    }
});

app?.get('/api/appointments/conflicts', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { dentist_id, appointment_date, exclude_id } = req.query;
        let query = supabase.from('appointments').select('*').eq('dentist_id', dentist_id).eq('appointment_date', appointment_date).in('status', ['confirmed','scheduled']);
        if (exclude_id) query = query.neq('id', exclude_id);
        const { data, error } = await query;
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get conflicts error:', error);
        res.status(500).json({ error: 'Failed to fetch conflicts' });
    }
});

app?.get('/api/appointments/availability', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { dentist_id, date, start_time, duration } = req.query;
        // simplistic availability check: ensure no appointment starts within [start_time, start_time+duration)
        const { data, error } = await supabase.from('appointments').select('id,start_time').eq('dentist_id', dentist_id).eq('appointment_date', date).gte('start_time', start_time);
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Availability error:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

app?.put('/api/appointments/:id/status', validateAuth, requireRole(['super_admin','practice_admin','dentist','receptionist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const schema = z.object({ status: z.string().min(1) });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });
        const { data, error } = await supabase.from('appointments').update({ status: parsed.data.status }).eq('id', id).select().single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ error: 'Failed to update appointment status' });
    }
});

// Appointments endpoints
app?.get('/api/appointments', validateAuth, requireRole(['super_admin','practice_admin','dentist','hygienist','receptionist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { status, dentist_id, practice_location_id, date_from, date_to } = req.query;
        let query = supabase
            .from('appointments')
            .select(`id, appointment_date, status, treatment_type, start_time, end_time, notes, created_at, patient_id, dentist_id, practice_location_id, patients(id,first_name,last_name,email,phone), dentist:user_profiles!dentist_id(id,full_name), practice_locations(id,name,address)`) ;
        if (status) query = query.eq('status', status);
        if (dentist_id) query = query.eq('dentist_id', dentist_id);
        if (practice_location_id) query = query.eq('practice_location_id', practice_location_id);
        if (date_from) query = query.gte('appointment_date', date_from);
        if (date_to) query = query.lte('appointment_date', date_to);
        const { data, error } = await query.order('appointment_date', { ascending: true });
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

app?.get('/api/appointments/:id', validateAuth, requireRole(['super_admin','practice_admin','dentist','hygienist','receptionist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { data, error } = await supabase
            .from('appointments')
            .select(`*, patients(id,first_name,last_name,email,phone,date_of_birth), dentist:user_profiles!dentist_id(id,full_name,email,phone), practice_locations(id,name,address,phone), created_by:user_profiles!created_by_id(id,full_name)`) 
            .eq('id', id)
            .single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({ error: 'Failed to fetch appointment' });
    }
});

app?.post('/api/appointments', validateAuth, requireRole(['super_admin','practice_admin','dentist','receptionist']), async (req, res) => {
    const appointmentCreateSchema = z.object({
        appointment_date: z.string().min(8),
        start_time: z.string().min(4),
        end_time: z.string().min(4),
        status: z.string().optional(),
        treatment_type: z.string().optional(),
        notes: z.string().optional(),
        patient_id: z.any(),
        dentist_id: z.any(),
        practice_location_id: z.any()
    }).passthrough();
    try {
        res.set('Cache-Control', 'no-store');
        const parsed = appointmentCreateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        const { data, error } = await supabase
            .from('appointments')
            .insert(parsed.data)
            .select()
            .single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

app?.put('/api/appointments/:id', validateAuth, requireRole(['super_admin','practice_admin','dentist','receptionist']), async (req, res) => {
    const appointmentUpdateSchema = z.object({
        appointment_date: z.string().min(8).optional(),
        start_time: z.string().min(4).optional(),
        end_time: z.string().min(4).optional(),
        status: z.string().optional(),
        treatment_type: z.string().optional(),
        notes: z.string().optional(),
        patient_id: z.any().optional(),
        dentist_id: z.any().optional(),
        practice_location_id: z.any().optional()
    }).passthrough();
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const parsed = appointmentUpdateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        const { data, error } = await supabase
            .from('appointments')
            .update(parsed.data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

app?.delete('/api/appointments/:id', validateAuth, requireRole(['super_admin','practice_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
});

// Leads endpoints
app?.post('/api/leads', validateAuth, requireRole(['super_admin','practice_admin','manager','receptionist']), async (req, res) => {
    const leadCreateSchema = z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        lead_source: z.string().optional(),
        lead_status: z.string().optional(),
        interest_level: z.string().optional(),
        estimated_value: z.number().optional(),
        notes: z.string().optional(),
        assigned_to_id: z.string().optional(),
        practice_location_id: z.string().optional()
    }).passthrough();
    try {
        res.set('Cache-Control', 'no-store');
        const parsed = leadCreateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        const { data, error } = await supabase
            .from('leads')
            .insert(parsed.data)
            .select()
            .single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

app?.put('/api/leads/:id', validateAuth, requireRole(['super_admin','practice_admin','manager','receptionist']), async (req, res) => {
    const leadUpdateSchema = z.object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        lead_source: z.string().optional(),
        lead_status: z.string().optional(),
        interest_level: z.string().optional(),
        estimated_value: z.number().optional(),
        notes: z.string().optional(),
        assigned_to_id: z.string().optional(),
        practice_location_id: z.string().optional()
    }).passthrough();
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const parsed = leadUpdateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        const { data, error } = await supabase
            .from('leads')
            .update(parsed.data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Update lead error:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// Payments endpoints
app?.get('/api/payments', validateAuth, requireRole(['super_admin','practice_admin','dentist','receptionist']), requireModulePermission('finance','read'), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { status, method, patient_id } = req.query;
        let query = supabase
            .from('payments')
            .select(`id, amount, payment_method, status, payment_date, description, created_at, patient_id, appointment_id, processed_by_id, patients(id,first_name,last_name), appointments(id,appointment_date,treatment_type), processed_by:user_profiles!processed_by_id(id,full_name)`);
        if (status) query = query.eq('status', status);
        if (method) query = query.eq('payment_method', method);
        if (patient_id) query = query.eq('patient_id', patient_id);
        const { data, error } = await query.order('payment_date', { ascending: false });
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

app?.post('/api/payments', validateAuth, requireRole(['super_admin','practice_admin','dentist','receptionist']), requireModulePermission('finance','write'), async (req, res) => {
    const paymentCreateSchema = z.object({
        amount: z.number().positive(),
        payment_method: z.enum(['card','bank_transfer','cash','cheque','direct_debit','finance','insurance_claim']).or(z.string()),
        status: z.enum(['paid','pending','failed']).or(z.string()).optional(),
        payment_date: z.string().optional(),
        description: z.string().optional(),
        patient_id: z.any().optional(),
        appointment_id: z.any().optional(),
        payment_reference: z.string().optional()
    }).passthrough();
    try {
        res.set('Cache-Control', 'no-store');
        const parsed = paymentCreateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        const { data, error } = await supabase
            .from('payments')
            .insert(parsed.data)
            .select()
            .single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Dashboard stats endpoint
app?.get('/api/stats', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const [patientsResult, appointmentsResult, leadsResult, paymentsResult] = await Promise.all([
            supabase.from('patients').select('id', { count: 'exact', head: true }),
            supabase.from('appointments').select('id', { count: 'exact', head: true }),
            supabase.from('leads').select('id', { count: 'exact', head: true }),
            supabase.from('payments').select('amount').eq('status', 'paid')
        ]);
        const totalPatients = patientsResult?.count || 0;
        const totalAppointments = appointmentsResult?.count || 0;
        const totalLeads = leadsResult?.count || 0;
        let totalRevenue = paymentsResult?.data?.reduce((sum, p) => sum + (p?.amount || 0), 0) || 0;
        // Mask revenue if finance read permission is missing
        const financeLevel = await getModulePermissionLevel(req?.user?.client_organization_id, 'finance');
        if (!(PERMISSION_LEVELS[financeLevel] >= PERMISSION_LEVELS['read'])) {
            totalRevenue = null; // or 0; using null to signal restricted
        }
        res.json({ data: { totalPatients, totalAppointments, totalLeads, totalRevenue } });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ===== User Profiles API =====
app?.get('/api/user-profiles', validateAuth, requireRole(['super_admin','practice_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { role, is_active } = req.query;
        let query = supabase.from('user_profiles').select('id,email,full_name,role,is_active,phone,created_at,updated_at');
        if (role) query = query.eq('role', role);
        if (typeof is_active !== 'undefined') query = query.eq('is_active', is_active === 'true');
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get user profiles error:', error);
        res.status(500).json({ error: 'Failed to fetch user profiles' });
    }
});

app?.get('/api/user-profiles/:id', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { data, error } = await supabase.from('user_profiles').select('*').eq('id', id).single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

app?.put('/api/user-profiles/:id', validateAuth, requireRole(['super_admin','practice_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { data, error } = await supabase.from('user_profiles').update(req.body).eq('id', id).select().single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

// ===== Membership APIs =====
// Applications
app?.get('/api/memberships/applications', validateAuth, requireRole(['super_admin','practice_admin','manager','receptionist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { status, practice_location_id } = req.query;
        let query = supabase.from('membership_applications').select(`
            *,
            patient:patients(id, first_name, last_name, email, phone),
            membership_plan:membership_plans(id, name, tier, monthly_price),
            practice_location:practice_locations(id, name),
            processed_by:user_profiles(id, full_name)
        `).order('created_at', { ascending: false });
        if (status) query = query.eq('status', status);
        if (practice_location_id) query = query.eq('practice_location_id', practice_location_id);
        const { data, error } = await query;
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get membership applications error:', error);
        res.status(500).json({ error: 'Failed to fetch membership applications' });
    }
});

app?.get('/api/memberships/applications/:id', validateAuth, requireRole(['super_admin','practice_admin','manager','receptionist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { data, error } = await supabase.from('membership_applications').select(`
            *,
            patient:patients(id, first_name, last_name, email, phone, date_of_birth, address),
            membership_plan:membership_plans(id, name, description, tier, monthly_price, benefits),
            practice_location:practice_locations(id, name, address),
            processed_by:user_profiles(id, full_name)
        `).eq('id', id).single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

app?.post('/api/memberships/applications', validateAuth, requireRole(['super_admin','practice_admin','manager','receptionist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { data, error } = await supabase.from('membership_applications').insert([req.body]).select().single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({ error: 'Failed to create application' });
    }
});

app?.patch('/api/memberships/applications/:id/status', validateAuth, requireRole(['super_admin','practice_admin','manager']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { status, processed_by_id, rejected_reason } = req.body;
        const updateData = { status, processed_by_id, updated_at: new Date().toISOString() };
        if (status === 'approved') updateData.approved_date = new Date().toISOString();
        if (status === 'rejected' && rejected_reason) updateData.rejected_reason = rejected_reason;
        const { data, error } = await supabase.from('membership_applications').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

app?.delete('/api/memberships/applications/:id', validateAuth, requireRole(['super_admin','practice_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { error } = await supabase.from('membership_applications').delete().eq('id', id);
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// Plans
app?.get('/api/memberships/plans', validateAuth, requireRole(['super_admin','practice_admin','manager']), async (req, res) => {
    try {
        const { practice_location_id } = req.query;
        let query = supabase.from('membership_plans').select(`
            *,
            practice_location:practice_locations(id, name),
            created_by:user_profiles(id, full_name)
        `).eq('is_active', true).order('tier', { ascending: true });
        if (practice_location_id) query = query.eq('practice_location_id', practice_location_id);
        const { data, error } = await query;
        if (error) throw error;
        return sendCached(req, res, { data }, 'public, max-age=300, s-maxage=300, stale-while-revalidate=30');
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

app?.post('/api/memberships/plans', validateAuth, requireRole(['super_admin','practice_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { data, error } = await supabase.from('membership_plans').insert([req.body]).select().single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Create plan error:', error);
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

app?.put('/api/memberships/plans/:id', validateAuth, requireRole(['super_admin','practice_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { data, error } = await supabase.from('membership_plans').update(req.body).eq('id', id).select().single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

// Memberships
app?.get('/api/memberships', validateAuth, requireRole(['super_admin','practice_admin','manager','receptionist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { status, practice_location_id } = req.query;
        let query = supabase.from('memberships').select(`
            *,
            patient:patients(id, first_name, last_name, email, phone),
            membership_plan:membership_plans(id, name, tier, monthly_price),
            practice_location:practice_locations(id, name),
            managed_by:user_profiles(id, full_name)
        `).order('created_at', { ascending: false });
        if (status) query = query.eq('status', status);
        if (practice_location_id) query = query.eq('practice_location_id', practice_location_id);
        const { data, error } = await query;
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get memberships error:', error);
        res.status(500).json({ error: 'Failed to fetch memberships' });
    }
});

app?.get('/api/memberships/:id', validateAuth, requireRole(['super_admin','practice_admin','manager','receptionist']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { data, error } = await supabase.from('memberships').select(`
            *,
            patient:patients(id, first_name, last_name, email, phone, date_of_birth),
            membership_plan:membership_plans(id, name, description, tier, benefits, service_inclusions),
            application:membership_applications(id, application_number, status),
            practice_location:practice_locations(id, name)
        `).eq('id', id).single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get membership error:', error);
        res.status(500).json({ error: 'Failed to fetch membership' });
    }
});

app?.post('/api/memberships/from-application', validateAuth, requireRole(['super_admin','practice_admin','manager']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { application_id, membership_data } = req.body;
        const { data, error } = await supabase.from('memberships').insert([{ ...membership_data, application_id }]).select().single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Create membership error:', error);
        res.status(500).json({ error: 'Failed to create membership' });
    }
});

app?.patch('/api/memberships/:id/status', validateAuth, requireRole(['super_admin','practice_admin','manager']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { status } = req.body;
        const updateData = { status };
        if (status === 'cancelled') updateData.end_date = new Date().toISOString();
        const { data, error } = await supabase.from('memberships').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Update membership status error:', error);
        res.status(500).json({ error: 'Failed to update membership status' });
    }
});

// Membership analytics
app?.get('/api/memberships/analytics/overview', validateAuth, requireRole(['super_admin','practice_admin','manager']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { practice_location_id } = req.query;
        let applicationsQuery = supabase.from('membership_applications').select('status', { count: 'exact' });
        if (practice_location_id) applicationsQuery = applicationsQuery.eq('practice_location_id', practice_location_id);
        let membershipsQuery = supabase.from('memberships').select('status', { count: 'exact' }).eq('status', 'active');
        if (practice_location_id) membershipsQuery = membershipsQuery.eq('practice_location_id', practice_location_id);
        let revenueQuery = supabase.from('membership_payments').select('amount_paid, paid_date').not('paid_date', 'is', null);
        const [applicationsResult, membershipsResult, revenueResult] = await Promise.all([applicationsQuery, membershipsQuery, revenueQuery]);
        if (applicationsResult?.error) throw applicationsResult?.error;
        if (membershipsResult?.error) throw membershipsResult?.error;
        if (revenueResult?.error) throw revenueResult?.error;
        const totalApplications = applicationsResult?.count || 0;
        const activeMemberships = membershipsResult?.count || 0;
        const monthlyRevenue = (revenueResult?.data || []).filter(p => {
            const pd = new Date(p.paid_date); const now = new Date();
            return pd.getMonth() === now.getMonth() && pd.getFullYear() === now.getFullYear();
        }).reduce((sum, p) => sum + parseFloat(p?.amount_paid || 0), 0) || 0;
        res.json({ data: { totalApplications, activeMemberships, monthlyRevenue: monthlyRevenue.toFixed(2), conversionRate: totalApplications > 0 ? ((activeMemberships/totalApplications)*100).toFixed(1) : 0 } });
    } catch (error) {
        console.error('Membership analytics overview error:', error);
        res.status(500).json({ error: 'Failed to fetch membership analytics' });
    }
});

app?.get('/api/memberships/analytics/trends', validateAuth, requireRole(['super_admin','practice_admin','manager']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { practice_location_id, days = 30 } = req.query;
        const startDate = new Date(); startDate.setDate(startDate.getDate() - Number(days));
        let query = supabase.from('memberships').select('created_at, status').gte('created_at', startDate.toISOString());
        if (practice_location_id) query = query.eq('practice_location_id', practice_location_id);
        const { data, error } = await query;
        if (error) throw error;
        const trendsData = (data || []).reduce((acc, m) => { const d = new Date(m.created_at).toISOString().split('T')[0]; acc[d] = acc[d] || { date: d, count: 0 }; acc[d].count++; return acc; }, {});
        res.json({ data: Object.values(trendsData).sort((a,b) => new Date(a.date)-new Date(b.date)) });
    } catch (error) {
        console.error('Membership trends error:', error);
        res.status(500).json({ error: 'Failed to fetch membership trends' });
    }
});

// ===== Appointments SSE =====
app?.get('/api/events/appointments/stream', validateAuth, async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders();

    const channel = supabase
        .channel(`sse_appointments_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
            res.write(`event: appointment_update\n`);
            res.write(`data: ${JSON.stringify({ table: 'appointments', payload })}\n\n`);
        })
        .subscribe();

    const heartbeat = setInterval(() => { res.write(`: heartbeat\n\n`); }, 25000);
    req.on('close', () => {
        clearInterval(heartbeat);
        try { supabase.removeChannel(channel); } catch (_) {}
        res.end();
    });
});

// ===== System Owner Admin APIs =====
// Aggregate-only KPIs for system owner
app?.get('/api/admin/kpis', validateAuth, requireRole(['super_admin']), async (_req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const [clientsRes, usersRes] = await Promise.all([
            supabase.from('client_organizations').select('id,status,subscription_tier,installation_fee,monthly_cost'),
            supabase.from('user_profiles').select('id')
        ]);
        if (clientsRes.error) throw clientsRes.error;
        if (usersRes.error) throw usersRes.error;
        const totalClients = clientsRes.data?.length || 0;
        const activeClients = clientsRes.data?.filter(c => c.status === 'active')?.length || 0;
        const totalUsers = usersRes.data?.length || 0;
        const mrr = clientsRes.data?.reduce((sum, c) => sum + (Number(c.monthly_cost) || 0), 0) || 0;
        res.json({ data: { totalClients, activeClients, totalUsers, mrr } });
    } catch (error) {
        console.error('Admin KPIs error:', error);
        res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
});

// UI Settings - per-tenant
app?.get('/api/ui/settings', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const clientId = req?.user?.client_organization_id;
        if (!clientId) return res.json({ data: null });
        const { data, error } = await supabase
            .from('client_ui_settings')
            .select('public_footer_enabled, public_footer_variant, internal_footer_enabled')
            .eq('client_organization_id', clientId)
            .maybeSingle();
        if (error) throw error;
        const defaults = {
            publicFooterEnabled: true,
            publicFooterVariant: 'compact',
            internalFooterEnabled: true
        };
        if (!data) return res.json({ data: defaults });
        res.json({ data: {
            publicFooterEnabled: data.public_footer_enabled ?? defaults.publicFooterEnabled,
            publicFooterVariant: data.public_footer_variant || defaults.publicFooterVariant,
            internalFooterEnabled: data.internal_footer_enabled ?? defaults.internalFooterEnabled
        }});
    } catch (error) {
        console.error('Get UI settings error:', error);
        res.status(200).json({ data: { publicFooterEnabled: true, publicFooterVariant: 'compact', internalFooterEnabled: true } });
    }
});

app?.put('/api/admin/ui-settings/:clientId', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { clientId } = req.params;
        const schema = z.object({
            publicFooterEnabled: z.boolean().optional(),
            publicFooterVariant: z.enum(['full','compact']).optional(),
            internalFooterEnabled: z.boolean().optional()
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        const payload = {
            client_organization_id: clientId,
            public_footer_enabled: parsed.data.publicFooterEnabled ?? null,
            public_footer_variant: parsed.data.publicFooterVariant ?? null,
            internal_footer_enabled: parsed.data.internalFooterEnabled ?? null
        };
        // upsert
        const { error } = await supabase
            .from('client_ui_settings')
            .upsert(payload, { onConflict: 'client_organization_id' });
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        console.error('Update UI settings error:', error);
        res.status(500).json({ error: 'Failed to update UI settings' });
    }
});

// Branding (tenant fetch/update)
app?.get('/api/ui/branding', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const clientId = req?.user?.client_organization_id;
        if (!clientId) return res.json({ data: null });
        const { data, error } = await supabase
            .from('client_branding')
            .select('practice_name, logo_url, primary_color, secondary_color_1, secondary_color_2, secondary_color_3, font_family')
            .eq('client_organization_id', clientId)
            .maybeSingle();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get branding error:', error);
        res.status(200).json({ data: null });
    }
});

app?.put('/api/ui/branding', validateAuth, requireRole(['practice_admin','practice_manager','super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const clientId = req?.user?.client_organization_id;
        if (!clientId) return res.status(400).json({ error: 'No client context' });
        const color = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).nullable().optional();
        const schema = z.object({
            practice_name: z.string().min(1).max(120).optional(),
            logo_url: z.string().url().optional(),
            primary_color: color,
            secondary_color_1: color,
            secondary_color_2: color,
            secondary_color_3: color,
            font_family: z.string().min(1).max(100).optional()
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        const payload = { ...parsed.data, client_organization_id: clientId, updated_at: new Date().toISOString() };
        const { error } = await supabase.from('client_branding').upsert(payload, { onConflict: 'client_organization_id' });
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        console.error('Update branding error:', error);
        res.status(500).json({ error: 'Failed to update branding' });
    }
});

// Branding (admin manage per tenant)
app?.get('/api/admin/branding/:clientId', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { clientId } = req.params;
        const { data, error } = await supabase
            .from('client_branding')
            .select('practice_name, logo_url, primary_color, secondary_color_1, secondary_color_2, secondary_color_3, font_family')
            .eq('client_organization_id', clientId)
            .maybeSingle();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get branding (admin) error:', error);
        res.status(500).json({ error: 'Failed to fetch branding' });
    }
});

app?.put('/api/admin/branding/:clientId', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { clientId } = req.params;
        const color = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).nullable().optional();
        const schema = z.object({
            practice_name: z.string().min(1).max(120).optional(),
            logo_url: z.string().url().optional(),
            primary_color: color,
            secondary_color_1: color,
            secondary_color_2: color,
            secondary_color_3: color,
            font_family: z.string().min(1).max(100).optional()
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        const payload = { ...parsed.data, client_organization_id: clientId, updated_at: new Date().toISOString() };
        const { error } = await supabase.from('client_branding').upsert(payload, { onConflict: 'client_organization_id' });
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        console.error('Update branding (admin) error:', error);
        res.status(500).json({ error: 'Failed to update branding' });
    }
});
app?.get('/api/admin/clients', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { data, error } = await supabase.from('client_organizations').select(`
            id, organization_name, organization_type, status, subscription_tier, contact_email, contact_phone,
            billing_address, max_users, total_users, pricing_info, installation_fee, monthly_cost, created_at, updated_at
        `).order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

app?.get('/api/admin/modules', validateAuth, requireRole(['super_admin']), async (_req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { data, error } = await supabase.from('system_modules').select('*').order('display_name');
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Get modules error:', error);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// Aggregated feature adoption (no tenant details)
app?.get('/api/admin/adoption', validateAuth, requireRole(['super_admin']), async (_req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { data, error } = await supabase
            .from('client_module_permissions')
            .select('module_name, is_enabled');
        if (error) throw error;
        const counts = {};
        (data || []).forEach(p => {
            if (p.is_enabled) counts[p.module_name] = (counts[p.module_name] || 0) + 1;
        });
        const out = Object.entries(counts).map(([module_name, enabled_count]) => ({ module_name, enabled_count }));
        res.json({ data: out });
    } catch (error) {
        console.error('Admin adoption error:', error);
        res.status(500).json({ error: 'Failed to fetch adoption' });
    }
});

app?.put('/api/admin/clients/:id/status', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const schema = z.object({ status: z.string().min(1) });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });
        const { data, error } = await supabase.from('client_organizations').update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error) throw error;
        res.json({ data });
    } catch (error) {
        console.error('Update client status error:', error);
        res.status(500).json({ error: 'Failed to update client status' });
    }
});

app?.delete('/api/admin/clients/:id', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const { error } = await supabase.from('client_organizations').delete().eq('id', id);
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ error: 'Failed to delete client' });
    }
});

app?.patch('/api/admin/clients/bulk', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const schema = z.object({ action: z.enum(['activate','suspend','delete']), ids: z.array(z.string()).min(1) });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });
        const { action, ids } = parsed.data;
        if (action === 'delete') {
            const { error } = await supabase.from('client_organizations').delete().in('id', ids);
            if (error) throw error;
            return res.json({ ok: true });
        }
        const newStatus = action === 'activate' ? 'active' : 'suspended';
        const { error } = await supabase.from('client_organizations').update({ status: newStatus }).in('id', ids);
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        console.error('Bulk client action error:', error);
        res.status(500).json({ error: 'Failed to process bulk action' });
    }
});

app?.put('/api/admin/clients/:id/permissions', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { id } = req.params;
        const schema = z.object({ permissions: z.array(z.object({ module_name: z.string(), permission_level: z.string(), is_enabled: z.boolean().optional() })).default([]) });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });
        await supabase.from('client_module_permissions').delete().eq('client_organization_id', id);
        const newPermissions = parsed.data.permissions.map(p => ({ ...p, client_organization_id: id, granted_at: new Date().toISOString() }));
        if (newPermissions.length > 0) {
            const { error: insertError } = await supabase.from('client_module_permissions').insert(newPermissions);
            if (insertError) throw insertError;
        }
        res.json({ ok: true });
    } catch (error) {
        console.error('Update client permissions error:', error);
        res.status(500).json({ error: 'Failed to update client permissions' });
    }
});

app?.post('/api/admin/log', validateAuth, requireRole(['super_admin']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const schema = z.object({ action_type: z.string(), performed_by_id: z.string().optional(), target_client_id: z.string().optional(), target_user_id: z.string().optional(), details: z.any().optional() });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });
        const payload = { ...parsed.data, performed_by_id: parsed.data.performed_by_id || req.user?.id, created_at: new Date().toISOString() };
        const { error } = await supabase.from('system_owner_audit_log').insert([payload]);
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        console.error('Admin log error:', error);
        res.status(500).json({ error: 'Failed to log admin action' });
    }
});

// Client security log endpoint used by the SPA
app?.post('/api/security/log', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const schema = z.object({
            event: z.string(),
            riskLevel: z.enum(['low','medium','high']).optional(),
            metadata: z.any().optional()
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });

        const { event, riskLevel = 'low', metadata = {} } = parsed.data;
        await supabase?.rpc('log_security_event', {
            action_type: event,
            resource_type: 'client',
            risk_level: riskLevel,
            additional_metadata: {
                ...(metadata || {}),
                user_id: req?.user?.id,
                user_role: req?.user?.role,
                user_agent: req?.get('User-Agent')
            }
        });

        res.json({ ok: true });
    } catch (error) {
        console.error('Security log error:', error);
        res.status(500).json({ error: 'Failed to record security log' });
    }
});

// AI usage audit endpoint used by the SPA
app?.post('/api/ai-usage/log', validateAuth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const schema = z.object({
            provider: z.string().default('internal'),
            dataType: z.string().optional(),
            purpose: z.string().optional(),
            approved: z.boolean().default(false),
            timestamp: z.string().optional(),
            gdprCompliance: z.boolean().optional(),
            dataMinimization: z.boolean().optional()
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });

        const payload = parsed.data;
        await supabase?.rpc('log_security_event', {
            action_type: 'ai_usage',
            resource_type: 'ai',
            risk_level: payload.approved ? 'low' : 'medium',
            additional_metadata: {
                ...payload,
                user_id: req?.user?.id,
                user_role: req?.user?.role
            }
        });

        res.json({ ok: true });
    } catch (error) {
        console.error('AI usage log error:', error);
        res.status(500).json({ error: 'Failed to record AI usage' });
    }
});

// ===================== Public, unauthenticated endpoints =====================
// Public waitlist signup (marketing site)
app?.post('/api/public/waitlist', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const schema = z.object({
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            email: z.string().email(),
            phone: z.string().optional().nullable(),
            practiceName: z.string().optional().nullable(),
            interest: z.string().optional().nullable(),
            utm_source: z.string().optional().nullable(),
            utm_medium: z.string().optional().nullable(),
            utm_campaign: z.string().optional().nullable()
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

        const leadNumber = `AES-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        const payload = {
            lead_number: leadNumber,
            first_name: parsed.data.firstName,
            last_name: parsed.data.lastName,
            email: parsed.data.email,
            phone: parsed.data.phone || null,
            source: 'website',
            status: 'new',
            treatment_interest: parsed.data.interest || null,
            notes: `Waitlist signup${parsed.data.practiceName ? ` - Practice: ${parsed.data.practiceName}` : ''}`,
            utm_source: parsed.data.utm_source || 'aescrm_landing',
            utm_medium: parsed.data.utm_medium || 'waitlist_form',
            utm_campaign: parsed.data.utm_campaign || 'pre_launch_waitlist'
        };

        const { data, error } = await supabase.from('leads').insert(payload).select().single();
        if (error) throw error;

        // Best-effort security log (no auth context available)
        try {
            await supabase?.rpc('log_security_event', {
                action_type: 'public_waitlist_signup',
                resource_type: 'marketing',
                risk_level: 'low',
                additional_metadata: { lead_number: leadNumber, email: parsed.data.email }
            });
        } catch (_) {}

        res.status(201).json({ ok: true, data });
    } catch (err) {
        console.error('Public waitlist error:', err);
        res.status(500).json({ error: 'Failed to submit waitlist' });
    }
});

// Public self-serve tenant signup (stores pending client_organizations)
app?.post('/api/public/tenants/signup', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const schema = z.object({
            organization_name: z.string().min(2),
            contact_email: z.string().email(),
            contact_phone: z.string().optional().nullable(),
            subscription_tier: z.string().optional().nullable()
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

        const payload = {
            organization_name: parsed.data.organization_name,
            contact_email: parsed.data.contact_email,
            contact_phone: parsed.data.contact_phone || null,
            status: 'pending_approval',
            subscription_tier: parsed.data.subscription_tier || 'basic'
        };

        const { data, error } = await supabase.from('client_organizations').insert(payload).select('id, organization_name, status, subscription_tier, contact_email, contact_phone, created_at').single();
        if (error) throw error;

        // Log tenant signup
        try {
            await supabase?.rpc('log_security_event', {
                action_type: 'public_tenant_signup',
                resource_type: 'client_organizations',
                risk_level: 'low',
                additional_metadata: { id: data?.id, email: data?.contact_email }
            });
        } catch (_) {}

        res.status(201).json({ ok: true, data });
    } catch (err) {
        console.error('Public tenant signup error:', err);
        res.status(500).json({ error: 'Failed to submit tenant signup' });
    }
});
// Health check endpoint
app?.get('/api/health', (req, res) => {
    res?.json({ 
        status: 'healthy', 
        timestamp: new Date()?.toISOString(),
        version: process.env?.npm_package_version || '1.0.0'
    });
});

// F5 - Automated data retention cron job (runs daily at 2 AM)
cron?.schedule('0 2 * * *', async () => {
    try {
        console.log('Running daily data retention check...');
        
        const { data, error } = await supabase?.rpc('mark_for_deletion');
        
        if (error) {
            console.error('Data retention cron error:', error);
            return;
        }

        console.log(`Data retention check complete. Marked ${data} records for deletion.`);
        
        // Log the automated process
        await supabase?.rpc('log_security_event', {
            action_type: 'automated_data_retention',
            resource_type: 'system',
            risk_level: 'low',
            additional_metadata: { 
                marked_count: data,
                automated: true 
            }
        });

    } catch (error) {
        console.error('Data retention cron job failed:', error);
    }
});

// Error handling middleware
app?.use((error, req, res, next) => {
    console.error('Server error:', error);
    res?.status(500)?.json({ 
        error: 'Internal server error',
        message: process.env?.NODE_ENV === 'development' ? error?.message : 'Something went wrong'
    });
});

// 404 handler
app?.use('*', (req, res) => {
    res?.status(404)?.json({ error: 'Endpoint not found' });
});

// F6 - HTTPS enforcement for production
if (process.env?.NODE_ENV === 'production') {
    app?.use((req, res, next) => {
        if (!req?.secure && req?.get('x-forwarded-proto') !== 'https') {
            return res?.redirect(301, 'https://' + req?.get('host') + req?.url);
        }
        next();
    });
}

app?.listen(PORT, () => {
    console.log(`Secure dental CRM API server running on port ${PORT}`);
    console.log(`Environment: ${process.env?.NODE_ENV || 'development'}`);
    console.log('Security features: HTTPS enforcement, RBAC, data encryption, audit logging');
});

module.exports = app;
