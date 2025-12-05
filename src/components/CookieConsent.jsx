import React, { useState, useEffect } from 'react';
import { X, Shield, Settings, Check, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CookieBanner = ({ onAccept, onDecline, onManage }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900">Cookie Consent & Data Processing</h3>
            </div>
            <p className="text-sm text-gray-600">
              We use essential cookies for website functionality and optional cookies for analytics and marketing.
              We process personal data in accordance with GDPR and GDC requirements. You can withdraw consent
              at any time via our{' '}
              <a href="/privacy-policy" className="text-blue-600 hover:underline">privacy policy</a>.
            </p>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>Special category health data requires explicit consent</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <button
              onClick={onManage}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage
            </button>
            <button
              onClick={onDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Essential Only
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CookiePreferencesModal = ({ isOpen, onClose, onSave }) => {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be changed
    analytics: false,
    marketing: false,
    functional: false,
    emailMarketing: false,
    smsMarketing: false,
    postalMarketing: false
  });

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cookie & Marketing Preferences</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Essential Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Essential Cookies</h3>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="sr-only"
                  />
                  <div className="w-11 h-6 bg-blue-600 rounded-full shadow-inner">
                    <div className="w-4 h-4 bg-white rounded-full shadow transform translate-x-6 transition-transform"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Required for website functionality, security, and patient data protection.
                These cannot be disabled as they ensure GDC compliance.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences?.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e?.target?.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full shadow-inner transition-colors ${preferences?.analytics ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${preferences?.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Help us understand website usage and improve patient experience through
                anonymized data analysis.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Marketing Cookies</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences?.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e?.target?.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full shadow-inner transition-colors ${preferences?.marketing ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${preferences?.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Enable personalized advertising and track campaign effectiveness
                across dental service websites.
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Functional Cookies</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences?.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e?.target?.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full shadow-inner transition-colors ${preferences?.functional ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${preferences?.functional ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Enable enhanced features like appointment booking preferences
                and chat support functionality.
              </p>
            </div>

            {/* Marketing Communications Section */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Marketing Communications</h3>
              <p className="text-sm text-gray-600 mb-4">
                Granular opt-ins for different marketing channels (required by PECR):
              </p>

              {/* Email Marketing */}
              <div className="border rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">Email Marketing</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences?.emailMarketing}
                      onChange={(e) => setPreferences({ ...preferences, emailMarketing: e?.target?.checked })}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full shadow-inner transition-colors ${preferences?.emailMarketing ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${preferences?.emailMarketing ? 'translate-x-6' : 'translate-x-1'
                        }`}></div>
                    </div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive dental health tips, appointment reminders, and special offers via email.
                </p>
              </div>

              {/* SMS Marketing */}
              <div className="border rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">SMS Marketing</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences?.smsMarketing}
                      onChange={(e) => setPreferences({ ...preferences, smsMarketing: e?.target?.checked })}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full shadow-inner transition-colors ${preferences?.smsMarketing ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${preferences?.smsMarketing ? 'translate-x-6' : 'translate-x-1'
                        }`}></div>
                    </div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive appointment confirmations and promotional messages via SMS.
                </p>
              </div>

              {/* Postal Marketing */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">Postal Marketing</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences?.postalMarketing}
                      onChange={(e) => setPreferences({ ...preferences, postalMarketing: e?.target?.checked })}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full shadow-inner transition-colors ${preferences?.postalMarketing ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${preferences?.postalMarketing ? 'translate-x-6' : 'translate-x-1'
                        }`}></div>
                    </div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive practice newsletters and information leaflets by post.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(() => {
    return localStorage.getItem('cookieConsent') === null;
  });
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in for consent recording
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session?.user);
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const recordConsentToDatabase = async (preferences, consentTimestamp) => {
    if (!isLoggedIn) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Record in compliance_records table
      const { error } = await supabase.from('compliance_records').insert({
        record_type: 'cookie_consent',
        compliance_date: new Date().toISOString()?.split('T')?.[0],
        details: {
          preferences,
          timestamp: consentTimestamp,
          userAgent: navigator?.userAgent,
          ipAddress: 'client-side', // Server should capture real IP
          consentMethod: 'explicit',
          granularConsent: {
            essential: preferences?.essential,
            analytics: preferences?.analytics,
            marketing: preferences?.marketing,
            functional: preferences?.functional,
            emailMarketing: preferences?.emailMarketing,
            smsMarketing: preferences?.smsMarketing,
            postalMarketing: preferences?.postalMarketing
          }
        },
        status: 'compliant'
      });

      if (error) {
        console.error('Failed to record consent:', error);
      }

      // Also log to security audit logs
      await supabase.from('security_audit_logs').insert({
        action: 'cookie_consent_updated',
        resource_type: 'user_consent',
        resource_id: user?.id,
        metadata: {
          preferences,
          timestamp: consentTimestamp,
          consentType: 'explicit'
        },
        success: true
      });

    } catch (error) {
      console.error('Error recording consent to database:', error);
    }
  };

  const handleAcceptAll = async () => {
    const consentTimestamp = new Date().toISOString();
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      emailMarketing: true,
      smsMarketing: true,
      postalMarketing: true,
      timestamp: consentTimestamp,
      userIdentifier: isLoggedIn ? 'authenticated_user' : `anonymous_${Date.now()}`
    };

    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    await recordConsentToDatabase(preferences, consentTimestamp);
    setShowBanner(false);

    // Enable all scripts
    enableAnalytics();
    enableMarketing();
    enableFunctional();
  };

  const handleDeclineAll = async () => {
    const consentTimestamp = new Date().toISOString();
    const preferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      emailMarketing: false,
      smsMarketing: false,
      postalMarketing: false,
      timestamp: consentTimestamp,
      userIdentifier: isLoggedIn ? 'authenticated_user' : `anonymous_${Date.now()}`
    };

    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    await recordConsentToDatabase(preferences, consentTimestamp);
    setShowBanner(false);
  };

  const handleManagePreferences = () => {
    setShowPreferencesModal(true);
  };

  const handleSavePreferences = async (preferences) => {
    const consentTimestamp = new Date().toISOString();
    const preferencesWithTimestamp = {
      ...preferences,
      timestamp: consentTimestamp,
      userIdentifier: isLoggedIn ? 'authenticated_user' : `anonymous_${Date.now()}`
    };

    localStorage.setItem('cookieConsent', JSON.stringify(preferencesWithTimestamp));
    await recordConsentToDatabase(preferencesWithTimestamp, consentTimestamp);
    setShowBanner(false);

    // Enable/disable scripts based on preferences
    if (preferences?.analytics) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }

    if (preferences?.marketing) {
      enableMarketing();
    } else {
      disableMarketing();
    }

    if (preferences?.functional) {
      enableFunctional();
    } else {
      disableFunctional();
    }
  };

  const enableAnalytics = () => {
    const consent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');
    if (consent?.analytics) {
      console.log('Analytics enabled');
      // Initialize Google Analytics or other analytics
      // gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  };

  const disableAnalytics = () => {
    console.log('Analytics disabled');
    // gtag('consent', 'update', { analytics_storage: 'denied' });
  };

  const enableMarketing = () => {
    const consent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');
    if (consent?.marketing) {
      console.log('Marketing cookies enabled');
      // Initialize marketing pixels/scripts
      // gtag('consent', 'update', { ad_storage: 'granted' });
    }
  };

  const disableMarketing = () => {
    console.log('Marketing cookies disabled');
    // gtag('consent', 'update', { ad_storage: 'denied' });
  };

  const enableFunctional = () => {
    const consent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');
    if (consent?.functional) {
      console.log('Functional cookies enabled');
      // Initialize chat widgets, etc.
    }
  };

  const disableFunctional = () => {
    console.log('Functional cookies disabled');
  };

  if (!showBanner) return null;

  return (
    <>
      <CookieBanner
        onAccept={handleAcceptAll}
        onDecline={handleDeclineAll}
        onManage={handleManagePreferences}
      />
      <CookiePreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={handleSavePreferences}
      />
    </>
  );
};

export default CookieConsent;