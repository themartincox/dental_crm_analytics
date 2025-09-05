import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProtectedRoute from "components/ProtectedRoute";
import { AuthProvider } from "contexts/AuthContext";
import Login from "pages/Login";
import CookieConsent from "components/CookieConsent";
import GDCFooter from "components/GDCFooter";
import AIUsagePolicyPage from './pages/AIUsagePolicy';
import ServerValidatedProtectedRoute from './components/ServerValidatedProtectedRoute';
import SystemOwnerAdminDashboard from './pages/system-owner-admin-dashboard/index';


// Lazy load dashboard components for better performance
const LeadGenerationConversionAnalyticsDashboard = lazy(() => import('./pages/lead-generation-conversion-analytics-dashboard'));
const ComplianceOperationsMonitoringDashboard = lazy(() => import('./pages/compliance-operations-monitoring-dashboard'));
const PatientJourneyRevenueDashboard = lazy(() => import('./pages/patient-journey-revenue-optimization-dashboard'));
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
                  {/* Root Route - Redirect to login */}
                  <Route path="/" element={<Login />} />
                  
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/public-booking-interface" element={<PublicBookingInterface />} />
                  <Route path="/embeddable-booking-widget" element={<EmbeddableBookingWidget />} />
                  
                  {/* GDC Compliance Routes */}
                  <Route path="/ai-policy" element={<AIUsagePolicyPage />} />
                  <Route path="/complaints-procedure" element={<div className="p-8"><h1>Complaints Procedure</h1><p>Detailed complaints procedure content...</p></div>} />
                  <Route path="/privacy-policy" element={<div className="p-8"><h1>Privacy Policy</h1><p>Privacy policy content...</p></div>} />
                  <Route path="/gdc-standards" element={<div className="p-8"><h1>GDC Standards</h1><p>GDC standards content...</p></div>} />
                  
                  {/* System Owner Super Admin Route */}
                  <Route 
                    path="/system-owner-admin-dashboard" 
                    element={
                      <ServerValidatedProtectedRoute requiredRoles={['super_admin']}>
                        <SystemOwnerAdminDashboard />
                      </ServerValidatedProtectedRoute>
                    } 
                  />
                  
                  {/* F3 - Protected routes with server-side validation */}
                  <Route 
                    path="/patient-management-dashboard" 
                    element={
                      <ServerValidatedProtectedRoute requireClinicalAccess={true}>
                        <PatientManagementDashboard />
                      </ServerValidatedProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/appointment-scheduler" 
                    element={
                      <ServerValidatedProtectedRoute requiredRoles={['dentist', 'hygienist', 'receptionist']}>
                        <AppointmentScheduler />
                      </ServerValidatedProtectedRoute>
                    } 
                  />
                  
                  {/* F3 - Admin routes with strict server validation */}
                  <Route 
                    path="/compliance-operations-monitoring-dashboard" 
                    element={
                      <ServerValidatedProtectedRoute requireAdminAccess={true}>
                        <ComplianceOperationsMonitoringDashboard />
                      </ServerValidatedProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/practice-performance-overview-dashboard" 
                    element={
                      <ServerValidatedProtectedRoute requireAdminAccess={true}>
                        <PracticePerformanceOverviewDashboard />
                      </ServerValidatedProtectedRoute>
                    } 
                  />
                  
                  {/* F3 - Marketing routes with specific access control */}
                  <Route 
                    path="/lead-management-screen" 
                    element={
                      <ServerValidatedProtectedRoute requireMarketingAccess={true}>
                        <LeadManagementScreen />
                      </ServerValidatedProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/booking-confirmation-payment-processing" 
                    element={
                      <ProtectedRoute>
                        <BookingConfirmationPaymentProcessing />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/service-provider-matching-engine" 
                    element={
                      <ProtectedRoute>
                        <ServiceProviderMatchingEngine />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/widget-configuration-dashboard" 
                    element={
                      <ProtectedRoute requiredRoles={['super_admin', 'practice_admin', 'manager']}>
                        <WidgetConfigurationDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/cross-site-analytics-dashboard" 
                    element={
                      <ProtectedRoute requiredRoles={['super_admin', 'practice_admin', 'manager']}>
                        <CrossSiteAnalyticsDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Add new membership management route */}
                  <Route 
                    path="/membership-program-management" 
                    element={
                      <ServerValidatedProtectedRoute requiredRoles={['super_admin', 'practice_admin', 'manager', 'receptionist']}>
                        <MembershipProgramManagement />
                      </ServerValidatedProtectedRoute>
                    } 
                  />
                  
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