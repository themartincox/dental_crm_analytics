import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsStrip = ({ metrics, dateRange }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(value);
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(1)}%`;
  };

  const getChangeIcon = (change) => {
    if (change > 0) return { name: 'TrendingUp', color: 'text-success' };
    if (change < 0) return { name: 'TrendingDown', color: 'text-error' };
    return { name: 'Minus', color: 'text-muted-foreground' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Acquisition Cost */}
      <div className="clinical-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="PoundSterling" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Cost Per Lead</h3>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics?.costPerLead)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${getChangeIcon(metrics?.costPerLeadChange)?.color}`}>
              <Icon name={getChangeIcon(metrics?.costPerLeadChange)?.name} size={16} />
              <span className="text-sm font-medium">{Math.abs(metrics?.costPerLeadChange)?.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs {dateRange?.comparison}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target: {formatCurrency(metrics?.targetCostPerLead)}</span>
            <span className={metrics?.costPerLead <= metrics?.targetCostPerLead ? 'text-success' : 'text-warning'}>
              {metrics?.costPerLead <= metrics?.targetCostPerLead ? 'On Target' : 'Above Target'}
            </span>
          </div>
        </div>
      </div>
      {/* Conversion Rate */}
      <div className="clinical-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-medical-green/10 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={20} className="text-medical-green" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Lead to Consultation</h3>
              <p className="text-2xl font-bold text-foreground">{formatPercentage(metrics?.leadToConsultation)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${getChangeIcon(metrics?.leadToConsultationChange)?.color}`}>
              <Icon name={getChangeIcon(metrics?.leadToConsultationChange)?.name} size={16} />
              <span className="text-sm font-medium">{Math.abs(metrics?.leadToConsultationChange)?.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs {dateRange?.comparison}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Industry Avg: {formatPercentage(metrics?.industryAvgConversion)}</span>
            <span className={metrics?.leadToConsultation >= metrics?.industryAvgConversion ? 'text-success' : 'text-warning'}>
              {metrics?.leadToConsultation >= metrics?.industryAvgConversion ? 'Above Average' : 'Below Average'}
            </span>
          </div>
        </div>
      </div>
      {/* ROI */}
      <div className="clinical-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-clinical-blue/10 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-clinical-blue" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Marketing ROI</h3>
              <p className="text-2xl font-bold text-foreground">{formatPercentage(metrics?.marketingROI)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${getChangeIcon(metrics?.marketingROIChange)?.color}`}>
              <Icon name={getChangeIcon(metrics?.marketingROIChange)?.name} size={16} />
              <span className="text-sm font-medium">{Math.abs(metrics?.marketingROIChange)?.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs {dateRange?.comparison}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Revenue: {formatCurrency(metrics?.totalRevenue)}</span>
            <span className="text-muted-foreground">Spend: {formatCurrency(metrics?.totalSpend)}</span>
          </div>
        </div>
      </div>
      {/* Total Leads */}
      <div className="clinical-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
              <p className="text-2xl font-bold text-foreground">{metrics?.totalLeads?.toLocaleString('en-GB')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${getChangeIcon(metrics?.totalLeadsChange)?.color}`}>
              <Icon name={getChangeIcon(metrics?.totalLeadsChange)?.name} size={16} />
              <span className="text-sm font-medium">{Math.abs(metrics?.totalLeadsChange)?.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs {dateRange?.comparison}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Qualified: {metrics?.qualifiedLeads?.toLocaleString('en-GB')}</span>
            <span className="text-success">{formatPercentage((metrics?.qualifiedLeads / metrics?.totalLeads) * 100)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsStrip;