import { describe, it, expect } from 'vitest';
import { rules, patterns, schemas, Validator, ValidationError } from '../validation';

describe('Validation Rules', () => {
  describe('required', () => {
    it('should pass for valid values', () => {
      expect(() => rules.required('test', 'field')).not.toThrow();
      expect(() => rules.required(0, 'field')).not.toThrow();
      expect(() => rules.required(false, 'field')).not.toThrow();
    });

    it('should throw for null, undefined, or empty string', () => {
      expect(() => rules.required(null, 'field')).toThrow(ValidationError);
      expect(() => rules.required(undefined, 'field')).toThrow(ValidationError);
      expect(() => rules.required('', 'field')).toThrow(ValidationError);
    });
  });

  describe('email', () => {
    it('should pass for valid emails', () => {
      expect(() => rules.email('test@example.com', 'email')).not.toThrow();
      expect(() => rules.email('user.name+tag@domain.co.uk', 'email')).not.toThrow();
    });

    it('should throw for invalid emails', () => {
      expect(() => rules.email('invalid-email', 'email')).toThrow(ValidationError);
      expect(() => rules.email('@example.com', 'email')).toThrow(ValidationError);
      expect(() => rules.email('test@', 'email')).toThrow(ValidationError);
    });
  });

  describe('phone', () => {
    it('should pass for valid UK phone numbers', () => {
      expect(() => rules.phone('+44 20 7946 0958', 'uk', 'phone')).not.toThrow();
      expect(() => rules.phone('020 7946 0958', 'uk', 'phone')).not.toThrow();
      expect(() => rules.phone('07946 095 858', 'uk', 'phone')).not.toThrow();
    });

    it('should throw for invalid phone numbers', () => {
      expect(() => rules.phone('123', 'uk', 'phone')).toThrow(ValidationError);
      expect(() => rules.phone('abc-def-ghij', 'uk', 'phone')).toThrow(ValidationError);
    });
  });

  describe('age', () => {
    it('should pass for valid ages', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);
      
      expect(() => rules.age(birthDate.toISOString().split('T')[0], 18, 'age')).not.toThrow();
    });

    it('should throw for underage', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 15);
      
      expect(() => rules.age(birthDate.toISOString().split('T')[0], 18, 'age')).toThrow(ValidationError);
    });
  });

  describe('minLength', () => {
    it('should pass for strings meeting minimum length', () => {
      expect(() => rules.minLength('hello', 3, 'field')).not.toThrow();
      expect(() => rules.minLength('hello', 5, 'field')).not.toThrow();
    });

    it('should throw for strings below minimum length', () => {
      expect(() => rules.minLength('hi', 3, 'field')).toThrow(ValidationError);
    });
  });

  describe('maxLength', () => {
    it('should pass for strings within maximum length', () => {
      expect(() => rules.maxLength('hello', 10, 'field')).not.toThrow();
      expect(() => rules.maxLength('hello', 5, 'field')).not.toThrow();
    });

    it('should throw for strings exceeding maximum length', () => {
      expect(() => rules.maxLength('hello world', 5, 'field')).toThrow(ValidationError);
    });
  });
});

describe('Validation Patterns', () => {
  describe('email pattern', () => {
    it('should match valid email formats', () => {
      expect(patterns.email.test('test@example.com')).toBe(true);
      expect(patterns.email.test('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should not match invalid email formats', () => {
      expect(patterns.email.test('invalid-email')).toBe(false);
      expect(patterns.email.test('@example.com')).toBe(false);
      expect(patterns.email.test('test@')).toBe(false);
    });
  });

  describe('phone patterns', () => {
    it('should match valid UK phone numbers', () => {
      expect(patterns.phone.uk.test('+44 20 7946 0958')).toBe(true);
      expect(patterns.phone.uk.test('020 7946 0958')).toBe(true);
      expect(patterns.phone.uk.test('07946 095 858')).toBe(true);
    });

    it('should match valid US phone numbers', () => {
      expect(patterns.phone.us.test('(555) 123-4567')).toBe(true);
      expect(patterns.phone.us.test('555-123-4567')).toBe(true);
      expect(patterns.phone.us.test('555.123.4567')).toBe(true);
    });
  });
});

describe('Validator Class', () => {
  const schema = {
    name: [rules.required, [rules.minLength, 2], [rules.maxLength, 50]],
    email: [rules.required, rules.email],
    age: [[rules.age, 18]]
  };

  const validator = new Validator(schema);

  it('should validate correct data', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      age: '1990-01-01'
    };

    const result = validator.validate(data);
    expect(result).toEqual(data);
  });

  it('should throw ValidationError for invalid data', () => {
    const data = {
      name: 'J', // Too short
      email: 'invalid-email',
      age: '2010-01-01' // Too young
    };

    expect(() => validator.validate(data)).toThrow(ValidationError);
  });

  it('should return detailed error information', () => {
    const data = {
      name: 'J',
      email: 'invalid-email',
      age: '2010-01-01'
    };

    try {
      validator.validate(data);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.details.errors).toHaveLength(3);
      expect(error.details.errors[0].field).toBe('name');
      expect(error.details.errors[1].field).toBe('email');
      expect(error.details.errors[2].field).toBe('age');
    }
  });
});

describe('Predefined Schemas', () => {
  describe('patient schema', () => {
    it('should validate correct patient data', () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+44 20 7946 0958',
        dateOfBirth: '1990-01-01',
        address: '123 Main Street',
        postcode: 'SW1A 1AA'
      };

      expect(() => schemas.patient.validate(patientData)).not.toThrow();
    });

    it('should reject invalid patient data', () => {
      const patientData = {
        firstName: 'J', // Too short
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '123', // Invalid phone
        dateOfBirth: '2010-01-01' // Too young
      };

      expect(() => schemas.patient.validate(patientData)).toThrow(ValidationError);
    });
  });

  describe('appointment schema', () => {
    it('should validate correct appointment data', () => {
      const appointmentData = {
        patientId: '123',
        dentistId: '456',
        appointmentDate: '2024-12-31',
        startTime: '10:00',
        endTime: '11:00',
        treatmentType: 'Checkup',
        notes: 'Regular checkup'
      };

      expect(() => schemas.appointment.validate(appointmentData)).not.toThrow();
    });

    it('should reject past appointment dates', () => {
      const appointmentData = {
        patientId: '123',
        dentistId: '456',
        appointmentDate: '2020-01-01', // Past date
        startTime: '10:00',
        endTime: '11:00',
        treatmentType: 'Checkup'
      };

      expect(() => schemas.appointment.validate(appointmentData)).toThrow(ValidationError);
    });
  });

  describe('lead schema', () => {
    it('should validate correct lead data', () => {
      const leadData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+44 20 7946 0958',
        leadSource: 'google-ads',
        leadStatus: 'new',
        interestLevel: 'high',
        estimatedValue: 5000
      };

      expect(() => schemas.lead.validate(leadData)).not.toThrow();
    });

    it('should reject invalid lead source', () => {
      const leadData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        leadSource: 'invalid-source',
        leadStatus: 'new'
      };

      expect(() => schemas.lead.validate(leadData)).toThrow(ValidationError);
    });
  });

  describe('payment schema', () => {
    it('should validate card payment data', () => {
      const paymentData = {
        amount: 150.00,
        paymentMethod: 'card',
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123'
      };

      expect(() => schemas.payment.validate(paymentData)).not.toThrow();
    });

    it('should reject expired card', () => {
      const paymentData = {
        amount: 150.00,
        paymentMethod: 'card',
        cardNumber: '4111111111111111',
        expiryDate: '01/20', // Expired
        cvv: '123'
      };

      expect(() => schemas.payment.validate(paymentData)).toThrow(ValidationError);
    });
  });
});

