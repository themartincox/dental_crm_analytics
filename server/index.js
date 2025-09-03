// Server-side API layer to address F2 - protecting Supabase keys
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');
const cron = require('node-cron');
require('dotenv')?.config();

const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env?.PORT || 3001;

// F6 - HTTPS enforcement and security headers
app?.use(helmet({
    forceHTTPS: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

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
    origin: process.env?.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app?.use(express?.json({ limit: '10mb' }));

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
        const { data: profile, error: profileError } = await supabase?.from('user_profiles')?.select('role, is_active')?.eq('id', user?.id)?.single();

        if (profileError || !profile || !profile?.is_active) {
            return res?.status(403)?.json({ error: 'User profile not found or inactive' });
        }

        req.user = { ...user, role: profile?.role };
        
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

// F2 - Secure API endpoints replacing direct Supabase client calls

// Patient management - restricted to clinical staff
app?.get('/api/patients', validateAuth, requireRole(['super_admin', 'practice_admin', 'dentist', 'hygienist']), async (req, res) => {
    try {
        const { data, error } = await supabase?.from('patients')?.select(`
                id, patient_number, first_name, last_name, email, phone, 
                date_of_birth, status, treatment_type, insurance_provider,
                created_at, updated_at,
                assigned_dentist:user_profiles!assigned_dentist_id(id, full_name)
            `)?.order('created_at', { ascending: false });

        if (error) throw error;

        // F6 - Encrypt sensitive data in transit
        const sanitizedData = data?.map(patient => ({
            ...patient,
            // Encrypt PII fields
            email: patient?.email ? encryptSensitiveData(patient?.email) : null,
            phone: patient?.phone ? encryptSensitiveData(patient?.phone) : null,
            date_of_birth: patient?.date_of_birth ? encryptSensitiveData(patient?.date_of_birth) : null
        }));

        res?.json({ data: sanitizedData, count: data?.length });
    } catch (error) {
        console.error('Get patients error:', error);
        res?.status(500)?.json({ error: 'Failed to fetch patients' });
    }
});

// Lead management - separate from clinical data (F5)
app?.get('/api/leads', validateAuth, requireRole(['super_admin', 'practice_admin', 'manager', 'receptionist']), async (req, res) => {
    try {
        const { data, error } = await supabase?.from('leads')?.select(`
                id, lead_number, first_name, last_name, email, phone,
                source, status, treatment_interest, estimated_value,
                created_at, consent_withdrawn_date,
                assigned_to:user_profiles!assigned_to_id(id, full_name)
            `)?.order('created_at', { ascending: false });

        if (error) throw error;

        res?.json({ data, count: data?.length });
    } catch (error) {
        console.error('Get leads error:', error);
        res?.status(500)?.json({ error: 'Failed to fetch leads' });
    }
});

// User profile management - self-service with admin override
app?.get('/api/profile', validateAuth, async (req, res) => {
    try {
        const { data, error } = await supabase?.from('user_profiles')?.select('id, email, full_name, role, created_at, last_access_date')?.eq('id', req?.user?.id)?.single();

        if (error) throw error;

        res?.json({ data });
    } catch (error) {
        console.error('Get profile error:', error);
        res?.status(500)?.json({ error: 'Failed to fetch profile' });
    }
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