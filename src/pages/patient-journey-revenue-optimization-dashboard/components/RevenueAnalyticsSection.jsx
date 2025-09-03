import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import Icon from '../../../components/AppIcon';

const RevenueAnalyticsSection = () => {
  const [activeChart, setActiveChart] = useState('mix');

  const treatmentMixData = [
    { treatment: 'Implants', revenue: 485600, percentage: 32.4, patients: 127, avgValue: 3824 },
    { treatment: 'Orthodontics', revenue: 367200, percentage: 24.5, patients: 89, avgValue: 4125 },
    { treatment: 'Crowns', revenue: 298400, percentage: 19.9, patients: 156, avgValue: 1913 },
    { treatment: 'Whitening', revenue: 189600, percentage: 12.6, patients: 234, avgValue: 810 },
    { treatment: 'Root Canal', revenue: 98700, percentage: 6.6, patients: 67, avgValue: 1473 },
    { treatment: 'Preventive', revenue: 59800, percentage: 4.0, patients: 298, avgValue: 201 }
  ];

  const pricingEffectivenessData = [
    { priceRange: '£0-500', bookings: 298, revenue: 89400, conversion: 89.2 },
    { priceRange: '£500-1000', bookings: 234, revenue: 175500, conversion: 76.8 },
    { priceRange: '£1000-2000', bookings: 156, revenue: 234000, conversion: 68.4 },
    { priceRange: '£2000-5000', bookings: 89, revenue: 267000, conversion: 52.3 },
    { priceRange: '£5000+', bookings: 67, revenue: 469200, conversion: 34.7 }
  ];

  const correlationData = [
    { satisfaction: 4.8, revenue: 5200, treatment: 'Implants' },
    { satisfaction: 4.6, revenue: 4800, treatment: 'Orthodontics' },
    { satisfaction: 4.4, revenue: 2100, treatment: 'Crowns' },
    { satisfaction: 4.2, revenue: 1200, treatment: 'Whitening' },
    { satisfaction: 3.9, revenue: 1600, treatment: 'Root Canal' },
    { satisfaction: 4.7, revenue: 300, treatment: 'Preventive' }
  ];

  const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EFF6FF'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-clinical-lg p-3">
          <p className="text-sm font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-sm text-popover-foreground">
                {entry?.name}: {typeof entry?.value === 'number' && entry?.name?.includes('revenue') 
                  ? formatCurrency(entry?.value) 
                  : entry?.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-clinical-lg p-3">
          <p className="text-sm font-medium text-popover-foreground mb-1">{data?.treatment}</p>
          <p className="text-sm text-popover-foreground">{formatCurrency(data?.revenue)}</p>
          <p className="text-xs text-muted-foreground">{data?.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Analytics</h3>
          <p className="text-sm text-muted-foreground">Treatment optimization and pricing effectiveness</p>
        </div>
        
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveChart('mix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
              activeChart === 'mix' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Treatment Mix
          </button>
          <button
            onClick={() => setActiveChart('pricing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
              activeChart === 'pricing' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => setActiveChart('correlation')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
              activeChart === 'correlation' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Correlation
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2">
          <div className="clinical-card p-6">
            {activeChart === 'mix' && (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground">Treatment Revenue Mix</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={treatmentMixData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis 
                        type="number" 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="treatment" 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        width={80}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="revenue" 
                        fill="var(--color-primary)" 
                        name="Revenue"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeChart === 'pricing' && (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground">Pricing Effectiveness</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pricingEffectivenessData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis 
                        dataKey="priceRange" 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="bookings" 
                        fill="var(--color-primary)" 
                        name="Bookings"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="conversion" 
                        fill="var(--color-accent)" 
                        name="Conversion %"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeChart === 'correlation' && (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground">Satisfaction vs Revenue</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={correlationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis 
                        type="number" 
                        dataKey="satisfaction" 
                        domain={[3.5, 5]}
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        name="Satisfaction"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="revenue" 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        name="Revenue"
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter 
                        dataKey="revenue" 
                        fill="var(--color-primary)" 
                        name="Revenue per Patient"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Revenue Distribution Pie Chart */}
          <div className="clinical-card p-6">
            <h4 className="text-md font-semibold text-foreground mb-4">Revenue Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={treatmentMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="revenue"
                  >
                    {treatmentMixData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="clinical-card p-6">
            <h4 className="text-md font-semibold text-foreground mb-4">Key Metrics</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={16} className="text-success" />
                  <span className="text-sm text-muted-foreground">Avg. Treatment Value</span>
                </div>
                <span className="text-sm font-semibold text-foreground">£1,847</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Users" size={16} className="text-primary" />
                  <span className="text-sm text-muted-foreground">Total Patients</span>
                </div>
                <span className="text-sm font-semibold text-foreground">971</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="DollarSign" size={16} className="text-accent" />
                  <span className="text-sm text-muted-foreground">Revenue per Patient</span>
                </div>
                <span className="text-sm font-semibold text-foreground">£1,544</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Target" size={16} className="text-warning" />
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                </div>
                <span className="text-sm font-semibold text-foreground">68.4%</span>
              </div>
            </div>
          </div>

          {/* Optimization Opportunities */}
          <div className="clinical-card p-6">
            <h4 className="text-md font-semibold text-foreground mb-4">Optimization Opportunities</h4>
            <div className="space-y-3">
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="ArrowUp" size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-success">High Opportunity</p>
                    <p className="text-xs text-muted-foreground">Increase implant pricing by 8%</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-warning">Medium Priority</p>
                    <p className="text-xs text-muted-foreground">Bundle preventive services</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-primary">Consider</p>
                    <p className="text-xs text-muted-foreground">Promote whitening packages</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalyticsSection;