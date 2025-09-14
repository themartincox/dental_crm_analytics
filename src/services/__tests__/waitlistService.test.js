import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitlistService } from '../waitlistService';
import { leadsService } from '../dentalCrmService';
import { emailService } from '../emailService';

// Mock the dependencies
vi.mock('../dentalCrmService', () => ({
  leadsService: {
    create: vi.fn()
  }
}));

vi.mock('../emailService', () => ({
  emailService: {
    sendWaitlistNotification: vi.fn(),
    sendWelcomeEmail: vi.fn()
  }
}));

describe('waitlistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addToWaitlist', () => {
    it('should successfully add user to waitlist and send emails', async () => {
      // Mock successful database operation
      const mockLeadData = {
        id: 'test-lead-id',
        lead_number: 'AES-1234567890-ABC123DEF',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      };

      leadsService.create.mockResolvedValue({
        data: mockLeadData,
        error: null
      });

      // Mock successful email operations
      emailService.sendWaitlistNotification.mockResolvedValue({
        success: true,
        error: null
      });

      emailService.sendWelcomeEmail.mockResolvedValue({
        success: true,
        error: null
      });

      // Test data
      const waitlistData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        practiceName: 'Test Practice',
        interest: 'cosmetic'
      };

      // Execute
      const result = await waitlistService.addToWaitlist(waitlistData);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.leadNumber).toMatch(/^AES-\d+-[A-Z0-9]+$/);
      expect(result.emailsSent.notification).toBe(true);
      expect(result.emailsSent.welcome).toBe(true);

      // Verify database call
      expect(leadsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          source: 'website',
          status: 'new',
          treatment_interest: 'cosmetic'
        })
      );

      // Verify email calls
      expect(emailService.sendWaitlistNotification).toHaveBeenCalledWith(
        waitlistData,
        expect.stringMatching(/^AES-\d+-[A-Z0-9]+$/)
      );

      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        waitlistData,
        expect.stringMatching(/^AES-\d+-[A-Z0-9]+$/)
      );
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      leadsService.create.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const waitlistData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      const result = await waitlistService.addToWaitlist(waitlistData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.leadNumber).toBeNull();
      expect(result.emailsSent.notification).toBe(false);
      expect(result.emailsSent.welcome).toBe(false);
    });

    it('should continue if email sending fails', async () => {
      // Mock successful database operation
      const mockLeadData = {
        id: 'test-lead-id',
        lead_number: 'AES-1234567890-ABC123DEF'
      };

      leadsService.create.mockResolvedValue({
        data: mockLeadData,
        error: null
      });

      // Mock email failures
      emailService.sendWaitlistNotification.mockResolvedValue({
        success: false,
        error: 'Email service unavailable'
      });

      emailService.sendWelcomeEmail.mockResolvedValue({
        success: false,
        error: 'Email service unavailable'
      });

      const waitlistData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      const result = await waitlistService.addToWaitlist(waitlistData);

      // Should still succeed despite email failures
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.emailsSent.notification).toBe(false);
      expect(result.emailsSent.welcome).toBe(false);
    });

    it('should generate unique lead numbers', async () => {
      leadsService.create.mockResolvedValue({
        data: { id: 'test-id' },
        error: null
      });

      emailService.sendWaitlistNotification.mockResolvedValue({
        success: true,
        error: null
      });

      emailService.sendWelcomeEmail.mockResolvedValue({
        success: true,
        error: null
      });

      const waitlistData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      const result1 = await waitlistService.addToWaitlist(waitlistData);
      const result2 = await waitlistService.addToWaitlist(waitlistData);

      expect(result1.leadNumber).not.toBe(result2.leadNumber);
      expect(result1.leadNumber).toMatch(/^AES-\d+-[A-Z0-9]+$/);
      expect(result2.leadNumber).toMatch(/^AES-\d+-[A-Z0-9]+$/);
    });

    it('should handle missing optional fields', async () => {
      leadsService.create.mockResolvedValue({
        data: { id: 'test-id' },
        error: null
      });

      emailService.sendWaitlistNotification.mockResolvedValue({
        success: true,
        error: null
      });

      emailService.sendWelcomeEmail.mockResolvedValue({
        success: true,
        error: null
      });

      const waitlistData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
        // Missing phone, practiceName, interest
      };

      const result = await waitlistService.addToWaitlist(waitlistData);

      expect(result.success).toBe(true);
      expect(leadsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: null,
          treatment_interest: null
        })
      );
    });
  });
});
