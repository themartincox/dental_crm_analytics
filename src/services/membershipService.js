import secureApiService from './secureApiService';

/**
 * Membership Program Service
 * Handles all membership-related database operations
 */

// ========== MEMBERSHIP APPLICATIONS ==========
export const membershipApplicationsService = {
  // Get all membership applications with related data
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.practice_location_id) params.append('practice_location_id', filters.practice_location_id);
      const res = await secureApiService.makeSecureRequest(`/memberships/applications?${params.toString()}`, { method: 'GET' }, 'manager');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get single application by ID
  async getById(id) {
    try {
      const res = await secureApiService.makeSecureRequest(`/memberships/applications/${id}`, { method: 'GET' }, 'manager');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new membership application
  async create(applicationData) {
    try {
      const res = await secureApiService.makeSecureRequest('/memberships/applications', { method: 'POST', body: JSON.stringify(applicationData) }, 'receptionist');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update application status
  async updateStatus(id, status, processed_by_id, rejected_reason = null) {
    try {
      const updateData = {
        status,
        processed_by_id,
        updated_at: new Date()?.toISOString()
      };

      if (status === 'approved') {
        updateData.approved_date = new Date()?.toISOString();
      } else if (status === 'rejected' && rejected_reason) {
        updateData.rejected_reason = rejected_reason;
      }

      const res = await secureApiService.makeSecureRequest(`/memberships/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(updateData) }, 'manager');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete application
  async delete(id) {
    try {
      await secureApiService.makeSecureRequest(`/memberships/applications/${id}`, { method: 'DELETE' }, 'practice_admin');
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// ========== MEMBERSHIP PLANS ==========
export const membershipPlansService = {
  // Get all membership plans
  async getAll(practice_location_id = null) {
    try {
      const params = new URLSearchParams();
      if (practice_location_id) params.append('practice_location_id', practice_location_id);
      const res = await secureApiService.makeSecureRequest(`/memberships/plans?${params.toString()}`, { method: 'GET' }, 'manager');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new membership plan
  async create(planData) {
    try {
      const res = await secureApiService.makeSecureRequest('/memberships/plans', { method: 'POST', body: JSON.stringify(planData) }, 'practice_admin');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update membership plan
  async update(id, planData) {
    try {
      const res = await secureApiService.makeSecureRequest(`/memberships/plans/${id}`, { method: 'PUT', body: JSON.stringify(planData) }, 'practice_admin');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// ========== ACTIVE MEMBERSHIPS ==========
export const membershipsService = {
  // Get all active memberships
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.practice_location_id) params.append('practice_location_id', filters.practice_location_id);
      const res = await secureApiService.makeSecureRequest(`/memberships?${params.toString()}`, { method: 'GET' }, 'receptionist');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get membership by ID
  async getById(id) {
    try {
      const res = await secureApiService.makeSecureRequest(`/memberships/${id}`, { method: 'GET' }, 'receptionist');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create membership from approved application
  async createFromApplication(application_id, membership_data) {
    try {
      const res = await secureApiService.makeSecureRequest('/memberships/from-application', { method: 'POST', body: JSON.stringify({ application_id, membership_data }) }, 'manager');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update membership status
  async updateStatus(id, status) {
    try {
      const res = await secureApiService.makeSecureRequest(`/memberships/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, 'manager');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// ========== MEMBERSHIP ANALYTICS ==========
export const membershipAnalyticsService = {
  // Get membership overview stats
  async getOverviewStats(practice_location_id = null) {
    try {
      const params = new URLSearchParams();
      if (practice_location_id) params.append('practice_location_id', practice_location_id);
      const res = await secureApiService.makeSecureRequest(`/memberships/analytics/overview?${params.toString()}`, { method: 'GET' }, 'manager');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get membership trends
  async getMembershipTrends(practice_location_id = null, days = 30) {
    try {
      const params = new URLSearchParams();
      if (practice_location_id) params.append('practice_location_id', practice_location_id);
      params.append('days', String(days));
      const res = await secureApiService.makeSecureRequest(`/memberships/analytics/trends?${params.toString()}`, { method: 'GET' }, 'manager');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// ========== REALTIME SUBSCRIPTIONS ==========
export const membershipRealtimeService = {
  // Subscribe to membership applications changes
  subscribeToApplications(callback) {
    const base = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
    const es = new EventSource(`${base}/events/memberships/stream`, { withCredentials: true });
    const handler = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.table === 'membership_applications') callback(data);
      } catch {}
    };
    es.addEventListener('membership_update', handler);
    return () => es.close();
  },

  // Subscribe to memberships changes  
  subscribeToMemberships(callback) {
    const base = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
    const es = new EventSource(`${base}/events/memberships/stream`, { withCredentials: true });
    const handler = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.table === 'memberships') callback(data);
      } catch {}
    };
    es.addEventListener('membership_update', handler);
    return () => es.close();
  }
};
