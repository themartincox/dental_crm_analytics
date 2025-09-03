import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      'conversion': 'UserCheck',
      'booking': 'Calendar',
      'payment': 'CreditCard',
      'consultation': 'Stethoscope',
      'treatment': 'Activity',
      'follow-up': 'Phone'
    };
    return icons?.[type] || 'Bell';
  };

  const getActivityColor = (type) => {
    const colors = {
      'conversion': 'text-success',
      'booking': 'text-primary',
      'payment': 'text-emerald-600',
      'consultation': 'text-purple-600',
      'treatment': 'text-orange-600',
      'follow-up': 'text-blue-600'
    };
    return colors?.[type] || 'text-muted-foreground';
  };

  const getActivityBgColor = (type) => {
    const colors = {
      'conversion': 'bg-success/10',
      'booking': 'bg-primary/10',
      'payment': 'bg-emerald-100',
      'consultation': 'bg-purple-100',
      'treatment': 'bg-orange-100',
      'follow-up': 'bg-blue-100'
    };
    return colors?.[type] || 'bg-muted';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest conversions and bookings</p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-4 p-3 hover:bg-muted/50 rounded-lg transition-colors duration-150">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityBgColor(activity?.type)}`}>
              <Icon 
                name={getActivityIcon(activity?.type)} 
                size={18} 
                className={getActivityColor(activity?.type)} 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity?.patientName}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity?.description}
                  </p>
                  {activity?.value && (
                    <p className="text-sm font-semibold text-success mt-1">
                      £{activity?.value?.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity?.timestamp)}
                  </span>
                  {activity?.source && (
                    <p className="text-xs text-muted-foreground mt-1">
                      via {activity?.source}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {activities?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;