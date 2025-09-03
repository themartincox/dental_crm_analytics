import React from 'react';
import Icon from '../../../components/AppIcon';

const IntegrationHealth = () => {
  const integrations = [
    {
      id: 1,
      name: 'Stripe',
      status: 'healthy',
      uptime: '99.9%',
      lastPing: '30s ago',
      errorRate: '0.1%',
      responseTime: '145ms',
      icon: 'CreditCard',
      description: 'Payment processing'
    },
    {
      id: 2,
      name: 'Resend',
      status: 'healthy',
      uptime: '99.7%',
      lastPing: '45s ago',
      errorRate: '0.3%',
      responseTime: '89ms',
      icon: 'Mail',
      description: 'Email delivery'
    },
    {
      id: 3,
      name: 'Twilio',
      status: 'warning',
      uptime: '98.2%',
      lastPing: '2m ago',
      errorRate: '1.8%',
      responseTime: '234ms',
      icon: 'MessageSquare',
      description: 'SMS notifications'
    },
    {
      id: 4,
      name: 'Google Calendar',
      status: 'healthy',
      uptime: '99.5%',
      lastPing: '1m ago',
      errorRate: '0.5%',
      responseTime: '167ms',
      icon: 'Calendar',
      description: 'Appointment sync'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'healthy': return 'bg-success/10';
      case 'warning': return 'bg-warning/10';
      case 'error': return 'bg-error/10';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getUptimeColor = (uptime) => {
    const percentage = parseFloat(uptime);
    if (percentage >= 99.5) return 'text-success';
    if (percentage >= 98.0) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="clinical-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Integration Health</h2>
          <div className="flex items-center space-x-2">
            <Icon name="Activity" size={20} className="text-primary" />
            <span className="text-sm text-muted-foreground">System Status</span>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {integrations?.map((integration) => (
          <div key={integration?.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getStatusBg(integration?.status)}`}>
                  <Icon 
                    name={integration?.icon} 
                    size={20} 
                    className={getStatusColor(integration?.status)} 
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {integration?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {integration?.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Icon 
                  name={getStatusIcon(integration?.status)} 
                  size={16} 
                  className={getStatusColor(integration?.status)} 
                />
                <span className={`text-sm font-medium capitalize ${getStatusColor(integration?.status)}`}>
                  {integration?.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pl-11">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Uptime</span>
                  <span className={`text-xs font-medium ${getUptimeColor(integration?.uptime)}`}>
                    {integration?.uptime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Error Rate</span>
                  <span className="text-xs font-medium text-foreground">
                    {integration?.errorRate}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Response Time</span>
                  <span className="text-xs font-medium text-foreground">
                    {integration?.responseTime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Last Ping</span>
                  <span className="text-xs font-medium text-foreground">
                    {integration?.lastPing}
                  </span>
                </div>
              </div>
            </div>

            {integration?.id !== integrations?.length && (
              <div className="border-b border-border" />
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {integrations?.filter(i => i?.status === 'healthy')?.length} of {integrations?.length} services healthy
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle" />
            <span className="text-xs text-muted-foreground">Auto-monitoring active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationHealth;