import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GeographicHeatmap = ({ geoData, onRegionClick }) => {
  const [selectedView, setSelectedView] = useState('leads');
  const [selectedRegion, setSelectedRegion] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(value);
  };

  const formatPercentage = (value) => `${value?.toFixed(1)}%`;

  const getIntensityColor = (value, max) => {
    const intensity = value / max;
    if (intensity >= 0.8) return 'bg-primary text-primary-foreground';
    if (intensity >= 0.6) return 'bg-clinical-blue/80 text-white';
    if (intensity >= 0.4) return 'bg-clinical-blue/60 text-white';
    if (intensity >= 0.2) return 'bg-clinical-blue/40 text-foreground';
    return 'bg-clinical-blue/20 text-foreground';
  };

  const getDemographicIcon = (demographic) => {
    switch (demographic) {
      case 'young-professionals':
        return 'Briefcase';
      case 'families':
        return 'Users';
      case 'seniors':
        return 'User';
      case 'students':
        return 'GraduationCap';
      default:
        return 'MapPin';
    }
  };

  const maxValue = Math.max(...geoData?.map(region =>
    selectedView === 'leads' ? region?.totalLeads :
      selectedView === 'conversion' ? region?.conversionRate :
        selectedView === 'revenue' ? region?.totalRevenue : region?.costPerLead
  ));

  const sortedRegions = [...geoData]?.sort((a, b) => {
    const aValue = selectedView === 'leads' ? a?.totalLeads :
      selectedView === 'conversion' ? a?.conversionRate :
        selectedView === 'revenue' ? a?.totalRevenue : a?.costPerLead;
    const bValue = selectedView === 'leads' ? b?.totalLeads :
      selectedView === 'conversion' ? b?.conversionRate :
        selectedView === 'revenue' ? b?.totalRevenue : b?.costPerLead;

    return selectedView === 'cost' ? aValue - bValue : bValue - aValue;
  });

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Geographic Lead Distribution</h3>
          <p className="text-sm text-muted-foreground">Regional performance and demographic insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e?.target?.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="leads">Lead Volume</option>
            <option value="conversion">Conversion Rate</option>
            <option value="revenue">Revenue</option>
            <option value="cost">Cost per Lead</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        </div>
      </div>
      {/* Map Visualization */}
      <div className="mb-8">
        <div className="relative bg-muted/30 rounded-lg p-6 min-h-96">
          {/* Mock UK Map with Interactive Regions */}
          <div className="grid grid-cols-3 gap-4 h-full">
            {/* Scotland */}
            <div className="col-span-3 h-24">
              <div className="grid grid-cols-2 gap-2 h-full">
                {geoData?.filter(region => region?.area === 'Scotland')?.map(region => {
                  const value = selectedView === 'leads' ? region?.totalLeads :
                    selectedView === 'conversion' ? region?.conversionRate :
                      selectedView === 'revenue' ? region?.totalRevenue : region?.costPerLead;

                  return (
                    <div
                      key={region?.name}
                      className={`rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 ${getIntensityColor(value, maxValue)}`}
                      onClick={() => {
                        setSelectedRegion(region);
                        onRegionClick?.(region);
                      }}
                    >
                      <div className="text-xs font-medium">{region?.name}</div>
                      <div className="text-xs opacity-80">
                        {selectedView === 'leads' ? region?.totalLeads?.toLocaleString('en-GB') :
                          selectedView === 'conversion' ? formatPercentage(region?.conversionRate) :
                            selectedView === 'revenue' ? formatCurrency(region?.totalRevenue) :
                              formatCurrency(region?.costPerLead)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Northern England */}
            <div className="col-span-3 h-20">
              <div className="grid grid-cols-3 gap-2 h-full">
                {geoData?.filter(region => region?.area === 'Northern England')?.map(region => {
                  const value = selectedView === 'leads' ? region?.totalLeads :
                    selectedView === 'conversion' ? region?.conversionRate :
                      selectedView === 'revenue' ? region?.totalRevenue : region?.costPerLead;

                  return (
                    <div
                      key={region?.name}
                      className={`rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 ${getIntensityColor(value, maxValue)}`}
                      onClick={() => {
                        setSelectedRegion(region);
                        onRegionClick?.(region);
                      }}
                    >
                      <div className="text-xs font-medium">{region?.name}</div>
                      <div className="text-xs opacity-80">
                        {selectedView === 'leads' ? region?.totalLeads?.toLocaleString('en-GB') :
                          selectedView === 'conversion' ? formatPercentage(region?.conversionRate) :
                            selectedView === 'revenue' ? formatCurrency(region?.totalRevenue) :
                              formatCurrency(region?.costPerLead)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Midlands & Wales */}
            <div className="col-span-3 h-20">
              <div className="grid grid-cols-4 gap-2 h-full">
                {geoData?.filter(region => region?.area === 'Midlands' || region?.area === 'Wales')?.map(region => {
                  const value = selectedView === 'leads' ? region?.totalLeads :
                    selectedView === 'conversion' ? region?.conversionRate :
                      selectedView === 'revenue' ? region?.totalRevenue : region?.costPerLead;

                  return (
                    <div
                      key={region?.name}
                      className={`rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 ${getIntensityColor(value, maxValue)}`}
                      onClick={() => {
                        setSelectedRegion(region);
                        onRegionClick?.(region);
                      }}
                    >
                      <div className="text-xs font-medium">{region?.name}</div>
                      <div className="text-xs opacity-80">
                        {selectedView === 'leads' ? region?.totalLeads?.toLocaleString('en-GB') :
                          selectedView === 'conversion' ? formatPercentage(region?.conversionRate) :
                            selectedView === 'revenue' ? formatCurrency(region?.totalRevenue) :
                              formatCurrency(region?.costPerLead)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* London & South */}
            <div className="col-span-3 h-24">
              <div className="grid grid-cols-3 gap-2 h-full">
                {geoData?.filter(region => region?.area === 'London' || region?.area === 'South England')?.map(region => {
                  const value = selectedView === 'leads' ? region?.totalLeads :
                    selectedView === 'conversion' ? region?.conversionRate :
                      selectedView === 'revenue' ? region?.totalRevenue : region?.costPerLead;

                  return (
                    <div
                      key={region?.name}
                      className={`rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 ${getIntensityColor(value, maxValue)}`}
                      onClick={() => {
                        setSelectedRegion(region);
                        onRegionClick?.(region);
                      }}
                    >
                      <div className="text-xs font-medium">{region?.name}</div>
                      <div className="text-xs opacity-80">
                        {selectedView === 'leads' ? region?.totalLeads?.toLocaleString('en-GB') :
                          selectedView === 'conversion' ? formatPercentage(region?.conversionRate) :
                            selectedView === 'revenue' ? formatCurrency(region?.totalRevenue) :
                              formatCurrency(region?.costPerLead)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-background border border-border rounded-lg p-3">
            <div className="text-xs font-medium text-foreground mb-2">
              {selectedView === 'leads' ? 'Lead Volume' :
                selectedView === 'conversion' ? 'Conversion Rate' :
                  selectedView === 'revenue' ? 'Revenue' : 'Cost per Lead'}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-clinical-blue/20 rounded"></div>
                <div className="w-3 h-3 bg-clinical-blue/40 rounded"></div>
                <div className="w-3 h-3 bg-clinical-blue/60 rounded"></div>
                <div className="w-3 h-3 bg-clinical-blue/80 rounded"></div>
                <div className="w-3 h-3 bg-primary rounded"></div>
              </div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      </div>
      {/* Regional Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Top Performing Regions</h4>
          <div className="space-y-3">
            {sortedRegions?.slice(0, 5)?.map((region, index) => (
              <div
                key={region?.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all duration-200"
                onClick={() => {
                  setSelectedRegion(region);
                  onRegionClick?.(region);
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-foreground">{region?.name}</h5>
                    <p className="text-xs text-muted-foreground">{region?.area}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {selectedView === 'leads' ? region?.totalLeads?.toLocaleString('en-GB') :
                      selectedView === 'conversion' ? formatPercentage(region?.conversionRate) :
                        selectedView === 'revenue' ? formatCurrency(region?.totalRevenue) :
                          formatCurrency(region?.costPerLead)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {region?.totalLeads?.toLocaleString('en-GB')} leads
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographic Insights */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Demographic Breakdown</h4>
          {selectedRegion ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h5 className="text-sm font-medium text-foreground mb-2">{selectedRegion?.name}</h5>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Total Leads</span>
                    <p className="text-sm font-semibold text-foreground">{selectedRegion?.totalLeads?.toLocaleString('en-GB')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Conversion Rate</span>
                    <p className="text-sm font-semibold text-success">{formatPercentage(selectedRegion?.conversionRate)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Avg Deal Size</span>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(selectedRegion?.avgDealSize)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Cost per Lead</span>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(selectedRegion?.costPerLead)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h6 className="text-xs font-medium text-foreground">Demographics</h6>
                  {selectedRegion?.demographics?.map((demo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon name={getDemographicIcon(demo?.segment)} size={14} className="text-muted-foreground" />
                        <span className="text-xs text-foreground">{demo?.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-muted rounded-full h-1.5">
                          <div
                            className="h-1.5 bg-primary rounded-full"
                            style={{ width: `${demo?.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground w-8">{demo?.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="MapPin" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a region to view demographic insights</p>
            </div>
          )}
        </div>
      </div>
      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-foreground">{geoData?.length}</p>
            <p className="text-xs text-muted-foreground">Active Regions</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {geoData?.reduce((sum, region) => sum + region?.totalLeads, 0)?.toLocaleString('en-GB')}
            </p>
            <p className="text-xs text-muted-foreground">Total Leads</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatPercentage(geoData?.reduce((sum, region) => sum + region?.conversionRate, 0) / geoData?.length)}
            </p>
            <p className="text-xs text-muted-foreground">Avg Conversion</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(geoData?.reduce((sum, region) => sum + region?.totalRevenue, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicHeatmap;