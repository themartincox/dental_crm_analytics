import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GlobalControlsBar = ({ onFiltersChange }) => {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedTreatment, setSelectedTreatment] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [cohortPeriod, setCohortPeriod] = useState('monthly');
  const [isExporting, setIsExporting] = useState(false);

  const patientSegments = [
    { value: 'all', label: 'All Patients', count: 2847 },
    { value: 'new', label: 'New Patients', count: 456 },
    { value: 'returning', label: 'Returning', count: 1892 },
    { value: 'high-value', label: 'High Value', count: 234 },
    { value: 'at-risk', label: 'At Risk', count: 89 },
    { value: 'inactive', label: 'Inactive', count: 176 }
  ];

  const treatmentTypes = [
    { value: 'all', label: 'All Treatments' },
    { value: 'preventive', label: 'Preventive Care' },
    { value: 'restorative', label: 'Restorative' },
    { value: 'cosmetic', label: 'Cosmetic' },
    { value: 'orthodontics', label: 'Orthodontics' },
    { value: 'surgery', label: 'Oral Surgery' },
    { value: 'implants', label: 'Implants' }
  ];

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '6m', label: 'Last 6 months' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const cohortPeriods = [
    { value: 'weekly', label: 'Weekly Cohorts' },
    { value: 'monthly', label: 'Monthly Cohorts' },
    { value: 'quarterly', label: 'Quarterly Cohorts' }
  ];

  const handleExport = async (type) => {
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    
    // In a real app, this would trigger the actual export
    console.log(`Exporting ${type} report.`);
  };

  const handleFilterChange = (filterType, value) => {
    const filters = {
      segment: selectedSegment,
      treatment: selectedTreatment,
      dateRange: dateRange,
      cohortPeriod: cohortPeriod
    };

    switch (filterType) {
      case 'segment':
        setSelectedSegment(value);
        filters.segment = value;
        break;
      case 'treatment':
        setSelectedTreatment(value);
        filters.treatment = value;
        break;
      case 'dateRange':
        setDateRange(value);
        filters.dateRange = value;
        break;
      case 'cohortPeriod':
        setCohortPeriod(value);
        filters.cohortPeriod = value;
        break;
    }

    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  return (
    <div className="clinical-card p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left Side - Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Patient Segment Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Patient Segment</label>
            <div className="relative">
              <select
                value={selectedSegment}
                onChange={(e) => handleFilterChange('segment', e?.target?.value)}
                className="appearance-none bg-muted border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-150 min-w-[140px]"
              >
                {patientSegments?.map((segment) => (
                  <option key={segment?.value} value={segment?.value}>
                    {segment?.label} ({segment?.count})
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

          {/* Treatment Type Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Treatment Type</label>
            <div className="relative">
              <select
                value={selectedTreatment}
                onChange={(e) => handleFilterChange('treatment', e?.target?.value)}
                className="appearance-none bg-muted border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-150 min-w-[140px]"
              >
                {treatmentTypes?.map((treatment) => (
                  <option key={treatment?.value} value={treatment?.value}>
                    {treatment?.label}
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

          {/* Date Range Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Date Range</label>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => handleFilterChange('dateRange', e?.target?.value)}
                className="appearance-none bg-muted border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-150 min-w-[120px]"
              >
                {dateRanges?.map((range) => (
                  <option key={range?.value} value={range?.value}>
                    {range?.label}
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

          {/* Cohort Analysis Period */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Cohort Analysis</label>
            <div className="relative">
              <select
                value={cohortPeriod}
                onChange={(e) => handleFilterChange('cohortPeriod', e?.target?.value)}
                className="appearance-none bg-muted border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-150 min-w-[140px]"
              >
                {cohortPeriods?.map((period) => (
                  <option key={period?.value} value={period?.value}>
                    {period?.label}
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

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={() => window.location?.reload()}
          >
            Refresh
          </Button>

          {/* Export Dropdown */}
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              loading={isExporting}
              disabled={isExporting}
            >
              Export
            </Button>
            
            {/* Export Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-clinical-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-2">
                <button
                  onClick={() => handleExport('patient-segments')}
                  className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted transition-colors duration-150 flex items-center space-x-2"
                >
                  <Icon name="Users" size={16} />
                  <span>Patient Segments Report</span>
                </button>
                <button
                  onClick={() => handleExport('revenue-forecast')}
                  className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted transition-colors duration-150 flex items-center space-x-2"
                >
                  <Icon name="TrendingUp" size={16} />
                  <span>Revenue Forecasting</span>
                </button>
                <button
                  onClick={() => handleExport('journey-analysis')}
                  className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted transition-colors duration-150 flex items-center space-x-2"
                >
                  <Icon name="Map" size={16} />
                  <span>Journey Analysis</span>
                </button>
                <button
                  onClick={() => handleExport('predictive-insights')}
                  className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted transition-colors duration-150 flex items-center space-x-2"
                >
                  <Icon name="Brain" size={16} />
                  <span>Predictive Insights</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-success/10 border border-success/20 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-success">Live</span>
          </div>
        </div>
      </div>
      {/* Active Filters Summary */}
      {(selectedSegment !== 'all' || selectedTreatment !== 'all' || dateRange !== '30d') && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={16} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Active Filters:</span>
            <div className="flex items-center space-x-2">
              {selectedSegment !== 'all' && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  {patientSegments?.find(s => s?.value === selectedSegment)?.label}
                </span>
              )}
              {selectedTreatment !== 'all' && (
                <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-md">
                  {treatmentTypes?.find(t => t?.value === selectedTreatment)?.label}
                </span>
              )}
              {dateRange !== '30d' && (
                <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md">
                  {dateRanges?.find(d => d?.value === dateRange)?.label}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedSegment('all');
                  setSelectedTreatment('all');
                  setDateRange('30d');
                  setCohortPeriod('monthly');
                  if (onFiltersChange) {
                    onFiltersChange({
                      segment: 'all',
                      treatment: 'all',
                      dateRange: '30d',
                      cohortPeriod: 'monthly'
                    });
                  }
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalControlsBar;