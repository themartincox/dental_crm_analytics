import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Building, CheckCircle, Loader } from 'lucide-react';
import { waitlistService } from '../../../services/waitlistService';
import { logger } from '../../../utils/logger';

const WaitlistForm = ({ isOpen, onClose }) => {
  // Netlify hidden HTML form for build-time form detection
  // This form is not shown to users, but Netlify will parse it and enable submissions in the dashboard
  // It must be present in the HTML output
  const netlifyForm = (
    <form name="waitlist" netlify="true" hidden>
      <input type="text" name="firstName" />
      <input type="text" name="lastName" />
      <input type="email" name="email" />
      <input type="tel" name="phone" />
      <input type="text" name="practiceName" />
      <select name="interest">
        <option value="general">General Dentistry</option>
        <option value="cosmetic">Cosmetic Dentistry</option>
        <option value="orthodontics">Orthodontics</option>
        <option value="implants">Dental Implants</option>
        <option value="aesthetics">Aesthetic Medicine</option>
      </select>
      <input type="checkbox" name="gdprConsent" />
    </form>
  );
  </>
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
      setSubmitError(error?.message || 'Something went wrong. Please try again.');
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
    <>
      {netlifyForm}
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