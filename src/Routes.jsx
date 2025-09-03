import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProtectedRoute from "components/ProtectedRoute";
import { AuthProvider } from "contexts/AuthContext";
import Login from "pages/Login";
import LeadGenerationConversionAnalyticsDashboard from './pages/lead-generation-conversion-analytics-dashboard';
import ComplianceOperationsMonitoringDashboard from './pages/compliance-operations-monitoring-dashboard';
import PatientJourneyRevenueDashboard from './pages/patient-journey-revenue-optimization-dashboard';
import PracticePerformanceOverviewDashboard from './pages/practice-performance-overview-dashboard';
import PatientManagementDashboard from './pages/patient-management-dashboard';
import LeadManagementScreen from './pages/lead-management-screen';
import AppointmentScheduler from './pages/appointment-scheduler';
import BookingConfirmationPaymentProcessing from './pages/booking-confirmation-payment-processing';
import PublicBookingInterface from './pages/public-booking-interface';
import ServiceProviderMatchingEngine from './pages/service-provider-matching-engine';
import EmbeddableBookingWidget from './pages/embeddable-booking-widget';
import WidgetConfigurationDashboard from './pages/widget-configuration-dashboard';
import CrossSiteAnalyticsDashboard from './pages/cross-site-analytics-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/public-booking-interface" element={<PublicBookingInterface />} />
            <Route path="/embeddable-booking-widget" element={<EmbeddableBookingWidget />} />
            
            {/* Protected Routes - Admin/Manager Only */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'practice_admin', 'manager']}>
                  <PracticePerformanceOverviewDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/compliance-operations-monitoring-dashboard" 
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'practice_admin', 'manager']}>
                  <ComplianceOperationsMonitoringDashboard />
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
            
            {/* Protected Routes - Staff Access */}
            <Route 
              path="/patient-management-dashboard" 
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'practice_admin', 'dentist', 'hygienist', 'receptionist', 'manager']}>
                  <PatientManagementDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appointment-scheduler" 
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'practice_admin', 'dentist', 'receptionist', 'manager']}>
                  <AppointmentScheduler />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/lead-generation-conversion-analytics-dashboard" 
              element={
                <ProtectedRoute>
                  <LeadGenerationConversionAnalyticsDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient-journey-revenue-optimization-dashboard" 
              element={
                <ProtectedRoute>
                  <PatientJourneyRevenueDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lead-management-screen" 
              element={
                <ProtectedRoute>
                  <LeadManagementScreen />
                </ProtectedRoute>
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
            
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;