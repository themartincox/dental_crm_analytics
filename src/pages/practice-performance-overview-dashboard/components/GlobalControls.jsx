import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GlobalControls = ({ onDateRangeChange, onLocationChange, onRefreshToggle }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const dateRangeOptions = [
    'Last 7 days',
    'Last 30 days',
    'Last 90 days',
    'This Quarter',
    'This Year',
    'Custom Range'
  ];

  const locationOptions = [
    'All Locations',
    'Downtown Dental',
    'Westside Dental',
    'Northgate Dental'
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    onDateRangeChange?.(period);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    onLocationChange?.(location);
  };

  const toggleAutoRefresh = () => {
    const newState = !autoRefresh;
    setAutoRefresh(newState);
    onRefreshToggle?.(newState);
  };

  return (
    <div className="clinical-card p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={18} className="text-muted-foreground" />
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e?.target?.value)}
                className="appearance-none bg-background border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {dateRangeOptions?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" 
              />
            </div>
          </div>

          {/* Location Selector */}
          <div className="flex items-center space-x-2">
            <Icon name="MapPin" size={18} className="text-muted-foreground" />
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e?.target?.value)}
                className="appearance-none bg-background border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {locationOptions?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" 
              />
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Auto-refresh</span>
            <button
              onClick={toggleAutoRefresh}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                autoRefresh ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Export Button */}
          <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
            Export
          </Button>

          {/* Refresh Button */}
          <Button variant="ghost" size="icon">
            <Icon name="RefreshCw" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalControls;