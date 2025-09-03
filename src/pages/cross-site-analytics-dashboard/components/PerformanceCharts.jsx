import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

import Button from '../../../components/ui/Button';

const PerformanceCharts = ({ data, selectedSites, sitesData }) => {
  const [activeChart, setActiveChart] = useState('bookings');
  const [viewMode, setViewMode] = useState('combined');

  const chartTypes = [
    { id: 'bookings', label: 'Booking Performance', icon: 'Calendar' },
    { id: 'heatmap', label: 'Interaction Heatmap', icon: 'Activity' },
    { id: 'conversion', label: 'Conversion Analysis', icon: 'Target' }
  ];

  const viewModes = [
    { id: 'combined', label: 'Combined View' },
    { id: 'individual', label: 'Individual Sites' },
    { id: 'comparison', label: 'Site Comparison' }
  ];

  const selectedSitesData = sitesData?.filter(site => selectedSites?.includes(site?.id));
  const siteColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item?.color }}
              />
              <span className="text-foreground">{item?.name}: {item?.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const HeatmapCell = ({ hour, day, intensity }) => {
    const getIntensityColor = (value) => {
      if (value > 500) return 'bg-clinical-blue';
      if (value > 300) return 'bg-clinical-blue/70';
      if (value > 200) return 'bg-clinical-blue/50';
      if (value > 100) return 'bg-clinical-blue/30';
      return 'bg-muted';
    };

    return (
      <div 
        className={`w-8 h-8 rounded ${getIntensityColor(intensity)} flex items-center justify-center text-xs text-white font-medium`}
        title={`${day} ${hour}:00 - ${intensity} interactions`}
      >
        {intensity > 200 ? intensity : ''}
      </div>
    );
  };

  const renderBookingChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data?.bookingsByDay}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="day" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {viewMode === 'combined' ? (
          <Line
            type="monotone"
            dataKey="totalBookings"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        ) : (
          selectedSitesData?.map((site, index) => (
            <Line
              key={site?.id}
              type="monotone"
              dataKey={(entry) => entry?.siteData?.find(s => s?.siteId === site?.id)?.bookings || 0}
              stroke={siteColors?.[index % siteColors?.length]}
              strokeWidth={2}
              dot={{ fill: siteColors?.[index % siteColors?.length], strokeWidth: 2, r: 3 }}
              name={site?.name}
            />
          ))
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderHeatmap = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array?.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Widget Interaction Heatmap</h4>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-muted rounded"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-clinical-blue/50 rounded"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-clinical-blue rounded"></div>
              <span>High</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-13 gap-1 text-xs">
          {/* Header row */}
          <div></div>
          {hours?.map(hour => (
            <div key={hour} className="text-center text-muted-foreground font-medium p-1">
              {hour}:00
            </div>
          ))}
          
          {/* Data rows */}
          {days?.map(day => (
            <React.Fragment key={day}>
              <div className="text-right text-muted-foreground font-medium p-1 min-w-[60px]">
                {day?.slice(0, 3)}
              </div>
              {hours?.map(hour => (
                <HeatmapCell
                  key={`${day}-${hour}`}
                  hour={hour}
                  day={day}
                  intensity={Math?.floor(Math?.random() * 600) + 100}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderConversionChart = () => {
    const conversionData = selectedSitesData?.map(site => ({
      name: site?.name?.split(' ')?.[0],
      conversionRate: site?.conversionRate,
      bookings: site?.bookings
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={conversionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="conversionRate" radius={4}>
            {conversionData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={siteColors?.[index % siteColors?.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="clinical-card p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 lg:mb-0">
          Performance Analytics
        </h3>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Chart Type Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            {chartTypes?.map(chart => (
              <Button
                key={chart?.id}
                variant={activeChart === chart?.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveChart(chart?.id)}
                iconName={chart?.icon}
                iconPosition="left"
                className="text-xs"
              >
                {chart?.label}
              </Button>
            ))}
          </div>

          {/* View Mode Selector */}
          {activeChart !== 'heatmap' && (
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e?.target?.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {viewModes?.map(mode => (
                <option key={mode?.id} value={mode?.id}>{mode?.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      {/* Chart Content */}
      <div className="mt-6">
        {activeChart === 'bookings' && renderBookingChart()}
        {activeChart === 'heatmap' && renderHeatmap()}
        {activeChart === 'conversion' && renderConversionChart()}
      </div>
      {/* Chart Legend */}
      {viewMode === 'individual' && activeChart !== 'heatmap' && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-4">
            {selectedSitesData?.map((site, index) => (
              <div key={site?.id} className="flex items-center space-x-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: siteColors?.[index % siteColors?.length] }}
                />
                <span className="text-foreground">{site?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceCharts;