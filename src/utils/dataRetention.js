// F5 - Data retention helper utilities for GDPR compliance
import secureApiService from '../services/secureApiService';

// Data retention categories and their requirements
export const RETENTION_CATEGORIES = {
    CLINICAL_DATA: {
        category: 'clinical_data',
        period_days: 4015, // 11 years (NHS guidance)
        description: 'Patient medical records and treatment history',
        legal_basis: 'Healthcare Records Management Code of Practice'
    },
    MARKETING_DATA: {
        category: 'marketing_data', 
        period_days: 730, // 2 years
        description: 'Marketing consent and lead information',
        legal_basis: 'GDPR Article 5(1)(e) - storage limitation'
    },
    USER_DATA: {
        category: 'user_data',
        period_days: 2555, // 7 years
        description: 'User account and business records',
        legal_basis: 'Companies Act 2006'
    },
    AUDIT_LOGS: {
        category: 'audit_logs',
        period_days: 2190, // 6 years
        description: 'Security and compliance audit trails',
        legal_basis: 'GDPR Article 30 - records of processing'
    }
};

// Calculate retention dates based on category
export const calculateRetentionDate = (createdDate, category) => {
    const retentionInfo = RETENTION_CATEGORIES?.[category];
    if (!retentionInfo) {
        console.warn(`Unknown retention category: ${category}`);
        return null;
    }
    
    const createdDateTime = new Date(createdDate);
    const retentionDate = new Date(createdDateTime);
    retentionDate?.setDate(retentionDate?.getDate() + retentionInfo?.period_days);
    
    return retentionDate;
};

// Check if data should be retained based on category and consent
export const shouldRetainData = (item, category) => {
    const now = new Date();
    const createdDate = new Date(item.created_at);
    const maxRetentionDate = calculateRetentionDate(createdDate, category);
    
    // Check if consent has been withdrawn
    if (item?.consent_withdrawn_date) {
        const withdrawnDate = new Date(item.consent_withdrawn_date);
        // For marketing data, delete immediately after consent withdrawal
        if (category === 'MARKETING_DATA') {
            return false;
        }
        // For clinical data, still respect minimum retention periods
        if (category === 'CLINICAL_DATA') {
            const minRetentionDate = new Date(withdrawnDate);
            minRetentionDate?.setFullYear(minRetentionDate?.getFullYear() + 1); // 1 year minimum
            return now < minRetentionDate;
        }
    }
    
    // Check maximum retention period
    return now < maxRetentionDate;
};

// Format retention information for display
export const getRetentionInfo = (item, category) => {
    const retentionCategory = RETENTION_CATEGORIES?.[category];
    if (!retentionCategory) return null;
    
    const createdDate = new Date(item.created_at);
    const retentionDate = calculateRetentionDate(createdDate, category);
    const now = new Date();
    
    const daysRemaining = Math.ceil((retentionDate - now) / (1000 * 60 * 60 * 24));
    
    return {
        category: retentionCategory?.category,
        description: retentionCategory?.description,
        legal_basis: retentionCategory?.legal_basis,
        retention_date: retentionDate,
        days_remaining: Math.max(0, daysRemaining),
        should_retain: shouldRetainData(item, category),
        consent_status: item?.consent_withdrawn_date ? 'withdrawn' : 'active'
    };
};

// Data retention management functions (admin only)
export const dataRetentionService = {
    // Get all retention policies
    async getRetentionPolicies() {
        try {
            return await secureApiService?.admin?.getRetentionPolicies();
        } catch (error) {
            console.error('Failed to fetch retention policies:', error);
            return Object.values(RETENTION_CATEGORIES);
        }
    },
    
    // Mark expired data for deletion
    async markExpiredDataForDeletion() {
        try {
            return await secureApiService?.admin?.markDataForDeletion();
        } catch (error) {
            console.error('Failed to mark data for deletion:', error);
            throw new Error('Unable to process data retention. Please try again.');
        }
    },
    
    // Withdraw consent for marketing data
    async withdrawMarketingConsent(leadId) {
        try {
            return await secureApiService?.lead?.withdrawConsent(leadId);
        } catch (error) {
            console.error('Failed to withdraw consent:', error);
            throw new Error('Unable to withdraw consent. Please contact support.');
        }
    },
    
    // Generate retention compliance report
    async generateComplianceReport(startDate, endDate) {
        try {
            const reportData = await secureApiService?.admin?.exportComplianceReport(startDate, endDate);
            
            // Create download link
            const blob = new Blob([reportData], { type: 'text/csv' });
            const url = window.URL?.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `retention-compliance-report-${startDate}-to-${endDate}.csv`;
            document.body?.appendChild(link);
            link?.click();
            document.body?.removeChild(link);
            window.URL?.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Failed to generate compliance report:', error);
            throw new Error('Unable to generate report. Please try again.');
        }
    }
};

// Utility functions for retention status display
export const getRetentionStatusColor = (item, category) => {
    const info = getRetentionInfo(item, category);
    if (!info) return 'gray';
    
    if (!info?.should_retain) return 'red';
    if (info?.days_remaining < 30) return 'orange';
    if (info?.days_remaining < 90) return 'yellow';
    return 'green';
};

export const getRetentionStatusText = (item, category) => {
    const info = getRetentionInfo(item, category);
    if (!info) return 'Unknown';
    
    if (!info?.should_retain) return 'Scheduled for deletion';
    if (info?.consent_status === 'withdrawn') return 'Consent withdrawn';
    if (info?.days_remaining < 30) return `${info?.days_remaining} days remaining`;
    if (info?.days_remaining < 365) return `${Math.ceil(info?.days_remaining / 30)} months remaining`;
    return `${Math.ceil(info?.days_remaining / 365)} years remaining`;
};

// Format dates for display
export const formatRetentionDate = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })?.format(new Date(date));
};

// Export default service
export default {
    RETENTION_CATEGORIES,
    calculateRetentionDate,
    shouldRetainData,
    getRetentionInfo,
    getRetentionStatusColor,
    getRetentionStatusText,
    formatRetentionDate,
    dataRetentionService
};