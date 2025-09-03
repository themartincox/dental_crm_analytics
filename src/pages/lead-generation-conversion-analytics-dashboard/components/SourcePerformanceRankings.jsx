import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';


const SourcePerformanceRankings = ({ sourceData, onSourceClick }) => {
  const [selectedMetric, setSelectedMetric] = useState('conversion');
  const [viewMode, setViewMode] = useState('list');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(value);
  };

  const formatPercentage = (value) => `${value?.toFixed(1)}%`;

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'google ads':
        return { name: 'Search', color: 'text-blue-600' };
      case 'facebook':
        return { name: 'Facebook', color: 'text-blue-500' };
      case 'organic search':
        return { name: 'Globe', color: 'text-green-600' };
      case 'referrals':
        return { name: 'Users', color: 'text-purple-600' };
      case 'email marketing':
        return { name: 'Mail', color: 'text-orange-600' };
      case 'direct':
        return { name: 'ExternalLink', color: 'text-gray-600' };
      default:
        return { name: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) return { name: 'TrendingUp', color: 'text-success' };
    if (change < 0) return { name: 'TrendingDown', color: 'text-error' };
    return { name: 'Minus', color: 'text-muted-foreground' };
  };

  const sortedSources = [...sourceData]?.sort((a, b) => {
    switch (selectedMetric) {
      case 'conversion':
        return b?.conversionRate - a?.conversionRate;
      case 'cost':
        return a?.costPerLead - b?.costPerLead;
      case 'volume':
        return b?.totalLeads - a?.totalLeads;
      case 'roi':
        return b?.roi - a?.roi;
      default:
        return 0;
    }
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-clinical-lg p-3">
          <p className="text-sm font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{entry?.name}:</span>
              <span className="text-xs font-medium text-popover-foreground ml-2">
                {entry?.name?.includes('Rate') ? formatPercentage(entry?.value) : entry?.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Source Performance Rankings</h3>
          <p className="text-sm text-muted-foreground">Lead source effectiveness and ROI analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e?.target?.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="conversion">Conversion Rate</option>
            <option value="cost">Cost per Lead</option>
            <option value="volume">Lead Volume</option>
            <option value="roi">ROI</option>
          </select>
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${
                viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${
                viewMode === 'chart' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Chart
            </button>
          </div>
        </div>
      </div>
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {sortedSources?.map((source, index) => {
            const icon = getSourceIcon(source?.name);
            const changeIcon = getChangeIcon(source?.conversionRateChange);
            
            return (
              <div
                key={source?.name}
                className="p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-md"
                onClick={() => onSourceClick?.(source)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-bold text-foreground">
                      #{index + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name={icon?.name} size={20} className={icon?.color} />
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{source?.name}</h4>
                        <p className="text-xs text-muted-foreground">{source?.category}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${changeIcon?.color}`}>
                      <Icon name={changeIcon?.name} size={14} />
                      <span className="text-sm font-medium">{Math.abs(source?.conversionRateChange)?.toFixed(1)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">vs last period</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Total Leads</span>
                    <p className="text-sm font-semibold text-foreground">{source?.totalLeads?.toLocaleString('en-GB')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Conversion Rate</span>
                    <p className="text-sm font-semibold text-success">{formatPercentage(source?.conversionRate)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Cost per Lead</span>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(source?.costPerLead)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">ROI</span>
                    <p className="text-sm font-semibold text-clinical-blue">{formatPercentage(source?.roi)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Quality Score</span>
                    <p className="text-sm font-semibold text-foreground">{source?.qualityScore}/10</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Avg Deal Size</span>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(source?.avgDealSize)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Time to Convert</span>
                    <p className="text-sm font-semibold text-foreground">{source?.avgTimeToConvert}d</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">LTV</span>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(source?.lifetimeValue)}</p>
                  </div>
                </div>
                {/* Performance Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Performance Score</span>
                    <span className="text-xs font-medium text-foreground">{source?.performanceScore}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${source?.performanceScore}%`,
                        backgroundColor: source?.performanceScore >= 80 ? '#059669' : 
                                       source?.performanceScore >= 60 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </div>
                </div>
                {/* Mini Trend Chart */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">7-Day Trend</span>
                    <span className="text-xs text-muted-foreground">Conversion Rate</span>
                  </div>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={source?.trendData}>
                        <Line 
                          type="monotone" 
                          dataKey="conversionRate" 
                          stroke={icon?.color?.replace('text-', '#')} 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                tickFormatter={selectedMetric === 'cost' ? formatCurrency : 
                             selectedMetric === 'conversion' || selectedMetric === 'roi' ? formatPercentage : 
                             (value) => value?.toLocaleString('en-GB')}
              />
              <Tooltip content={<CustomTooltip />} />
              {sourceData?.map((source, index) => {
                const icon = getSourceIcon(source?.name);
                return (
                  <Line
                    key={source?.name}
                    type="monotone"
                    dataKey={selectedMetric === 'conversion' ? 'conversionRate' :
                            selectedMetric === 'cost' ? 'costPerLead' :
                            selectedMetric === 'volume' ? 'totalLeads' : 'roi'}
                    stroke={icon?.color?.replace('text-', '#')}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-foreground">{sourceData?.length}</p>
            <p className="text-xs text-muted-foreground">Active Sources</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatPercentage(sourceData?.reduce((sum, s) => sum + s?.conversionRate, 0) / sourceData?.length)}
            </p>
            <p className="text-xs text-muted-foreground">Avg Conversion</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(sourceData?.reduce((sum, s) => sum + s?.costPerLead, 0) / sourceData?.length)}
            </p>
            <p className="text-xs text-muted-foreground">Avg Cost/Lead</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatPercentage(sourceData?.reduce((sum, s) => sum + s?.roi, 0) / sourceData?.length)}
            </p>
            <p className="text-xs text-muted-foreground">Avg ROI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourcePerformanceRankings;