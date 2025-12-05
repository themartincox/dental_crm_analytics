import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SitePerformanceTable = ({ sites, selectedSites }) => {
  const [sortBy, setSortBy] = useState('bookings');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedSite, setExpandedSite] = useState(null);

  const selectedSitesData = sites?.filter(site => selectedSites?.includes(site?.id));

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
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

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { color: 'text-success bg-success/10', label: 'Active', icon: 'CheckCircle' };
      case 'warning':
        return { color: 'text-warning bg-warning/10', label: 'Warning', icon: 'AlertTriangle' };
      case 'error':
        return { color: 'text-destructive bg-destructive/10', label: 'Error', icon: 'XCircle' };
      default:
        return { color: 'text-muted-foreground bg-muted', label: 'Unknown', icon: 'Circle' };
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedSites = [.selectedSitesData]?.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle special cases
    if (sortBy === 'lastBooking') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'ArrowUpDown';
    return sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const handleRowClick = (siteId) => {
    setExpandedSite(expandedSite === siteId ? null : siteId);
  };

  const getMockSessionData = (site) => ({
    avgPageViews: Math.floor(Math.random() * 10) + 3,
    bounceRate: Math.floor(Math.random() * 30) + 20,
    topPages: [
      { page: '/booking', views: Math.floor(Math.random() * 500) + 200 },
      { page: '/services', views: Math.floor(Math.random() * 300) + 100 },
      { page: '/about', views: Math.floor(Math.random() * 200) + 50 }
    ],
    topDevices: [
      { device: 'Desktop', percentage: 45 },
      { device: 'Mobile', percentage: 40 },
      { device: 'Tablet', percentage: 15 }
    ]
  });

  return (
    <div className="clinical-card p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Site Performance Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Detailed metrics with drill-down capabilities
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
          >
            Export Data
          </Button>
          
          <Button
            variant="outline"
            iconName="Filter"
            iconPosition="left"
          >
            More Filters
          </Button>
        </div>
      </div>

      {selectedSitesData?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No sites selected</h4>
          <p className="text-muted-foreground">
            Select sites from the filter above to view detailed performance metrics
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-foreground">
                  Site
                </th>
                <th 
                  className="text-right p-4 text-sm font-medium text-foreground cursor-pointer hover:text-primary"
                  onClick={() => handleSort('bookings')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Bookings</span>
                    <Icon name={getSortIcon('bookings')} size={14} />
                  </div>
                </th>
                <th 
                  className="text-right p-4 text-sm font-medium text-foreground cursor-pointer hover:text-primary"
                  onClick={() => handleSort('conversionRate')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Conv. Rate</span>
                    <Icon name={getSortIcon('conversionRate')} size={14} />
                  </div>
                </th>
                <th 
                  className="text-right p-4 text-sm font-medium text-foreground cursor-pointer hover:text-primary"
                  onClick={() => handleSort('avgSessionTime')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Avg. Session</span>
                    <Icon name={getSortIcon('avgSessionTime')} size={14} />
                  </div>
                </th>
                <th 
                  className="text-right p-4 text-sm font-medium text-foreground cursor-pointer hover:text-primary"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Revenue</span>
                    <Icon name={getSortIcon('revenue')} size={14} />
                  </div>
                </th>
                <th 
                  className="text-center p-4 text-sm font-medium text-foreground cursor-pointer hover:text-primary"
                  onClick={() => handleSort('errors')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Errors</span>
                    <Icon name={getSortIcon('errors')} size={14} />
                  </div>
                </th>
                <th 
                  className="text-center p-4 text-sm font-medium text-foreground cursor-pointer hover:text-primary"
                  onClick={() => handleSort('lastBooking')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Last Booking</span>
                    <Icon name={getSortIcon('lastBooking')} size={14} />
                  </div>
                </th>
                <th className="text-center p-4 text-sm font-medium text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSites?.map((site) => {
                const statusInfo = getStatusInfo(site?.status);
                const sessionData = getMockSessionData(site);
                const isExpanded = expandedSite === site?.id;

                return (
                  <React.Fragment key={site?.id}>
                    <tr 
                      className="border-b border-border hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleRowClick(site?.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${statusInfo?.color}`}>
                            <Icon name={statusInfo?.icon} size={12} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {site?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {site?.domain}
                            </p>
                          </div>
                          <Icon 
                            name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                            size={14} 
                            className="text-muted-foreground" 
                          />
                        </div>
                      </td>
                      <td className="p-4 text-right text-sm font-medium text-foreground">
                        {formatNumber(site?.bookings)}
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-medium text-foreground">
                          {site?.conversionRate}%
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm text-foreground">
                        {formatDuration(site?.avgSessionTime)}
                      </td>
                      <td className="p-4 text-right text-sm font-medium text-foreground">
                        {formatCurrency(site?.revenue)}
                      </td>
                      <td className="p-4 text-center">
                        {site?.errors > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-destructive/10 text-destructive">
                            {site?.errors}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-success/10 text-success">
                            0
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center text-xs text-muted-foreground">
                        {formatTimeAgo(site?.lastBooking)}
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="ExternalLink"
                          onClick={(e) => {
                            e?.stopPropagation();
                            console.log('View site details:', site?.id);
                          }}
                        />
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr className="border-b border-border bg-muted/50">
                        <td colSpan="8" className="p-0">
                          <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Session Analytics */}
                              <div>
                                <h4 className="text-sm font-medium text-foreground mb-4">Session Analytics</h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Avg. Page Views:</span>
                                    <span className="text-foreground font-medium">{sessionData?.avgPageViews}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Bounce Rate:</span>
                                    <span className="text-foreground font-medium">{sessionData?.bounceRate}%</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Widget Version:</span>
                                    <span className="text-foreground font-medium">v{site?.widgetVersion}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Top Pages */}
                              <div>
                                <h4 className="text-sm font-medium text-foreground mb-4">Top Pages</h4>
                                <div className="space-y-2">
                                  {sessionData?.topPages?.map((page, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground">{page?.page}</span>
                                      <span className="text-foreground font-medium">{formatNumber(page?.views)} views</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {/* Device Breakdown */}
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-4">Device Breakdown</h4>
                              <div className="grid grid-cols-3 gap-4">
                                {sessionData?.topDevices?.map((device, index) => (
                                  <div key={index} className="text-center p-3 bg-background rounded-lg">
                                    <div className="text-lg font-bold text-foreground mb-1">
                                      {device?.percentage}%
                                    </div>
                                    <p className="text-xs text-muted-foreground">{device?.device}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-3 pt-4 border-t border-border">
                              <Button
                                variant="outline"
                                size="sm"
                                iconName="BarChart3"
                                iconPosition="left"
                              >
                                View Full Analytics
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                iconName="Settings"
                                iconPosition="left"
                              >
                                Configure Widget
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                iconName="TestTube"
                                iconPosition="left"
                              >
                                Start A/B Test
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SitePerformanceTable;