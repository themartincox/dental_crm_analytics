import { leadsService } from './dentalCrmService';
import { emailService } from './emailService';

// Waitlist Service - Extends leads service for marketing page functionality
export const waitlistService = {
  
  /**
   * Add a new waitlist signup to the leads table and send notifications
   * @param {Object} waitlistData - Waitlist form data
   * @returns {Promise<{data, error}>}
   */
  async addToWaitlist(waitlistData) {
    try {
      // Generate unique lead number for waitlist
      const leadNumber = `AES-${Date.now()}-${Math.random()?.toString(36)?.substr(2, 9)?.toUpperCase()}`;
      
      const leadData = {
        first_name: waitlistData?.firstName,
        last_name: waitlistData?.lastName,
        email: waitlistData?.email,
        phone: waitlistData?.phone || null,
        source: 'website', // Use website as source for waitlist signups
        status: 'new', // Default status for new waitlist members
        notes: `Waitlist signup from AES CRM marketing page. ${waitlistData?.practiceName ? `Practice: ${waitlistData?.practiceName}. ` : ''}${waitlistData?.interest ? `Interest: ${waitlistData?.interest}` : ''}`,
        lead_number: leadNumber,
        treatment_interest: waitlistData?.interest === 'cosmetic' ? 'cosmetic' : 
                           waitlistData?.interest === 'general' ? 'general' : 
                           waitlistData?.interest === 'orthodontics' ? 'orthodontics' : null,
        utm_source: waitlistData?.utm_source || 'aescrm_landing',
        utm_medium: waitlistData?.utm_medium || 'waitlist_form',
        utm_campaign: waitlistData?.utm_campaign || 'pre_launch_waitlist'
      };

      // Store lead in database
      const result = await leadsService?.create(leadData);
      
      if (result?.error) {
        throw new Error(result.error.message || 'Failed to create lead record');
      }

      // Send notification email to admin (martin@postino.cc)
      const notificationResult = await emailService.sendWaitlistNotification(waitlistData, leadNumber);
      if (!notificationResult.success) {
        console.error('Failed to send notification email:', notificationResult.error);
        // Don't fail the entire process if email fails
      }

      // Send welcome email to the signup
      const welcomeResult = await emailService.sendWelcomeEmail(waitlistData, leadNumber);
      if (!welcomeResult.success) {
        console.error('Failed to send welcome email:', welcomeResult.error);
        // Don't fail the entire process if email fails
      }
      
      return {
        success: true,
        data: result?.data,
        error: null,
        leadNumber,
        emailsSent: {
          notification: notificationResult.success,
          welcome: welcomeResult.success
        }
      };
    } catch (error) {
      console.error('Waitlist signup error:', error);
      return {
        success: false,
        data: null,
        error: error?.message || 'Failed to add to waitlist',
        leadNumber: null,
        emailsSent: {
          notification: false,
          welcome: false
        }
      };
    }
  },

  /**
   * Get waitlist statistics
   * @returns {Promise<{totalWaitlist, error}>}
   */
  async getWaitlistStats() {
    try {
      const { data, error } = await leadsService?.getAll({ 
        source: 'website',
        status: 'new'
      });

      if (error) {
        return { totalWaitlist: 0, error };
      }

      // Filter for waitlist signups from marketing page
      const waitlistMembers = data?.filter(lead => 
        lead?.utm_source === 'aescrm_landing' && 
        lead?.utm_campaign === 'pre_launch_waitlist'
      ) || [];

      return {
        totalWaitlist: waitlistMembers?.length || 0,
        error: null
      };
    } catch (error) {
      return {
        totalWaitlist: 0,
        error: error?.message || 'Failed to get waitlist stats'
      };
    }
  },

  /**
   * Validate email format
   * @param {string} email 
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex?.test(email);
  },

  /**
   * Check if email is already on waitlist
   * @param {string} email 
   * @returns {Promise<{exists, error}>}
   */
  async checkEmailExists(email) {
    try {
      if (!this.isValidEmail(email)) {
        return { exists: false, error: 'Invalid email format' };
      }

      const { data, error } = await leadsService?.getAll({ 
        source: 'website'
      });

      if (error) {
        return { exists: false, error };
      }

      // Check if email exists in waitlist signups
      const existingLead = data?.find(lead => 
        lead?.email?.toLowerCase() === email?.toLowerCase() &&
        lead?.utm_source === 'aescrm_landing'
      );

      return {
        exists: !!existingLead,
        error: null,
        leadData: existingLead || null
      };
    } catch (error) {
      return {
        exists: false,
        error: error?.message || 'Failed to check email',
        leadData: null
      };
    }
  }
};

export default waitlistService;