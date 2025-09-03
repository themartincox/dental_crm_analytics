import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabaseService from '../services/supabaseService';

// Generic hook for managing Supabase data with loading states
export const useSupabaseData = (serviceMethod, dependencies = [], options = {}) => {
  const [data, setData] = useState(options?.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user && options?.requireAuth !== false) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await serviceMethod(...dependencies);
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
      if (options?.onError) {
        options?.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [serviceMethod, user, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

// Hook for patient data
export const usePatients = (filters = {}) => {
  return useSupabaseData(
    supabaseService?.patient?.getPatients,
    [filters],
    { initialData: [] }
  );
};

// Hook for patient statistics
export const usePatientStats = () => {
  return useSupabaseData(
    supabaseService?.patient?.getPatientStats,
    [],
    { initialData: {} }
  );
};

// Hook for appointments
export const useAppointments = (filters = {}) => {
  return useSupabaseData(
    supabaseService?.appointment?.getAppointments,
    [filters],
    { initialData: [] }
  );
};

// Hook for leads
export const useLeads = (filters = {}) => {
  return useSupabaseData(
    supabaseService?.lead?.getLeads,
    [filters],
    { initialData: [] }
  );
};

// Hook for practice statistics
export const usePracticeStats = () => {
  return useSupabaseData(
    supabaseService?.analytics?.getPracticeStats,
    [],
    { initialData: {} }
  );
};

// Hook for revenue data
export const useRevenueData = (days = 30) => {
  return useSupabaseData(
    supabaseService?.analytics?.getRevenueData,
    [days],
    { initialData: [] }
  );
};

// Hook for lead pipeline data
export const useLeadPipelineData = () => {
  return useSupabaseData(
    supabaseService?.analytics?.getLeadPipelineData,
    [],
    { initialData: [] }
  );
};

// Hook for recent activities
export const useRecentActivities = (limit = 10) => {
  return useSupabaseData(
    supabaseService?.analytics?.getRecentActivities,
    [limit],
    { initialData: [] }
  );
};

// Hook for practice locations
export const usePracticeLocations = () => {
  return useSupabaseData(
    supabaseService?.common?.getPracticeLocations,
    [],
    { 
      initialData: [],
      requireAuth: false  // Public data
    }
  );
};

// Hook for staff members
export const useStaffMembers = () => {
  return useSupabaseData(
    supabaseService?.common?.getStaffMembers,
    [],
    { initialData: [] }
  );
};

// Hook for real-time subscriptions
export const useSupabaseSubscription = (table, callback, filters = null) => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;

    let subscription = supabaseService?.client?.channel(`${table}-changes`)?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        ...(filters && { filter: filters })
      }, callback)?.subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [table, callback, filters, user]);
};

// Hook for optimistic updates
export const useOptimisticUpdate = (initialData = []) => {
  const [data, setData] = useState(initialData);

  const optimisticUpdate = useCallback((updateFn, rollbackFn) => {
    // Apply optimistic update
    setData(currentData => updateFn(currentData));

    return {
      rollback: () => {
        setData(currentData => rollbackFn(currentData));
      }
    };
  }, []);

  const addOptimistic = useCallback((newItem) => {
    return optimisticUpdate(
      (currentData) => [newItem, ...currentData],
      (currentData) => currentData?.filter(item => item?.id !== newItem?.id)
    );
  }, [optimisticUpdate]);

  const updateOptimistic = useCallback((id, updates) => {
    let originalItem = null;
    
    return optimisticUpdate(
      (currentData) => {
        return currentData?.map(item => {
          if (item?.id === id) {
            originalItem = item;
            return { ...item, ...updates };
          }
          return item;
        });
      },
      (currentData) => {
        return currentData?.map(item => 
          item?.id === id ? originalItem : item
        );
      }
    );
  }, [optimisticUpdate]);

  const removeOptimistic = useCallback((id) => {
    let removedItem = null;
    
    return optimisticUpdate(
      (currentData) => {
        const index = currentData?.findIndex(item => item?.id === id);
        if (index !== -1) {
          removedItem = currentData?.[index];
          return currentData?.filter(item => item?.id !== id);
        }
        return currentData;
      },
      (currentData) => {
        if (removedItem) {
          return [...currentData, removedItem];
        }
        return currentData;
      }
    );
  }, [optimisticUpdate]);

  return {
    data,
    setData,
    addOptimistic,
    updateOptimistic,
    removeOptimistic
  };
};

export default {
  useSupabaseData,
  usePatients,
  usePatientStats,
  useAppointments,
  useLeads,
  usePracticeStats,
  useRevenueData,
  useLeadPipelineData,
  useRecentActivities,
  usePracticeLocations,
  useStaffMembers,
  useSupabaseSubscription,
  useOptimisticUpdate
};