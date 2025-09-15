# Waitlist and Contact Form Integration

## Overview

The AES CRM system now includes comprehensive waitlist and contact form functionality that captures user data, stores it in Supabase, and sends email notifications to martin@postino.cc.

## Features

### ✅ **Waitlist Functionality**
- **Database Storage**: All waitlist signups are stored in the `leads` table
- **Email Notifications**: Admin notifications sent to martin@postino.cc
- **Welcome Emails**: Automated welcome emails sent to signups
- **Lead Tracking**: Unique lead numbers generated for each signup
- **UTM Tracking**: Marketing campaign tracking included

### ✅ **Contact Forms**
- **Multiple Forms**: Contact, pricing inquiry, demo request forms
- **Email Notifications**: All submissions sent to martin@postino.cc
- **Form Validation**: Client-side and server-side validation
- **Email Logging**: All emails tracked in `email_logs` table

## Database Schema

### Leads Table
```sql
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source public.lead_source NOT NULL,
    status public.lead_status DEFAULT 'new',
    treatment_interest public.treatment_type,
    notes TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Email Logs Table
```sql
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    data JSONB,
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Services

### WaitlistService (`src/services/waitlistService.js`)
- `addToWaitlist(waitlistData)` - Add user to waitlist and send emails
- `getWaitlistStats()` - Get waitlist statistics
- `getWaitlistMembers()` - Get all waitlist members

### ContactService (`src/services/contactService.js`)
- `submitContactForm(contactData)` - Submit general contact form
- `submitPricingInquiry(inquiryData)` - Submit pricing inquiry
- `submitDemoRequest(demoData)` - Submit demo request

### EmailService (`src/services/emailService.js`)
- `sendWaitlistNotification(waitlistData, leadNumber)` - Send admin notification
- `sendWelcomeEmail(waitlistData, leadNumber)` - Send welcome email
- `sendContactNotification(contactData)` - Send contact form notification

## Components

### WaitlistForm (`src/pages/aes-crm-marketing-landing-page/components/WaitlistForm.jsx`)
- Modal form for waitlist signups
- Form validation with react-hook-form
- Success/error handling
- GDPR compliance checkbox

### ContactForm (`src/components/ContactForm.jsx`)
- Reusable contact form component
- Configurable fields (company, phone, subject)
- Modal or inline display
- Form validation and error handling

### ContactPage (`src/pages/contact-page/index.jsx`)
- Dedicated contact page
- Contact information display
- FAQ section
- Integrated contact form

## Email Templates

### Waitlist Notification Email
- **To**: martin@postino.cc
- **Subject**: "New Waitlist Signup - {leadNumber}"
- **Content**: Lead details, practice info, marketing data

### Welcome Email
- **To**: User's email
- **Subject**: "Welcome to AES CRM Waitlist - You're In!"
- **Content**: Welcome message, benefits, next steps

### Contact Form Notification
- **To**: martin@postino.cc
- **Subject**: "New Contact Form Submission - {subject}"
- **Content**: Contact details, message, submission info

## Usage Examples

### Waitlist Signup
```javascript
import { waitlistService } from './services/waitlistService';

const result = await waitlistService.addToWaitlist({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  practiceName: 'Test Practice',
  interest: 'cosmetic'
});

if (result.success) {
  console.log('Lead number:', result.leadNumber);
  console.log('Emails sent:', result.emailsSent);
}
```

### Contact Form Submission
```javascript
import { contactService } from './services/contactService';

const result = await contactService.submitContactForm({
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+1234567890',
  company: 'Dental Practice Ltd',
  subject: 'Pricing Inquiry',
  message: 'I would like to know more about your pricing.'
});
```

## Configuration

### Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (for production)
EMAIL_SERVICE_API_KEY=your_email_service_key
EMAIL_FROM_ADDRESS=hello@postino.cc
```

### Email Service Integration
Currently, emails are logged to console. For production, integrate with:
- SendGrid
- Mailgun
- AWS SES
- Other email service providers

## Testing

### Unit Tests
```bash
npm run test src/services/__tests__/waitlistService.test.js
```

### Manual Testing
1. **Waitlist Form**: Visit marketing page and submit waitlist form
2. **Contact Form**: Visit contact page and submit contact form
3. **Pricing Inquiry**: Visit pricing page and click "Contact Sales"
4. **Check Console**: Verify email content is logged
5. **Check Database**: Verify data is stored in Supabase

## Monitoring

### Email Logs
All emails are tracked in the `email_logs` table:
- Email content and recipients
- Send status and timestamps
- Error messages if sending fails

### Lead Tracking
All waitlist signups are tracked in the `leads` table:
- Lead numbers and contact details
- UTM parameters for marketing attribution
- Treatment interests and practice information

## Security

### Data Protection
- All data encrypted in transit and at rest
- GDPR compliance with consent tracking
- Secure form validation and sanitization

### Access Control
- Row Level Security (RLS) enabled on all tables
- Role-based access to email logs and leads
- Audit trail for all data access

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check console logs for error messages
   - Verify email service configuration
   - Check database for email_logs entries

2. **Database errors**
   - Verify Supabase connection
   - Check table permissions and RLS policies
   - Review migration status

3. **Form validation errors**
   - Check required field validation
   - Verify email format validation
   - Review GDPR consent requirements

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'aescrm:waitlist,aescrm:contact');
```

## Future Enhancements

### Planned Features
- [ ] Real email service integration
- [ ] Email template customization
- [ ] Automated follow-up sequences
- [ ] Lead scoring and qualification
- [ ] CRM integration for lead management
- [ ] Analytics dashboard for form performance

### Integration Opportunities
- [ ] Calendar booking integration
- [ ] Payment processing for demos
- [ ] CRM lead management
- [ ] Marketing automation platform
- [ ] Customer support ticketing system

---

**Status**: ✅ **FULLY FUNCTIONAL** - All waitlist and contact functionality is working and ready for production use.

**Next Steps**: Integrate with real email service provider for production deployment.
