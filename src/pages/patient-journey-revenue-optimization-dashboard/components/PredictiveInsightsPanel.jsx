import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Icon from '../../../components/AppIcon';

const PredictiveInsightsPanel = () => {
  const [selectedModel, setSelectedModel] = useState('churn');

  const churnPredictionData = [
    { month: 'Jan', predicted: 12, actual: 14, confidence: 87 },
    { month: 'Feb', predicted: 15, actual: 13, confidence: 89 },
    { month: 'Mar', predicted: 18, actual: 19, confidence: 92 },
    { month: 'Apr', predicted: 14, actual: 16, confidence: 85 },
    { month: 'May', predicted: 11, actual: 10, confidence: 94 },
    { month: 'Jun', predicted: 13, actual: null, confidence: 91 }
  ];

  const noShowPredictionData = [
    { day: 'Mon', predicted: 8, actual: 9, appointments: 45 },
    { day: 'Tue', predicted: 12, actual: 11, appointments: 52 },
    { day: 'Wed', predicted: 15, actual: 16, appointments: 48 },
    { day: 'Thu', predicted: 10, actual: 8, appointments: 41 },
    { day: 'Fri', predicted: 6, actual: 7, appointments: 38 },
    { day: 'Sat', predicted: 4, actual: null, appointments: 23 }
  ];

  const satisfactionTrendData = [
    { month: 'Jan', satisfaction: 4.2, predicted: 4.3, reviews: 89 },
    { month: 'Feb', satisfaction: 4.4, predicted: 4.4, reviews: 94 },
    { month: 'Mar', satisfaction: 4.3, predicted: 4.5, reviews: 87 },
    { month: 'Apr', satisfaction: 4.6, predicted: 4.6, reviews: 102 },
    { month: 'May', satisfaction: 4.5, predicted: 4.7, reviews: 96 },
    { month: 'Jun', satisfaction: null, predicted: 4.8, reviews: 0 }
  ];

  const riskPatients = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      riskScore: 89,
      lastVisit: '2024-03-15',
      treatment: 'Orthodontics',
      reason: 'Missed last 2 appointments',
      action: 'Schedule follow-up call'
    },
    {
      id: 2,
      name: 'James Wilson',
      riskScore: 76,
      lastVisit: '2024-04-02',
      treatment: 'Implant',
      reason: 'Payment delays',
      action: 'Discuss payment plan'
    },
    {
      id: 3,
      name: 'Emma Thompson',
      riskScore: 68,
      lastVisit: '2024-04-20',
      treatment: 'Crown',
      reason: 'Satisfaction concerns',
      action: 'Quality assurance review'
    },
    {
      id: 4,
      name: 'Michael Brown',
      riskScore: 62,
      lastVisit: '2024-05-01',
      treatment: 'Whitening',
      reason: 'Long gap between visits',
      action: 'Send reminder'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-error';
    if (score >= 60) return 'text-warning';
    return 'text-success';
  };

  const getRiskBgColor = (score) => {
    if (score >= 80) return 'bg-error/10 border-error/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-success/10 border-success/20';
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
                {entry?.name === 'confidence' && '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Predictive Analytics</h3>
          <p className="text-sm text-muted-foreground">AI-powered insights and forecasting</p>
        </div>
        
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setSelectedModel('churn')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
              selectedModel === 'churn' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Churn Risk
          </button>
          <button
            onClick={() => setSelectedModel('noshow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
              selectedModel === 'noshow' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            No-Show
          </button>
          <button
            onClick={() => setSelectedModel('satisfaction')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
              selectedModel === 'satisfaction' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Satisfaction
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2">
          <div className="clinical-card p-6">
            {selectedModel === 'churn' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-foreground">Patient Churn Prediction</h4>
                  <div className="flex items-center space-x-2">
                    <Icon name="Brain" size={16} className="text-primary" />
                    <span className="text-xs text-muted-foreground">ML Model Accuracy: 91%</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={churnPredictionData}>
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
                      <Area
                        type="monotone"
                        dataKey="predicted"
                        stackId="1"
                        stroke="var(--color-primary)"
                        fill="var(--color-primary)"
                        fillOpacity={0.3}
                        name="Predicted Churn"
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-accent)"
                        strokeWidth={2}
                        name="Actual Churn"
                        dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {selectedModel === 'noshow' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-foreground">No-Show Prediction</h4>
                  <div className="flex items-center space-x-2">
                    <Icon name="Calendar" size={16} className="text-primary" />
                    <span className="text-xs text-muted-foreground">This Week Forecast</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={noShowPredictionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis 
                        dataKey="day" 
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
                        dataKey="predicted"
                        stroke="var(--color-warning)"
                        strokeWidth={2}
                        name="Predicted No-Shows"
                        strokeDasharray="5 5"
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-error)"
                        strokeWidth={2}
                        name="Actual No-Shows"
                        dot={{ fill: 'var(--color-error)', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {selectedModel === 'satisfaction' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-foreground">Satisfaction Trend Forecast</h4>
                  <div className="flex items-center space-x-2">
                    <Icon name="Star" size={16} className="text-primary" />
                    <span className="text-xs text-muted-foreground">6-Month Projection</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={satisfactionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[3.5, 5]}
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="satisfaction"
                        stroke="var(--color-success)"
                        strokeWidth={2}
                        name="Actual Rating"
                        dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Predicted Rating"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Patients Panel */}
        <div className="space-y-6">
          <div className="clinical-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-foreground">High-Risk Patients</h4>
              <Icon name="AlertTriangle" size={16} className="text-warning" />
            </div>
            
            <div className="space-y-3">
              {riskPatients?.map((patient) => (
                <div 
                  key={patient?.id} 
                  className={`p-3 rounded-lg border ${getRiskBgColor(patient?.riskScore)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{patient?.name}</p>
                      <p className="text-xs text-muted-foreground">{patient?.treatment}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${getRiskColor(patient?.riskScore)}`}>
                        {patient?.riskScore}%
                      </span>
                      <p className="text-xs text-muted-foreground">risk</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Last visit: {formatDate(patient?.lastVisit)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reason: {patient?.reason}
                    </p>
                    <p className="text-xs font-medium text-primary">
                      Action: {patient?.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Performance */}
          <div className="clinical-card p-6">
            <h4 className="text-md font-semibold text-foreground mb-4">Model Performance</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Target" size={16} className="text-success" />
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                </div>
                <span className="text-sm font-semibold text-foreground">91.2%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={16} className="text-primary" />
                  <span className="text-sm text-muted-foreground">Precision</span>
                </div>
                <span className="text-sm font-semibold text-foreground">87.8%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Search" size={16} className="text-accent" />
                  <span className="text-sm text-muted-foreground">Recall</span>
                </div>
                <span className="text-sm font-semibold text-foreground">89.4%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} className="text-warning" />
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                </div>
                <span className="text-sm font-semibold text-foreground">2 hours ago</span>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="clinical-card p-6">
            <h4 className="text-md font-semibold text-foreground mb-4">AI Recommendations</h4>
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Lightbulb" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-primary">Retention Strategy</p>
                    <p className="text-xs text-muted-foreground">Implement loyalty program for high-value patients</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-success">Scheduling</p>
                    <p className="text-xs text-muted-foreground">Send reminders 48h before appointments</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Star" size={16} className="text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-warning">Quality Focus</p>
                    <p className="text-xs text-muted-foreground">Review satisfaction scores for implant procedures</p>
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

export default PredictiveInsightsPanel;