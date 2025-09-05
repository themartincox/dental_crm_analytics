import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Users, Settings, Search } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import ClientCard from './components/ClientCard';
import ClientPermissionModal from './components/ClientPermissionModal';
import SystemMetrics from './components/SystemMetrics';
import ActivityFeed from './components/ActivityFeed';
import BulkActions from './components/BulkActions';

const SystemOwnerAdminDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [systemModules, setSystemModules] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedClients, setSelectedClients] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadClients(),
        loadSystemModules(),
        loadSystemMetrics(),
        loadActivityLog()
      ]);
    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase?.from('client_organizations')?.select(`
          *,
          client_practice_mappings (
            practice_locations (
              name,
              email,
              phone,
              address
            )
          ),
          client_module_permissions (
            module_name,
            permission_level,
            is_enabled
          )
        `)?.order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load client data');
    }
  };

  const loadSystemModules = async () => {
    try {
      const { data, error } = await supabase?.from('system_modules')?.select('*')?.order('display_name');

      if (error) throw error;
      setSystemModules(data || []);
    } catch (err) {
      console.error('Error loading system modules:', err);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      // Calculate metrics from loaded data
      const activeClients = clients?.filter(c => c?.status === 'active')?.length || 0;
      const totalUsers = clients?.reduce((sum, client) => sum + (client?.total_users || 0), 0) || 0;
      const totalRevenue = clients?.reduce((sum, client) => {
        const tierPricing = { basic: 99, professional: 299, enterprise: 599 };
        return sum + (tierPricing?.[client?.subscription_tier] || 0);
      }, 0) || 0;

      setSystemMetrics({
        totalClients: clients?.length || 0,
        activeClients,
        totalUsers,
        totalRevenue,
        systemHealth: 98.5
      });
    } catch (err) {
      console.error('Error calculating metrics:', err);
    }
  };

  const loadActivityLog = async () => {
    try {
      const { data, error } = await supabase?.from('system_owner_audit_log')?.select(`
          *,
          performed_by:user_profiles(full_name, email),
          target_client:client_organizations(organization_name)
        `)?.order('created_at', { ascending: false })?.limit(20);

      if (error) throw error;
      setActivityLog(data || []);
    } catch (err) {
      console.error('Error loading activity log:', err);
    }
  };

  const handleClientAction = async (action, clientId, data = {}) => {
    try {
      switch (action) {
        case 'edit_permissions':
          const client = clients?.find(c => c?.id === clientId);
          setSelectedClient(client);
          setShowPermissionModal(true);
          break;

        case 'toggle_status':
          const newStatus = data?.status === 'active' ? 'suspended' : 'active';
          await supabase?.from('client_organizations')?.update({ status: newStatus, updated_at: new Date()?.toISOString() })?.eq('id', clientId);
          
          await logSystemAction('client_status_changed', clientId, { 
            old_status: data?.status, 
            new_status: newStatus 
          });
          await loadClients();
          break;

        case 'delete':
          await supabase?.from('client_organizations')?.delete()?.eq('id', clientId);
          
          await logSystemAction('client_deleted', clientId, { 
            organization_name: data?.organization_name 
          });
          await loadClients();
          break;

        default:
          break;
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      setError(`Failed to ${action?.replace('_', ' ')}`);
    }
  };

  const logSystemAction = async (actionType, targetClientId = null, details = {}) => {
    try {
      await supabase?.rpc('log_system_owner_action', {
        action_type_param: actionType,
        target_client_param: targetClientId,
        target_user_param: null,
        details_param: details
      });
    } catch (err) {
      console.error('Error logging action:', err);
    }
  };

  const handleBulkAction = async (action, clientIds) => {
    try {
      switch (action) {
        case 'activate':
          await supabase?.from('client_organizations')?.update({ status: 'active' })?.in('id', clientIds);
          break;
        case 'suspend':
          await supabase?.from('client_organizations')?.update({ status: 'suspended' })?.in('id', clientIds);
          break;
        case 'delete':
          await supabase?.from('client_organizations')?.delete()?.in('id', clientIds);
          break;
      }
      
      await logSystemAction('bulk_action_performed', null, { 
        action, 
        client_count: clientIds?.length 
      });
      setSelectedClients([]);
      await loadClients();
    } catch (err) {
      console.error('Bulk action error:', err);
      setError('Failed to perform bulk action');
    }
  };

  const filteredClients = clients?.filter(client => {
    const matchesSearch = client?.organization_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         client?.contact_email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client?.status === statusFilter;
    const matchesTier = tierFilter === 'all' || client?.subscription_tier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="System Owner Admin Dashboard"
        description="Manage multi-tenant client access permissions and system-wide controls"
      />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">System Owner Dashboard</h1>
                <p className="text-sm text-gray-500">Multi-tenant client management & permissions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">System Healthy</span>
              </div>
              <span className="text-sm text-gray-500">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* System Metrics */}
            <SystemMetrics metrics={systemMetrics} />

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow mb-8 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e?.target?.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="trial">Trial</option>
                  </select>

                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e?.target?.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Tiers</option>
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedClients?.length > 0 && (
              <BulkActions
                selectedCount={selectedClients?.length}
                onBulkAction={handleBulkAction}
                onClearSelection={() => setSelectedClients([])}
              />
            )}

            {/* Client List */}
            <div className="grid grid-cols-1 gap-6">
              {filteredClients?.map((client) => (
                <ClientCard
                  key={client?.id}
                  client={client}
                  systemModules={systemModules}
                  isSelected={selectedClients?.includes(client?.id)}
                  onSelect={(id, selected) => {
                    setSelectedClients(prev =>
                      selected
                        ? [...prev, id]
                        : prev?.filter(clientId => clientId !== id)
                    );
                  }}
                  onAction={handleClientAction}
                />
              ))}
            </div>

            {filteredClients?.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || tierFilter !== 'all' ?'Try adjusting your search criteria or filters' :'No clients have been added to the system yet'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ActivityFeed activities={activityLog} />
          </div>
        </div>
      </div>
      {/* Permission Modal */}
      {showPermissionModal && selectedClient && (
        <ClientPermissionModal
          client={selectedClient}
          systemModules={systemModules}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedClient(null);
          }}
          onSave={() => {
            loadClients();
            loadActivityLog();
            setShowPermissionModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};

export default SystemOwnerAdminDashboard;