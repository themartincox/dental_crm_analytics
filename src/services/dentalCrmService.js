import secureApiService from './secureApiService';

// User Profiles Service
export const userProfilesService = {
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (typeof filters?.is_active !== 'undefined') params.append('is_active', String(filters.is_active));
      const res = await secureApiService.makeSecureRequest(`/user-profiles?${params.toString()}`, { method: 'GET' }, 'practice_admin');
      return { data: res?.data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },
  async getById(id) {
    try {
      const res = await secureApiService.makeSecureRequest(`/user-profiles/${id}`, { method: 'GET' }, 'practice_admin');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
  async update(id, updates) {
    try {
      const res = await secureApiService.makeSecureRequest(`/user-profiles/${id}`, { method: 'PUT', body: JSON.stringify(updates) }, 'practice_admin');
      return { data: res?.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Patients Service
export const patientsService = {
  async getAll(filters = {}) {
    try {
      const data = await secureApiService.getPatients(filters)
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const res = await secureApiService.makeSecureRequest(`/patients/${id}`, { method: 'GET' }, 'dentist')
      return { data: res?.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async create(patientData) {
    try {
      const res = await secureApiService.makeSecureRequest('/patients', { method: 'POST', body: JSON.stringify(patientData) }, 'dentist')
      return { data: res?.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async update(id, updates) {
    try {
      const res = await secureApiService.makeSecureRequest(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(updates) }, 'dentist')
      return { data: res?.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      await secureApiService.makeSecureRequest(`/patients/${id}`, { method: 'DELETE' }, 'practice_admin')
      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}

// Appointments Service
export const appointmentsService = {
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await secureApiService.makeSecureRequest(`/appointments?${params}`, { method: 'GET' }, 'receptionist')
      return { data: res?.data || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const res = await secureApiService.makeSecureRequest(`/appointments/${id}`, { method: 'GET' }, 'receptionist')
      return { data: res?.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async create(appointmentData) {
    try {
      const res = await secureApiService.makeSecureRequest('/appointments', { method: 'POST', body: JSON.stringify(appointmentData) }, 'receptionist')
      return { data: res?.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async update(id, updates) {
    try {
      const res = await secureApiService.makeSecureRequest(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(updates) }, 'receptionist')
      return { data: res?.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      await secureApiService.makeSecureRequest(`/appointments/${id}`, { method: 'DELETE' }, 'practice_admin')
      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}

// Practice Locations Service
export const practiceLocationsService = {
  async getAll() {
    try {
      const { data, error } = await supabase?.from('practice_locations')?.select('*')?.order('name', { ascending: true })
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase?.from('practice_locations')?.select('*')?.eq('id', id)?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async create(locationData) {
    try {
      const { data, error } = await supabase?.from('practice_locations')?.insert(locationData)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase?.from('practice_locations')?.update(updates)?.eq('id', id)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Leads Service
export const leadsService = {
  async getAll(filters = {}) {
    try {
      const data = await secureApiService.getLeads(filters)
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  },

  async create(leadData) {
    try {
      const res = await secureApiService.makeSecureRequest('/leads', { method: 'POST', body: JSON.stringify(leadData) }, 'receptionist')
      return { data: res?.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async update(id, updates) {
    try {
      const res = await secureApiService.makeSecureRequest(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(updates) }, 'receptionist')
      return { data: res?.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Payments Service
export const paymentsService = {
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await secureApiService.makeSecureRequest(`/payments?${params}`, { method: 'GET' }, 'receptionist')
      return { data: res?.data || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  },

  async create(paymentData) {
    try {
      const res = await secureApiService.makeSecureRequest('/payments', { method: 'POST', body: JSON.stringify(paymentData) }, 'receptionist')
      return { data: res?.data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Dashboard Statistics Service
export const dashboardService = {
  async getStats() {
    try {
      const res = await secureApiService.makeSecureRequest('/stats', { method: 'GET' })
      return { data: res?.data || { totalPatients: 0, totalAppointments: 0, totalLeads: 0, totalRevenue: 0 }, error: null }
    } catch (error) {
      return {
        data: {
          totalPatients: 0,
          totalAppointments: 0,
          totalLeads: 0,
          totalRevenue: 0
        },
        error
      }
    }
  }
}

// Appointments realtime (SSE)
export const appointmentsRealtimeService = {
  subscribe(callback) {
    const base = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
    const es = new EventSource(`${base}/events/appointments/stream`, { withCredentials: true });
    const handler = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.table === 'appointments') callback(data);
      } catch {}
    };
    es.addEventListener('appointment_update', handler);
    return () => es.close();
  }
};
