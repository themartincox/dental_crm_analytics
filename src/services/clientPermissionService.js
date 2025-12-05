import { supabase } from '../lib/supabase';

class ClientPermissionService {
  // Client Organizations
  async getAllClients() {
    try {
      const { data, error } = await supabase.from('client_organizations').select(`
          *,
          client_practice_mappings (
            id,
            is_primary_location,
            practice_locations (
              id,
              name,
              email,
              phone,
              address,
              postcode
            )
          ),
          client_module_permissions (
            id,
            module_name,
            permission_level,
            is_enabled,
            usage_quota,
            usage_count,
            expires_at,
            granted_at
          )
        `).order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching clients:', error);
      return { data: [], error: error?.message };
    }
  }

  async getClientById(clientId) {
    try {
      const { data, error } = await supabase.from('client_organizations').select(`
          *,
          client_practice_mappings (
            *,
            practice_locations (*)
          ),
          client_module_permissions (*)
        `).eq('id', clientId).single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching client:', error);
      return { data: null, error: error?.message };
    }
  }

  async createClient(clientData) {
    try {
      // Calculate pricing based on user count
      const userCount = clientData?.total_users || 2;
      const pricing = {
        installation_fee: 1000, // £1,000
        included_seats: 2,
        additional_seats: Math.max(0, userCount - 2),
        monthly_cost: Math.max(0, userCount - 2) * 50, // £50 per additional seat
        free_trial_months: 12
      };

      const { data, error } = await supabase.from('client_organizations').insert([{
        organization_name: clientData?.organization_name,
        organization_type: clientData?.organization_type || 'dental_practice',
        status: clientData?.status || 'pending_approval',
        subscription_tier: clientData?.subscription_tier || 'basic',
        contact_email: clientData?.contact_email,
        contact_phone: clientData?.contact_phone,
        billing_address: clientData?.billing_address,
        max_users: clientData?.max_users || 10,
        total_users: userCount,
        pricing_info: pricing,
        installation_fee: pricing.installation_fee,
        monthly_cost: pricing.monthly_cost,
        free_trial_ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 12 months from now
      }]).select().single();

      if (error) throw error;

      // Log the action with pricing details
      await this.logSystemAction('client_organization_created', data?.id, {
        organization_name: data?.organization_name,
        user_count: userCount,
        installation_fee: pricing.installation_fee,
        monthly_cost: pricing.monthly_cost,
        additional_seats: pricing.additional_seats
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error creating client:', error);
      return { data: null, error: error?.message };
    }
  }

  async updateClient(clientId, updates) {
    try {
      const { data, error } = await supabase.from('client_organizations').update({
        ...updates,
        updated_at: new Date().toISOString()
      }).eq('id', clientId).select().single();

      if (error) throw error;

      // Log the action
      await this.logSystemAction('client_organization_updated', clientId, {
        organization_name: data?.organization_name,
        changes: Object.keys(updates)
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating client:', error);
      return { data: null, error: error?.message };
    }
  }

  async deleteClient(clientId) {
    try {
      // Get client name for logging before deletion
      const { data: client } = await supabase.from('client_organizations').select('organization_name').eq('id', clientId).single();

      const { error } = await supabase.from('client_organizations').delete().eq('id', clientId);

      if (error) throw error;

      // Log the action
      await this.logSystemAction('client_deleted', clientId, {
        organization_name: client?.organization_name || 'Unknown'
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting client:', error);
      return { error: error?.message };
    }
  }

  // System Modules
  async getSystemModules() {
    try {
      const { data, error } = await supabase.from('system_modules').select('*').order('display_name');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching system modules:', error);
      return { data: [], error: error?.message };
    }
  }

  // Client Module Permissions
  async updateClientPermissions(clientId, permissions) {
    try {
      // Start a transaction by first deleting existing permissions
      const { error: deleteError } = await supabase.from('client_module_permissions').delete().eq('client_organization_id', clientId);

      if (deleteError) throw deleteError;

      // Insert new permissions
      const newPermissions = [];
      Object.entries(permissions)?.forEach(([moduleName, permission]) => {
        if (permission?.permission_level !== 'none') {
          newPermissions.push({
            client_organization_id: clientId,
            module_name: moduleName,
            permission_level: permission?.permission_level,
            is_enabled: permission?.is_enabled || false,
            usage_quota: permission?.usage_quota || null,
            expires_at: permission?.expires_at || null
          });
        }
      });

      if (newPermissions?.length > 0) {
        const { error: insertError } = await supabase.from('client_module_permissions').insert(newPermissions);

        if (insertError) throw insertError;
      }

      // Log the action
      await this.logSystemAction('client_permissions_updated', clientId, {
        permissions_count: newPermissions?.length
      });

      return { error: null };
    } catch (error) {
      console.error('Error updating client permissions:', error);
      return { error: error?.message };
    }
  }

  // Bulk Operations
  async bulkUpdateClientStatus(clientIds, status) {
    try {
      const { error } = await supabase.from('client_organizations').update({
        status,
        updated_at: new Date().toISOString()
      }).in('id', clientIds);

      if (error) throw error;

      // Log the action
      await this.logSystemAction('bulk_status_update', null, {
        action: `bulk_${status}`,
        client_count: clientIds?.length,
        status
      });

      return { error: null };
    } catch (error) {
      console.error('Error bulk updating client status:', error);
      return { error: error?.message };
    }
  }

  async bulkDeleteClients(clientIds) {
    try {
      const { error } = await supabase.from('client_organizations').delete().in('id', clientIds);

      if (error) throw error;

      // Log the action
      await this.logSystemAction('bulk_delete_clients', null, {
        action: 'bulk_delete',
        client_count: clientIds?.length
      });

      return { error: null };
    } catch (error) {
      console.error('Error bulk deleting clients:', error);
      return { error: error?.message };
    }
  }

  // Activity Logging
  async logSystemAction(actionType, targetClientId = null, details = {}) {
    try {
      await supabase.rpc('log_system_owner_action', {
        action_type_param: actionType,
        target_client_param: targetClientId,
        target_user_param: null,
        details_param: details
      });
    } catch (error) {
      console.error('Error logging system action:', error);
    }
  }

  async getActivityLog(limit = 50) {
    try {
      const { data, error } = await supabase.from('system_owner_audit_log').select(`
          *,
          performed_by:user_profiles(full_name, email),
          target_client:client_organizations(organization_name)
        `).order('created_at', { ascending: false }).limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching activity log:', error);
      return { data: [], error: error?.message };
    }
  }

  // System Metrics
  async getSystemMetrics() {
    try {
      // Get client stats
      const { data: clients, error: clientsError } = await supabase.from('client_organizations').select('id, status, subscription_tier, total_users, created_at');

      if (clientsError) throw clientsError;

      const totalClients = clients?.length || 0;
      const activeClients = clients?.filter(c => c?.status === 'active')?.length || 0;
      const totalUsers = clients?.reduce((sum, client) => sum + (client?.total_users || 0), 0) || 0;

      // Calculate revenue based on actual pricing model
      const totalRevenue = clients?.reduce((sum, client) => {
        const installFee = 1000; // £1,000 installation fee
        const includedSeats = 2; // 2 seats included for 12 months
        const additionalSeatPrice = 50; // £50 per month per additional seat
        const currentUsers = client?.total_users || 0;
        const additionalSeats = Math.max(0, currentUsers - includedSeats);
        const monthlyRevenue = additionalSeats * additionalSeatPrice;

        return sum + installFee + monthlyRevenue;
      }, 0) || 0;

      return {
        data: {
          totalClients,
          activeClients,
          totalUsers,
          totalRevenue,
          systemHealth: 98.5, // Mock system health percentage
          clientGrowth: this.calculateGrowthRate(clients),
        },
        error: null
      };
    } catch (error) {
      console.error('Error calculating system metrics:', error);
      return {
        data: {
          totalClients: 0,
          activeClients: 0,
          totalUsers: 0,
          totalRevenue: 0,
          systemHealth: 0
        },
        error: error?.message
      };
    }
  }

  calculateGrowthRate(clients) {
    if (!clients?.length) return 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClients = clients?.filter(
      client => new Date(client?.created_at) >= thirtyDaysAgo
    )?.length || 0;

    return clients?.length > 0 ? (recentClients / clients?.length) * 100 : 0;
  }
}

export const clientPermissionService = new ClientPermissionService();
export default clientPermissionService;