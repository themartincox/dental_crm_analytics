import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  patientsService, 
  appointmentsService, 
  leadsService, 
  paymentsService,
  dashboardService 
} from '../dentalCrmService';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    }))
  })
};

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('DentalCrmService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('patientsService', () => {
    it('should get all patients with filters', async () => {
      const mockPatients = [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' }
      ];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockPatients, error: null }))
          }))
        }))
      });

      const result = await patientsService.getAll({ status: 'active' });
      
      expect(result.data).toEqual(mockPatients);
      expect(result.error).toBeNull();
    });

    it('should create a new patient', async () => {
      const patientData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com'
      };
      
      const mockCreatedPatient = { id: 2, ...patientData };
      
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockCreatedPatient, error: null }))
          }))
        }))
      });

      const result = await patientsService.create(patientData);
      
      expect(result.data).toEqual(mockCreatedPatient);
      expect(result.error).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database connection failed');
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error }))
          }))
        }))
      });

      const result = await patientsService.getAll();
      
      expect(result.data).toEqual([]);
      expect(result.error).toBe(error);
    });
  });

  describe('appointmentsService', () => {
    it('should get appointments with date filters', async () => {
      const mockAppointments = [
        {
          id: 1,
          appointment_date: '2024-01-15',
          start_time: '10:00',
          end_time: '11:00',
          patients: { first_name: 'John', last_name: 'Doe' }
        }
      ];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockAppointments, error: null }))
            }))
          }))
        }))
      });

      const filters = {
        date_from: '2024-01-01',
        date_to: '2024-01-31'
      };

      const result = await appointmentsService.getAll(filters);
      
      expect(result.data).toEqual(mockAppointments);
    });
  });

  describe('leadsService', () => {
    it('should create a new lead', async () => {
      const leadData = {
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob@example.com',
        lead_source: 'google-ads'
      };
      
      const mockCreatedLead = { id: 3, ...leadData };
      
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockCreatedLead, error: null }))
          }))
        }))
      });

      const result = await leadsService.create(leadData);
      
      expect(result.data).toEqual(mockCreatedLead);
    });
  });

  describe('paymentsService', () => {
    it('should get payments with filters', async () => {
      const mockPayments = [
        {
          id: 1,
          amount: 150.00,
          payment_method: 'card',
          status: 'paid'
        }
      ];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockPayments, error: null }))
          }))
        }))
      });

      const result = await paymentsService.getAll({ status: 'paid' });
      
      expect(result.data).toEqual(mockPayments);
    });
  });

  describe('dashboardService', () => {
    it('should get dashboard statistics', async () => {
      const mockStats = {
        totalPatients: 100,
        totalAppointments: 50,
        totalLeads: 25,
        totalRevenue: 50000
      };

      // Mock multiple Supabase calls
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn(() => Promise.resolve({ count: 100 }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => Promise.resolve({ count: 50 }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => Promise.resolve({ count: 25 }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ 
              data: [{ amount: 50000 }], 
              error: null 
            }))
          }))
        });

      const result = await dashboardService.getStats();
      
      expect(result.data).toEqual(mockStats);
      expect(result.error).toBeNull();
    });

    it('should handle dashboard errors', async () => {
      const error = new Error('Database error');
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => Promise.resolve({ count: null, error }))
      });

      const result = await dashboardService.getStats();
      
      expect(result.data).toEqual({
        totalPatients: 0,
        totalAppointments: 0,
        totalLeads: 0,
        totalRevenue: 0
      });
      expect(result.error).toBe(error);
    });
  });
});

