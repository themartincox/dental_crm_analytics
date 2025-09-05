import React from 'react';
import { Building, Users, Settings, Globe, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

const ClientCard = ({ client, systemModules, isSelected, onSelect, onAction }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trial': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'suspended': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'inactive': return <AlertTriangle className="h-5 w-5 text-gray-400" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles?.[status] || styles?.inactive}`}>
        {status?.replace('_', ' ')?.toUpperCase()}
      </span>
    );
  };

  const getTierBadge = (tier) => {
    const styles = {
      basic: 'bg-gray-100 text-gray-800',
      professional: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles?.[tier] || styles?.basic}`}>
        {tier?.toUpperCase()}
      </span>
    );
  };

  const activeModules = client?.client_module_permissions?.filter(p => p?.is_enabled)?.length || 0;
  const totalModules = systemModules?.length || 0;
  const moduleUsagePercent = totalModules > 0 ? (activeModules / totalModules) * 100 : 0;

  const primaryPractice = client?.client_practice_mappings?.find(m => m?.is_primary_location)?.practice_locations;

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(client?.id, e?.target?.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Building className="h-6 w-6 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {client?.organization_name}
                </h3>
                {getStatusIcon(client?.status)}
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                {getStatusBadge(client?.status)}
                {getTierBadge(client?.subscription_tier)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact</p>
                  <p className="text-sm font-medium text-gray-900">{client?.contact_email}</p>
                  {client?.contact_phone && (
                    <p className="text-sm text-gray-500">{client?.contact_phone}</p>
                  )}
                </div>
                
                {primaryPractice && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Primary Practice</p>
                    <p className="text-sm font-medium text-gray-900">{primaryPractice?.name}</p>
                    <p className="text-sm text-gray-500">{primaryPractice?.address}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {client?.total_users}/{client?.max_users} users
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {activeModules}/{totalModules} modules
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(client?.created_at)?.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Module Usage Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Module Usage</span>
                  <span className="text-sm text-gray-500">{Math.round(moduleUsagePercent)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${moduleUsagePercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Active Modules List */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Active Modules</p>
                <div className="flex flex-wrap gap-1">
                  {client?.client_module_permissions
                    ?.filter(p => p?.is_enabled)
                    ?.map((permission) => {
                      const module = systemModules?.find(m => m?.module_name === permission?.module_name);
                      return (
                        <span
                          key={permission?.module_name}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                        >
                          {module?.display_name || permission?.module_name}
                          <span className="ml-1 text-xs text-green-600">
                            ({permission?.permission_level})
                          </span>
                        </span>
                      );
                    })}
                  {activeModules === 0 && (
                    <span className="text-sm text-gray-500 italic">No active modules</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => onAction?.('edit_permissions', client?.id)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Permissions</span>
            </button>
            
            <button
              onClick={() => onAction?.('toggle_status', client?.id, client)}
              className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-md transition-colors ${
                client?.status === 'active' ?'bg-yellow-600 text-white hover:bg-yellow-700' :'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {client?.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
            
            <button
              onClick={() => onAction?.('delete', client?.id, client)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;