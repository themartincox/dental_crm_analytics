import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookingNotifications = ({ notifications }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getServiceIcon = (service) => {
    const iconMap = {
      'Dental Implants': 'Zap',
      'Teeth Whitening': 'Sparkles',
      'General Checkup': 'Stethoscope',
      'Orthodontics': 'Smile',
      'Root Canal': 'AlertCircle'
    };
    return iconMap[service] || 'Calendar';
  };

  const getValueColor = (value) => {
    if (value >= 2000) return 'text-success';
    if (value >= 1000) return 'text-clinical-blue';
    if (value >= 500) return 'text-warning';
    return 'text-foreground';
  };

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Real-time Bookings
          </h3>
          <p className="text-sm text-muted-foreground">
            Live booking notifications across all sites
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {notifications?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Calendar" size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">No recent bookings</p>
          <p className="text-xs text-muted-foreground">
            New bookings will appear here in real-time
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications?.map((notification) => (
            <div
              key={notification?.id}
              className="flex items-start space-x-3 p-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
            >
              {/* Service Icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-success/10 text-success rounded-full flex items-center justify-center">
                <Icon name={getServiceIcon(notification?.service)} size={14} />
              </div>
              
              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    Patient {notification?.patientInitial}. booked {notification?.service}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(notification?.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate">
                    {notification?.siteName}
                  </p>
                  <span className={`text-sm font-semibold ${getValueColor(notification?.value)}`}>
                    {formatCurrency(notification?.value)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* View All Button */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
              iconName="ExternalLink"
              iconPosition="left"
            >
              View All Bookings
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground mb-1">
              {notifications?.length}
            </div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-success mb-1">
              {formatCurrency(notifications?.reduce((sum, n) => sum + n?.value, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingNotifications;