import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Building, CheckCircle, Loader } from 'lucide-react';
import { waitlistService } from '../../../services/waitlistService';
import { logger } from '../../../utils/logger';

const WaitlistForm = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Use the waitlist service which handles both database storage and email notifications
      const result = await waitlistService.addToWaitlist({
        firstName: data?.firstName,
        lastName: data?.lastName,
        email: data?.email,
        phone: data?.phone || null,
        practiceName: data?.practiceName || null,
        interest: data?.interest || 'General CRM',
        utm_source: 'aescrm_landing',
        utm_medium: 'waitlist_form',
        utm_campaign: 'pre_launch_waitlist'
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to join waitlist');
      }

      setIsSuccess(true);
      reset();
      
      // Log success with email status
      logger.info('Waitlist signup successful', {
        leadNumber: result.leadNumber,
        emailsSent: result.emailsSent,
        formType: 'waitlist',
        timestamp: new Date().toISOString()
      });
      
      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);

    } catch (error) {
      logger.error('Waitlist signup error', {
        error: error.message,
        stack: error.stack,
        formType: 'waitlist',
        timestamp: new Date().toISOString()
      });
      const raw = error?.message || '';
      const friendly = raw.includes('<!DOCTYPE') || raw.includes('<html')
        ? 'Unable to submit waitlist — API endpoint not reachable. Please try again shortly.'
        : raw;
      setSubmitError(friendly || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false);
      setSubmitError(null);
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Join the AES CRM Waitlist</h3>
              <p className="text-sm text-gray-600 mt-1">Get early access when we launch</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Success State */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">You're on the waitlist! 🎉</h4>
              <p className="text-gray-600 text-sm">
                Thank you for joining! We'll notify you as soon as AES CRM is available.
              </p>
            </motion.div>
          )}

          {/* Form */}
          {!isSuccess && (
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="firstName"
                    type="text"
                    { ...register('firstName', { 
                      required: 'First name is required',
                      minLength: { value: 2, message: 'First name must be at least 2 characters' }
                    })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                    disabled={isSubmitting}
                  />
                </div>
                {errors?.firstName && (
                  <p className="text-red-600 text-xs mt-1">{errors?.firstName?.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="lastName"
                    type="text"
                    { ...register('lastName', { 
                      required: 'Last name is required',
                      minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                    })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                    disabled={isSubmitting}
                  />
                </div>
                {errors?.lastName && (
                  <p className="text-red-600 text-xs mt-1">{errors?.lastName?.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    { ...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@practice.com"
                    disabled={isSubmitting}
                  />
                </div>
                {errors?.email && (
                  <p className="text-red-600 text-xs mt-1">{errors?.email?.message}</p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  { ...register('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+44 7700 900123"
                  disabled={isSubmitting}
                />
              </div>

              {/* Practice Name */}
              <div>
                <label htmlFor="practiceName" className="block text-sm font-medium text-gray-700 mb-1">
                  Practice Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="practiceName"
                    type="text"
                    { ...register('practiceName')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Practice Name"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Interest */}
              <div>
                <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Interest
                </label>
                <select
                  id="interest"
                  { ...register('interest')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="">Select your focus area</option>
                  <option value="general">General Dentistry</option>
                  <option value="cosmetic">Cosmetic Dentistry</option>
                  <option value="orthodontics">Orthodontics</option>
                  <option value="implants">Dental Implants</option>
                  <option value="aesthetics">Aesthetic Medicine</option>
                </select>
              </div>

              {/* GDPR Consent */}
              <div className="flex items-start space-x-2">
                <input
                  id="gdprConsent"
                  type="checkbox"
                  { ...register('gdprConsent', { required: 'Please agree to our privacy policy' })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="gdprConsent" className="text-xs text-gray-600">
                  I agree to receive marketing communications from AES CRM. You can unsubscribe at any time. 
                  By submitting, you agree to our privacy policy and terms of service.
                </label>
              </div>
              {errors?.gdprConsent && (
                <p className="text-red-600 text-xs">{errors?.gdprConsent?.message}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Joining waitlist.
                  </>
                ) : (
                  'Join the Waitlist'
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                Join 500+ practices already on the waitlist
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WaitlistForm;
