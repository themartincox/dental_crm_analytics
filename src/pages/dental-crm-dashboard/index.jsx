import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService, appointmentsService } from '../../services/dentalCrmService';
import { Calendar, Users, UserPlus, DollarSign, Clock, MapPin } from 'lucide-react';

const DentalCrmDashboard = () => {
  const { user, userProfile, loading } = useAuth()
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalLeads: 0,
    totalRevenue: 0
  })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Load dashboard statistics
      const { data: statsData, error: statsError } = await dashboardService?.getStats()
      if (statsError) {
        setError(`Failed to load statistics: ${statsError?.message || 'Unknown error'}`)
        return
      }

      // Load recent appointments
      const { data: appointmentsData, error: appointmentsError } = await appointmentsService?.getAll({
        date_from: new Date()?.toISOString()?.split('T')?.[0],
        date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0]
      })
      
      if (appointmentsError) {
        console.error('Appointments error:', appointmentsError)
      }

      setStats(statsData || stats)
      setRecentAppointments(appointmentsData?.slice(0, 5) || [])

    } catch (err) {
      setError(`Dashboard loading failed: ${err?.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    })?.format(amount || 0);
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No date'
    return new Date(dateString)?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'No time'
    return new Date(dateString)?.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-orange-100 text-orange-800'
    }
    
    return statusColors?.[status] || 'bg-gray-100 text-gray-800';
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dental CRM dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-4">Dashboard Error</h2>
            <p className="mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dental CRM Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userProfile?.full_name || user?.email || 'User'}
            {userProfile?.role && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {userProfile?.role?.replace('_', ' ')?.toUpperCase()}
              </span>
            )}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.totalPatients || 0}</dd>
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
        </div>

        {/* Recent Appointments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
            <p className="text-sm text-gray-500">Next 7 days</p>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAppointments?.length > 0 ? (
              recentAppointments?.map((appointment) => (
                <div key={appointment?.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
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
                        <span className="text-sm text-gray-500">
                          Dr. {appointment?.dentist?.full_name}
                        </span>
                      )}
                    </div>
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
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6 text-center">
              <Users className="mx-auto h-12 w-12 text-blue-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Manage Patients</h3>
              <p className="mt-2 text-sm text-gray-500">View, add, and manage patient records</p>
              <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Go to Patients
              </button>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6 text-center">
              <Calendar className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Schedule Appointments</h3>
              <p className="mt-2 text-sm text-gray-500">Book and manage appointments</p>
              <button className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Schedule Now
              </button>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6 text-center">
              <UserPlus className="mx-auto h-12 w-12 text-yellow-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Manage Leads</h3>
              <p className="mt-2 text-sm text-gray-500">Track and convert potential patients</p>
              <button className="mt-4 w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors">
                View Leads
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DentalCrmDashboard