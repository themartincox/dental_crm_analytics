import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivityFeed = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());

  const activities = [
    {
      id: 1,
      type: 'consent_request',
      severity: 'info',
      title: 'New consent request received',
      description: 'Patient Sarah Mitchell requested data processing consent for treatment planning',
      timestamp: '2025-09-02T08:05:00Z',
      user: 'System',
      requiresAction: false,
      icon: 'UserCheck'
    },
    {
      id: 2,
      type: 'data_export',
      severity: 'warning',
      title: 'SAR data export initiated',
      description: 'Subject Access Request for patient ID #2847 - Export in progress',
      timestamp: '2025-09-02T07:58:00Z',
      user: 'Dr. Sarah Johnson',
      requiresAction: true,
      icon: 'Download'
    },
    {
      id: 3,
      type: 'webhook_failure',
      severity: 'critical',
      title: 'Webhook delivery failed',
      description: 'Stripe payment webhook failed after 3 retry attempts - Manual intervention required',
      timestamp: '2025-09-02T07:45:00Z',
      user: 'System',
      requiresAction: true,
      icon: 'AlertTriangle'
    },
    {
      id: 4,
      type: 'anonymization',
      severity: 'info',
      title: 'Data anonymization completed',
      description: 'Patient records for ID #2834 successfully anonymized per retention policy',
      timestamp: '2025-09-02T07:30:00Z',
      user: 'System',
      requiresAction: false,
      icon: 'Shield'
    },
    {
      id: 5,
      type: 'audit_access',
      severity: 'info',
      title: 'Audit trail accessed',
      description: 'Compliance officer reviewed audit logs for Q3 2025 compliance report',
      timestamp: '2025-09-02T07:15:00Z',
      user: 'Emma Thompson',
      requiresAction: false,
      icon: 'Eye'
    },
    {
      id: 6,
      type: 'integration_error',
      severity: 'warning',
      title: 'Google Calendar sync warning',
      description: 'Appointment sync delayed due to API rate limiting - Retrying in 5 minutes',
      timestamp: '2025-09-02T07:00:00Z',
      user: 'System',
      requiresAction: false,
      icon: 'Calendar'
    }
  ];

  const severityOptions = [
    { value: 'all', label: 'All Activities', count: activities?.length },
    { value: 'critical', label: 'Critical', count: activities?.filter(a => a?.severity === 'critical')?.length },
    { value: 'warning', label: 'Warning', count: activities?.filter(a => a?.severity === 'warning')?.length },
    { value: 'info', label: 'Info', count: activities?.filter(a => a?.severity === 'info')?.length }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error';
      case 'warning': return 'text-warning';
      case 'info': return 'text-clinical-blue';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-error/10';
      case 'warning': return 'bg-warning/10';
      case 'info': return 'bg-clinical-blue/10';
      default: return 'bg-muted';
    }
  };

  const handleAcknowledge = (alertId) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
  };

  const filteredActivities = selectedSeverity === 'all' 
    ? activities 
    : activities?.filter(activity => activity?.severity === selectedSeverity);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date?.toLocaleDateString('en-GB');
  };

  return (
    <div className="clinical-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Real-time Activity Feed</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex flex-wrap gap-2">
          {severityOptions?.map((option) => (
            <Button
              key={option?.value}
              variant={selectedSeverity === option?.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeverity(option?.value)}
              className="text-xs"
            >
              {option?.label}
              <span className="ml-1 px-1.5 py-0.5 bg-muted rounded-full text-xs">
                {option?.count}
              </span>
            </Button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredActivities?.map((activity) => {
          const isAcknowledged = acknowledgedAlerts?.has(activity?.id);
          
          return (
            <div 
              key={activity?.id} 
              className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors duration-150 ${
                activity?.requiresAction && !isAcknowledged ? 'bg-warning/5' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getSeverityBg(activity?.severity)} flex-shrink-0`}>
                  <Icon 
                    name={activity?.icon} 
                    size={16} 
                    className={getSeverityColor(activity?.severity)} 
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        {activity?.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity?.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{activity?.user}</span>
                        <span>{formatTimestamp(activity?.timestamp)}</span>
                        {activity?.severity === 'critical' && (
                          <span className="flex items-center space-x-1 text-error">
                            <Icon name="AlertCircle" size={12} />
                            <span>Urgent</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {activity?.requiresAction && !isAcknowledged && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(activity?.id)}
                          className="text-xs"
                        >
                          Acknowledge
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs"
                        >
                          Take Action
                        </Button>
                      </div>
                    )}

                    {isAcknowledged && (
                      <div className="flex items-center space-x-1 text-success ml-4">
                        <Icon name="CheckCircle" size={16} />
                        <span className="text-xs">Acknowledged</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {filteredActivities?.length} of {activities?.length} activities
          </span>
          <Button variant="ghost" size="sm" className="text-xs">
            View All Activities
            <Icon name="ArrowRight" size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;