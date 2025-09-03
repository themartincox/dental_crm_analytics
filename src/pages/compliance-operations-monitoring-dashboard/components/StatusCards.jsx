import React from 'react';
import Icon from '../../../components/AppIcon';

const StatusCards = () => {
  const statusData = [
    {
      id: 1,
      title: 'Consent Management',
      value: '98.5%',
      status: 'excellent',
      icon: 'UserCheck',
      description: 'Active consent rate',
      details: '2,847 valid consents',
      trend: '+2.3%',
      lastCheck: '2 mins ago'
    },
    {
      id: 2,
      title: 'Data Retention',
      value: '100%',
      status: 'excellent',
      icon: 'Database',
      description: 'Policy adherence',
      details: 'All data within limits',
      trend: '0%',
      lastCheck: '5 mins ago'
    },
    {
      id: 3,
      title: 'Audit Trail',
      value: '96.2%',
      status: 'good',
      icon: 'FileText',
      description: 'Completeness score',
      details: '1,234 logged events',
      trend: '+1.8%',
      lastCheck: '1 min ago'
    },
    {
      id: 4,
      title: 'Webhook Status',
      value: '94.7%',
      status: 'warning',
      icon: 'Zap',
      description: 'System reliability',
      details: '3 failed deliveries',
      trend: '-0.5%',
      lastCheck: 'Just now'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-clinical-blue';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'excellent': return 'bg-success/10';
      case 'good': return 'bg-clinical-blue/10';
      case 'warning': return 'bg-warning/10';
      case 'critical': return 'bg-error/10';
      default: return 'bg-muted';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend?.startsWith('+')) return 'TrendingUp';
    if (trend?.startsWith('-')) return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = (trend) => {
    if (trend?.startsWith('+')) return 'text-success';
    if (trend?.startsWith('-')) return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statusData?.map((item) => (
        <div key={item?.id} className="clinical-card p-6 hover-lift">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${getStatusBg(item?.status)}`}>
              <Icon 
                name={item?.icon} 
                size={24} 
                className={getStatusColor(item?.status)} 
              />
            </div>
            <div className="flex items-center space-x-1">
              <Icon 
                name={getTrendIcon(item?.trend)} 
                size={16} 
                className={getTrendColor(item?.trend)} 
              />
              <span className={`text-sm font-medium ${getTrendColor(item?.trend)}`}>
                {item?.trend}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {item?.title}
            </h3>
            <div className={`text-2xl font-bold ${getStatusColor(item?.status)}`}>
              {item?.value}
            </div>
            <p className="text-sm text-muted-foreground">
              {item?.description}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-foreground font-medium">
                {item?.details}
              </span>
              <span className="text-xs text-muted-foreground">
                {item?.lastCheck}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;