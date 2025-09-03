import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, change, trend, icon, color = 'primary', sparklineData = [] }) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-destructive';
  const changeIcon = isPositive ? 'TrendingUp' : 'TrendingDown';

  // Simple sparkline visualization
  const renderSparkline = () => {
    if (!sparklineData?.length) return null;
    
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    
    const points = sparklineData?.map((value, index) => {
      const x = (index / (sparklineData?.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 15;
      return `${x},${y}`;
    })?.join(' ');

    return (
      <svg width="60" height="20" className="opacity-60">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="clinical-card p-6 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}/10 flex items-center justify-center`}>
          <Icon name={icon} size={24} className={`text-${color}`} />
        </div>
        <div className="text-right">
          {renderSparkline()}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <div className={`flex items-center space-x-1 ${changeColor}`}>
            <Icon name={changeIcon} size={16} />
            <span className="text-sm font-medium">
              {Math.abs(change)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;