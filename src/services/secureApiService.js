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

// F3 - Secure API methods with server-side RBAC validation

export const securePatientService = {
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
    },

    async createPatient(patientData) {
        try {
            const response = await apiClient?.post('/patients', patientData);
            return response?.data;
        } catch (error) {
            console.error('Create patient error:', error);
            throw new Error('Failed to create patient');
        }
    },

    async updatePatient(patientId, updates) {
        try {
            const response = await apiClient?.put(`/patients/${patientId}`, updates);
            return response?.data;
        } catch (error) {
            console.error('Update patient error:', error);
            throw new Error('Failed to update patient');
        }
    },

    async deletePatient(patientId) {
        try {
            const response = await apiClient?.delete(`/patients/${patientId}`);
            return response?.data;
        } catch (error) {
            console.error('Delete patient error:', error);
            throw new Error('Failed to delete patient');
        }
    }
};

export const secureLeadService = {
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
    },

    async createLead(leadData) {
        try {
            const response = await apiClient?.post('/leads', leadData);
            return response?.data;
        } catch (error) {
            console.error('Create lead error:', error);
            throw new Error('Failed to create lead');
        }
    },

    async withdrawConsent(leadId) {
        try {
            const response = await apiClient?.post(`/leads/${leadId}/withdraw-consent`);
            return response?.data;
        } catch (error) {
            console.error('Withdraw consent error:', error);
            throw new Error('Failed to withdraw consent');
        }
    }
};

export const secureUserService = {
    async getProfile() {
        try {
            const response = await apiClient?.get('/profile');
            return response?.data?.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw new Error('Failed to fetch user profile');
        }
    },

    async updateProfile(updates) {
        try {
            const response = await apiClient?.put('/profile', updates);
            return response?.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw new Error('Failed to update profile');
        }
    }
};

// F4 & F5 - Admin-only security and compliance functions
export const secureAdminService = {
    async getAuditLogs() {
        try {
            const response = await apiClient?.get('/admin/audit-logs');
            return response?.data?.data || [];
        } catch (error) {
            console.error('Get audit logs error:', error);
            throw new Error('Failed to fetch audit logs');
        }
    },

    async markDataForDeletion() {
        try {
            const response = await apiClient?.post('/admin/mark-for-deletion');
            return response?.data;
        } catch (error) {
            console.error('Mark for deletion error:', error);
            throw new Error('Failed to mark data for deletion');
        }
    },

    async getRetentionPolicies() {
        try {
            const response = await apiClient?.get('/admin/retention-policies');
            return response?.data?.data || [];
        } catch (error) {
            console.error('Get retention policies error:', error);
            throw new Error('Failed to fetch retention policies');
        }
    },

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
};

// Health check for API connectivity
export const checkApiHealth = async () => {
    try {
        const response = await apiClient?.get('/health');
        return response?.data;
    } catch (error) {
        console.error('API health check failed:', error);
        throw new Error('API server unavailable');
    }
};

// F13 - AI Usage Policy compliance service
export const secureAIService = {
    // Check if data contains special category health information
    validateDataForAI: (data) => {
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
                ? 'Contains potential health data - requires anonymization' :'Safe for AI processing'
        };
    },

    // Anonymize data before sending to external AI
    anonymizeForAI: (data) => {
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
    },

    // Log AI usage for audit trail
    logAIUsage: async (aiProvider, dataType, purpose, approved) => {
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
    },

    // Safe AI query wrapper
    safeAIQuery: async (data, purpose, aiProvider = 'internal') => {
        try {
            // Step 1: Validate data safety
            const validation = secureAIService?.validateDataForAI(data);
            
            if (!validation?.approved) {
                console.warn('AI query blocked:', validation?.reason);
                await secureAIService?.logAIUsage(aiProvider, 'blocked', purpose, false);
                throw new Error(`AI processing blocked: ${validation.reason}`);
            }

            // Step 2: Anonymize if necessary
            const processedData = validation?.riskLevel === 'high' 
                ? secureAIService?.anonymizeForAI(data)
                : data;

            // Step 3: Log the approved usage
            await secureAIService?.logAIUsage(aiProvider, 'approved', purpose, true);

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
};

// F11 - Enhanced cookie consent service
export const cookieConsentService = {
    // Record granular consent to compliance database
    recordConsent: async (consentData) => {
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
    },

    // Withdraw consent and disable tracking
    withdrawConsent: async (consentType) => {
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
    },

    // Get current consent status
    getConsentStatus: async () => {
        try {
            const response = await apiClient?.get('/consent/status');
            return response?.data?.data || {};
        } catch (error) {
            console.error('Failed to get consent status:', error);
            return {};
        }
    }
};

// Export updated default service object
export default {
    patient: securePatientService,
    lead: secureLeadService,
    user: secureUserService,
    admin: secureAdminService,
    ai: secureAIService,
    consent: cookieConsentService,
    checkHealth: checkApiHealth
};