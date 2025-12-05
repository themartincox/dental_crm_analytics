import React, { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, TrendingUp, Search, Filter, XCircle, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  membershipApplicationsService, 
  membershipPlansService,
  membershipsService,
  membershipAnalyticsService,
  membershipRealtimeService 
} from '../../services/membershipService';

// Import components
import ApplicationsTable from './components/ApplicationsTable';
import MembersDirectory from './components/MembersDirectory';
import PlanConfiguration from './components/PlanConfiguration';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ApplicationModal from './components/ApplicationModal';
import MemberModal from './components/MemberModal';

const MembershipProgramManagement = () => {
  const { user } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  
  // Modal states
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Setup realtime subscriptions
  useEffect(() => {
    const unsubscribeApplications = membershipRealtimeService?.subscribeToApplications((payload) => {
      console.log('Application updated:', payload);
      loadApplications(); // Refresh applications data
    });

    const unsubscribeMembers = membershipRealtimeService?.subscribeToMemberships((payload) => {
      console.log('Membership updated:', payload);
      loadMembers(); // Refresh members data
    });

    return () => {
      unsubscribeApplications();
      unsubscribeMembers();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadApplications(),
        loadMembers(),
        loadPlans(),
        loadAnalytics()
      ]);
    } catch (err) {
      setError('Failed to load membership data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    const { data, error } = await membershipApplicationsService?.getAll();
    if (error) {
      setError('Failed to load membership applications');
      return;
    }
    setApplications(data || []);
  };

  const loadMembers = async () => {
    const { data, error } = await membershipsService?.getAll({ status: 'active' });
    if (error) {
      setError('Failed to load active members');
      return;
    }
    setMembers(data || []);
  };

  const loadPlans = async () => {
    const { data, error } = await membershipPlansService?.getAll();
    if (error) {
      setError('Failed to load membership plans');
      return;
    }
    setPlans(data || []);
  };

  const loadAnalytics = async () => {
    const { data, error } = await membershipAnalyticsService?.getOverviewStats();
    if (error) {
      setError('Failed to load analytics data');
      return;
    }
    setAnalytics(data);
  };

  // Handle application actions
  const handleApproveApplication = async (applicationId) => {
    try {
      const { error } = await membershipApplicationsService?.updateStatus(
        applicationId, 
        'approved', 
        user?.id
      );
      
      if (error) throw error;
      
      // Refresh data
      await loadApplications();
      await loadAnalytics();
    } catch (err) {
      setError('Failed to approve application');
      console.error('Approve error:', err);
    }
  };

  const handleRejectApplication = async (applicationId, reason) => {
    try {
      const { error } = await membershipApplicationsService?.updateStatus(
        applicationId,
        'rejected',
        user?.id,
        reason
      );
      
      if (error) throw error;
      
      await loadApplications();
      await loadAnalytics();
    } catch (err) {
      setError('Failed to reject application');
      console.error('Reject error:', err);
    }
  };

  // Filter functions
  const filteredApplications = applications?.filter(app => {
    const matchesSearch = app?.patient?.first_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         app?.patient?.last_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         app?.patient?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         app?.application_number?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app?.status === statusFilter;
    
    const matchesPlan = planFilter === 'all' || app?.membership_plan?.tier === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  }) || [];

  const filteredMembers = members?.filter(member => {
    const matchesSearch = member?.patient?.first_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         member?.patient?.last_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         member?.patient?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         member?.membership_number?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || member?.membership_plan?.tier === planFilter;
    
    return matchesSearch && matchesPlan;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading membership data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Membership Program Management</h1>
              <p className="text-gray-600 mt-1">Manage dental practice membership programs and member lifecycle</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Analytics Overview */}
      {analytics && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics?.totalApplications || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Members</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics?.activeMemberships || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">£{analytics?.monthlyRevenue || '0.00'}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics?.conversionRate || '0'}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applications ({applications?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Members ({members?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plans' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Membership Plans ({plans?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Filters Bar */}
        {(activeTab === 'applications' || activeTab === 'members') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                  />
                </div>
              </div>
              
              {activeTab === 'applications' && (
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e?.target?.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e?.target?.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Plans</option>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="family">Family</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'applications' && (
            <ApplicationsTable 
              applications={filteredApplications}
              onViewApplication={(app) => {
                setSelectedApplication(app);
                setShowApplicationModal(true);
              }}
              onApproveApplication={handleApproveApplication}
              onRejectApplication={handleRejectApplication}
            />
          )}

          {activeTab === 'members' && (
            <MembersDirectory 
              members={filteredMembers}
              onViewMember={(member) => {
                setSelectedMember(member);
                setShowMemberModal(true);
              }}
            />
          )}

          {activeTab === 'plans' && (
            <PlanConfiguration 
              plans={plans}
              onPlansUpdate={loadPlans}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard 
              analytics={analytics}
            />
          )}
        </div>
      </div>
      {/* Modals */}
      {showApplicationModal && selectedApplication && (
        <ApplicationModal 
          application={selectedApplication}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedApplication(null);
          }}
          onApprove={handleApproveApplication}
          onReject={handleRejectApplication}
        />
      )}
      {showMemberModal && selectedMember && (
        <MemberModal 
          member={selectedMember}
          onClose={() => {
            setShowMemberModal(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
};

export default MembershipProgramManagement;