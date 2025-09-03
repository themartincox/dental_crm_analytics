import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConversionFunnel = ({ funnelData, selectedSites }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [viewMode, setViewMode] = useState('funnel');

  const viewModes = [
    { id: 'funnel', label: 'Funnel View', icon: 'Filter' },
    { id: 'table', label: 'Table View', icon: 'List' }
  ];

  const getStageColor = (conversionRate) => {
    if (conversionRate >= 80) return 'bg-success';
    if (conversionRate >= 60) return 'bg-warning';
    if (conversionRate >= 40) return 'bg-clinical-blue';
    return 'bg-destructive';
  };

  const getDropOffColor = (dropOffRate) => {
    if (dropOffRate <= 10) return 'text-success';
    if (dropOffRate <= 25) return 'text-warning';
    if (dropOffRate <= 50) return 'text-clinical-blue';
    return 'text-destructive';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleStageClick = (stage) => {
    setSelectedStage(selectedStage === stage ? null : stage);
  };

  const renderFunnelView = () => (
    <div className="space-y-4">
      {funnelData?.map((stage, index) => {
        const isFirst = index === 0;
        const isLast = index === funnelData?.length - 1;
        const width = Math?.max(20, (stage?.conversionRate / 100) * 100);
        
        return (
          <div
            key={stage?.stage}
            className={`cursor-pointer transition-all duration-200 ${
              selectedStage === stage?.stage ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleStageClick(stage?.stage)}
          >
            <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted">
              {/* Stage Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              
              {/* Funnel Bar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {stage?.stage}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-foreground font-medium">
                      {formatNumber(stage?.count)} users
                    </span>
                    <span className="text-muted-foreground">
                      {stage?.conversionRate?.toFixed(1)}%
                    </span>
                    {!isFirst && (
                      <span className={`${getDropOffColor(stage?.dropOffRate)} font-medium`}>
                        -{stage?.dropOffRate?.toFixed(1)}% drop-off
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full ${getStageColor(stage?.conversionRate)} transition-all duration-500`}
                    style={{ width: `${width}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
                    {formatNumber(stage?.count)}
                  </div>
                </div>
              </div>
              
              {/* Arrow */}
              {!isLast && (
                <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
              )}
            </div>
            
            {/* Expanded Details */}
            {selectedStage === stage?.stage && (
              <div className="mt-4 p-4 bg-muted rounded-lg border-l-4 border-l-primary">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2">Stage Analysis</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Users entering:</span>
                        <span className="text-foreground font-medium">{formatNumber(stage?.count)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversion rate:</span>
                        <span className="text-foreground font-medium">{stage?.conversionRate?.toFixed(1)}%</span>
                      </div>
                      {!isFirst && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Drop-off rate:</span>
                          <span className={`font-medium ${getDropOffColor(stage?.dropOffRate)}`}>
                            {stage?.dropOffRate?.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2">Optimization Tips</h5>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {stage?.dropOffRate > 30 && (
                        <p>• High drop-off detected - consider UX improvements</p>
                      )}
                      {stage?.conversionRate < 50 && (
                        <p>• Below average conversion - A/B test this stage</p>
                      )}
                      <p>• Review user feedback for this step</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2">Actions</h5>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="BarChart3"
                        iconPosition="left"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="TestTube"
                        iconPosition="left"
                      >
                        Start A/B Test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-4 text-sm font-medium text-foreground">Stage</th>
            <th className="text-right p-4 text-sm font-medium text-foreground">Users</th>
            <th className="text-right p-4 text-sm font-medium text-foreground">Conversion Rate</th>
            <th className="text-right p-4 text-sm font-medium text-foreground">Drop-off Rate</th>
            <th className="text-right p-4 text-sm font-medium text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {funnelData?.map((stage, index) => (
            <tr 
              key={stage?.stage}
              className="border-b border-border hover:bg-muted cursor-pointer"
              onClick={() => handleStageClick(stage?.stage)}
            >
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {stage?.stage}
                  </span>
                </div>
              </td>
              <td className="p-4 text-right text-sm text-foreground font-medium">
                {formatNumber(stage?.count)}
              </td>
              <td className="p-4 text-right">
                <span className={`text-sm font-medium px-2 py-1 rounded ${getStageColor(stage?.conversionRate)} text-white`}>
                  {stage?.conversionRate?.toFixed(1)}%
                </span>
              </td>
              <td className="p-4 text-right">
                {index === 0 ? (
                  <span className="text-sm text-muted-foreground">-</span>
                ) : (
                  <span className={`text-sm font-medium ${getDropOffColor(stage?.dropOffRate)}`}>
                    {stage?.dropOffRate?.toFixed(1)}%
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="MoreVertical"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Conversion Funnel Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Track user journey and identify optimization opportunities
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {viewModes?.map(mode => (
            <Button
              key={mode?.id}
              variant={viewMode === mode?.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode?.id)}
              iconName={mode?.icon}
              iconPosition="left"
            >
              {mode?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overall Funnel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {formatNumber(funnelData?.[0]?.count)}
          </div>
          <p className="text-sm text-muted-foreground">Total Visitors</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success mb-1">
            {formatNumber(funnelData?.[funnelData?.length - 1]?.count)}
          </div>
          <p className="text-sm text-muted-foreground">Conversions</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-clinical-blue mb-1">
            {((funnelData?.[funnelData?.length - 1]?.count / funnelData?.[0]?.count) * 100)?.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">Overall Rate</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {formatNumber(funnelData?.[0]?.count - funnelData?.[funnelData?.length - 1]?.count)}
          </div>
          <p className="text-sm text-muted-foreground">Drop-offs</p>
        </div>
      </div>

      {/* Funnel Content */}
      {viewMode === 'funnel' ? renderFunnelView() : renderTableView()}
    </div>
  );
};

export default ConversionFunnel;