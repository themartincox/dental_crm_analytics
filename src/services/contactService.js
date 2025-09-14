import { emailService } from './emailService';
import { logger } from '../utils/logger';

// Contact Service - Handles contact form submissions and notifications
export const contactService = {
  
  /**
   * Submit contact form and send notifications
   * @param {Object} contactData - Contact form data
   * @returns {Promise<{success, error}>}
   */
  async submitContactForm(contactData) {
    try {
      // Validate required fields
      if (!contactData.name || !contactData.email || !contactData.message) {
        throw new Error('Name, email, and message are required');
      }

      // Send notification email to admin (martin@postino.cc)
      const notificationResult = await emailService.sendContactNotification(contactData);
      if (!notificationResult.success) {
        logger.error('Failed to send contact notification', {
          error: notificationResult.error,
          service: 'contactService',
          operation: 'submitContactForm'
        });
        // Don't fail the entire process if email fails
      }

      // Store contact submission in database (optional - for tracking purposes)
      // This could be stored in a contacts table if needed
      
      return {
        success: true,
        error: null,
        emailSent: notificationResult.success
      };
    } catch (error) {
      logger.error('Contact form submission error', {
        error: error.message,
        stack: error.stack,
        service: 'contactService',
        operation: 'submitContactForm'
      });
      return {
        success: false,
        error: error.message || 'Failed to submit contact form',
        emailSent: false
      };
    }
  },

  /**
   * Submit pricing inquiry
   * @param {Object} inquiryData - Pricing inquiry data
   * @returns {Promise<{success, error}>}
   */
  async submitPricingInquiry(inquiryData) {
    try {
      // Validate required fields
      if (!inquiryData.name || !inquiryData.email) {
        throw new Error('Name and email are required');
      }

      // Format as contact data for email service
      const contactData = {
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone || null,
        company: inquiryData.company || null,
        subject: 'Pricing Inquiry',
        message: `Pricing inquiry from ${inquiryData.name}${inquiryData.company ? ` at ${inquiryData.company}` : ''}.\n\n` +
                `Number of seats: ${inquiryData.seats || 'Not specified'}\n` +
                `Practice type: ${inquiryData.practiceType || 'Not specified'}\n` +
                `Additional requirements: ${inquiryData.requirements || 'None specified'}\n\n` +
                `Message: ${inquiryData.message || 'No additional message'}`
      };

      // Send notification email to admin
      const notificationResult = await emailService.sendContactNotification(contactData);
      if (!notificationResult.success) {
        console.error('Failed to send pricing inquiry notification:', notificationResult.error);
      }

      return {
        success: true,
        error: null,
        emailSent: notificationResult.success
      };
    } catch (error) {
      console.error('Pricing inquiry submission error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit pricing inquiry',
        emailSent: false
      };
    }
  },

  /**
   * Submit demo request
   * @param {Object} demoData - Demo request data
   * @returns {Promise<{success, error}>}
   */
  async submitDemoRequest(demoData) {
    try {
      // Validate required fields
      if (!demoData.name || !demoData.email) {
        throw new Error('Name and email are required');
      }

      // Format as contact data for email service
      const contactData = {
        name: demoData.name,
        email: demoData.email,
        phone: demoData.phone || null,
        company: demoData.company || null,
        subject: 'Demo Request',
        message: `Demo request from ${demoData.name}${demoData.company ? ` at ${demoData.company}` : ''}.\n\n` +
                `Preferred date: ${demoData.preferredDate || 'Not specified'}\n` +
                `Preferred time: ${demoData.preferredTime || 'Not specified'}\n` +
                `Practice size: ${demoData.practiceSize || 'Not specified'}\n` +
                `Current system: ${demoData.currentSystem || 'Not specified'}\n\n` +
                `Message: ${demoData.message || 'No additional message'}`
      };

      // Send notification email to admin
      const notificationResult = await emailService.sendContactNotification(contactData);
      if (!notificationResult.success) {
        console.error('Failed to send demo request notification:', notificationResult.error);
      }

      return {
        success: true,
        error: null,
        emailSent: notificationResult.success
      };
    } catch (error) {
      console.error('Demo request submission error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit demo request',
        emailSent: false
      };
    }
  }
};
