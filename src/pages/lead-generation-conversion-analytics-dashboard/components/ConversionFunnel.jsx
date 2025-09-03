import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const ConversionFunnel = ({ funnelData, onStageClick }) => {
  const [selectedStage, setSelectedStage] = useState(null);

  const formatPercentage = (value) => `${value?.toFixed(1)}%`;
  const formatNumber = (value) => value?.toLocaleString('en-GB');

  const stageColors = {
    'Lead Capture': '#3B82F6',
    'Qualification': '#10B981',
    'Consultation Booked': '#F59E0B',
    'Consultation Attended': '#EF4444',
    'Treatment Accepted': '#8B5CF6',
    'Treatment Completed': '#059669'
  };

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    onStageClick?.(stage);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-clinical-lg p-4">
          <h4 className="font-medium text-popover-foreground mb-2">{label}</h4>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Count:</span>
              <span className="text-sm font-medium text-popover-foreground">{formatNumber(data?.count)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Conversion Rate:</span>
              <span className="text-sm font-medium text-popover-foreground">{formatPercentage(data?.conversionRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Drop-off:</span>
              <span className="text-sm font-medium text-error">{formatPercentage(data?.dropOffRate)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="clinical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Conversion Funnel Analysis</h3>
          <p className="text-sm text-muted-foreground">Lead progression through acquisition stages</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="icon"
            iconName="RefreshCw"
          />
        </div>
      </div>
      {/* Funnel Visualization */}
      <div className="mb-8">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={funnelData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="stage" 
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data) => handleStageClick(data)}
            >
              {funnelData?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={stageColors?.[entry?.stage] || '#6B7280'}
                  opacity={selectedStage === entry?.stage ? 1 : 0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Stage Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {funnelData?.map((stage, index) => {
          const nextStage = funnelData?.[index + 1];
          const conversionToNext = nextStage ? (nextStage?.count / stage?.count) * 100 : 0;
          
          return (
            <div 
              key={stage?.stage}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedStage === stage?.stage 
                  ? 'border-primary bg-primary/5' :'border-border bg-background hover:border-primary/50'
              }`}
              onClick={() => handleStageClick(stage)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stageColors?.[stage?.stage] }}
                  />
                  <h4 className="text-sm font-medium text-foreground">{stage?.stage}</h4>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Count</span>
                  <span className="text-sm font-semibold text-foreground">{formatNumber(stage?.count)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Conversion Rate</span>
                  <span className="text-sm font-semibold text-success">{formatPercentage(stage?.conversionRate)}</span>
                </div>
                
                {nextStage && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">To Next Stage</span>
                    <span className="text-sm font-semibold text-clinical-blue">{formatPercentage(conversionToNext)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Drop-off</span>
                  <span className="text-sm font-semibold text-error">{formatPercentage(stage?.dropOffRate)}</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stage?.conversionRate}%`,
                      backgroundColor: stageColors?.[stage?.stage]
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Stage Insights */}
      {selectedStage && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Lightbulb" size={16} className="text-warning" />
            <h4 className="text-sm font-medium text-foreground">Stage Insights: {selectedStage}</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-foreground mb-2">Performance Indicators</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Average time in stage: 2.3 days</li>
                <li>• Peak conversion hours: 10am-2pm</li>
                <li>• Best performing source: Google Ads</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">Optimization Opportunities</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Reduce response time by 30%</li>
                <li>• Implement automated follow-up</li>
                <li>• A/B test consultation booking flow</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversionFunnel;