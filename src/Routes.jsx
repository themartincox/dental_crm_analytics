import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

import { AuthProvider } from "contexts/AuthContext";
import Login from "pages/Login";
import CookieConsent from "components/CookieConsent";
import GDCFooter from "components/GDCFooter";
import AIUsagePolicyPage from './pages/AIUsagePolicy';

import SystemOwnerAdminDashboard from './pages/system-owner-admin-dashboard/index';
import DentalCrmDashboard from './pages/dental-crm-dashboard/index';
import NotFound from './pages/NotFound';

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

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <RouterRoutes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/o-auth-authentication-callback-handler" element={<OAuthAuthenticationCallbackHandler />} />
                  <Route path="/public-booking" element={<PublicBookingInterface />} />
                  <Route path="/booking-widget" element={<EmbeddableBookingWidget />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmationPaymentProcessing />} />
                  <Route path="/ai-usage-policy" element={<AIUsagePolicyPage />} />

                  {/* Protected Routes - Available in Preview Mode */}
                  <Route path="/" element={<DentalCrmDashboard />} />
                  <Route path="/dashboard" element={<DentalCrmDashboard />} />
                  <Route path="/appointments" element={<AppointmentScheduler />} />
                  <Route path="/patients" element={<PatientManagementDashboard />} />
                  <Route path="/leads" element={<LeadManagementScreen />} />
                  <Route path="/memberships" element={<MembershipProgramManagement />} />
                  <Route path="/analytics/leads" element={<LeadGenerationConversionAnalyticsDashboard />} />
                  <Route path="/analytics/patient-journey" element={<PatientJourneyRevenueOptimizationDashboard />} />
                  <Route path="/analytics/cross-site" element={<CrossSiteAnalyticsDashboard />} />
                  <Route path="/analytics/practice-overview" element={<PracticePerformanceOverviewDashboard />} />
                  <Route path="/compliance" element={<ComplianceOperationsMonitoringDashboard />} />
                  <Route path="/widgets" element={<WidgetConfigurationDashboard />} />
                  <Route path="/admin" element={<SystemOwnerAdminDashboard />} />
                  <Route path="/matching-engine" element={<ServiceProviderMatchingEngine />} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </RouterRoutes>
              </Suspense>
            </div>
            <GDCFooter />
            <CookieConsent />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;