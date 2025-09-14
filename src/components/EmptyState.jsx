import React from 'react';
import { FileX, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const EmptyState = ({ 
  icon = 'default',
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  action = null,
  className = ''
}) => {
  const iconMap = {
    default: FileX,
    users: Users,
    calendar: Calendar,
    analytics: TrendingUp,
    error: AlertCircle
  };

  const IconComponent = iconMap[icon] || iconMap.default;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-center max-w-md">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <IconComponent className="h-full w-full" aria-hidden="true" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          {description}
        </p>
        
        {action && (
          <div className="flex justify-center">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
