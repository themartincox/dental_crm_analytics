import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

import Login from "pages/Login";
import CookieConsent from "components/CookieConsent";
import GDCFooter from "components/GDCFooter";
import CompactFooter from "components/CompactFooter";
import AIUsagePolicyPage from './pages/AIUsagePolicy';
import ProtectedRoute from "components/ProtectedRoute";
import { uiConfig } from './config/uiConfig';
import { UiSettingsProvider, useUiSettings } from './contexts/UiSettingsContext';

// Lazy load all non-critical pages for better performance
const SystemOwnerAdminDashboard = lazy(() => import('./pages/system-owner-admin-dashboard/index'));
const DentalCrmDashboard = lazy(() => import('./pages/dental-crm-dashboard/index'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Marketing landing page - critical for LCP, keep as regular import
import AESCRMMarketingLandingPage from './pages/aes-crm-marketing-landing-page/index';

// Lazy load other pages
const GetStartedGatewayPage = lazy(() => import('./pages/get-started-gateway-page/index'));
const PricingPage = lazy(() => import('./pages/pricing-page/index'));
const ContactPage = lazy(() => import('./pages/contact-page/index'));

// Lazy load dashboard components for better performance
const LeadGenerationConversionAnalyticsDashboard = lazy(() => import('./pages/lead-generation-conversion-analytics-dashboard'));
const ComplianceOperationsMonitoringDashboard = lazy(() => import('./pages/compliance-operations-monitoring-dashboard'));
const PatientJourneyRevenueOptimizationDashboard = lazy(() => import('./pages/patient-journey-revenue-optimization-dashboard'));
const PracticePerformanceOverviewDashboard = lazy(() => import('./pages/practice-performance-overview-dashboard'));
const PatientManagementDashboard = lazy(() => import('./pages/patient-management-dashboard'));
const LeadManagementScreen = lazy(() => import('./pages/lead-management-screen'));
const AppointmentScheduler = lazy(() => import('./pages/appointment-scheduler'));
const BookingConfirmationPaymentProcessing = lazy(() => import('./pages/booking-confirmation-payment-processing'));
const PublicBookingInterface = lazy(() => import('./pages/public-booking-interface'));
const ServiceProviderMatchingEngine = lazy(() => import('./pages/service-provider-matching-engine'));
const EmbeddableBookingWidget = lazy(() => import('./pages/embeddable-booking-widget'));
const WidgetConfigurationDashboard = lazy(() => import('./pages/widget-configuration-dashboard'));
const CrossSiteAnalyticsDashboard = lazy(() => import('./pages/cross-site-analytics-dashboard'));
const TenantBrandingSettings = lazy(() => import('./pages/tenant-branding-settings'));

// Add new OAuth callback import
const OAuthAuthenticationCallbackHandler = lazy(() => import('./pages/o-auth-authentication-callback-handler'));

// Add new membership management import
const MembershipProgramManagement = lazy(() => import('./pages/membership-program-management'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const Footers = () => {
  const { settings } = useUiSettings();
  const PublicFooter = settings.publicFooterVariant === 'full' ? GDCFooter : CompactFooter;
  return (
    <>
      <RouterRoutes>
        <Route path="/" element={settings.publicFooterEnabled ? <PublicFooter /> : <CompactFooter />} />
        <Route path="/aes-crm-marketing-landing-page" element={settings.publicFooterEnabled ? <PublicFooter /> : <CompactFooter />} />
        <Route path="/pricing" element={settings.publicFooterEnabled ? <PublicFooter /> : <CompactFooter />} />
        <Route path="/contact" element={settings.publicFooterEnabled ? <PublicFooter /> : <CompactFooter />} />
        <Route path="/public-booking" element={settings.publicFooterEnabled ? <PublicFooter /> : <CompactFooter />} />
        <Route path="/booking-widget" element={settings.publicFooterEnabled ? <PublicFooter /> : <CompactFooter />} />
        <Route path="*" element={null} />
      </RouterRoutes>
      <RouterRoutes>
        <Route path="/" element={null} />
        <Route path="/aes-crm-marketing-landing-page" element={null} />
        <Route path="/pricing" element={null} />
        <Route path="/contact" element={null} />
        <Route path="/public-booking" element={null} />
        <Route path="/booking-widget" element={null} />
        <Route path="*" element={settings.internalFooterEnabled ? <CompactFooter /> : null} />
      </RouterRoutes>
    </>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
        <ErrorBoundary>
          <UiSettingsProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <RouterRoutes>
                  {/* Public Marketing Homepage */}
                  <Route path="/" element={<AESCRMMarketingLandingPage />} />
                  <Route path="/aes-crm-marketing-landing-page" element={<AESCRMMarketingLandingPage />} />

                  {/* Get Started Gateway Page */}
                  <Route path="/get-started-gateway-page" element={<GetStartedGatewayPage />} />

                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/auth/callback" element={<OAuthAuthenticationCallbackHandler />} />
                  <Route path="/o-auth-authentication-callback-handler" element={<OAuthAuthenticationCallbackHandler />} />
                  <Route path="/public-booking" element={<PublicBookingInterface />} />
                  <Route path="/booking-widget" element={<EmbeddableBookingWidget />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmationPaymentProcessing />} />
                  <Route path="/ai-usage-policy" element={<AIUsagePolicyPage />} />

                  {/* CRM Application Routes */}
                  <Route path="/get-started" element={<GetStartedGatewayPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute><DentalCrmDashboard /></ProtectedRoute>} />
                  <Route path="/appointments" element={<ProtectedRoute><AppointmentScheduler /></ProtectedRoute>} />
                  <Route path="/patients" element={<ProtectedRoute><PatientManagementDashboard /></ProtectedRoute>} />
                  <Route path="/leads" element={<ProtectedRoute><LeadManagementScreen /></ProtectedRoute>} />
                  <Route path="/memberships" element={<ProtectedRoute><MembershipProgramManagement /></ProtectedRoute>} />
                  <Route path="/analytics/leads" element={<ProtectedRoute><LeadGenerationConversionAnalyticsDashboard /></ProtectedRoute>} />
                  <Route path="/analytics/patient-journey" element={<ProtectedRoute><PatientJourneyRevenueOptimizationDashboard /></ProtectedRoute>} />
                  <Route path="/analytics/cross-site" element={<ProtectedRoute><CrossSiteAnalyticsDashboard /></ProtectedRoute>} />
                  <Route path="/analytics/practice-overview" element={<ProtectedRoute><PracticePerformanceOverviewDashboard /></ProtectedRoute>} />
                  <Route path="/compliance" element={<ProtectedRoute><ComplianceOperationsMonitoringDashboard /></ProtectedRoute>} />
                  <Route path="/widgets" element={<ProtectedRoute><WidgetConfigurationDashboard /></ProtectedRoute>} />
                  <Route path="/settings/branding" element={<ProtectedRoute><TenantBrandingSettings /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute requiredRoles={["super_admin"]}><SystemOwnerAdminDashboard /></ProtectedRoute>} />
                  <Route path="/matching-engine" element={<ProtectedRoute><ServiceProviderMatchingEngine /></ProtectedRoute>} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </RouterRoutes>
              </Suspense>
            </div>
            
            <Footers />
            
            {/* Only show cookie consent on non-marketing pages */}
            <RouterRoutes>
              <Route path="/" element={null} />
              <Route path="/aes-crm-marketing-landing-page" element={null} />
              <Route path="/get-started" element={null} />
              <Route path="/get-started-gateway-page" element={null} />
              <Route path="*" element={<CookieConsent />} />
            </RouterRoutes>
          </div>
          </UiSettingsProvider>
        </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
