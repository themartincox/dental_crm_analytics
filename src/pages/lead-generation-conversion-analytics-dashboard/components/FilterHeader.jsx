import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterHeader = ({ filters, onFiltersChange }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const comparisonTypes = [
    { value: 'previous', label: 'Previous period' },
    { value: 'year', label: 'Year over year' },
    { value: 'none', label: 'No comparison' }
  ];

  const leadSources = [
    { value: 'google-ads', label: 'Google Ads', count: 342 },
    { value: 'facebook', label: 'Facebook', count: 189 },
    { value: 'organic', label: 'Organic Search', count: 156 },
    { value: 'referral', label: 'Referrals', count: 98 },
    { value: 'direct', label: 'Direct', count: 67 },
    { value: 'email', label: 'Email Marketing', count: 45 }
  ];

  const campaigns = [
    { value: 'dental-implants-q4', label: 'Dental Implants Q4' },
    { value: 'teeth-whitening-winter', label: 'Teeth Whitening Winter' },
    { value: 'orthodontics-new-year', label: 'Orthodontics New Year' },
    { value: 'general-checkup-promo', label: 'General Checkup Promo' }
  ];

  const handleSourceToggle = (sourceValue) => {
    const currentSources = filters?.sources || [];
    const newSources = currentSources?.includes(sourceValue)
      ? currentSources?.filter(s => s !== sourceValue)
      : [.currentSources, sourceValue];
    
    onFiltersChange({ .filters, sources: newSources });
  };

  return (
    <div className="clinical-card p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Primary Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} className="text-muted-foreground" />
            <select
              value={filters?.dateRange}
              onChange={(e) => onFiltersChange({ .filters, dateRange: e?.target?.value })}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {dateRanges?.map(range => (
                <option key={range?.value} value={range?.value}>{range?.label}</option>
              ))}
            </select>
          </div>

          {/* Comparison Type */}
          <div className="flex items-center space-x-2">
            <Icon name="GitCompare" size={16} className="text-muted-foreground" />
            <select
              value={filters?.comparison}
              onChange={(e) => onFiltersChange({ .filters, comparison: e?.target?.value })}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {comparisonTypes?.map(type => (
                <option key={type?.value} value={type?.value}>{type?.label}</option>
              ))}
            </select>
          </div>

          {/* Campaign Filter */}
          <div className="flex items-center space-x-2">
            <Icon name="Megaphone" size={16} className="text-muted-foreground" />
            <select
              value={filters?.campaign}
              onChange={(e) => onFiltersChange({ .filters, campaign: e?.target?.value })}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All campaigns</option>
              {campaigns?.map(campaign => (
                <option key={campaign?.value} value={campaign?.value}>{campaign?.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            iconName="Settings"
            iconPosition="left"
          >
            Advanced Filters
          </Button>
          
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>

          <Button
            variant="ghost"
            iconName="RefreshCw"
            size="icon"
          />
        </div>
      </div>
      {/* Advanced Filters Panel */}
      {isAdvancedOpen && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Sources */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Lead Sources</h4>
              <div className="space-y-2">
                {leadSources?.map(source => (
                  <label key={source?.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(filters?.sources || [])?.includes(source?.value)}
                      onChange={() => handleSourceToggle(source?.value)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-foreground">{source?.label}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {source?.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* UTM Parameters */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">UTM Tracking</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">UTM Source</label>
                  <input
                    type="text"
                    placeholder="e.g., google, facebook"
                    value={filters?.utmSource || ''}
                    onChange={(e) => onFiltersChange({ .filters, utmSource: e?.target?.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">UTM Medium</label>
                  <input
                    type="text"
                    placeholder="e.g., cpc, social"
                    value={filters?.utmMedium || ''}
                    onChange={(e) => onFiltersChange({ .filters, utmMedium: e?.target?.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">UTM Campaign</label>
                  <input
                    type="text"
                    placeholder="e.g., winter-promo"
                    value={filters?.utmCampaign || ''}
                    onChange={(e) => onFiltersChange({ .filters, utmCampaign: e?.target?.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {filters?.sources?.length > 0 && (
                <span>{filters?.sources?.length} source{filters?.sources?.length !== 1 ? 's' : ''} selected</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => onFiltersChange({
                  dateRange: '30d',
                  comparison: 'previous',
                  campaign: '',
                  sources: [],
                  utmSource: '',
                  utmMedium: '',
                  utmCampaign: ''
                })}
              >
                Clear All
              </Button>
              <Button
                onClick={() => setIsAdvancedOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterHeader;