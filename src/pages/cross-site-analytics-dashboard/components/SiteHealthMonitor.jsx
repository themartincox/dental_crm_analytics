import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SiteHealthMonitor = ({ sites, selectedSites }) => {
  const [sortBy, setSortBy] = useState('status');

  const selectedSitesData = sites?.filter(site => selectedSites?.includes(site?.id));

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-success bg-success/10',
          icon: 'CheckCircle',
          label: 'Active',
          description: 'All systems operational'
        };
      case 'warning':
        return {
          color: 'text-warning bg-warning/10',
          icon: 'AlertTriangle',
          label: 'Warning',
          description: 'Minor issues detected'
        };
      case 'error':
        return {
          color: 'text-destructive bg-destructive/10',
          icon: 'XCircle',
          label: 'Error',
          description: 'Critical issues found'
        };
      default:
        return {
          color: 'text-muted-foreground bg-muted',
          icon: 'Circle',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const getPerformanceScore = (site) => {
    const baseScore = 100;
    const errorPenalty = site?.errors * 5;
    const conversionBonus = site?.conversionRate > 12 ? 10 : 0;
    const sessionBonus = site?.avgSessionTime > 240 ? 5 : 0;

    return Math?.max(0, Math?.min(100, baseScore - errorPenalty + conversionBonus + sessionBonus));
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-clinical-blue';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const sortOptions = [
    { value: 'status', label: 'Status' },
    { value: 'score', label: 'Performance Score' },
    { value: 'errors', label: 'Error Count' },
    { value: 'lastBooking', label: 'Last Booking' }
  ];

  const sortedSites = [...selectedSitesData]?.sort((a, b) => {
    switch (sortBy) {
      case 'status': {
        const statusOrder = { error: 0, warning: 1, active: 2 };
        return statusOrder?.[a?.status] - statusOrder?.[b?.status];
      }
      case 'score':
        return getPerformanceScore(b) - getPerformanceScore(a);
      case 'errors':
        return b?.errors - a?.errors;
      case 'lastBooking':
        return new Date(b?.lastBooking) - new Date(a?.lastBooking);
      default:
        return 0;
    }
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math?.floor((now - timestamp) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math?.floor(diffInMinutes / 60)}h ago`;
    return `${Math?.floor(diffInMinutes / 1440)}d ago`;
  };

  const overallHealthScore = selectedSitesData?.length > 0
    ? Math?.round(selectedSitesData?.reduce((sum, site) => sum + getPerformanceScore(site), 0) / selectedSitesData?.length)
    : 0;

  const totalErrors = selectedSitesData?.reduce((sum, site) => sum + site?.errors, 0);
  const sitesWithIssues = selectedSitesData?.filter(site => site?.status !== 'active')?.length;

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Site Health Monitor
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring and error tracking
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="RefreshCw"
        />
      </div>

      {/* Overall Health Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(overallHealthScore)} mb-1`}>
            {overallHealthScore}
          </div>
          <p className="text-xs text-muted-foreground">Health Score</p>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${totalErrors === 0 ? 'text-success' : 'text-warning'} mb-1`}>
            {totalErrors}
          </div>
          <p className="text-xs text-muted-foreground">Total Errors</p>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${sitesWithIssues === 0 ? 'text-success' : 'text-destructive'} mb-1`}>
            {sitesWithIssues}
          </div>
          <p className="text-xs text-muted-foreground">Sites w/ Issues</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-foreground">
          Site Status ({selectedSitesData?.length})
        </h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e?.target?.value)}
          className="bg-background border border-border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {sortOptions?.map(option => (
            <option key={option?.value} value={option?.value}>{option?.label}</option>
          ))}
        </select>
      </div>

      {/* Sites List */}
      <div className="space-y-3">
        {sortedSites?.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="Server" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No sites selected</p>
            <p className="text-xs text-muted-foreground">
              Select sites to monitor their health status
            </p>
          </div>
        ) : (
          sortedSites?.map((site) => {
            const statusInfo = getStatusInfo(site?.status);
            const performanceScore = getPerformanceScore(site);

            return (
              <div
                key={site?.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Status Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusInfo?.color}`}>
                    <Icon name={statusInfo?.icon} size={14} />
                  </div>

                  {/* Site Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {site?.name}
                      </p>
                      <span className={`text-xs font-medium ${getScoreColor(performanceScore)}`}>
                        {performanceScore}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {site?.domain} • v{site?.widgetVersion}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {/* Error Count */}
                  {site?.errors > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-destructive mb-1">
                      <Icon name="AlertCircle" size={12} />
                      <span>{site?.errors} error{site?.errors !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Last Booking */}
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(site?.lastBooking)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Integration Status */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Integration Health</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={14} className="text-success" />
              <span className="text-foreground">Widget API</span>
            </div>
            <span className="text-success">Operational</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={14} className="text-success" />
              <span className="text-foreground">Payment Processing</span>
            </div>
            <span className="text-success">Operational</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={14} className="text-warning" />
              <span className="text-foreground">Email Notifications</span>
            </div>
            <span className="text-warning">Minor delays</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteHealthMonitor;