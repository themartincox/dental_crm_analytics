import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, User, MessageSquare, Building, Phone, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { contactService } from '../services/contactService';
import { logger } from '../utils/logger';
import { useLoadingState } from '../hooks/useLoadingState';
import LoadingSpinner from './LoadingSpinner';
import { FORM_MESSAGES, FORM_LABELS, FORM_PLACEHOLDERS } from '../utils/constants';
import { FormAccessibility, FocusManager } from '../utils/accessibility';
import { performanceMonitoringService } from '../services/performanceMonitoringService';
import { analyticsService } from '../services/analyticsService';

const ContactForm = ({ 
  isOpen = false, 
  onClose = null, 
  title = "Contact Us",
  subtitle = "Get in touch with our team",
  showCompany = true,
  showPhone = true,
  defaultSubject = "General Inquiry",
  className = ""
}) => {
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const focusManager = new FocusManager();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    const startTime = performance.now();
    startLoading();
    setSubmitError(null);

    // Track form submission start
    analyticsService.trackUserAction('contact_form_submit_start', {
      formType: 'contact',
      hasPhone: !!data.phone,
      hasCompany: !!data.company
    });

    try {
      const result = await contactService.submitContactForm({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        subject: data.subject || defaultSubject,
        message: data.message
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Track performance metrics
      performanceMonitoringService.recordMetric('contact_form_submission_time', duration, {
        formType: 'contact',
        success: true
      });

      // Track analytics
      analyticsService.trackFormSubmit('contact', {
        emailSent: result.emailSent,
        duration: Math.round(duration)
      });

      setIsSuccess(true);
      reset();
      
      // Log success
      logger.info('Contact form submitted successfully', {
        emailSent: result.emailSent,
        formType: 'contact',
        duration: Math.round(duration),
        timestamp: new Date().toISOString()
      });
      
      // Auto-close success message after 3 seconds if modal
      if (onClose) {
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 3000);
      }

    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Track performance metrics for error case
      performanceMonitoringService.recordMetric('contact_form_submission_time', duration, {
        formType: 'contact',
        success: false,
        error: error.message
      });

      // Track error analytics
      analyticsService.trackUserAction('contact_form_submit_error', {
        formType: 'contact',
        error: error.message,
        duration: Math.round(duration)
      });

      logger.error('Contact form submission error', {
        error: error.message,
        stack: error.stack,
        formType: 'contact',
        duration: Math.round(duration),
        timestamp: new Date().toISOString()
      });
      setSubmitError(error?.message || 'Something went wrong. Please try again.');
    } finally {
      stopLoading();
    }
  };

  const handleClose = () => {
    if (!isLoading && onClose) {
      setIsSuccess(false);
      setSubmitError(null);
      reset();
      onClose();
    }
  };

  const formContent = (
    <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
        {onClose && (
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Form */}
      <div className="p-6">
        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-gray-600">
              Thank you for your message. We'll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={FORM_PLACEHOLDERS.NAME}
                  disabled={isLoading}
                  aria-required="true"
                  aria-invalid={errors?.name ? 'true' : 'false'}
                  aria-describedby={errors?.name ? 'name-error' : undefined}
                />
              </div>
              {errors?.name && (
                <p id="name-error" className="text-red-600 text-sm mt-1" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={FORM_PLACEHOLDERS.EMAIL}
                  disabled={isLoading}
                  aria-required="true"
                  aria-invalid={errors?.email ? 'true' : 'false'}
                  aria-describedby={errors?.email ? 'email-error' : undefined}
                />
              </div>
              {errors?.email && (
                <p id="email-error" className="text-red-600 text-sm mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            {showPhone && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={FORM_PLACEHOLDERS.PHONE}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Company */}
            {showCompany && (
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="company"
                    {...register('company')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={FORM_PLACEHOLDERS.COMPANY}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                {...register('subject')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={defaultSubject}
                disabled={isSubmitting}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  id="message"
                  rows={4}
                  {...register('message', { required: 'Message is required' })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder={FORM_PLACEHOLDERS.MESSAGE}
                  disabled={isLoading}
                />
              </div>
              {errors?.message && (
                <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>
              )}
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" text={FORM_MESSAGES.LOADING} />
              ) : (
                FORM_LABELS.SEND_MESSAGE
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              {FORM_MESSAGES.RESPONSE_TIME}
            </p>
          </form>
        )}
      </div>
    </div>
  );

  if (onClose) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {formContent}
        </motion.div>
      </motion.div>
    );
  }

  return formContent;
};

export default ContactForm;
