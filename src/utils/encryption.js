// F6 - Client-side encryption utilities for sensitive data handling
import CryptoJS from 'crypto-js';

// Get encryption key from environment or use default (should be rotated in production)
const ENCRYPTION_KEY = import.meta.env?.VITE_CLIENT_ENCRYPTION_KEY || 'dental-crm-default-key-2024';

// Encrypt sensitive data before storing locally or transmitting
export const encryptData = (data) => {
    try {
        if (!data) return null;
        
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const encrypted = CryptoJS?.AES?.encrypt(dataString, ENCRYPTION_KEY)?.toString();
        
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

// Decrypt sensitive data for display
export const decryptData = (encryptedData) => {
    try {
        if (!encryptedData) return null;
        
        const bytes = CryptoJS?.AES?.decrypt(encryptedData, ENCRYPTION_KEY);
        const decrypted = bytes?.toString(CryptoJS?.enc?.Utf8);
        
        if (!decrypted) return '[Invalid Data]';
        
        // Try to parse as JSON, fallback to string
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        return '[Encrypted]';
    }
};

// Hash sensitive data for comparison (one-way)
export const hashData = (data) => {
    try {
        if (!data) return null;
        
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        return CryptoJS?.SHA256(dataString)?.toString();
    } catch (error) {
        console.error('Hashing error:', error);
        return null;
    }
};

// Generate secure random strings
export const generateSecureRandom = (length = 32) => {
    try {
        return CryptoJS?.lib?.WordArray?.random(length / 2)?.toString();
    } catch (error) {
        console.error('Random generation error:', error);
        return Math.random()?.toString(36)?.substring(2, length + 2);
    }
};

// F6 - HTTPS enforcement utility
export const enforceHTTPS = () => {
    // Only enforce HTTPS in production
    if (import.meta.env?.PROD && window.location?.protocol !== 'https:') {
        window.location.href = `https:${window.location?.href?.substring(window.location?.protocol?.length)}`;
    }
};

// Secure session storage with encryption
export const secureStorage = {
    setItem: (key, value) => {
        try {
            const encrypted = encryptData(value);
            if (encrypted) {
                sessionStorage.setItem(key, encrypted);
            }
        } catch (error) {
            console.error('Secure storage set error:', error);
        }
    },
    
    getItem: (key) => {
        try {
            const encrypted = sessionStorage.getItem(key);
            return encrypted ? decryptData(encrypted) : null;
        } catch (error) {
            console.error('Secure storage get error:', error);
            return null;
        }
    },
    
    removeItem: (key) => {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error('Secure storage remove error:', error);
        }
    },
    
    clear: () => {
        try {
            sessionStorage.clear();
        } catch (error) {
            console.error('Secure storage clear error:', error);
        }
    }
};

// Data sanitization utilities
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return (
        // Remove event handlers
        // Remove JavaScript protocols
        // Remove potential HTML tags
        input?.replace(/[<>]/g, '')?.replace(/javascript:/gi, '')?.replace(/on\w+=/gi, '')?.trim()
    );
};

// Format sensitive data for display (partial masking)
export const maskSensitiveData = (data, type = 'general') => {
    if (!data) return '';
    
    const str = String(data);
    
    switch (type) {
        case 'email':
            const atIndex = str?.indexOf('@');
            if (atIndex > 2) {
                return str?.substring(0, 2) + '***' + str?.substring(atIndex);
            }
            return '***' + str?.substring(str?.length - 3);
            
        case 'phone':
            if (str?.length > 6) {
                return str?.substring(0, 3) + '***' + str?.substring(str?.length - 3);
            }
            return '***' + str?.substring(str?.length - 2);
            
        case 'nhs_number':
            if (str?.length === 10) {
                return str?.substring(0, 3) + ' *** ' + str?.substring(7);
            }
            return '*** ' + str?.substring(str?.length - 3);
            
        case 'postcode':
            const parts = str?.split(' ');
            if (parts?.length === 2) {
                return parts?.[0] + ' ***';
            }
            return str?.substring(0, 3) + '***';
            
        default:
            return str?.substring(0, 2) + '*'?.repeat(Math.max(0, str?.length - 4)) + str?.substring(str?.length - 2);
    }
};

// Export all utilities
export default {
    encryptData,
    decryptData,
    hashData,
    generateSecureRandom,
    enforceHTTPS,
    secureStorage,
    sanitizeInput,
    maskSensitiveData
};