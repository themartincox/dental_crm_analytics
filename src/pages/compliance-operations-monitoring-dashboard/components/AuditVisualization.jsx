import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AuditVisualization = () => {
  const [selectedView, setSelectedView] = useState('access_patterns');

  const accessPatternData = [
    { hour: '00:00', accesses: 12, exports: 0 },
    { hour: '02:00', accesses: 8, exports: 1 },
    { hour: '04:00', accesses: 5, exports: 0 },
    { hour: '06:00', accesses: 15, exports: 2 },
    { hour: '08:00', accesses: 45, exports: 8 },
    { hour: '10:00', accesses: 78, exports: 12 },
    { hour: '12:00', accesses: 92, exports: 15 },
    { hour: '14:00', accesses: 85, exports: 18 },
    { hour: '16:00', accesses: 67, exports: 10 },
    { hour: '18:00', accesses: 34, exports: 5 },
    { hour: '20:00', accesses: 23, exports: 2 },
    { hour: '22:00', accesses: 18, exports: 1 }
  ];

  const exportActivityData = [
    { date: '28/08', sar: 3, routine: 12, anonymization: 8 },
    { date: '29/08', sar: 5, routine: 15, anonymization: 6 },
    { date: '30/08', sar: 2, routine: 18, anonymization: 12 },
    { date: '31/08', sar: 7, routine: 14, anonymization: 9 },
    { date: '01/09', sar: 4, routine: 16, anonymization: 11 },
    { date: '02/09', sar: 6, routine: 13, anonymization: 7 }
  ];

  const complianceBreakdownData = [
    { name: 'Consent Management', value: 35, color: '#10B981' },
    { name: 'Data Access Logs', value: 28, color: '#3B82F6' },
    { name: 'Export Activities', value: 20, color: '#EA580C' },
    { name: 'Anonymization', value: 12, color: '#8B5CF6' },
    { name: 'Retention Policy', value: 5, color: '#EF4444' }
  ];

  const recentExports = [
    {
      id: 1,
      type: 'SAR',
      patient: 'Sarah Mitchell',
      requestedBy: 'Patient',
      timestamp: '2025-09-02T07:58:00Z',
      status: 'In Progress',
      size: '2.4 MB'
    },
    {
      id: 2,
      type: 'Routine Backup',
      patient: 'Multiple',
      requestedBy: 'System',
      timestamp: '2025-09-02T06:00:00Z',
      status: 'Completed',
      size: '145.7 MB'
    },
    {
      id: 3,
      type: 'Anonymization',
      patient: 'John Smith',
      requestedBy: 'Dr. Sarah Johnson',
      timestamp: '2025-09-02T05:30:00Z',
      status: 'Completed',
      size: '1.8 MB'
    }
  ];

  const viewOptions = [
    { value: 'access_patterns', label: 'Access Patterns', icon: 'BarChart3' },
    { value: 'export_activity', label: 'Export Activity', icon: 'Download' },
    { value: 'compliance_breakdown', label: 'Compliance Breakdown', icon: 'PieChart' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-success';
      case 'In Progress': return 'text-warning';
      case 'Failed': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success/10';
      case 'In Progress': return 'bg-warning/10';
      case 'Failed': return 'bg-error/10';
      default: return 'bg-muted';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderChart = () => {
    switch (selectedView) {
      case 'access_patterns':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accessPatternData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="hour" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="accesses" fill="var(--color-primary)" name="Data Accesses" />
              <Bar dataKey="exports" fill="var(--color-warning)" name="Exports" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'export_activity':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={exportActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sar" 
                stroke="var(--color-error)" 
                strokeWidth={2}
                name="SAR Requests"
              />
              <Line 
                type="monotone" 
                dataKey="routine" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                name="Routine Exports"
              />
              <Line 
                type="monotone" 
                dataKey="anonymization" 
                stroke="var(--color-success)" 
                strokeWidth={2}
                name="Anonymization"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'compliance_breakdown':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {complianceBreakdownData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="clinical-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Audit Trail Visualization</h2>
            <div className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={20} className="text-primary" />
              <span className="text-sm text-muted-foreground">Analytics</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {viewOptions?.map((option) => (
              <Button
                key={option?.value}
                variant={selectedView === option?.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView(option?.value)}
                iconName={option?.icon}
                iconPosition="left"
                className="text-xs"
              >
                {option?.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {renderChart()}
        </div>
      </div>
      {/* Recent Export Activities */}
      <div className="clinical-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Export Activities</h3>
            <Button variant="ghost" size="sm" className="text-xs">
              View All
              <Icon name="ArrowRight" size={14} className="ml-1" />
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border">
          {recentExports?.map((export_item) => (
            <div key={export_item?.id} className="p-4 hover:bg-muted/50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(export_item?.status)} ${getStatusColor(export_item?.status)}`}>
                    {export_item?.type}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      {export_item?.patient}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Requested by {export_item?.requestedBy} • {formatTimestamp(export_item?.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(export_item?.status)}`}>
                      {export_item?.status}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {export_item?.size}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Icon name="MoreVertical" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Compliance Legend for Pie Chart */}
      {selectedView === 'compliance_breakdown' && (
        <div className="clinical-card p-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Compliance Activity Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {complianceBreakdownData?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item?.color }}
                />
                <div>
                  <div className="text-xs font-medium text-foreground">
                    {item?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item?.value}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditVisualization;