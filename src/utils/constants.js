// Application constants for better maintainability

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  TIME_ONLY: 'HH:mm',
  DATE_ONLY: 'YYYY-MM-DD'
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false
  },
  EMAIL: {
    MAX_LENGTH: 254
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50
  }
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  PRACTICE_ADMIN: 'practice_admin',
  DENTIST: 'dentist',
  HYGIENIST: 'hygienist',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient'
};

// Lead Status
export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost'
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

// Treatment Types
export const TREATMENT_TYPES = {
  GENERAL: 'general',
  COSMETIC: 'cosmetic',
  ORTHODONTICS: 'orthodontics',
  PERIODONTICS: 'periodontics',
  ENDODONTICS: 'endodontics',
  ORAL_SURGERY: 'oral_surgery',
  PREVENTIVE: 'preventive'
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  MAX_FILES: 5
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'aescrm_auth_token',
  USER_PREFERENCES: 'aescrm_user_preferences',
  THEME: 'aescrm_theme',
  LANGUAGE: 'aescrm_language',
  RECENT_SEARCHES: 'aescrm_recent_searches'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  CREATED: 'Item created successfully.',
  UPDATED: 'Item updated successfully.',
  DELETED: 'Item deleted successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  APPOINTMENT_SCHEDULED: 'Appointment scheduled successfully.',
  PATIENT_ADDED: 'Patient added successfully.',
  LEAD_CREATED: 'Lead created successfully.'
};

// Form constants
export const FORM_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  SUBMISSION_SUCCESS: 'Message sent successfully!',
  SUBMISSION_ERROR: 'Something went wrong. Please try again.',
  LOADING: 'Sending...',
  RESPONSE_TIME: "We'll respond within 24 hours"
};

export const FORM_LABELS = {
  NAME: 'Name',
  EMAIL: 'Email',
  PHONE: 'Phone',
  COMPANY: 'Company',
  SUBJECT: 'Subject',
  MESSAGE: 'Message',
  SEND_MESSAGE: 'Send Message'
};

export const FORM_PLACEHOLDERS = {
  NAME: 'Your full name',
  EMAIL: 'your@email.com',
  PHONE: '+44 20 1234 5678',
  COMPANY: 'Your company name',
  MESSAGE: 'Tell us how we can help you...',
  SUBJECT_GENERAL: 'General Inquiry',
  SUBJECT_PRICING: 'Pricing Inquiry',
  SUBJECT_DEMO: 'Demo Request'
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development',
  ENABLE_PWA: process.env.VITE_ENABLE_PWA === 'true',
  ENABLE_OFFLINE_MODE: process.env.VITE_ENABLE_OFFLINE_MODE === 'true'
};

// Default Values
export const DEFAULTS = {
  THEME: 'light',
  LANGUAGE: 'en',
  TIMEZONE: 'Europe/London',
  CURRENCY: 'GBP',
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: '24h'
};

export default {
  API_CONFIG,
  PAGINATION,
  DATE_FORMATS,
  VALIDATION_RULES,
  USER_ROLES,
  LEAD_STATUS,
  APPOINTMENT_STATUS,
  TREATMENT_TYPES,
  FILE_UPLOAD,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ANIMATION_DURATION,
  BREAKPOINTS,
  Z_INDEX,
  FEATURE_FLAGS,
  DEFAULTS
};
