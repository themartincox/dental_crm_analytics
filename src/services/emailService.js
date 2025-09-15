import { supabase } from '../lib/supabase';

// Email Service for sending notifications and marketing emails
export const emailService = {
  
  /**
   * Send waitlist signup notification to admin
   * @param {Object} waitlistData - Waitlist form data
   * @param {string} leadNumber - Generated lead number
   * @returns {Promise<{success, error}>}
   */
  async sendWaitlistNotification(waitlistData, leadNumber) {
    try {
      const emailData = {
        to: 'martin@postino.cc',
        subject: `New Waitlist Signup - ${leadNumber}`,
        template: 'waitlist_notification',
        data: {
          leadNumber,
          firstName: waitlistData.firstName,
          lastName: waitlistData.lastName,
          email: waitlistData.email,
          phone: waitlistData.phone || 'Not provided',
          practiceName: waitlistData.practiceName || 'Not specified',
          interest: waitlistData.interest || 'General CRM',
          signupDate: new Date().toLocaleString('en-GB', {
            timeZone: 'Europe/London',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          utmSource: waitlistData.utm_source || 'aescrm_landing',
          utmMedium: waitlistData.utm_medium || 'waitlist_form',
          utmCampaign: waitlistData.utm_campaign || 'pre_launch_waitlist'
        }
      };

      // Store email in database for tracking
      const { error: emailError } = await supabase
        .from('email_logs')
        .insert([{
          to_email: emailData.to,
          subject: emailData.subject,
          template: emailData.template,
          data: emailData.data,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (emailError) {
        console.error('Error storing email log:', emailError);
      }

      // For now, we'll use a simple email sending approach
      // In production, integrate with SendGrid, Mailgun, or similar service
      const emailContent = this.generateWaitlistEmailContent(emailData.data);
      
      // Log the email content (in production, this would be sent via email service)
      console.log('=== WAITLIST NOTIFICATION EMAIL ===');
      console.log(`To: ${emailData.to}`);
      console.log(`Subject: ${emailData.subject}`);
      console.log('Content:');
      console.log(emailContent);
      console.log('=====================================');

      return { success: true, error: null };
    } catch (error) {
      console.error('Error sending waitlist notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send welcome email to waitlist signup
   * @param {Object} waitlistData - Waitlist form data
   * @param {string} leadNumber - Generated lead number
   * @returns {Promise<{success, error}>}
   */
  async sendWelcomeEmail(waitlistData, leadNumber) {
    try {
      const emailData = {
        to: waitlistData.email,
        subject: 'Welcome to AES CRM Waitlist - You\'re In!',
        template: 'waitlist_welcome',
        data: {
          firstName: waitlistData.firstName,
          lastName: waitlistData.lastName,
          leadNumber,
          practiceName: waitlistData.practiceName || 'Your Practice',
          interest: waitlistData.interest || 'General CRM',
          signupDate: new Date().toLocaleString('en-GB', {
            timeZone: 'Europe/London',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      };

      // Store email in database for tracking
      const { error: emailError } = await supabase
        .from('email_logs')
        .insert([{
          to_email: emailData.to,
          subject: emailData.subject,
          template: emailData.template,
          data: emailData.data,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (emailError) {
        console.error('Error storing email log:', emailError);
      }

      // Generate email content
      const emailContent = this.generateWelcomeEmailContent(emailData.data);
      
      // Log the email content (in production, this would be sent via email service)
      console.log('=== WAITLIST WELCOME EMAIL ===');
      console.log(`To: ${emailData.to}`);
      console.log(`Subject: ${emailData.subject}`);
      console.log('Content:');
      console.log(emailContent);
      console.log('===============================');

      return { success: true, error: null };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate waitlist notification email content
   * @param {Object} data - Email data
   * @returns {string} HTML email content
   */
  generateWaitlistEmailContent(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Waitlist Signup</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 New Waitlist Signup!</h1>
            <p>Lead Number: ${data.leadNumber}</p>
        </div>
        <div class="content">
            <div class="highlight">
                <h3>Contact Information</h3>
                <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">${data.firstName} ${data.lastName}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${data.email}</span>
                </div>
                <div class="info-row">
                    <span class="label">Phone:</span>
                    <span class="value">${data.phone}</span>
                </div>
            </div>
            
            <div class="highlight">
                <h3>Practice Details</h3>
                <div class="info-row">
                    <span class="label">Practice Name:</span>
                    <span class="value">${data.practiceName}</span>
                </div>
                <div class="info-row">
                    <span class="label">Interest Area:</span>
                    <span class="value">${data.interest}</span>
                </div>
            </div>
            
            <div class="highlight">
                <h3>Marketing Information</h3>
                <div class="info-row">
                    <span class="label">Signup Date:</span>
                    <span class="value">${data.signupDate}</span>
                </div>
                <div class="info-row">
                    <span class="label">UTM Source:</span>
                    <span class="value">${data.utmSource}</span>
                </div>
                <div class="info-row">
                    <span class="label">UTM Medium:</span>
                    <span class="value">${data.utmMedium}</span>
                </div>
                <div class="info-row">
                    <span class="label">UTM Campaign:</span>
                    <span class="value">${data.utmCampaign}</span>
                </div>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <a href="https://admin.aescrm.com/leads" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View in Admin Dashboard
                </a>
            </div>
        </div>
        <div class="footer">
            <p>This notification was sent automatically from AES CRM Waitlist System</p>
        </div>
    </div>
</body>
</html>`;
  },

  /**
   * Generate welcome email content for waitlist signup
   * @param {Object} data - Email data
   * @returns {string} HTML email content
   */
  generateWelcomeEmailContent(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AES CRM Waitlist</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .highlight { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .feature-list li:before { content: "✓ "; color: #4caf50; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to AES CRM!</h1>
            <p>You're now on our exclusive waitlist</p>
        </div>
        <div class="content">
            <p>Hi ${data.firstName},</p>
            
            <p>Thank you for joining the AES CRM waitlist! We're excited to have you on board as we prepare to revolutionize dental practice management.</p>
            
            <div class="highlight">
                <h3>Your Waitlist Details</h3>
                <p><strong>Lead Number:</strong> ${data.leadNumber}</p>
                <p><strong>Practice:</strong> ${data.practiceName}</p>
                <p><strong>Interest:</strong> ${data.interest}</p>
                <p><strong>Signup Date:</strong> ${data.signupDate}</p>
            </div>
            
            <h3>What's Next?</h3>
            <p>As a waitlist member, you'll be among the first to experience:</p>
            
            <ul class="feature-list">
                <li>Advanced patient management and scheduling</li>
                <li>Comprehensive analytics and reporting</li>
                <li>Lead generation and conversion tracking</li>
                <li>Multi-location practice support</li>
                <li>Mobile-first design for on-the-go access</li>
                <li>Integration with popular dental software</li>
            </ul>
            
            <div class="highlight">
                <h3>Early Access Benefits</h3>
                <p>Waitlist members receive:</p>
                <ul>
                    <li>50% off installation fee (normally £1,000)</li>
                    <li>3 months free on additional seats</li>
                    <li>Priority support and onboarding</li>
                    <li>Exclusive feature previews</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="https://aescrm.com/learn-more" class="cta-button">Learn More About AES CRM</a>
            </div>
            
            <p>We'll keep you updated on our progress and notify you as soon as we're ready to onboard your practice.</p>
            
            <p>If you have any questions, feel free to reply to this email or contact us at hello@postino.cc</p>
            
            <p>Best regards,<br>
            The AES CRM Team</p>
        </div>
        <div class="footer">
            <p>You're receiving this email because you signed up for the AES CRM waitlist.</p>
            <p>If you no longer wish to receive these emails, you can <a href="https://aescrm.com/unsubscribe">unsubscribe here</a>.</p>
        </div>
    </div>
</body>
</html>`;
  },

  /**
   * Send contact form notification
   * @param {Object} contactData - Contact form data
   * @returns {Promise<{success, error}>}
   */
  async sendContactNotification(contactData) {
    try {
      const emailData = {
        to: 'martin@postino.cc',
        subject: `New Contact Form Submission - ${contactData.subject || 'General Inquiry'}`,
        template: 'contact_notification',
        data: {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || 'Not provided',
          subject: contactData.subject || 'General Inquiry',
          message: contactData.message,
          company: contactData.company || 'Not provided',
          submissionDate: new Date().toLocaleString('en-GB', {
            timeZone: 'Europe/London',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      };

      // Store email in database for tracking
      const { error: emailError } = await supabase
        .from('email_logs')
        .insert([{
          to_email: emailData.to,
          subject: emailData.subject,
          template: emailData.template,
          data: emailData.data,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (emailError) {
        console.error('Error storing email log:', emailError);
      }

      // Generate email content
      const emailContent = this.generateContactEmailContent(emailData.data);
      
      // Log the email content (in production, this would be sent via email service)
      console.log('=== CONTACT FORM NOTIFICATION ===');
      console.log(`To: ${emailData.to}`);
      console.log(`Subject: ${emailData.subject}`);
      console.log('Content:');
      console.log(emailContent);
      console.log('==================================');

      return { success: true, error: null };
    } catch (error) {
      console.error('Error sending contact notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate contact form email content
   * @param {Object} data - Email data
   * @returns {string} HTML email content
   */
  generateContactEmailContent(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .message-box { background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>Subject: ${data.subject}</p>
        </div>
        <div class="content">
            <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${data.name}</span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${data.email}</span>
            </div>
            <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${data.phone}</span>
            </div>
            <div class="info-row">
                <span class="label">Company:</span>
                <span class="value">${data.company}</span>
            </div>
            <div class="info-row">
                <span class="label">Submission Date:</span>
                <span class="value">${data.submissionDate}</span>
            </div>
            
            <div class="message-box">
                <h3>Message:</h3>
                <p>${data.message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <a href="mailto:${data.email}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reply to ${data.name}
                </a>
            </div>
        </div>
        <div class="footer">
            <p>This notification was sent automatically from AES CRM Contact Form</p>
        </div>
    </div>
</body>
</html>`;
  }
};
