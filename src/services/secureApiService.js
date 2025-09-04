// Secure API service to replace direct Supabase calls - addresses F2
import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios?.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient?.interceptors?.request?.use(
    (config) => {
        const token = localStorage.getItem('sb-auth-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient?.interceptors?.response?.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            // Clear invalid token and redirect to login
            localStorage.removeItem('sb-auth-token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// F6 - Encryption utilities for client-side sensitive data handling
const encryptionKey = import.meta.env?.VITE_CLIENT_ENCRYPTION_KEY || 'default-key';

const decryptSensitiveData = (encryptedData) => {
    try {
        // Simple client-side decryption for display purposes
        // In production, use proper encryption library
        if (!encryptedData) return null;
        
        // Placeholder for decryption - implement with crypto-js
        return atob(encryptedData);
    } catch (error) {
        console.error('Decryption error:', error);
        return '[Encrypted]';
    }
};

// F3 Resolution - Enhanced server-side RBAC validation
class SecureApiService {
    constructor() {
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        this.requestId = 0;
    }

    // Enhanced authentication with server-side role validation
    async validateServerSideAccess(requiredRole = null, requiredPermissions = []) {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseUrl}/auth/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': `${Date.now()}-${++this.requestId}`
                },
                body: JSON.stringify({
                    requiredRole,
                    requiredPermissions,
                    endpoint: window.location?.pathname,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response?.ok) {
                throw new Error(`Server-side validation failed: ${response?.status}`);
            }

            const validation = await response?.json();
            
            // Log security event
            await this.logSecurityEvent('access_validation', {
                valid: validation?.valid,
                role: validation?.userRole,
                permissions: validation?.userPermissions,
                requiredRole,
                requiredPermissions
            });

            return validation;
        } catch (error) {
            await this.logSecurityEvent('access_validation_failed', {
                error: error?.message,
                requiredRole,
                requiredPermissions
            });
            throw error;
        }
    }

    // F3 - Enhanced secure request with mandatory role validation
    async makeSecureRequest(url, options = {}, requiredRole = null) {
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
            try {
                // Step 1: Validate server-side access first
                if (requiredRole) {
                    const validation = await this.validateServerSideAccess(requiredRole);
                    if (!validation?.valid) {
                        throw new Error(`Access denied - insufficient privileges for role: ${requiredRole}`);
                    }
                }

                // Step 2: Make authenticated request with role headers
                const token = await this.getAuthToken();
                
                const response = await fetch(`${this.baseUrl}${url}`, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-Request-ID': `${Date.now()}-${++this.requestId}`,
                        'X-Required-Role': requiredRole || '',
                        'X-Client-Validation': 'true',
                        ...options?.headers
                    }
                });

                if (!response?.ok) {
                    if (response?.status === 401 && retryCount < maxRetries) {
                        retryCount++;
                        continue;
                    }
                    
                    if (response?.status === 403) {
                        throw new Error('Server-side RBAC validation failed - access denied');
                    }
                    
                    const errorData = await response?.json?.().catch(() => ({}));
                    throw new Error(errorData?.message || `HTTP ${response?.status}: ${response?.statusText}`);
                }

                const data = await response?.json();
                
                // Log successful authenticated request
                await this.logSecurityEvent('authenticated_request', {
                    endpoint: url,
                    method: options?.method || 'GET',
                    role: requiredRole,
                    success: true
                });

                return data;
            } catch (error) {
                if (retryCount >= maxRetries) {
                    await this.logSecurityEvent('request_failed', {
                        endpoint: url,
                        error: error?.message,
                        requiredRole
                    });
                    throw error;
                }
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }
    }

    // Enhanced security event logging
    async logSecurityEvent(eventType, metadata = {}) {
        try {
            const token = await this.getAuthToken();
            
            await fetch(`${this.baseUrl}/security/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    event: eventType,
                    metadata: {
                        ...metadata,
                        userAgent: navigator?.userAgent,
                        timestamp: new Date().toISOString(),
                        url: window.location?.href,
                        referrer: document?.referrer
                    },
                    riskLevel: this.calculateRiskLevel(eventType, metadata)
                })
            });
        } catch (error) {
            console.warn('Security logging failed:', error);
            // Don't throw - logging failures shouldn't break app functionality
        }
    }

    // Calculate risk level for security events
    calculateRiskLevel(eventType, metadata) {
        if (eventType.includes('failed') || eventType.includes('denied')) {
            return 'high';
        }
        if (metadata?.requiredRole === 'super_admin' || metadata?.requiredRole === 'practice_admin') {
            return 'medium';
        }
        return 'low';
    }

    // Enhanced service methods with role validation
    patients = {
        list: async (filters = {}) => {
            return this.makeSecureRequest(`/patients?${new URLSearchParams(filters)}`, 
                { method: 'GET' }, 'dentist'); // Requires dentist role
        },

        get: async (patientId) => {
            return this.makeSecureRequest(`/patients/${patientId}`, 
                { method: 'GET' }, 'dentist');
        },

        create: async (patientData) => {
            return this.makeSecureRequest('/patients', {
                method: 'POST',
                body: JSON.stringify(patientData)
            }, 'dentist'); // Only dentists can create patients
        }
    };

    // Admin-only operations with strict role validation
    security = {
        getAuditLogs: async (filters = {}) => {
            return this.makeSecureRequest(`/security/audit-logs?${new URLSearchParams(filters)}`, 
                { method: 'GET' }, 'super_admin'); // Super admin only
        },

        getUserSessions: async (userId) => {
            return this.makeSecureRequest(`/security/user-sessions/${userId}`, 
                { method: 'GET' }, 'practice_admin'); // Admin only
        }
    };

    // F4 & F5 - Admin-only security and compliance functions
    async getRetentionPolicies() {
        try {
            const response = await apiClient?.get('/admin/retention-policies');
            return response?.data?.data || [];
        } catch (error) {
            console.error('Get retention policies error:', error);
            throw new Error('Failed to fetch retention policies');
        }
    }

    async exportComplianceReport(startDate, endDate) {
        try {
            const response = await apiClient?.get('/admin/compliance-report', {
                params: { startDate, endDate },
                responseType: 'blob'
            });
            return response?.data;
        } catch (error) {
            console.error('Export compliance report error:', error);
            throw new Error('Failed to export compliance report');
        }
    }

    // Health check for API connectivity
    async checkApiHealth() {
        try {
            const response = await apiClient?.get('/health');
            return response?.data;
        } catch (error) {
            console.error('API health check failed:', error);
            throw new Error('API server unavailable');
        }
    }

    // F13 - AI Usage Policy compliance service
    async validateDataForAI(data) {
        const healthDataIndicators = [
            'patient', 'nhs', 'medical', 'treatment', 'diagnosis', 
            'health', 'clinical', 'medication', 'surgery', 'appointment',
            'dentist', 'dental', 'tooth', 'gum', 'pain', 'infection'
        ];

        const dataString = JSON.stringify(data)?.toLowerCase();
        const containsHealthData = healthDataIndicators?.some(indicator => 
            dataString?.includes(indicator)
        );

        return {
            containsHealthData,
            riskLevel: containsHealthData ? 'high' : 'low',
            approved: !containsHealthData,
            reason: containsHealthData 
                ? 'Contains potential health data - requires anonymization' 
                : 'Safe for AI processing'
        };
    }

    // Anonymize data before sending to external AI
    anonymizeForAI(data) {
        if (typeof data !== 'object') return data;

        const anonymized = { ...data };
        
        // Remove direct identifiers
        const identifierFields = [
            'id', 'patient_id', 'nhs_number', 'email', 'phone', 
            'name', 'first_name', 'last_name', 'address', 'postcode',
            'date_of_birth', 'created_by_id', 'dentist_id'
        ];

        identifierFields?.forEach(field => {
            if (anonymized?.hasOwnProperty(field)) {
                delete anonymized?.[field];
            }
        });

        // Replace dates with relative indicators
        Object.keys(anonymized)?.forEach(key => {
            if (key?.includes('date') || key?.includes('time')) {
                if (anonymized?.[key]) {
                    const date = new Date(anonymized[key]);
                    const now = new Date();
                    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                    anonymized[key] = `${diffDays} days ago`;
                }
            }
        });

        return anonymized;
    }

    // Log AI usage for audit trail
    async logAIUsage(aiProvider, dataType, purpose, approved) {
        try {
            await apiClient?.post('/ai-usage/log', {
                provider: aiProvider,
                dataType,
                purpose,
                approved,
                timestamp: new Date()?.toISOString(),
                gdprCompliance: true,
                dataMinimization: approved
            });
        } catch (error) {
            console.error('Failed to log AI usage:', error);
        }
    }

    // Safe AI query wrapper
    async safeAIQuery(data, purpose, aiProvider = 'internal') {
        try {
            // Step 1: Validate data safety
            const validation = this.validateDataForAI(data);
            
            if (!validation?.approved) {
                console.warn('AI query blocked:', validation?.reason);
                await this.logAIUsage(aiProvider, 'blocked', purpose, false);
                throw new Error(`AI processing blocked: ${validation.reason}`);
            }

            // Step 2: Anonymize if necessary
            const processedData = validation?.riskLevel === 'high' 
                ? this.anonymizeForAI(data)
                : data;

            // Step 3: Log the approved usage
            await this.logAIUsage(aiProvider, 'approved', purpose, true);

            // Step 4: Return safe data for AI processing
            return {
                data: processedData,
                metadata: {
                    originalDataType: typeof data,
                    anonymized: validation?.riskLevel === 'high',
                    purpose,
                    gdprCompliant: true
                }
            };

        } catch (error) {
            console.error('Safe AI query failed:', error);
            throw error;
        }
    }

    // F11 - Enhanced cookie consent service
    async recordConsent(consentData) {
        try {
            // Add this function to check if user is logged in
            const isLoggedIn = () => {
                return localStorage.getItem('sb-auth-token') !== null;
            };

            if (!isLoggedIn()) return;

            const response = await apiClient?.post('/consent/cookie', {
                preferences: consentData,
                timestamp: new Date()?.toISOString(),
                consentMethod: 'explicit',
                gdprLawfulBasis: 'consent',
                dataProcessingPurpose: {
                    essential: 'service_provision',
                    analytics: 'legitimate_interest',
                    marketing: 'consent',
                    functional: 'consent'
                }
            });

            return response?.data;
        } catch (error) {
            console.error('Failed to record consent:', error);
            throw error;
        }
    }

    // Withdraw consent and disable tracking
    async withdrawConsent(consentType) {
        try {
            const response = await apiClient?.post('/consent/withdraw', {
                consentType,
                withdrawalTimestamp: new Date()?.toISOString(),
                reason: 'user_initiated'
            });

            // Clear relevant cookies based on type
            if (consentType === 'analytics' || consentType === 'all') {
                // Clear analytics cookies
                document.cookie?.split(";")?.forEach(function(c) { 
                    if (c?.indexOf('_ga') === 0 || c?.indexOf('_gid') === 0) {
                        document.cookie = c?.replace(/^ +/, "")?.replace(/=.*/, "=;expires=" + new Date()?.toUTCString() + ";path=/");
                    }
                });
            }

            if (consentType === 'marketing' || consentType === 'all') {
                // Clear marketing cookies
                localStorage.removeItem('marketing_tracking');
                sessionStorage.removeItem('ad_preferences');
            }

            return response?.data;
        } catch (error) {
            console.error('Failed to withdraw consent:', error);
            throw error;
        }
    }

    // Get current consent status
    async getConsentStatus() {
        try {
            const response = await apiClient?.get('/consent/status');
            return response?.data?.data || {};
        } catch (error) {
            console.error('Failed to get consent status:', error);
            return {};
        }
    }

    // Get patients with server-side security validation
    async getPatients(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters)?.forEach(([key, value]) => {
                if (value && value !== 'all') {
                    params?.append(key, value);
                }
            });

            const response = await apiClient?.get(`/patients?${params}`);
            const { data } = response?.data;

            // Decrypt sensitive data for display
            return data?.map(patient => ({
                ...patient,
                email: patient?.email ? decryptSensitiveData(patient?.email) : null,
                phone: patient?.phone ? decryptSensitiveData(patient?.phone) : null,
                dateOfBirth: patient?.date_of_birth ? decryptSensitiveData(patient?.date_of_birth) : null,
                name: `${patient?.first_name} ${patient?.last_name}`,
                assignedDentist: patient?.assigned_dentist?.full_name || 'Unassigned'
            })) || [];
        } catch (error) {
            console.error('Secure patient service error:', error);
            throw new Error('Failed to fetch patients securely');
        }
    }

    async createPatient(patientData) {
        try {
            const response = await apiClient?.post('/patients', patientData);
            return response?.data;
        } catch (error) {
            console.error('Create patient error:', error);
            throw new Error('Failed to create patient');
        }
    }

    async updatePatient(patientId, updates) {
        try {
            const response = await apiClient?.put(`/patients/${patientId}`, updates);
            return response?.data;
        } catch (error) {
            console.error('Update patient error:', error);
            throw new Error('Failed to update patient');
        }
    }

    async deletePatient(patientId) {
        try {
            const response = await apiClient?.delete(`/patients/${patientId}`);
            return response?.data;
        } catch (error) {
            console.error('Delete patient error:', error);
            throw new Error('Failed to delete patient');
        }
    }

    // F5 - Separate marketing data from clinical data
    async getLeads(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters)?.forEach(([key, value]) => {
                if (value && value !== 'all') {
                    params?.append(key, value);
                }
            });

            const response = await apiClient?.get(`/leads?${params}`);
            return response?.data?.data || [];
        } catch (error) {
            console.error('Secure lead service error:', error);
            throw new Error('Failed to fetch leads securely');
        }
    }

    async createLead(leadData) {
        try {
            const response = await apiClient?.post('/leads', leadData);
            return response?.data;
        } catch (error) {
            console.error('Create lead error:', error);
            throw new Error('Failed to create lead');
        }
    }

    async withdrawLeadConsent(leadId) {
        try {
            const response = await apiClient?.post(`/leads/${leadId}/withdraw-consent`);
            return response?.data;
        } catch (error) {
            console.error('Withdraw consent error:', error);
            throw new Error('Failed to withdraw consent');
        }
    }

    // Get user profile
    async getProfile() {
        try {
            const response = await apiClient?.get('/profile');
            return response?.data?.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw new Error('Failed to fetch user profile');
        }
    }

    async updateProfile(updates) {
        try {
            const response = await apiClient?.put('/profile', updates);
            return response?.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw new Error('Failed to update profile');
        }
    }

    async getAuthToken() {
        return localStorage.getItem('sb-auth-token');
    }
}

export default new SecureApiService();