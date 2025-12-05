import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import secureApiService from '../../services/secureApiService';
import { AlertCircle, Users, Settings, Search } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import ClientCard from './components/ClientCard';
import ClientPermissionModal from './components/ClientPermissionModal';
import SystemMetrics from './components/SystemMetrics';
import ActivityFeed from './components/ActivityFeed';
import BulkActions from './components/BulkActions';
import { logger } from '../../utils/logger';
import { ERROR_MESSAGES } from '../../utils/constants';
import { supabase } from '../../lib/supabase';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const SystemOwnerAdminDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [systemModules, setSystemModules] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [adoption, setAdoption] = useState([]);
  const LogoPreview = ({ path }) => {
    const [url, setUrl] = useState('');
    useEffect(() => {
      let active = true;
      (async () => {
        try {
          if (!path) return;
          if (path.startsWith('http')) { setUrl(path); return; }
          const { data, error } = await supabase.storage.from('branding').createSignedUrl(path, 60);
          if (!error && data?.signedUrl && active) setUrl(data.signedUrl);
        } catch (_) { }
      })();
      return () => { active = false; };
    }, [path]);
    if (!url) return <div className="h-10 w-10 bg-gray-200 rounded" />;
    return <img src={url} alt="logo" className="h-10" />;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedClients, setSelectedClients] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [uiSettingsEditing, setUiSettingsEditing] = useState({ publicFooterEnabled: true, publicFooterVariant: 'compact', internalFooterEnabled: true });
  const [uiSettingsClientId, setUiSettingsClientId] = useState('');
  const [brandingClientId, setBrandingClientId] = useState('');
  const [brandingForm, setBrandingForm] = useState({
    practice_name: '',
    logo_url: '',
    primary_color: '#2563eb',
    secondary_color_1: '#14b8a6',
    secondary_color_2: '#f59e0b',
    secondary_color_3: '#ef4444',
    font_family: 'Inter'
  });

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
        loadActivityLog(),
        loadAdoption()
      ]);
    } catch (err) {
      logger.error('Dashboard loading error', {
        error: err?.message || 'Unknown error',
        stack: err?.stack,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      setError(ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data } = await secureApiService.makeSecureRequest('/admin/clients', { method: 'GET' }, 'super_admin');
      setClients(data || []);
    } catch (err) {
      logger.error('Error loading clients', {
        error: err?.message || 'Unknown error',
        stack: err?.stack,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      setError(ERROR_MESSAGES.GENERIC_ERROR);
    }
  };

  const loadSystemModules = async () => {
    try {
      const { data } = await secureApiService.makeSecureRequest('/admin/modules', { method: 'GET' }, 'super_admin');
      setSystemModules(data || []);
    } catch (err) {
      logger.error('Error loading system modules', {
        error: err?.message || 'Unknown error',
        stack: err?.stack,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const loadSystemMetrics = async () => {
    try {
      // Prefer server KPIs (aggregate only)
      const { data } = await (await import('../../services/secureApiService')).default.makeSecureRequest('/admin/kpis', { method: 'GET' }, 'super_admin');
      if (data) {
        setSystemMetrics({
          totalClients: data.totalClients,
          activeClients: data.activeClients,
          totalUsers: data.totalUsers,
          totalRevenue: data.mrr,
          systemHealth: 98.5
        });
        return;
      }
    } catch (_) { }
    // Fallback if KPIs not available
    const activeClients = clients?.filter(c => c?.status === 'active')?.length || 0;
    const totalUsers = clients?.reduce((sum, client) => sum + (client?.total_users || 0), 0) || 0;
    setSystemMetrics({
      totalClients: clients?.length || 0,
      activeClients,
      totalUsers,
      totalRevenue: 0,
      systemHealth: 98.5
    });
  };

  const loadActivityLog = async () => {
    try {
      const { data } = await secureApiService.makeSecureRequest('/admin/audit-logs', { method: 'GET' }, 'super_admin');
      setActivityLog(data || []);
    } catch (err) {
      console.error('Error loading activity log:', err);
    }
  };

  const loadAdoption = async () => {
    try {
      const { data } = await secureApiService.makeSecureRequest('/admin/adoption', { method: 'GET' }, 'super_admin');
      setAdoption(data || []);
    } catch (err) {
      console.error('Error loading adoption:', err);
    }
  };

  const handleClientAction = async (action, clientId, data = {}) => {
    try {
      switch (action) {
        case 'edit_permissions': {
          const client = clients?.find(c => c?.id === clientId);
          setSelectedClient(client);
          setShowPermissionModal(true);
          break;
        }

        case 'toggle_status': {
          const newStatus = data?.status === 'active' ? 'suspended' : 'active';
          await secureApiService.makeSecureRequest(`/admin/clients/${clientId}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) }, 'super_admin');

          await logSystemAction('client_status_changed', clientId, {
            old_status: data?.status,
            new_status: newStatus
          });
          await loadClients();
          break;
        }
        case 'approve':
          await secureApiService.makeSecureRequest(`/admin/clients/${clientId}/approve`, { method: 'POST' }, 'super_admin');
          await logSystemAction('client_approved', clientId, { organization_name: data?.organization_name });
          await loadClients();
          break;

        case 'delete':
          await secureApiService.makeSecureRequest(`/admin/clients/${clientId}`, { method: 'DELETE' }, 'super_admin');

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
      await secureApiService.makeSecureRequest('/admin/log', { method: 'POST', body: JSON.stringify({ action_type: actionType, target_client_id: targetClientId, details }) }, 'super_admin');
    } catch (err) {
      console.error('Error logging action:', err);
    }
  };

  const handleBulkAction = async (action, clientIds) => {
    try {
      switch (action) {
        case 'activate':
        case 'suspend':
        case 'delete':
          await secureApiService.makeSecureRequest('/admin/clients/bulk', { method: 'PATCH', body: JSON.stringify({ action, ids: clientIds }) }, 'super_admin');
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
          <p className="text-gray-600">Loading system dashboard.</p>
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

            {/* Feature Adoption (Aggregated, no tenant details) */}
            <div className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-lg font-semibold mb-4">Feature Adoption</h2>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={adoption} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module_name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="enabled_count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-2">Count of tenants with each module enabled.</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow mb-8 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients."
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
                    <option value="pending_approval">Pending approval</option>
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

            {/* UI Settings (Tenant) */}
            <div className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-lg font-semibold mb-4">UI Settings (Tenant)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select className="w-full border rounded px-3 py-2" value={uiSettingsClientId} onChange={(e) => setUiSettingsClientId(e.target.value)}>
                    <option value="">Select client</option>
                    {clients?.map(c => (
                      <option key={c.id} value={c.id}>{c.organization_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Public Footer Variant</label>
                  <select className="w-full border rounded px-3 py-2" value={uiSettingsEditing.publicFooterVariant} onChange={(e) => setUiSettingsEditing(prev => ({ ...prev, publicFooterVariant: e.target.value }))}>
                    <option value="compact">Compact</option>
                    <option value="full">Full (GDC)</option>
                  </select>
                  <div className="mt-2 text-xs text-gray-500">GDC compliance is always ensured. Compact still shows compliance.</div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center text-sm">
                    <input type="checkbox" className="mr-2" checked={uiSettingsEditing.publicFooterEnabled} onChange={(e) => setUiSettingsEditing(prev => ({ ...prev, publicFooterEnabled: e.target.checked }))} />
                    Public Footer Enabled
                  </label>
                  <label className="inline-flex items-center text-sm">
                    <input type="checkbox" className="mr-2" checked={uiSettingsEditing.internalFooterEnabled} onChange={(e) => setUiSettingsEditing(prev => ({ ...prev, internalFooterEnabled: e.target.checked }))} />
                    Internal Footer Enabled
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <button
                  disabled={!uiSettingsClientId}
                  onClick={async () => {
                    try {
                      await secureApiService.makeSecureRequest(`/admin/ui-settings/${uiSettingsClientId}`, { method: 'PUT', body: JSON.stringify(uiSettingsEditing) }, 'super_admin');
                      alert('UI settings saved');
                    } catch (e) {
                      alert('Failed to save settings');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* Branding (Tenant) */}
            <div className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-lg font-semibold mb-4">Branding (Tenant)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select className="w-full border rounded px-3 py-2" value={brandingClientId} onChange={async (e) => {
                    const id = e.target.value; setBrandingClientId(id);
                    if (id) {
                      try {
                        const { data } = await secureApiService.makeSecureRequest(`/admin/branding/${id}`, { method: 'GET' }, 'super_admin');
                        if (data) setBrandingForm(prev => ({ ...prev, ...data }));
                      } catch (_) { }
                    }
                  }}>
                    <option value="">Select client</option>
                    {clients?.map(c => (
                      <option key={c.id} value={c.id}>{c.organization_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name</label>
                  <input className="w-full border rounded px-3 py-2 text-sm" value={brandingForm.practice_name} onChange={(e) => setBrandingForm(prev => ({ ...prev, practice_name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input className="w-full border rounded px-3 py-2 text-sm" value={brandingForm.logo_url} onChange={(e) => setBrandingForm(prev => ({ ...prev, logo_url: e.target.value }))} placeholder="https://." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {['primary_color', 'secondary_color_1', 'secondary_color_2', 'secondary_color_3'].map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{key.replace(/_/g, ' ')}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={brandingForm[key] || '#ffffff'} onChange={(e) => setBrandingForm(prev => ({ ...prev, [key]: e.target.value }))} className="h-8 w-12 p-0 border rounded" />
                      <input value={brandingForm[key] || ''} onChange={(e) => setBrandingForm(prev => ({ ...prev, [key]: e.target.value }))} className="flex-1 border rounded px-3 py-2 text-sm" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Font</label>
                  <input value={brandingForm.font_family} onChange={(e) => setBrandingForm(prev => ({ ...prev, font_family: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" placeholder="Inter, Roboto, ." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo</label>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    try {
                      const file = e.target.files?.[0];
                      if (!file || !brandingClientId) return;
                      const path = `${brandingClientId}/${Date.now()}-${file.name}`;
                      const { error } = await supabase.storage.from('branding').upload(path, file, { upsert: true, cacheControl: '3600' });
                      if (error) throw error;
                      // store the path; display using signed URL
                      setBrandingForm(prev => ({ ...prev, logo_url: path }));
                    } catch (err) {
                      alert('Upload failed');
                    }
                  }} />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={!brandingClientId}
                    onClick={async () => {
                      try {
                        await secureApiService.makeSecureRequest(`/admin/branding/${brandingClientId}`, { method: 'PUT', body: JSON.stringify(brandingForm) }, 'super_admin');
                        alert('Branding saved');
                      } catch (_) {
                        alert('Failed to save branding');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >Save Branding</button>
                </div>
              </div>
              {brandingForm.logo_url && (
                <div className="mt-4 flex items-center gap-3">
                  <LogoPreview path={brandingForm.logo_url} />
                  <span className="text-sm text-gray-500">Preview</span>
                </div>
              )}
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
                  {searchTerm || statusFilter !== 'all' || tierFilter !== 'all' ? 'Try adjusting your search criteria or filters' : 'No clients have been added to the system yet'
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
