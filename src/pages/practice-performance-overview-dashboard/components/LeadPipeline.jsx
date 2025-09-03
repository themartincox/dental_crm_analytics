import React from 'react';
import Icon from '../../../components/AppIcon';

const LeadPipeline = ({ pipelineData, highValueAlerts }) => {
  const getStageColor = (stage) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800 border-blue-200',
      'Contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Qualified': 'bg-purple-100 text-purple-800 border-purple-200',
      'Consultation': 'bg-orange-100 text-orange-800 border-orange-200',
      'Treatment': 'bg-green-100 text-green-800 border-green-200',
      'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors?.[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getProgressPercentage = (current, total) => {
    return total > 0 ? (current / total) * 100 : 0;
  };

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Lead Pipeline</h3>
          <p className="text-sm text-muted-foreground">Real-time conversion tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      {/* Pipeline Stages */}
      <div className="space-y-4 mb-6">
        {pipelineData?.map((stage, index) => (
          <div key={stage?.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStageColor(stage?.name)}`}>
                  {stage?.name}
                </span>
                <span className="text-sm font-medium text-foreground">{stage?.count}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                £{stage?.value?.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(stage?.count, pipelineData?.[0]?.count || 1)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {/* High Value Alerts */}
      {highValueAlerts?.length > 0 && (
        <div className="border-t border-border pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="AlertTriangle" size={18} className="text-warning" />
            <h4 className="text-sm font-semibold text-foreground">High-Value Opportunities</h4>
          </div>
          <div className="space-y-3">
            {highValueAlerts?.map((alert) => (
              <div key={alert?.id} className="flex items-start space-x-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="DollarSign" size={16} className="text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert?.patientName}</p>
                  <p className="text-xs text-muted-foreground mb-1">{alert?.treatment}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-warning">
                      £{alert?.value?.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {alert?.timeAgo}
                    </span>
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

export default LeadPipeline;