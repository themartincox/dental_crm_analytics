import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PatientJourneyMap = () => {
  const [selectedStage, setSelectedStage] = useState(null);

  const journeyStages = [
    {
      id: 1,
      name: 'Initial Inquiry',
      patients: 1247,
      conversionRate: 85.2,
      revenue: 0,
      icon: 'Phone',
      color: 'bg-blue-500',
      description: 'First contact via phone, web, or referral'
    },
    {
      id: 2,
      name: 'Consultation Booked',
      patients: 1062,
      conversionRate: 78.4,
      revenue: 0,
      icon: 'Calendar',
      color: 'bg-indigo-500',
      description: 'Initial consultation appointment scheduled'
    },
    {
      id: 3,
      name: 'Consultation Completed',
      patients: 833,
      conversionRate: 92.1,
      revenue: 125400,
      icon: 'UserCheck',
      color: 'bg-purple-500',
      description: 'Patient attended consultation appointment'
    },
    {
      id: 4,
      name: 'Treatment Planned',
      patients: 767,
      conversionRate: 73.8,
      revenue: 0,
      icon: 'FileText',
      color: 'bg-pink-500',
      description: 'Treatment plan created and presented'
    },
    {
      id: 5,
      name: 'Treatment Accepted',
      patients: 566,
      conversionRate: 89.2,
      revenue: 1847200,
      icon: 'CheckCircle',
      color: 'bg-green-500',
      description: 'Patient accepted treatment plan'
    },
    {
      id: 6,
      name: 'Treatment Completed',
      patients: 505,
      conversionRate: 94.7,
      revenue: 1748640,
      icon: 'Award',
      color: 'bg-emerald-500',
      description: 'All planned treatments finished'
    },
    {
      id: 7,
      name: 'Follow-up Care',
      patients: 478,
      conversionRate: 68.4,
      revenue: 143400,
      icon: 'Heart',
      color: 'bg-teal-500',
      description: 'Ongoing maintenance and check-ups'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Patient Journey Map</h3>
          <p className="text-sm text-muted-foreground">Conversion rates and revenue attribution by stage</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
      </div>
      <div className="relative">
        {/* Journey Flow */}
        <div className="flex flex-col space-y-4">
          {journeyStages?.map((stage, index) => (
            <div key={stage?.id} className="relative">
              {/* Connection Line */}
              {index < journeyStages?.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-border z-0" />
              )}
              
              {/* Stage Card */}
              <div 
                className={`relative z-10 flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  selectedStage === stage?.id 
                    ? 'border-primary bg-primary/5 shadow-clinical' 
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-clinical'
                }`}
                onClick={() => setSelectedStage(selectedStage === stage?.id ? null : stage?.id)}
              >
                {/* Stage Icon */}
                <div className={`w-12 h-12 ${stage?.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon name={stage?.icon} size={20} color="white" />
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{stage?.name}</h4>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-foreground">{stage?.patients?.toLocaleString()} patients</span>
                      <div className="flex items-center space-x-1">
                        <Icon name="TrendingUp" size={14} className="text-success" />
                        <span className="text-sm font-medium text-success">{stage?.conversionRate}%</span>
                      </div>
                      {stage?.revenue > 0 && (
                        <span className="text-sm font-bold text-primary">{formatCurrency(stage?.revenue)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${stage?.color}`}
                        style={{ width: `${stage?.conversionRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12">{stage?.conversionRate}%</span>
                  </div>
                </div>

                {/* Expand Icon */}
                <Icon 
                  name={selectedStage === stage?.id ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="text-muted-foreground flex-shrink-0" 
                />
              </div>

              {/* Expanded Details */}
              {selectedStage === stage?.id && (
                <div className="mt-2 ml-16 p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-3">{stage?.description}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Drop-off Rate</span>
                      <p className="text-sm font-medium text-foreground">{(100 - stage?.conversionRate)?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Avg. Time in Stage</span>
                      <p className="text-sm font-medium text-foreground">{Math.floor(Math.random() * 14) + 1} days</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Revenue per Patient</span>
                      <p className="text-sm font-medium text-foreground">
                        {stage?.revenue > 0 ? formatCurrency(stage?.revenue / stage?.patients) : '£0'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">40.5%</p>
            <span className="text-xs text-muted-foreground">Overall Conversion</span>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(3864640)}</p>
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">£7,650</p>
            <span className="text-xs text-muted-foreground">Avg. Patient Value</span>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">23 days</p>
            <span className="text-xs text-muted-foreground">Avg. Journey Time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientJourneyMap;