import { supabase } from '../lib/supabase';

// Helper function for error handling
const handleError = (error, operation) => {
  console.error(`Error in ${operation}:`, error);
  throw error;
};

// Helper function to check if user is authenticated
const checkAuth = async () => {
  // CHANGED: Use getUser() instead of deprecated auth.user
  if (!supabase.auth. {
    throw new Error('Supabase client not initialized');
  }
  const result = await supabase.auth.getUser();
  const user = result?.data?.user;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
};

// ==================== USER PROFILE SERVICE ====================

export const userProfileService = {
  // Safely create or retrieve user profile with improved error handling
  async ensureUserProfile(userId, userData = {}) {
    try {
      // CHANGED: Add retry logic for infinite recursion issues
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const { data, error } = await supabase.rpc('ensure_user_profile', {
            user_id: userId,
            user_email: userData?.email,
            user_full_name: userData?.fullName || userData?.full_name,
            user_role: userData?.role || 'receptionist'
          });

          if (error) {
            // Check for infinite recursion error
            if (error?.code === '42P17' || error?.message?.includes('infinite recursion')) {
              console.warn(`Infinite recursion detected, retry ${retryCount + 1}/${maxRetries}`);
              retryCount++;

              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
            throw error;
          }

          return data;
        } catch (retryError) {
          if (retryCount === maxRetries - 1) {
            throw retryError;
          }
          retryCount++;
        }
      }
    } catch (error) {
      handleError(error, 'ensureUserProfile');
    }
  },

  // Update user profile with conflict resolution and improved error handling
  async updateUserProfile(userId, updates) {
    try {
      const user = await checkAuth();

      // CHANGED: Use upsert with better conflict handling
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          .updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .maybeSingle();

      if (error) {
        // Special handling for RLS errors
        if (error?.code === '42P17') {
          throw new Error('Profile update blocked by security policy. Please try again.');
        }
        throw error;
      }

      return data;
    } catch (error) {
      handleError(error, 'updateUserProfile');
    }
  },

  // ADDED: Get user profile with safe fallbacks
  async getUserProfile(userId) {
    try {
      // Try the ensure function first (bypasses RLS)
      const profile = await this.ensureUserProfile(userId);

      if (profile) {
        return profile;
      }

      // Fallback to direct query
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();

      if (error && error?.code === '42P17') {
        throw new Error('Unable to fetch profile due to security policy recursion');
      }

      if (error) throw error;

      return data;
    } catch (error) {
      handleError(error, 'getUserProfile');
    }
  },

  // Clean up duplicate or orphaned profiles
  async cleanupProfiles() {
    try {
      const { data, error } = await supabase.rpc('cleanup_duplicate_profiles');

      if (error) throw error;

      return { cleanedCount: data };
    } catch (error) {
      handleError(error, 'cleanupProfiles');
    }
  }
};

// ==================== PATIENTS ====================

export const patientService = {
  // Get all patients with optional filters
  async getPatients(filters = {}) {
    try {
      let query = supabase.from('patients').select(`
          *,
          assigned_dentist:user_profiles!assigned_dentist_id(id, full_name, email),
          practice_location:practice_locations(id, name)
        `);

      // Apply filters
      if (filters?.status && filters?.status !== 'all') {
        query = query.eq('patient_status', filters?.status);
      }
      if (filters?.treatmentType && filters?.treatmentType !== 'all') {
        query = query.eq('treatment_type', filters?.treatmentType);
      }
      if (filters?.insuranceProvider && filters?.insuranceProvider !== 'all') {
        query = query.eq('insurance_provider', filters?.insuranceProvider);
      }
      if (filters?.search) {
        query = query?.or(`first_name.ilike.%${filters?.search}%,last_name.ilike.%${filters?.search}%,email.ilike.%${filters?.search}%,phone.ilike.%${filters?.search}%`);
      }

      // Apply sorting
      if (filters?.sortBy) {
        const direction = filters?.sortDirection === 'desc' ? false : true;
        query = query.order(filters?.sortBy, { ascending: direction });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match frontend expectations
      return data?.map(patient => ({
        id: patient?.id,
        name: `${patient?.first_name} ${patient?.last_name}`,
        email: patient?.email,
        phone: patient?.phone,
        dateOfBirth: patient?.date_of_birth,
        lastVisit: patient?.updated_at?.split('T')?.[0],
        nextAppointment: null, // Will be populated by appointment service
        status: patient?.patient_status,
        treatmentType: patient?.treatment_type,
        insuranceProvider: patient?.insurance_provider,
        outstandingBalance: 0, // Will be calculated from payments
        profileImage: patient?.profile_image_url,
        progress: 75, // Will be calculated based on treatments
        notes: patient?.notes,
        communicationPreference: patient?.communication_preference,
        assignedDentist: patient?.assigned_dentist?.full_name,
        practiceLocation: patient?.practice_location?.name
      })) || [];
    } catch (error) {
      handleError(error, 'getPatients');
    }
  },

  // Get patient by ID
  async getPatientById(id) {
    try {
      const { data, error } = await supabase.from('patients').select(`
          *,
          assigned_dentist:user_profiles!assigned_dentist_id(id, full_name, email),
          practice_location:practice_locations(id, name),
          appointments(id, appointment_date, start_time, status, treatment_type),
          treatments(id, procedure_name, status, estimated_cost, actual_cost)
        `).eq('id', id).single();

      if (error) throw error;

      return data;
    } catch (error) {
      handleError(error, 'getPatientById');
    }
  },

  // Create new patient
  async createPatient(patientData) {
    try {
      checkAuth();

      const { data, error } = await supabase.from('patients').insert({
        patient_number: `P${Date.now()}`,
        first_name: patientData?.firstName,
        last_name: patientData?.lastName,
        email: patientData?.email,
        phone: patientData?.phone,
        date_of_birth: patientData?.dateOfBirth,
        address: patientData?.address,
        postcode: patientData?.postcode,
        patient_status: patientData?.status || 'prospective',
        treatment_type: patientData?.treatmentType || 'general',
        insurance_provider: patientData?.insuranceProvider || 'NHS',
        communication_preference: patientData?.communicationPreference || 'email',
        notes: patientData?.notes,
        practice_location_id: patientData?.practiceLocationId,
        assigned_dentist_id: patientData?.assignedDentistId
      }).select().single();

      if (error) throw error;

      // Log activity
      await this.logActivity({
        activity_type: 'patient_registration',
        description: `New patient registered: ${patientData?.firstName} ${patientData?.lastName}`,
        patient_id: data?.id
      });

      return data;
    } catch (error) {
      handleError(error, 'createPatient');
    }
  },

  // Update patient
  async updatePatient(id, patientData) {
    try {
      checkAuth();

      const { data, error } = await supabase.from('patients').update({
        first_name: patientData?.firstName,
        last_name: patientData?.lastName,
        email: patientData?.email,
        phone: patientData?.phone,
        date_of_birth: patientData?.dateOfBirth,
        address: patientData?.address,
        postcode: patientData?.postcode,
        patient_status: patientData?.status,
        treatment_type: patientData?.treatmentType,
        insurance_provider: patientData?.insuranceProvider,
        communication_preference: patientData?.communicationPreference,
        notes: patientData?.notes,
        assigned_dentist_id: patientData?.assignedDentistId
      }).eq('id', id).select().single();

      if (error) throw error;

      return data;
    } catch (error) {
      handleError(error, 'updatePatient');
    }
  },

  // Get patient statistics
  async getPatientStats() {
    try {
      const { data, error } = await supabase.rpc('get_practice_stats');

      if (error) throw error;

      return data?.[0] || {};
    } catch (error) {
      handleError(error, 'getPatientStats');
    }
  }
};

// ==================== APPOINTMENTS ====================

export const appointmentService = {
  // Get appointments with filters
  async getAppointments(filters = {}) {
    try {
      let query = supabase.from('appointments').select(`
          *,
          patient:patients(id, first_name, last_name, phone, email),
          dentist:user_profiles!dentist_id(id, full_name),
          practice_location:practice_locations(id, name)
        `);

      // Apply filters
      if (filters?.date) {
        query = query.eq('appointment_date', filters?.date);
      }
      if (filters?.status) {
        query = query.eq('status', filters?.status);
      }
      if (filters?.dentistId) {
        query = query.eq('dentist_id', filters?.dentistId);
      }

      const { data, error } = await query.order('appointment_date').order('start_time');

      if (error) throw error;

      return data?.map(appointment => ({
        id: appointment?.id,
        appointmentNumber: appointment?.appointment_number,
        patient: {
          id: appointment?.patient?.id,
          name: `${appointment?.patient?.first_name} ${appointment?.patient?.last_name}`,
          phone: appointment?.patient?.phone,
          email: appointment?.patient?.email
        },
        dentist: {
          id: appointment?.dentist?.id,
          name: appointment?.dentist?.full_name
        },
        date: appointment?.appointment_date,
        startTime: appointment?.start_time,
        endTime: appointment?.end_time,
        treatmentType: appointment?.treatment_type,
        status: appointment?.status,
        notes: appointment?.notes,
        estimatedCost: appointment?.estimated_cost,
        depositRequired: appointment?.deposit_required,
        depositPaid: appointment?.deposit_paid,
        practiceLocation: appointment?.practice_location?.name
      })) || [];
    } catch (error) {
      handleError(error, 'getAppointments');
    }
  },

  // Create appointment
  async createAppointment(appointmentData) {
    try {
      checkAuth();

      const { data, error } = await supabase.from('appointments').insert({
        appointment_number: `A${Date.now()}`,
        patient_id: appointmentData?.patientId,
        dentist_id: appointmentData?.dentistId,
        practice_location_id: appointmentData?.practiceLocationId,
        appointment_date: appointmentData?.date,
        start_time: appointmentData?.startTime,
        end_time: appointmentData?.endTime,
        treatment_type: appointmentData?.treatmentType,
        status: 'scheduled',
        notes: appointmentData?.notes,
        estimated_cost: appointmentData?.estimatedCost,
        deposit_required: appointmentData?.depositRequired || 0
      }).select().single();

      if (error) throw error;

      // Log activity
      await this.logActivity({
        activity_type: 'appointment_booking',
        description: 'New appointment booked',
        patient_id: appointmentData?.patientId,
        appointment_id: data?.id
      });

      return data;
    } catch (error) {
      handleError(error, 'createAppointment');
    }
  },

  // Update appointment status
  async updateAppointmentStatus(id, status, notes = null) {
    try {
      checkAuth();

      const { data, error } = await supabase.from('appointments').update({
        status,
        notes: notes || undefined
      }).eq('id', id).select().single();

      if (error) throw error;

      return data;
    } catch (error) {
      handleError(error, 'updateAppointmentStatus');
    }
  }
};

// ==================== LEADS ====================

export const leadService = {
  // Get leads with filters
  async getLeads(filters = {}) {
    try {
      let query = supabase.from('leads').select(`
          *,
          assigned_to:user_profiles!assigned_to_id(id, full_name),
          practice_location:practice_locations(id, name)
        `);

      // Apply filters
      if (filters?.status && filters?.status !== 'all') {
        query = query.eq('lead_status', filters?.status);
      }
      if (filters?.source && filters?.source !== 'all') {
        query = query.eq('lead_source', filters?.source);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to_id', filters?.assignedTo);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      handleError(error, 'getLeads');
    }
  },

  // Create lead
  async createLead(leadData) {
    try {
      checkAuth();

      const { data, error } = await supabase.from('leads').insert({
        lead_number: `L${Date.now()}`,
        first_name: leadData?.firstName,
        last_name: leadData?.lastName,
        email: leadData?.email,
        phone: leadData?.phone,
        postcode: leadData?.postcode,
        lead_source: leadData?.source,
        lead_status: 'new',
        treatment_interest: leadData?.treatmentInterest,
        estimated_value: leadData?.estimatedValue,
        notes: leadData?.notes,
        assigned_to_id: leadData?.assignedToId,
        practice_location_id: leadData?.practiceLocationId
      }).select().single();

      if (error) throw error;

      return data;
    } catch (error) {
      handleError(error, 'createLead');
    }
  },

  // Convert lead to patient
  async convertLeadToPatient(leadId, patientData) {
    try {
      checkAuth();

      // Create patient from lead data
      const patient = await patientService.createPatient(patientData);

      // Update lead as converted
      const { error } = await supabase.from('leads').update({
        lead_status: 'converted',
        conversion_date: new Date().toISOString(),
        converted_patient_id: patient?.id
      }).eq('id', leadId);

      if (error) throw error;

      // Log activity
      await this.logActivity({
        activity_type: 'lead_conversion',
        description: `Lead converted to patient: ${patientData?.firstName} ${patientData?.lastName}`,
        patient_id: patient?.id
      });

      return patient;
    } catch (error) {
      handleError(error, 'convertLeadToPatient');
    }
  }
};

// ==================== ANALYTICS ====================

export const analyticsService = {
  // Get practice performance metrics
  async getPracticeStats() {
    try {
      const { data, error } = await supabase.rpc('get_practice_stats');

      if (error) throw error;

      const stats = data?.[0] || {};

      return {
        totalPatients: stats?.total_patients || 0,
        activePatients: stats?.active_patients || 0,
        totalRevenue: stats?.total_revenue || 0,
        monthlyRevenue: stats?.monthly_revenue || 0,
        avgPatientValue: stats?.avg_patient_value || 0,
        conversionRate: stats?.conversion_rate || 0
      };
    } catch (error) {
      handleError(error, 'getPracticeStats');
    }
  },

  // Get revenue data for charts
  async getRevenueData(days = 30) {
    try {
      const { data, error } = await supabase.from('revenue_records').select('*').gte('record_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).order('record_date');

      if (error) throw error;

      // Transform data for charts
      return data?.map(record => ({
        date: record?.record_date,
        revenue: record?.revenue_amount,
        patients: record?.patient_count,
        appointments: record?.appointment_count,
        newPatients: record?.new_patient_count,
        treatmentType: record?.treatment_type
      })) || [];
    } catch (error) {
      handleError(error, 'getRevenueData');
    }
  },

  // Get lead pipeline data
  async getLeadPipelineData() {
    try {
      const { data, error } = await supabase.from('leads').select('lead_status, estimated_value');

      if (error) throw error;

      // Group by status and calculate totals
      const pipeline = {};
      data?.forEach(lead => {
        if (!pipeline?.[lead?.lead_status]) {
          pipeline[lead?.lead_status] = {
            count: 0,
            value: 0
          };
        }
        pipeline[lead?.lead_status].count++;
        pipeline[lead?.lead_status].value += parseFloat(lead?.estimated_value || 0);
      });

      // Transform to expected format
      const pipelineArray = [
        { name: 'New', count: pipeline?.new?.count || 0, value: pipeline?.new?.value || 0 },
        { name: 'Contacted', count: pipeline?.contacted?.count || 0, value: pipeline?.contacted?.value || 0 },
        { name: 'Qualified', count: pipeline?.qualified?.count || 0, value: pipeline?.qualified?.value || 0 },
        { name: 'Consultation', count: pipeline?.consultation_booked?.count || 0, value: pipeline?.consultation_booked?.value || 0 },
        { name: 'Treatment', count: pipeline?.treatment_planned?.count || 0, value: pipeline?.treatment_planned?.value || 0 },
        { name: 'Converted', count: pipeline?.converted?.count || 0, value: pipeline?.converted?.value || 0 }
      ];

      return pipelineArray;
    } catch (error) {
      handleError(error, 'getLeadPipelineData');
    }
  },

  // Get recent activities
  async getRecentActivities(limit = 10) {
    try {
      const { data, error } = await supabase.from('system_activities').select(`
          *,
          patient:patients(first_name, last_name),
          user:user_profiles!user_id(full_name)
        `).order('created_at', { ascending: false }).limit(limit);

      if (error) throw error;

      return data?.map(activity => ({
        id: activity?.id,
        type: activity?.activity_type,
        description: activity?.description,
        patientName: activity?.patient ? `${activity?.patient?.first_name} ${activity?.patient?.last_name}` : null,
        userName: activity?.user?.full_name,
        timestamp: new Date(activity?.created_at),
        metadata: activity?.metadata
      })) || [];
    } catch (error) {
      handleError(error, 'getRecentActivities');
    }
  }
};

// ==================== COMMON SERVICES ====================

export const commonService = {
  // Log system activity
  async logActivity(activityData) {
    try {
      const user = supabase.auth..user;

      const { error } = await supabase.from('system_activities').insert({
        activity_type: activityData?.activity_type,
        description: activityData?.description,
        patient_id: activityData?.patient_id || null,
        user_id: user?.id || null,
        appointment_id: activityData?.appointment_id || null,
        treatment_id: activityData?.treatment_id || null,
        metadata: activityData?.metadata || null
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error for activity logging as it's not critical
    }
  },

  // Get practice locations
  async getPracticeLocations() {
    try {
      const { data, error } = await supabase.from('practice_locations').select('*').eq('is_active', true).order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      handleError(error, 'getPracticeLocations');
    }
  },

  // Get staff members
  async getStaffMembers() {
    try {
      const { data, error } = await supabase.from('user_profiles').select('id, full_name, email, role').eq('is_active', true).order('full_name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      handleError(error, 'getStaffMembers');
    }
  }
};

// Export all services including the new user profile service
export default {
  userProfile: userProfileService,
  patient: patientService,
  appointment: appointmentService,
  lead: leadService,
  analytics: analyticsService,
  common: commonService
};