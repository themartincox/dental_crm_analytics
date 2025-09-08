import { supabase } from '../lib/supabase';

// User Profiles Service
export const userProfilesService = {
  async getAll(filters = {}) {
    try {
      let query = supabase?.from('user_profiles')?.select(`
          id,
          email,
          full_name,
          role,
          is_active,
          phone,
          created_at,
          updated_at
        `)

      if (filters?.role) {
        query = query?.eq('role', filters?.role)
      }
      if (filters?.is_active !== undefined) {
        query = query?.eq('is_active', filters?.is_active)
      }

      const { data, error } = await query?.order('created_at', { ascending: false })
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', id)?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', id)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Patients Service
export const patientsService = {
  async getAll(filters = {}) {
    try {
      let query = supabase?.from('patients')?.select(`
          id,
          email,
          first_name,
          last_name,
          phone,
          date_of_birth,
          patient_status,
          insurance_provider,
          practice_location_id,
          assigned_dentist_id,
          created_at,
          updated_at,
          practice_locations(id, name, address),
          assigned_dentist:user_profiles!assigned_dentist_id(id, full_name)
        `)

      if (filters?.status) {
        query = query?.eq('patient_status', filters?.status)
      }
      if (filters?.practice_location_id) {
        query = query?.eq('practice_location_id', filters?.practice_location_id)
      }
      if (filters?.assigned_dentist_id) {
        query = query?.eq('assigned_dentist_id', filters?.assigned_dentist_id)
      }

      const { data, error } = await query?.order('created_at', { ascending: false })
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase?.from('patients')?.select(`
          *,
          practice_locations(id, name, address, phone),
          assigned_dentist:user_profiles!assigned_dentist_id(id, full_name, email, phone),
          created_by:user_profiles!created_by_id(id, full_name)
        `)?.eq('id', id)?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async create(patientData) {
    try {
      const { data, error } = await supabase?.from('patients')?.insert(patientData)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase?.from('patients')?.update(updates)?.eq('id', id)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase?.from('patients')?.delete()?.eq('id', id)
      return { error }
    } catch (error) {
      return { error }
    }
  }
}

// Appointments Service
export const appointmentsService = {
  async getAll(filters = {}) {
    try {
      let query = supabase?.from('appointments')?.select(`
          id,
          appointment_date,
          status,
          treatment_type,
          start_time,
          end_time,
          notes,
          created_at,
          patient_id,
          dentist_id,
          practice_location_id,
          patients(id, first_name, last_name, email, phone),
          dentist:user_profiles!dentist_id(id, full_name),
          practice_locations(id, name, address)
        `)

      if (filters?.status) {
        query = query?.eq('status', filters?.status)
      }
      if (filters?.dentist_id) {
        query = query?.eq('dentist_id', filters?.dentist_id)
      }
      if (filters?.practice_location_id) {
        query = query?.eq('practice_location_id', filters?.practice_location_id)
      }
      if (filters?.date_from) {
        query = query?.gte('appointment_date', filters?.date_from)
      }
      if (filters?.date_to) {
        query = query?.lte('appointment_date', filters?.date_to)
      }

      const { data, error } = await query?.order('appointment_date', { ascending: true })
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase?.from('appointments')?.select(`
          *,
          patients(id, first_name, last_name, email, phone, date_of_birth),
          dentist:user_profiles!dentist_id(id, full_name, email, phone),
          practice_locations(id, name, address, phone),
          created_by:user_profiles!created_by_id(id, full_name)
        `)?.eq('id', id)?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async create(appointmentData) {
    try {
      const { data, error } = await supabase?.from('appointments')?.insert(appointmentData)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase?.from('appointments')?.update(updates)?.eq('id', id)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase?.from('appointments')?.delete()?.eq('id', id)
      return { error }
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
      let query = supabase?.from('leads')?.select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          lead_source,
          lead_status,
          interest_level,
          estimated_value,
          notes,
          created_at,
          assigned_to_id,
          practice_location_id,
          assigned_to:user_profiles!assigned_to_id(id, full_name),
          practice_locations(id, name, address)
        `)

      if (filters?.status) {
        query = query?.eq('lead_status', filters?.status)
      }
      if (filters?.source) {
        query = query?.eq('lead_source', filters?.source)
      }
      if (filters?.assigned_to_id) {
        query = query?.eq('assigned_to_id', filters?.assigned_to_id)
      }

      const { data, error } = await query?.order('created_at', { ascending: false })
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async create(leadData) {
    try {
      const { data, error } = await supabase?.from('leads')?.insert(leadData)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase?.from('leads')?.update(updates)?.eq('id', id)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Payments Service
export const paymentsService = {
  async getAll(filters = {}) {
    try {
      let query = supabase?.from('payments')?.select(`
          id,
          amount,
          payment_method,
          status,
          payment_date,
          description,
          created_at,
          patient_id,
          appointment_id,
          processed_by_id,
          patients(id, first_name, last_name),
          appointments(id, appointment_date, treatment_type),
          processed_by:user_profiles!processed_by_id(id, full_name)
        `)

      if (filters?.status) {
        query = query?.eq('status', filters?.status)
      }
      if (filters?.method) {
        query = query?.eq('payment_method', filters?.method)
      }
      if (filters?.patient_id) {
        query = query?.eq('patient_id', filters?.patient_id)
      }

      const { data, error } = await query?.order('payment_date', { ascending: false })
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async create(paymentData) {
    try {
      const { data, error } = await supabase?.from('payments')?.insert(paymentData)?.select()?.single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Dashboard Statistics Service
export const dashboardService = {
  async getStats() {
    try {
      // Get basic counts
      const [patientsResult, appointmentsResult, leadsResult, paymentsResult] = await Promise.all([
        supabase?.from('patients')?.select('id', { count: 'exact', head: true }),
        supabase?.from('appointments')?.select('id', { count: 'exact', head: true }),
        supabase?.from('leads')?.select('id', { count: 'exact', head: true }),
        supabase?.from('payments')?.select('amount')?.eq('status', 'paid')
      ])

      const totalPatients = patientsResult?.count || 0
      const totalAppointments = appointmentsResult?.count || 0
      const totalLeads = leadsResult?.count || 0
      const totalRevenue = paymentsResult?.data?.reduce((sum, payment) => sum + (payment?.amount || 0), 0) || 0

      return {
        data: {
          totalPatients,
          totalAppointments,
          totalLeads,
          totalRevenue
        },
        error: null
      }
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