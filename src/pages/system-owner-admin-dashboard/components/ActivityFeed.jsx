import React from 'react';
import { Activity, Clock, User, Building, Settings, Trash2, Power } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (actionType) => {
    switch (actionType) {
      case 'client_organization_created':
        return <Building className="h-4 w-4 text-green-500" />;
      case 'client_permissions_updated':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'client_status_changed':
        return <Power className="h-4 w-4 text-yellow-500" />;
      case 'client_deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'bulk_action_performed':
        return <User className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatActionMessage = (activity) => {
    const performerName = activity?.performed_by?.full_name || activity?.performed_by?.email || 'System';
    const clientName = activity?.target_client?.organization_name || 'Unknown Client';
    const actionDetails = activity?.action_details || {};

    switch (activity?.action_type) {
      case 'client_organization_created':
        return {
          message: `${performerName} created new client organization "${clientName}"`,
          details: `Subscription tier: ${actionDetails?.tier || 'Unknown'}`
        };
      
      case 'client_permissions_updated':
        return {
          message: `${performerName} updated permissions for "${clientName}"`,
          details: `${actionDetails?.permissions_count || 0} modules configured`
        };
        
      case 'client_status_changed':
        return {
          message: `${performerName} changed status for "${clientName}"`,
          details: `${actionDetails?.old_status} → ${actionDetails?.new_status}`
        };
        
      case 'client_deleted':
        return {
          message: `${performerName} deleted client organization`,
          details: `Organization: ${actionDetails?.organization_name || clientName}`
        };
        
      case 'bulk_action_performed':
        return {
          message: `${performerName} performed bulk ${actionDetails?.action}`,
          details: `Applied to ${actionDetails?.client_count || 0} clients`
        };
        
      default:
        return {
          message: `${performerName} performed ${activity?.action_type?.replace('_', ' ')}`,
          details: clientName
        };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activities?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {activities?.map((activity) => {
              const { message, details } = formatActionMessage(activity);
              
              return (
                <div key={activity?.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity?.action_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {message}
                      </p>
                      
                      {details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {details}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-1 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(activity?.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        )}
      </div>

      {activities?.length > 0 && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;