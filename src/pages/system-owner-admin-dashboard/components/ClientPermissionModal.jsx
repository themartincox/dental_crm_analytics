import React, { useState, useEffect } from 'react';
import { X, Save, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const ClientPermissionModal = ({ client, systemModules, onClose, onSave }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize permissions state from current client permissions
    const currentPermissions = {};
    
    systemModules?.forEach(module => {
      const existingPermission = client?.client_module_permissions?.find(
        p => p?.module_name === module?.module_name
      );
      
      currentPermissions[module?.module_name] = {
        permission_level: existingPermission?.permission_level || 'none',
        is_enabled: existingPermission?.is_enabled || false,
        usage_quota: existingPermission?.usage_quota || null,
        expires_at: existingPermission?.expires_at || null
      };
    });
    
    setPermissions(currentPermissions);
  }, [client, systemModules]);

  const handlePermissionChange = (moduleName, field, value) => {
    setPermissions(prev => ({
      ...prev,
      [moduleName]: {
        ...prev?.[moduleName],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First, delete existing permissions for this client
      const { error: deleteError } = await supabase?.from('client_module_permissions')?.delete()?.eq('client_organization_id', client?.id);

      if (deleteError) throw deleteError;

      // Then insert new permissions
      const newPermissions = [];
      Object.entries(permissions)?.forEach(([moduleName, permission]) => {
        if (permission?.permission_level !== 'none') {
          newPermissions?.push({
            client_organization_id: client?.id,
            module_name: moduleName,
            permission_level: permission?.permission_level,
            is_enabled: permission?.is_enabled,
            usage_quota: permission?.usage_quota || null,
            expires_at: permission?.expires_at || null
          });
        }
      });

      if (newPermissions?.length > 0) {
        const { error: insertError } = await supabase?.from('client_module_permissions')?.insert(newPermissions);

        if (insertError) throw insertError;
      }

      // Log the action
      await supabase?.rpc('log_system_owner_action', {
        action_type_param: 'client_permissions_updated',
        target_client_param: client?.id,
        target_user_param: null,
        details_param: {
          organization_name: client?.organization_name,
          permissions_count: newPermissions?.length
        }
      });

      onSave?.();
    } catch (err) {
      console.error('Error updating permissions:', err);
      setError('Failed to update permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionLevelColor = (level) => {
    switch (level) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'write': return 'text-blue-600 bg-blue-100';
      case 'read': return 'text-green-600 bg-green-100';
      case 'none': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isModuleAvailableForTier = (module, tier) => {
    return module?.tier_availability?.includes(tier);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Client Permissions - {client?.organization_name}
              </h3>
              <p className="text-sm text-gray-500">
                Subscription Tier: {client?.subscription_tier?.toUpperCase()} • 
                Status: {client?.status?.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 gap-6">
            {systemModules?.map((module) => {
              const isAvailable = isModuleAvailableForTier(module, client?.subscription_tier);
              const permission = permissions?.[module?.module_name] || {};
              
              return (
                <div
                  key={module?.id}
                  className={`border rounded-lg p-4 ${
                    isAvailable ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className={`font-medium ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                        {module?.display_name}
                      </h4>
                      <p className={`text-sm mt-1 ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                        {module?.description}
                      </p>
                      {!isAvailable && (
                        <p className="text-xs text-orange-600 mt-1">
                          Not available in {client?.subscription_tier} tier
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        ${module?.base_price}/month
                      </span>
                      {module?.is_core_module && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          Core
                        </span>
                      )}
                    </div>
                  </div>
                  {isAvailable && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Permission Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Permission Level
                        </label>
                        <select
                          value={permission?.permission_level || 'none'}
                          onChange={(e) => handlePermissionChange(
                            module?.module_name, 
                            'permission_level', 
                            e?.target?.value
                          )}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="none">No Access</option>
                          <option value="read">Read Only</option>
                          <option value="write">Read & Write</option>
                          <option value="admin">Full Admin</option>
                        </select>
                      </div>

                      {/* Enabled Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={permission?.is_enabled || false}
                            onChange={(e) => handlePermissionChange(
                              module?.module_name, 
                              'is_enabled', 
                              e?.target?.checked
                            )}
                            disabled={permission?.permission_level === 'none'}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600">
                            {permission?.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      {/* Usage Quota */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Usage Quota
                        </label>
                        <input
                          type="number"
                          placeholder="Unlimited"
                          value={permission?.usage_quota || ''}
                          onChange={(e) => handlePermissionChange(
                            module?.module_name, 
                            'usage_quota', 
                            e?.target?.value ? parseInt(e?.target?.value) : null
                          )}
                          disabled={permission?.permission_level === 'none'}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            {hasChanges && 'You have unsaved changes'}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPermissionModal;