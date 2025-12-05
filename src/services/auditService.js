import { supabase } from '../lib/supabase';

class AuditService {
  /**
   * Log security events for compliance and monitoring
   * @param {Object} event - Security event details
   * @param {string} event.action - Action performed
   * @param {string} event.resourceType - Type of resource accessed
   * @param {string} event.resourceId - ID of resource (optional)
   * @param {string} event.riskLevel - Risk level: 'low', 'medium', 'high', 'critical'
   * @param {Object} event.metadata - Additional metadata
   */
  static async logSecurityEvent({
    action,
    resourceType,
    resourceId = null,
    riskLevel = 'low',
    metadata = {}
  }) {
    try {
      // Get current user context
      const { data: { user } } = await supabase.auth.getUser();

      // Get client information
      const clientInfo = {
        userAgent: navigator?.userAgent || 'Unknown',
        timestamp: new Date().toISOString(),
        url: window?.location?.href,
...metadata
      };

      // Use the existing log_security_event function
      const { data, error } = await supabase.rpc('log_security_event', {
        action_type: action,
        resource_type: resourceType,
        resource_id: resourceId,
        risk_level: riskLevel,
        additional_metadata: clientInfo
      });

      if (error) {
        console.error('Failed to log security event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Audit logging error:', error);
      return null;
    }
  }

  /**
   * Log system activity for operational monitoring
   * @param {Object} activity - Activity details
   * @param {string} activity.type - Activity type from enum
   * @param {string} activity.description - Activity description
   * @param {string} activity.patientId - Patient ID (optional)
   * @param {string} activity.appointmentId - Appointment ID (optional)
   * @param {string} activity.treatmentId - Treatment ID (optional)
   * @param {Object} activity.metadata - Additional metadata
   */
  static async logSystemActivity({
    type,
    description,
    patientId = null,
    appointmentId = null,
    treatmentId = null,
    metadata = {}
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.from('system_activities').insert({
        user_id: user?.id,
        activity_type: type,
        description,
        patient_id: patientId,
        appointment_id: appointmentId,
        treatment_id: treatmentId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator?.userAgent
        }
      }).select('id').single();

      if (error) {
        console.error('Failed to log system activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('System activity logging error:', error);
      return null;
    }
  }

  /**
   * Log patient data access for GDPR compliance
   * @param {string} patientId - Patient ID
   * @param {string} action - Action performed ('view', 'edit', 'delete', 'export')
   * @param {Object} metadata - Additional context
   */
  static async logPatientAccess(patientId, action, metadata = {}) {
    return await this.logSecurityEvent({
      action: `patient_${action}`,
      resourceType: 'patient_record',
      resourceId: patientId,
      riskLevel: action === 'delete' ? 'high' : 'medium',
      metadata: {
        ...metadata,
        gdprCompliance: true,
        accessType: 'clinical_data'
      }
    });
  }

  /**
   * Log authentication events
   * @param {string} action - Auth action ('login', 'logout', 'password_change', 'failed_login')
   * @param {Object} metadata - Additional context
   */
  static async logAuthEvent(action, metadata = {}) {
    const riskLevels = {
      login: 'low',
      logout: 'low',
      password_change: 'medium',
      failed_login: 'high',
      account_locked: 'critical'
    };

    return await this.logSecurityEvent({
      action: `auth_${action}`,
      resourceType: 'user_authentication',
      riskLevel: riskLevels?.[action] || 'medium',
      metadata: {
        ...metadata,
        authEvent: true
      }
    });
  }

  /**
   * Log lead access for marketing compliance
   * @param {string} leadId - Lead ID
   * @param {string} action - Action performed
   * @param {Object} metadata - Additional context
   */
  static async logLeadAccess(leadId, action, metadata = {}) {
    return await this.logSecurityEvent({
      action: `lead_${action}`,
      resourceType: 'lead_record',
      resourceId: leadId,
      riskLevel: 'low',
      metadata: {
        ...metadata,
        dataType: 'marketing_data'
      }
    });
  }

  /**
   * Log appointment access and modifications
   * @param {string} appointmentId - Appointment ID
   * @param {string} action - Action performed
   * @param {Object} metadata - Additional context
   */
  static async logAppointmentAccess(appointmentId, action, metadata = {}) {
    return await this.logSecurityEvent({
      action: `appointment_${action}`,
      resourceType: 'appointment',
      resourceId: appointmentId,
      riskLevel: action === 'delete' ? 'medium' : 'low',
      metadata: {
        ...metadata,
        dataType: 'scheduling_data'
      }
    });
  }

  /**
   * Get audit trail for a specific resource
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID
   * @param {number} limit - Number of records to retrieve
   */
  static async getAuditTrail(resourceType, resourceId, limit = 50) {
    try {
      const { data, error } = await supabase.from('security_audit_logs').select(`
          *,
          user_profiles!user_id (
            full_name,
            email,
            role
          )
        `).eq('resource_type', resourceType).eq('resource_id', resourceId).order('created_at', { ascending: false }).limit(limit);

      if (error) {
        console.error('Failed to get audit trail:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Audit trail retrieval error:', error);
      return [];
    }
  }

  /**
   * Get security events by risk level
   * @param {string} riskLevel - Risk level to filter by
   * @param {number} hours - Time window in hours (default 24)
   */
  static async getSecurityEvents(riskLevel = 'high', hours = 24) {
    try {
      const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

      const { data, error } = await supabase.from('security_audit_logs').select(`
          *,
          user_profiles!user_id (
            full_name,
            email,
            role
          )
        `).eq('risk_level', riskLevel).gte('created_at', timeThreshold.toISOString()).order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get security events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Security events retrieval error:', error);
      return [];
    }
  }

  /**
   * Monitor suspicious activity patterns
   */
  static async detectSuspiciousActivity() {
    try {
      // Check for multiple failed logins
      const failedLogins = await this.getSecurityEvents('high', 1);
      const authFailures = failedLogins?.filter(event =>
        event?.action?.includes('failed_login')
      );

      // Check for unusual data access patterns
      const dataAccess = await this.getSecurityEvents('medium', 2);
      const patientAccess = dataAccess?.filter(event =>
        event?.resource_type === 'patient_record'
      );

      return {
        failedLoginAttempts: authFailures?.length || 0,
        unusualDataAccess: patientAccess?.length > 50,
        recentHighRiskEvents: failedLogins?.length || 0,
        recommendations: this.generateSecurityRecommendations(failedLogins, dataAccess)
      };
    } catch (error) {
      console.error('Suspicious activity detection error:', error);
      return {
        failedLoginAttempts: 0,
        unusualDataAccess: false,
        recentHighRiskEvents: 0,
        recommendations: []
      };
    }
  }

  /**
   * Generate security recommendations based on activity patterns
   */
  static generateSecurityRecommendations(failedLogins, dataAccess) {
    const recommendations = [];

    if (failedLogins?.length > 5) {
      recommendations.push({
        type: 'auth_security',
        priority: 'high',
        message: 'Multiple failed login attempts detected. Consider implementing account lockouts.',
        action: 'review_auth_policies'
      });
    }

    if (dataAccess?.length > 100) {
      recommendations.push({
        type: 'data_access',
        priority: 'medium',
        message: 'High volume of patient data access detected. Review access patterns.',
        action: 'review_data_access'
      });
    }

    return recommendations;
  }
}

export default AuditService;