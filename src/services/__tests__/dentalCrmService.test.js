import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  patientsService, 
  appointmentsService, 
  leadsService, 
  paymentsService,
  dashboardService 
} from '../dentalCrmService';

// Mock secureApiService methods used by dentalCrmService
const mockSecureApi = {
  getPatients: vi.fn(async () => [{ id: 1, first_name: 'John', last_name: 'Doe' }]),
  makeSecureRequest: vi.fn(async () => ({ data: { id: 1 } })),
};
vi.mock('../../services/secureApiService', () => ({
  default: mockSecureApi
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
      
      mockSecureApi.getPatients.mockResolvedValueOnce(mockPatients);
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
      
      mockSecureApi.makeSecureRequest.mockResolvedValueOnce({ data: mockCreatedPatient });
      const result = await patientsService.create(patientData);
      
      expect(result.data).toEqual(mockCreatedPatient);
      expect(result.error).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database connection failed');
      
      mockSecureApi.getPatients.mockRejectedValueOnce(error);
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
      
      mockSecureApi.makeSecureRequest.mockResolvedValueOnce({ data: mockAppointments });

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
      
      mockSecureApi.makeSecureRequest.mockResolvedValueOnce({ data: mockCreatedLead });
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
      
      mockSecureApi.makeSecureRequest.mockResolvedValueOnce({ data: mockPayments });
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
      mockSecureApi.makeSecureRequest.mockResolvedValueOnce({ data: mockStats });
      const result = await dashboardService.getStats();
      
      expect(result.data).toEqual(mockStats);
      expect(result.error).toBeNull();
    });

    it('should handle dashboard errors', async () => {
      const error = new Error('Database error');
      
      mockSecureApi.makeSecureRequest.mockRejectedValueOnce(error);
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
