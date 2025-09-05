import { supabase } from '../lib/supabase';

/**
 * Membership Program Service
 * Handles all membership-related database operations
 */

// ========== MEMBERSHIP APPLICATIONS ==========
export const membershipApplicationsService = {
  // Get all membership applications with related data
  async getAll(filters = {}) {
    try {
      let query = supabase?.from('membership_applications')?.select(`
          *,
          patient:patients(id, first_name, last_name, email, phone),
          membership_plan:membership_plans(id, name, tier, monthly_price),
          practice_location:practice_locations(id, name),
          processed_by:user_profiles(id, full_name)
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }
      if (filters?.practice_location_id) {
        query = query?.eq('practice_location_id', filters?.practice_location_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get single application by ID
  async getById(id) {
    try {
      const { data, error } = await supabase?.from('membership_applications')?.select(`
          *,
          patient:patients(id, first_name, last_name, email, phone, date_of_birth, address),
          membership_plan:membership_plans(id, name, description, tier, monthly_price, benefits),
          practice_location:practice_locations(id, name, address),
          processed_by:user_profiles(id, full_name)
        `)?.eq('id', id)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new membership application
  async create(applicationData) {
    try {
      const { data, error } = await supabase?.from('membership_applications')?.insert([{
          patient_id: applicationData?.patient_id,
          membership_plan_id: applicationData?.membership_plan_id,
          billing_frequency: applicationData?.billing_frequency || 'monthly',
          requested_start_date: applicationData?.requested_start_date,
          emergency_contact_name: applicationData?.emergency_contact_name,
          emergency_contact_phone: applicationData?.emergency_contact_phone,
          additional_notes: applicationData?.additional_notes,
          practice_location_id: applicationData?.practice_location_id
        }])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
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

      const { data, error } = await supabase?.from('membership_applications')?.update(updateData)?.eq('id', id)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete application
  async delete(id) {
    try {
      const { error } = await supabase?.from('membership_applications')?.delete()?.eq('id', id);

      if (error) throw error;
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
      let query = supabase?.from('membership_plans')?.select(`
          *,
          practice_location:practice_locations(id, name),
          created_by:user_profiles(id, full_name)
        `)?.eq('is_active', true)?.order('tier', { ascending: true });

      if (practice_location_id) {
        query = query?.eq('practice_location_id', practice_location_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new membership plan
  async create(planData) {
    try {
      const { data, error } = await supabase?.from('membership_plans')?.insert([planData])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update membership plan
  async update(id, planData) {
    try {
      const { data, error } = await supabase?.from('membership_plans')?.update(planData)?.eq('id', id)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
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
      let query = supabase?.from('memberships')?.select(`
          *,
          patient:patients(id, first_name, last_name, email, phone),
          membership_plan:membership_plans(id, name, tier, monthly_price),
          practice_location:practice_locations(id, name),
          managed_by:user_profiles(id, full_name)
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }
      if (filters?.practice_location_id) {
        query = query?.eq('practice_location_id', filters?.practice_location_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get membership by ID
  async getById(id) {
    try {
      const { data, error } = await supabase?.from('memberships')?.select(`
          *,
          patient:patients(id, first_name, last_name, email, phone, date_of_birth),
          membership_plan:membership_plans(id, name, description, tier, benefits, service_inclusions),
          application:membership_applications(id, application_number, status),
          practice_location:practice_locations(id, name)
        `)?.eq('id', id)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create membership from approved application
  async createFromApplication(application_id, membership_data) {
    try {
      const { data, error } = await supabase?.from('memberships')?.insert([{
          ...membership_data,
          application_id
        }])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update membership status
  async updateStatus(id, status) {
    try {
      const updateData = { status };
      if (status === 'cancelled') {
        updateData.end_date = new Date()?.toISOString();
      }

      const { data, error } = await supabase?.from('memberships')?.update(updateData)?.eq('id', id)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
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
      // Get application counts by status
      let applicationsQuery = supabase?.from('membership_applications')?.select('status', { count: 'exact' });
      
      if (practice_location_id) {
        applicationsQuery = applicationsQuery?.eq('practice_location_id', practice_location_id);
      }

      // Get active memberships count
      let membershipsQuery = supabase?.from('memberships')?.select('status', { count: 'exact' })?.eq('status', 'active');
      
      if (practice_location_id) {
        membershipsQuery = membershipsQuery?.eq('practice_location_id', practice_location_id);
      }

      // Get revenue data
      let revenueQuery = supabase?.from('membership_payments')?.select('amount_paid, paid_date')?.not('paid_date', 'is', null);

      const [applicationsResult, membershipsResult, revenueResult] = await Promise.all([
        applicationsQuery,
        membershipsQuery,
        revenueQuery
      ]);

      if (applicationsResult?.error) throw applicationsResult?.error;
      if (membershipsResult?.error) throw membershipsResult?.error;
      if (revenueResult?.error) throw revenueResult?.error;

      // Calculate stats
      const totalApplications = applicationsResult?.count || 0;
      const activeMemberships = membershipsResult?.count || 0;
      
      const monthlyRevenue = revenueResult?.data
        ?.filter(payment => {
          const paidDate = new Date(payment.paid_date);
          const currentMonth = new Date();
          return paidDate?.getMonth() === currentMonth?.getMonth() && 
                 paidDate?.getFullYear() === currentMonth?.getFullYear();
        })?.reduce((sum, payment) => sum + parseFloat(payment?.amount_paid || 0), 0) || 0;

      return {
        data: {
          totalApplications,
          activeMemberships,
          monthlyRevenue: monthlyRevenue?.toFixed(2),
          conversionRate: totalApplications > 0 ? ((activeMemberships / totalApplications) * 100)?.toFixed(1) : 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get membership trends
  async getMembershipTrends(practice_location_id = null, days = 30) {
    try {
      const startDate = new Date();
      startDate?.setDate(startDate?.getDate() - days);

      let query = supabase?.from('memberships')?.select('created_at, status')?.gte('created_at', startDate?.toISOString());

      if (practice_location_id) {
        query = query?.eq('practice_location_id', practice_location_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process trends data
      const trendsData = data?.reduce((acc, membership) => {
        const date = new Date(membership.created_at)?.toISOString()?.split('T')?.[0];
        if (!acc?.[date]) acc[date] = { date, count: 0 };
        acc[date].count++;
        return acc;
      }, {}) || {};

      return {
        data: Object.values(trendsData)?.sort((a, b) => new Date(a.date) - new Date(b.date)),
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// ========== REALTIME SUBSCRIPTIONS ==========
export const membershipRealtimeService = {
  // Subscribe to membership applications changes
  subscribeToApplications(callback) {
    const channel = supabase?.channel('membership_applications_changes')?.on('postgres_changes', 
        { event: '*', schema: 'public', table: 'membership_applications' },
        callback
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  },

  // Subscribe to memberships changes  
  subscribeToMemberships(callback) {
    const channel = supabase?.channel('memberships_changes')?.on('postgres_changes',
        { event: '*', schema: 'public', table: 'memberships' },
        callback
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }
};