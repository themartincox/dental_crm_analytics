import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase auth endpoints
  http?.post('*/auth/v1/token*', () => {
    return HttpResponse?.json({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      }
    });
  }),

  // Mock user profiles endpoint
  http?.get('*/rest/v1/user_profiles*', () => {
    return HttpResponse?.json([
      {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'dentist'
      }
    ]);
  }),

  // Mock security audit logs
  http?.get('*/rest/v1/security_audit_logs*', () => {
    return HttpResponse?.json([
      {
        id: 'audit-1',
        user_id: 'test-user-id',
        action: 'patient_view',
        resource_type: 'patient_record',
        created_at: new Date().toISOString()
      }
    ]);
  }),

  // Mock RPC calls
  http?.post('*/rest/v1/rpc/log_security_event', () => {
    return HttpResponse?.json('audit-log-id');
  }),

  // Public waitlist endpoint (used in waitlistService.js)
  http?.post('*/public/waitlist', () => {
    return HttpResponse?.json({
      data: {
        id: 'test-lead-id',
        lead_number: 'AES-1234567890-ABC123DEF',
        status: 'new'
      }
    });
  })
];