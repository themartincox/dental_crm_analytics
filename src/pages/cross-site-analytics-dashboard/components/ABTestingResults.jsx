import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ABTestingResults = ({ testData }) => {
  const [selectedTest, setSelectedTest] = useState(null);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'running':
        return {
          color: 'text-clinical-blue bg-clinical-blue/10',
          icon: 'Play',
          label: 'Running',
          description: 'Test is currently active'
        };
      case 'completed':
        return {
          color: 'text-success bg-success/10',
          icon: 'CheckCircle',
          label: 'Completed',
          description: 'Test has finished'
        };
      case 'paused':
        return {
          color: 'text-warning bg-warning/10',
          icon: 'Pause',
          label: 'Paused',
          description: 'Test is temporarily paused'
        };
      default:
        return {
          color: 'text-muted-foreground bg-muted',
          icon: 'Circle',
          label: 'Draft',
          description: 'Test not yet started'
        };
    }
  };

  const getSignificanceInfo = (significance) => {
    switch (significance) {
      case 'significant':
        return {
          color: 'text-success',
          icon: 'TrendingUp',
          label: 'Statistically Significant',
          description: 'Results are reliable'
        };
      case 'not-significant':
        return {
          color: 'text-warning',
          icon: 'Minus',
          label: 'Not Significant',
          description: 'Need more data'
        };
      case 'inconclusive':
        return {
          color: 'text-muted-foreground',
          icon: 'AlertCircle',
          label: 'Inconclusive',
          description: 'Mixed results'
        };
      default:
        return {
          color: 'text-muted-foreground',
          icon: 'Clock',
          label: 'Pending',
          description: 'Collecting data'
        };
    }
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getWinningVariant = (variants) => {
    return variants?.reduce((prev, current) => 
      current?.conversionRate > prev?.conversionRate ? current : prev
    );
  };

  const calculateUplift = (control, variant) => {
    const uplift = ((variant?.conversionRate - control?.conversionRate) / control?.conversionRate) * 100;
    return uplift?.toFixed(1);
  };

  const handleTestClick = (testId) => {
    setSelectedTest(selectedTest === testId ? null : testId);
  };

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            A/B Testing Results
          </h3>
          <p className="text-sm text-muted-foreground">
            Widget optimization tests with statistical significance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="Plus"
            iconPosition="left"
          >
            New Test
          </Button>
          
          <Button
            variant="outline"
            iconName="Settings"
            iconPosition="left"
          >
            Test Settings
          </Button>
        </div>
      </div>

      {testData?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="TestTube" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No A/B tests running</h4>
          <p className="text-muted-foreground mb-4">
            Start optimizing your booking widgets with A/B testing
          </p>
          <Button
            iconName="Plus"
            iconPosition="left"
          >
            Create First Test
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {testData?.map((test) => {
            const statusInfo = getStatusInfo(test?.status);
            const significanceInfo = getSignificanceInfo(test?.significance);
            const winningVariant = getWinningVariant(test?.variants);
            const controlVariant = test?.variants?.[0];
            const isExpanded = selectedTest === test?.id;
            
            return (
              <div
                key={test?.id}
                className={`border border-border rounded-lg transition-all duration-200 ${
                  isExpanded ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted"
                  onClick={() => handleTestClick(test?.id)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Status Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusInfo?.color}`}>
                      <Icon name={statusInfo?.icon} size={16} />
                    </div>
                    
                    {/* Test Info */}
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {test?.name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Started {formatDate(test?.startDate)} • {test?.variants?.length} variants
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {/* Key Metrics */}
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground mb-1">
                        {winningVariant?.conversionRate}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Best rate
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium mb-1 ${significanceInfo?.color}`}>
                        {winningVariant?.confidence}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Confidence
                      </p>
                    </div>
                    
                    <Icon 
                      name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                      size={16} 
                      className="text-muted-foreground" 
                    />
                  </div>
                </div>
                
                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6 border-t border-border bg-muted/30">
                    {/* Statistical Significance */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Icon name={significanceInfo?.icon} size={16} className={significanceInfo?.color} />
                        <div>
                          <p className={`text-sm font-medium ${significanceInfo?.color}`}>
                            {significanceInfo?.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {significanceInfo?.description}
                          </p>
                        </div>
                      </div>
                      
                      {test?.status === 'running' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Pause"
                            iconPosition="left"
                          >
                            Pause Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Square"
                            iconPosition="left"
                          >
                            End Test
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Variants Comparison */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {test?.variants?.map((variant, index) => {
                        const isWinner = variant === winningVariant;
                        const isControl = index === 0;
                        const uplift = !isControl ? calculateUplift(controlVariant, variant) : null;
                        
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              isWinner 
                                ? 'border-success bg-success/5' :'border-border bg-background'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <h5 className="text-sm font-medium text-foreground">
                                  {variant?.name}
                                </h5>
                                {isControl && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                                    Control
                                  </span>
                                )}
                                {isWinner && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-success text-success-foreground">
                                    <Icon name="Trophy" size={12} className="mr-1" />
                                    Winner
                                  </span>
                                )}
                              </div>
                              
                              {uplift && (
                                <span className={`text-sm font-medium ${
                                  parseFloat(uplift) > 0 ? 'text-success' : 'text-destructive'
                                }`}>
                                  {parseFloat(uplift) > 0 ? '+' : ''}{uplift}%
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Conversion Rate:</span>
                                <span className="text-sm font-medium text-foreground">
                                  {variant?.conversionRate}%
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Bookings:</span>
                                <span className="text-sm font-medium text-foreground">
                                  {variant?.bookings?.toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Confidence Level:</span>
                                <span className="text-sm font-medium text-foreground">
                                  {variant?.confidence}%
                                </span>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mt-4">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                  <span>Statistical Power</span>
                                  <span>{variant?.confidence}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 ${
                                      variant?.confidence >= 95 
                                        ? 'bg-success' 
                                        : variant?.confidence >= 80 
                                        ? 'bg-warning' :'bg-clinical-blue'
                                    }`}
                                    style={{ width: `${variant?.confidence}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="BarChart3"
                        iconPosition="left"
                      >
                        View Full Report
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Copy"
                        iconPosition="left"
                      >
                        Duplicate Test
                      </Button>
                      
                      {test?.status === 'completed' && isWinner && (
                        <Button
                          size="sm"
                          iconName="Check"
                          iconPosition="left"
                        >
                          Implement Winner
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ABTestingResults;