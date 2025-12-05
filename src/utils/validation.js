import React from 'react';
import { ValidationError, AppError, SchemaValidationError } from './errorHandler.jsx';
export { ValidationError }; // Re-export for tests

// Comprehensive data validation utilities

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: {
    uk: /^(\+44|0)(?:[\s-]*\d){9,10}$/,
    us: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    international: /^\+[1-9]\d{1,14}$/
  },
  postcode: {
    uk: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    us: /^\d{5}(-\d{4})?$/
  },
  cardNumber: /^\d{13,19}$/,
  cvv: /^\d{3,4}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
};

// Validation rules
export const rules = {
  required: (value, field) => {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(`${field} is required`, field, value);
    }
    return true;
  },

  minLength: (value, min, field) => {
    if (typeof value === 'string' && value.length < min) {
      throw new ValidationError(`${field} must be at least ${min} characters`, field, value);
    }
    return true;
  },

  maxLength: (value, max, field) => {
    if (typeof value === 'string' && value.length > max) {
      throw new ValidationError(`${field} must be no more than ${max} characters`, field, value);
    }
    return true;
  },

  pattern: (value, regex, field, message) => {
    if (typeof value === 'string' && !regex.test(value)) {
      throw new ValidationError(message || `${field} format is invalid`, field, value);
    }
    return true;
  },

  email: (value, field = 'email') => {
    if (value && !patterns.email.test(value)) {
      throw new ValidationError('Please enter a valid email address', field, value);
    }
    return true;
  },

  phone: (value, country = 'uk', field = 'phone') => {
    if (value) {
      const cleanValue = value.replace(/\s/g, '');
      const regex = patterns.phone[country];
      if (!regex.test(cleanValue)) {
        throw new ValidationError(`Please enter a valid ${country.toUpperCase()} phone number`, field, value);
      }
    }
    return true;
  },

  min: (value, min, field) => {
    const num = Number(value);
    if (!isNaN(num) && num < min) {
      throw new ValidationError(`${field} must be at least ${min}`, field, value);
    }
    return true;
  },

  max: (value, max, field) => {
    const num = Number(value);
    if (!isNaN(num) && num > max) {
      throw new ValidationError(`${field} must be no more than ${max}`, field, value);
    }
    return true;
  },

  age: (birthDate, minAge, field = 'age') => {
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      if (age < minAge) {
        throw new ValidationError(`Must be at least ${minAge} years old`, field, birthDate);
      }
    }
    return true;
  },

  futureDate: (date, field) => {
    if (date && new Date(date) <= new Date()) {
      throw new ValidationError(`${field} must be in the future`, field, date);
    }
    return true;
  },

  pastDate: (date, field) => {
    if (date && new Date(date) >= new Date()) {
      throw new ValidationError(`${field} must be in the past`, field, date);
    }
    return true;
  },

  oneOf: (value, options, field) => {
    if (value && !options.includes(value)) {
      throw new ValidationError(`${field} must be one of: ${options.join(', ')}`, field, value);
    }
    return true;
  },

  array: (value, field) => {
    if (value && !Array.isArray(value)) {
      throw new ValidationError(`${field} must be an array`, field, value);
    }
    return true;
  },

  object: (value, field) => {
    if (value && (typeof value !== 'object' || Array.isArray(value))) {
      throw new ValidationError(`${field} must be an object`, field, value);
    }
    return true;
  }
};

// Schema validation
export class Validator {
  constructor(schema) {
    this.schema = schema;
  }

  validate(data) {
    const errors = [];
    const validatedData = {};

    for (const [field, validations] of Object.entries(this.schema)) {
      const value = data[field];

      try {
        for (const validation of validations) {
          if (typeof validation === 'function') {
            validation(value, field, data);
          } else if (Array.isArray(validation)) {
            const [ruleName, ...args] = validation;
            // Call the rule function with proper arguments
            if (typeof ruleName === 'string' && rules[ruleName]) {
              rules[ruleName](value, ...args, field);
            } else if (typeof ruleName === 'function') {
              ruleName(value, ...args, field, data);
            }
          }
        }
        validatedData[field] = value;
      } catch (error) {
        if (error instanceof ValidationError || error instanceof AppError) {
          errors.push({
            field,
            message: error.message,
            code: error.code || 'VALIDATION_ERROR',
            value: error.details?.value !== undefined ? error.details.value : value
          });
        } else {
          errors.push({
            field,
            message: error.message || 'Validation error',
            code: 'VALIDATION_ERROR',
            value
          });
        }
      }
    }

    if (errors.length > 0) {
      throw new SchemaValidationError(errors);
    }

    return validatedData;
  }
}

// Common schemas
export const schemas = {
  patient: new Validator({
    firstName: [
      rules.required,
      [rules.minLength, 2],
      [rules.maxLength, 50]
    ],
    lastName: [
      rules.required,
      [rules.minLength, 2],
      [rules.maxLength, 50]
    ],
    email: [
      rules.required,
      rules.email
    ],
    phone: [
      rules.required,
      [rules.phone, 'uk']
    ],
    dateOfBirth: [
      rules.required,
      [rules.age, 16]
    ],
    address: [
      (value) => !value || rules.maxLength(value, 200, 'address')
    ],
    postcode: [
      (value) => !value || rules.pattern(value, patterns.postcode.uk, 'postcode', 'Please enter a valid UK postcode')
    ]
  }),

  appointment: new Validator({
    patientId: [
      rules.required
    ],
    dentistId: [
      rules.required
    ],
    appointmentDate: [
      rules.required,
      [rules.pattern, patterns.date, 'appointmentDate', 'Date must be in YYYY-MM-DD format'],
      rules.futureDate
    ],
    startTime: [
      rules.required,
      [rules.pattern, patterns.time, 'startTime', 'Time must be in HH:MM format']
    ],
    endTime: [
      rules.required,
      [rules.pattern, patterns.time, 'endTime', 'Time must be in HH:MM format']
    ],
    treatmentType: [
      rules.required,
      [rules.maxLength, 100]
    ],
    notes: [
      [rules.maxLength, 1000]
    ]
  }),

  lead: new Validator({
    firstName: [
      rules.required,
      [rules.minLength, 2],
      [rules.maxLength, 50]
    ],
    lastName: [
      rules.required,
      [rules.minLength, 2],
      [rules.maxLength, 50]
    ],
    email: [
      rules.required,
      rules.email
    ],
    phone: [
      (value) => !value || rules.phone(value, 'uk', 'phone')
    ],
    leadSource: [
      rules.required,
      [rules.oneOf, ['google-ads', 'facebook', 'organic', 'referral', 'email', 'other']]
    ],
    leadStatus: [
      rules.required,
      [rules.oneOf, ['new', 'contacted', 'qualified', 'converted', 'lost']]
    ],
    interestLevel: [
      [rules.oneOf, ['low', 'medium', 'high']]
    ],
    estimatedValue: [
      [rules.min, 0],
      [rules.max, 100000]
    ]
  }),

  payment: new Validator({
    amount: [
      rules.required,
      [rules.min, 0.01],
      [rules.max, 100000]
    ],
    paymentMethod: [
      rules.required,
      [rules.oneOf, ['card', 'bank_transfer', 'cash', 'cheque']]
    ],
    cardNumber: [
      (value, field, data) => {
        if (data.paymentMethod === 'card') {
          rules.required(value, field);
          rules.pattern(value, patterns.cardNumber, field, 'Please enter a valid card number');
        }
        return true;
      }
    ],
    expiryDate: [
      (value, field, data) => {
        if (data.paymentMethod === 'card') {
          rules.required(value, field);
          const [month, year] = value.split('/');
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;

          if (!month || !year || month > 12 || month < 1) {
            throw new ValidationError('Please enter a valid expiry date', field, value);
          } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            throw new ValidationError('Card has expired', field, value);
          }
        }
        return true;
      }
    ],
    cvv: [
      (value, field, data) => {
        if (data.paymentMethod === 'card') {
          rules.required(value, field);
          rules.pattern(value, patterns.cvv, field, 'Please enter a valid security code');
        }
        return true;
      }
    ]
  })
};

// Sanitization utilities
export const sanitize = {
  string: (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove JavaScript protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  email: (value) => {
    if (typeof value !== 'string') return value;
    return value.toLowerCase().trim();
  },

  phone: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/[^\d+\-\(\)\s]/g, '').trim();
  },

  number: (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  },

  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }
};

// Form validation hook
export const useFormValidation = (schema, initialData = {}) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [isValid, setIsValid] = React.useState(false);

  const validate = React.useCallback(() => {
    try {
      schema.validate(data);
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if ((error instanceof ValidationError || error instanceof AppError) && error.details?.errors) {
        const fieldErrors = {};
        error.details.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.message });
      }
      setIsValid(false);
      return false;
    }
  }, [data, schema]);

  const updateField = React.useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const reset = React.useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsValid(false);
  }, [initialData]);

  React.useEffect(() => {
    validate();
  }, [validate]);

  return {
    data,
    errors,
    isValid,
    updateField,
    validate,
    reset
  };
};
