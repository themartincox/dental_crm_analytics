import { schemas, ValidationError } from '../utils/validation.js';

// Middleware factory for request validation
export const validateRequest = (schema, options = {}) => {
  return (req, res, next) => {
    try {
      const { body, params, query } = req;
      const dataToValidate = { ...body, ...params, .query };
      
      // Validate the data
      const validatedData = schema.validate(dataToValidate);
      
      // Replace request data with validated data
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: error.message,
          details: error.details,
          code: error.code
        });
      }
      
      next(error);
    }
  };
};

// Specific validation middlewares
export const validatePatient = validateRequest(schemas.patient);
export const validateAppointment = validateRequest(schemas.appointment);
export const validateLead = validateRequest(schemas.lead);
export const validatePayment = validateRequest(schemas.payment);

// Rate limiting middleware
export const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [key, timestamp] of requests.entries()) {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    }
    
    // Check current requests
    const userRequests = Array.from(requests.entries())
      .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart);
    
    if (userRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    requests.set(`${ip}-${now}`, now);
    
    next();
  };
};

// CSRF protection middleware
export const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'CSRF token mismatch',
      message: 'Invalid or missing CSRF token'
    });
  }
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

// Content type validation
export const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    const contentType = req.get('Content-Type');
    
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      return res.status(415).json({
        error: 'Unsupported media type',
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`
      });
    }
    
    next();
  };
};

// Request size limiting
export const limitRequestSize = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxBytes = parseSize(maxSize);
    
    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: 'Request entity too large',
        message: `Request size exceeds ${maxSize} limit`
      });
    }
    
    next();
  };
};

// Helper function to parse size strings
function parseSize(size) {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  return Math.floor(value * units[unit]);
}

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

