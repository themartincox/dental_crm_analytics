import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SiteSelector = ({ 
  sites, 
  selectedSites, 
  onSiteSelection, 
  dateRange, 
  onDateRangeChange,
  widgetVersion,
  onWidgetVersionChange 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const widgetVersions = [
    { value: 'all', label: 'All versions' },
    { value: '2.1.0', label: 'Version 2.1.0' },
    { value: '2.0.8', label: 'Version 2.0.8' },
    { value: '1.9.5', label: 'Version 1.9.5' }
  ];

  const filteredSites = sites?.filter(site =>
    site?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    site?.domain?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const selectedSitesData = sites?.filter(site => selectedSites?.includes(site?.id));

  const handleSiteToggle = (siteId) => {
    const newSelection = selectedSites?.includes(siteId)
      ? selectedSites?.filter(id => id !== siteId)
      : [...selectedSites, siteId];
    onSiteSelection(newSelection);
  };

  const handleSelectAll = () => {
    onSiteSelection(sites?.map(site => site?.id));
  };

  const handleClearAll = () => {
    onSiteSelection([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      default: return 'Circle';
    }
  };

  return (
    <div className="clinical-card p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Site Selector */}
        <div className="flex-1">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full lg:w-auto min-w-[300px] justify-between"
              iconName="ChevronDown"
              iconPosition="right"
            >
              <div className="flex items-center space-x-2">
                <Icon name="Globe" size={16} />
                <span>
                  {selectedSites?.length === 0 
                    ? 'Select sites' 
                    : `${selectedSites?.length} site${selectedSites?.length !== 1 ? 's' : ''} selected`
                  }
                </span>
              </div>
            </Button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full lg:w-96 bg-background border border-border rounded-lg shadow-lg z-50">
                {/* Search */}
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search sites."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e?.target?.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="text-sm font-medium text-foreground">Select Sites</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Sites List */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredSites?.map(site => (
                    <label
                      key={site?.id}
                      className="flex items-center space-x-3 p-4 hover:bg-muted cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSites?.includes(site?.id)}
                        onChange={() => handleSiteToggle(site?.id)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Icon 
                            name={getStatusIcon(site?.status)} 
                            size={12} 
                            className={getStatusColor(site?.status)} 
                          />
                          <span className="text-sm font-medium text-foreground truncate">
                            {site?.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {site?.domain}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground">
                          {site?.bookings} bookings
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {site?.conversionRate}% conv.
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Close */}
                <div className="p-4 border-t border-border">
                  <Button
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full"
                  >
                    Apply Selection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} className="text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e?.target?.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {dateRanges?.map(range => (
                <option key={range?.value} value={range?.value}>{range?.label}</option>
              ))}
            </select>
          </div>

          {/* Widget Version */}
          <div className="flex items-center space-x-2">
            <Icon name="Code" size={16} className="text-muted-foreground" />
            <select
              value={widgetVersion}
              onChange={(e) => onWidgetVersionChange(e?.target?.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {widgetVersions?.map(version => (
                <option key={version?.value} value={version?.value}>{version?.label}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            iconName="RefreshCw"
          />
        </div>
      </div>

      {/* Selected Sites Summary */}
      {selectedSites?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Selected Sites ({selectedSites?.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSitesData?.map(site => (
              <div
                key={site?.id}
                className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg"
              >
                <Icon 
                  name={getStatusIcon(site?.status)} 
                  size={12} 
                  className={getStatusColor(site?.status)} 
                />
                <span className="text-sm text-foreground">{site?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => handleSiteToggle(site?.id)}
                  className="ml-2 h-4 w-4 p-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteSelector;