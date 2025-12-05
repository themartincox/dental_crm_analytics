import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuditService from '../services/auditService';

/**
 * Custom hook for simplified audit logging throughout the application
 */
export const useAuditLogger = () => {
  const { user } = useAuth();

  const logPatientView = useCallback(async (patientId, metadata = {}) => {
    return await AuditService?.logPatientAccess(patientId, 'view', {
      .metadata,
      userId: user?.id,
      userRole: user?.role
    });
  }, [user]);

  const logPatientEdit = useCallback(async (patientId, changes = {}, metadata = {}) => {
    return await AuditService?.logPatientAccess(patientId, 'edit', {
      .metadata,
      changes,
      userId: user?.id,
      userRole: user?.role
    });
  }, [user]);

  const logAppointmentAccess = useCallback(async (appointmentId, action, metadata = {}) => {
    return await AuditService?.logAppointmentAccess(appointmentId, action, {
      .metadata,
      userId: user?.id,
      userRole: user?.role
    });
  }, [user]);

  const logLeadInteraction = useCallback(async (leadId, action, metadata = {}) => {
    return await AuditService?.logLeadAccess(leadId, action, {
      .metadata,
      userId: user?.id,
      userRole: user?.role
    });
  }, [user]);

  const logSystemActivity = useCallback(async (type, description, metadata = {}) => {
    return await AuditService?.logSystemActivity({
      type,
      description,
      metadata: {
        .metadata,
        userId: user?.id,
        userRole: user?.role
      }
    });
  }, [user]);

  const logSecurityEvent = useCallback(async (action, resourceType, resourceId, riskLevel = 'low', metadata = {}) => {
    return await AuditService?.logSecurityEvent({
      action,
      resourceType,
      resourceId,
      riskLevel,
      metadata: {
        .metadata,
        userId: user?.id,
        userRole: user?.role
      }
    });
  }, [user]);

  return {
    logPatientView,
    logPatientEdit,
    logAppointmentAccess,
    logLeadInteraction,
    logSystemActivity,
    logSecurityEvent,
    getAuditTrail: AuditService?.getAuditTrail,
    getSecurityEvents: AuditService?.getSecurityEvents,
    detectSuspiciousActivity: AuditService?.detectSuspiciousActivity
  };
};

export default useAuditLogger;