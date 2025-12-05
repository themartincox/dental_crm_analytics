import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService, appointmentsService } from '../../services/dentalCrmService';
import { Calendar, Users, UserPlus, DollarSign, Clock, MapPin } from 'lucide-react';
import { logger } from '../../utils/logger';
import { ERROR_MESSAGES } from '../../utils/constants';
import { useLoadingState } from '../../hooks/useLoadingState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { measurePerformance, performanceMetrics, debounce, throttle } from '../../utils/performance';
import ErrorBoundary from '../../components/ErrorBoundary';
import { withRetry, withTimeout } from '../../utils/componentEnhancements';
import { ScreenReader, KeyboardNavigation } from '../../utils/accessibility';

const DentalCrmDashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const { isLoading, loadingMessage, withLoading, setData } = useLoadingState(false);
  const [stats, setStats] = useState({ totalPatients: 0, totalAppointments: 0, totalLeads: 0, totalRevenue: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [error, setError] = useState(null);

  const debouncedRefresh = useMemo(() => debounce(() => { loadDashboardData(); }, 300), []);

  const throttledPerformanceCheck = useMemo(() => throttle(() => {
    const avgLoadTime = performanceMetrics.getAverage('Dashboard Load');
    if (avgLoadTime > 2000) {
      logger.warn('Dashboard performance degradation detected', { averageLoadTime: avgLoadTime, userId: user?.id });
    }
  }, 5000), [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Super admins should see tenant/system owner insights
  useEffect(() => {
    if (userProfile?.role === 'super_admin') {
      navigate('/admin', { replace: true });
    }
  }, [userProfile, navigate]);

  useEffect(() => {
    const interval = setInterval(throttledPerformanceCheck, 5000);
    return () => clearInterval(interval);
  }, [throttledPerformanceCheck]);

  const loadDashboardData = async () => {
    // Demo mode for unauthenticated users
    if (!user) {
      setError(null);
      // Lightweight demo data so the page renders in preview without auth
      setStats({
        totalPatients: 128,
        totalAppointments: 42,
        totalLeads: 17,
        totalRevenue: 52340
      });
      setRecentAppointments([
        { id: 'demo-1', appointment_date: new Date().toISOString(), patients: { first_name: 'Alex', last_name: 'Taylor' }, practice_locations: { name: 'City Clinic' }, appointment_status: 'scheduled', dentist: { full_name: 'Smith' } },
        { id: 'demo-2', appointment_date: new Date(Date.now()+3600000).toISOString(), patients: { first_name: 'Jamie', last_name: 'Lee' }, practice_locations: { name: 'Riverside' }, appointment_status: 'confirmed', dentist: { full_name: 'Patel' } }
      ]);
      return;
    }
    await withLoading(async () => {
      setError(null);
      try {
        const result = await measurePerformance('Dashboard Data Loading', async () => {
          const statsResult = await withRetry(() => dashboardService?.getStats(), 2, 500);
          if (statsResult.error) {
            setError(`Failed to load statistics: ${statsResult.error?.message || 'Unknown error'}`);
            return null;
          }

          const dateFrom = new Date().toISOString()?.split('T')?.[0];
          const dateTo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0];
          const appointmentsResult = await withRetry(() => appointmentsService?.getAll({ date_from: dateFrom, date_to: dateTo }), 2, 500);
          if (appointmentsResult.error) {
            logger.error('Failed to load appointments', { error: appointmentsResult.error?.message || 'Unknown error', userId: user?.id });
          }

          setStats(statsResult.data || stats);
          setRecentAppointments(appointmentsResult.data?.slice(0, 5) || []);
          return true;
        });

        if (result) {
          performanceMetrics.record({ name: 'Dashboard Load', value: result.duration, unit: 'ms', userId: user?.id });
          ScreenReader.announce('Dashboard data loaded successfully', 'polite');
        }
      } catch (err) {
        throw err;
      }
    }, 'Loading dashboard data.').catch(err => {
      logger.error('Dashboard loading failed', { error: err?.message || 'Unknown error', stack: err?.stack, userId: user?.id });
      setError(`Dashboard loading failed: ${err?.message || ERROR_MESSAGES?.GENERIC_ERROR || 'Unknown error'}`);
      ScreenReader.announce('Failed to load dashboard data. Please try again.', 'assertive');
    });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })?.format(amount || 0);
  const formatDate = (dateString) => !dateString ? 'No date' : new Date(dateString)?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (dateString) => !dateString ? 'No time' : new Date(dateString)?.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const getStatusBadge = (status) => ({
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800'
  }[status] || 'bg-gray-100 text-gray-800');

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text={loadingMessage || 'Loading dental CRM dashboard.'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-4">Dashboard Error</h2>
            <p className="mb-4">{error}</p>
            <button onClick={loadDashboardData} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Retry Loading</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50" role="main" aria-label="Dental CRM Dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" id="dashboard-title">Dental CRM Dashboard</h1>
            <p className="text-gray-600 mt-2" aria-describedby="dashboard-title">
              Welcome back, {userProfile?.full_name || user?.email || 'User'}
              {userProfile?.role && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" role="status" aria-label={`User role: ${userProfile?.role?.replace('_', ' ')}`}>
                  {userProfile?.role?.replace('_', ' ')?.toUpperCase()}
                </span>
              )}
            </p>
          </header>

          {/* Statistics Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" aria-label="Practice Statistics">
            <div className="bg-white overflow-hidden shadow rounded-lg" role="article" aria-label="Total Patients">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0" aria-hidden="true">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                      <dd className="text-lg font-medium text-gray-900" aria-live="polite">{stats?.totalPatients || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Appointments</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats?.totalAppointments || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserPlus className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Leads</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats?.totalLeads || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats?.totalRevenue || 0)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Appointments */}
          <section className="bg-white shadow rounded-lg" aria-label="Recent Appointments">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Appointments</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentAppointments?.length > 0 ? (
                recentAppointments.map((appointment) => (
                  <div key={appointment?.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment?.patients?.first_name || 'Unknown'} {appointment?.patients?.last_name || 'Patient'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(appointment?.appointment_date)} at {formatTime(appointment?.appointment_date)}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {appointment?.practice_locations?.name || 'No location'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(appointment?.appointment_status)}`}>
                        {appointment?.appointment_status?.replace('_', ' ')?.toUpperCase() || 'Unknown'}
                      </span>
                      {appointment?.dentist?.full_name && (
                        <span className="text-sm text-gray-500">Dr. {appointment?.dentist?.full_name}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by scheduling a new appointment.</p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Quick Actions">
            <div className="bg-white overflow-hidden shadow rounded-lg" role="article" aria-label="Manage Patients">
              <div className="p-6 text-center">
                <Users className="mx-auto h-12 w-12 text-blue-600" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Manage Patients</h3>
                <p className="mt-2 text-sm text-gray-500">View, add, and manage patient records</p>
                <button
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => { ScreenReader.announce('Navigating to patient management', 'polite'); navigate('/patients'); }}
                  onKeyDown={(e) => KeyboardNavigation.handleActivation(e, () => { ScreenReader.announce('Navigating to patient management', 'polite'); navigate('/patients'); })}
                  aria-describedby="patients-description"
                >
                  Go to Patients
                </button>
                <div id="patients-description" className="sr-only">Navigate to the patient management section to view and manage patient records</div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6 text-center">
                <Calendar className="mx-auto h-12 w-12 text-green-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Schedule Appointments</h3>
                <p className="mt-2 text-sm text-gray-500">Book and manage appointments</p>
                <button 
                  className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  onClick={() => navigate('/appointments')}
                >
                  Schedule Now
                </button>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6 text-center">
                <UserPlus className="mx-auto h-12 w-12 text-yellow-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Manage Leads</h3>
                <p className="mt-2 text-sm text-gray-500">Track and convert potential patients</p>
                <button 
                  className="mt-4 w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                  onClick={() => navigate('/leads')}
                >
                  View Leads
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DentalCrmDashboard;
