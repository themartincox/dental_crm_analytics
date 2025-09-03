import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsSummary = ({ metrics, selectedSites, sitesData }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000)?.toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000)?.toFixed(1)}K`;
    return num?.toString();
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  const metricCards = [
    {
      title: 'Total Bookings',
      value: formatNumber(metrics?.totalBookings),
      change: metrics?.totalBookingsChange,
      icon: 'Calendar',
      color: 'text-clinical-blue'
    },
    {
      title: 'Avg. Conversion Rate',
      value: `${metrics?.avgConversionRate}%`,
      change: metrics?.avgConversionRateChange,
      icon: 'Target',
      color: 'text-success'
    },
    {
      title: 'Avg. Session Duration',
      value: formatDuration(metrics?.avgSessionDuration),
      change: metrics?.avgSessionDurationChange,
      icon: 'Clock',
      color: 'text-warning'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics?.totalRevenue),
      change: metrics?.totalRevenueChange,
      icon: 'PoundSterling',
      color: 'text-accent'
    }
  ];

  return (
    <div className="mb-8">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {metricCards?.map((metric, index) => (
          <div key={index} className="clinical-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-muted ${metric?.color}`}>
                <Icon name={metric?.icon} size={20} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${getChangeColor(metric?.change)}`}>
                <Icon name={getChangeIcon(metric?.change)} size={14} />
                <span>{Math.abs(metric?.change)}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {metric?.value}
              </h3>
              <p className="text-sm text-muted-foreground">
                {metric?.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="clinical-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">System Overview</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-muted-foreground">All systems operational</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {metrics?.activeDeployments}
            </div>
            <p className="text-sm text-muted-foreground">Active Deployments</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {selectedSites?.length}
            </div>
            <p className="text-sm text-muted-foreground">Selected Sites</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {metrics?.errorRate}%
            </div>
            <p className="text-sm text-muted-foreground">Error Rate</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-1">
              99.9%
            </div>
            <p className="text-sm text-muted-foreground">Uptime</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              1.2s
            </div>
            <p className="text-sm text-muted-foreground">Avg. Load Time</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-clinical-blue mb-1">
              {sitesData?.filter(site => selectedSites?.includes(site?.id))?.reduce((sum, site) => sum + site?.bookings, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Combined Bookings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsSummary;