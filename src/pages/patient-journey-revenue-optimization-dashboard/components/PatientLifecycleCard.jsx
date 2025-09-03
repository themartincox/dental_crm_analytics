import React from 'react';
import Icon from '../../../components/AppIcon';

const PatientLifecycleCard = ({ title, value, change, changeType, icon, description, trend }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="clinical-card p-6 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name={getChangeIcon()} size={16} className={getChangeColor()} />
          <span className={`text-sm font-medium ${getChangeColor()}`}>{change}</span>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
      )}
      
      {trend && (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${trend}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{trend}%</span>
        </div>
      )}
    </div>
  );
};

export default PatientLifecycleCard;