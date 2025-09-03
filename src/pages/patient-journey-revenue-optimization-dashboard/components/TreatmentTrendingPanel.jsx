import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';

const TreatmentTrendingPanel = () => {
  const [activeTab, setActiveTab] = useState('trending');

  const trendingData = [
    { month: 'Jan', implants: 45, crowns: 78, whitening: 123, orthodontics: 34 },
    { month: 'Feb', implants: 52, crowns: 85, whitening: 134, orthodontics: 41 },
    { month: 'Mar', implants: 48, crowns: 92, whitening: 145, orthodontics: 38 },
    { month: 'Apr', implants: 61, crowns: 88, whitening: 156, orthodontics: 45 },
    { month: 'May', implants: 58, crowns: 95, whitening: 167, orthodontics: 52 },
    { month: 'Jun', implants: 67, crowns: 102, whitening: 178, orthodontics: 48 }
  ];

  const seasonalData = [
    { period: 'Q1', bookings: 1247, revenue: 485600, avgValue: 389 },
    { period: 'Q2', bookings: 1389, revenue: 542300, avgValue: 390 },
    { period: 'Q3', bookings: 1156, revenue: 478900, avgValue: 414 },
    { period: 'Q4', bookings: 1523, revenue: 634700, avgValue: 417 }
  ];

  const treatmentInterests = [
    { treatment: 'Teeth Whitening', interest: 89, change: '+12%', icon: 'Sparkles' },
    { treatment: 'Dental Implants', interest: 76, change: '+8%', icon: 'Zap' },
    { treatment: 'Orthodontics', interest: 68, change: '+15%', icon: 'Smile' },
    { treatment: 'Crowns & Bridges', interest: 82, change: '+5%', icon: 'Crown' },
    { treatment: 'Root Canal', interest: 45, change: '-3%', icon: 'AlertCircle' },
    { treatment: 'Preventive Care', interest: 94, change: '+7%', icon: 'Shield' }
  ];

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
                {entry?.name}: {entry?.value}
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
          <h3 className="text-lg font-semibold text-foreground">Treatment Analytics</h3>
          <p className="text-sm text-muted-foreground">Interest trends and seasonal patterns</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
              activeTab === 'trending' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab('seasonal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
              activeTab === 'seasonal' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Seasonal
          </button>
        </div>
      </div>
      {activeTab === 'trending' && (
        <div className="space-y-6">
          {/* Treatment Interest List */}
          <div className="space-y-3">
            {treatmentInterests?.map((treatment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={treatment?.icon} size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{treatment?.treatment}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${treatment?.interest}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-8">{treatment?.interest}%</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    treatment?.change?.startsWith('+') ? 'text-success' : 'text-error'
                  }`}>
                    {treatment?.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Trending Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="whitening" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  name="Whitening"
                />
                <Line 
                  type="monotone" 
                  dataKey="crowns" 
                  stroke="var(--color-secondary)" 
                  strokeWidth={2}
                  name="Crowns"
                />
                <Line 
                  type="monotone" 
                  dataKey="implants" 
                  stroke="var(--color-accent)" 
                  strokeWidth={2}
                  name="Implants"
                />
                <Line 
                  type="monotone" 
                  dataKey="orthodontics" 
                  stroke="var(--color-warning)" 
                  strokeWidth={2}
                  name="Orthodontics"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {activeTab === 'seasonal' && (
        <div className="space-y-6">
          {/* Seasonal Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Calendar" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Peak Season</span>
              </div>
              <p className="text-lg font-bold text-foreground">Q4 2024</p>
              <span className="text-xs text-muted-foreground">1,523 bookings</span>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingDown" size={16} className="text-warning" />
                <span className="text-sm font-medium text-foreground">Low Season</span>
              </div>
              <p className="text-lg font-bold text-foreground">Q3 2024</p>
              <span className="text-xs text-muted-foreground">1,156 bookings</span>
            </div>
          </div>

          {/* Seasonal Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="period" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
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
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Predictive Insights */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Brain" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Predictive Insights</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Based on historical patterns and current trends
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Q1 2025 expected to see 15% increase in whitening procedures</li>
                  <li>• Orthodontic consultations likely to peak in September</li>
                  <li>• Implant procedures show consistent growth trajectory</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentTrendingPanel;