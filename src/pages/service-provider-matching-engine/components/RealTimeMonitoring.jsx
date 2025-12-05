import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Activity, AlertTriangle, CheckCircle, Clock, Users, Zap, RefreshCw, Bell } from 'lucide-react';
import Button from '../../../components/ui/Button';

const RealTimeMonitoring = ({ providers = [], services = [], matchingRules = [] }) => {
  const [realTimeData, setRealTimeData] = useState({
    activeMatches: 0,
    queueLength: 0,
    systemStatus: 'optimal',
    lastUpdate: new Date()
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [matchingQueue, setMatchingQueue] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRefresh) {
        updateRealTimeData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const updateRealTimeData = () => {
    // Simulate real-time data updates
    setRealTimeData(prev => ({
      activeMatches: Math.floor(Math.random() * 15) + 5,
      queueLength: Math.floor(Math.random() * 8),
      systemStatus: Math.random() > 0.1 ? 'optimal' : 'warning',
      lastUpdate: new Date()
    }));

    // Update recent activity
    setRecentActivity(prev => {
      const newActivity = {
        id: Date.now(),
        type: ['match_success', 'match_failed', 'rule_triggered', 'queue_added']?.[Math.floor(Math.random() * 4)],
        message: generateActivityMessage(),
        timestamp: new Date(),
        severity: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
      };

      return [newActivity, ...(prev?.slice(0, 19) || [])]; // Keep last 20 activities
    });

    // Update system alerts
    if (Math.random() > 0.7) { // 30% chance of new alert
      setSystemAlerts(prev => {
        const newAlert = {
          id: Date.now(),
          type: ['workload', 'performance', 'system']?.[Math.floor(Math.random() * 3)],
          message: generateAlertMessage(),
          timestamp: new Date(),
          severity: Math.random() > 0.6 ? 'high' : 'medium',
          resolved: false
        };

        return [newAlert, ...(prev?.slice(0, 9) || [])]; // Keep last 10 alerts
      });
    }

    // Update matching queue
    setMatchingQueue(generateMatchingQueue());
  };

  const generateActivityMessage = () => {
    const messages = [
      'Successfully matched patient to Dr. Smith for dental cleaning',
      'Emergency appointment routed to available dentist',
      'High-value patient rule triggered for crown procedure',
      'Workload balancing rule redistributed appointment',
      'New patient added to matching queue',
      'Provider availability updated for Dr. Johnson',
      'Complex treatment matched to specialist',
      'Emergency override activated for urgent case'
    ];

    return messages?.[Math.floor(Math.random() * messages?.length)];
  };

  const generateAlertMessage = () => {
    const alerts = [
      'Dr. Wilson approaching 90% workload capacity',
      'Matching engine response time increased to 2.1s',
      'Queue length exceeded optimal threshold',
      'Emergency appointments backlog detected',
      'Provider availability sync delayed',
      'High-priority rule conflicts detected'
    ];

    return alerts?.[Math.floor(Math.random() * alerts?.length)];
  };

  const generateMatchingQueue = () => {
    return Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
      id: `queue-${Date.now()}-${i}`,
      patientName: `Patient ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      serviceType: services?.[Math.floor(Math.random() * services?.length)]?.name || 'Consultation',
      priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      waitTime: Math.floor(Math.random() * 30) + 1,
      preferredProvider: providers?.[Math.floor(Math.random() * providers?.length)]?.name || 'Any',
      timestamp: new Date(Date.now() - Math.random() * 300000) // Random time in last 5 minutes
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'match_success': return <CheckCircle size={16} className="text-green-500" />;
      case 'match_failed': return <AlertTriangle size={16} className="text-red-500" />;
      case 'rule_triggered': return <Zap size={16} className="text-blue-500" />;
      case 'queue_added': return <Clock size={16} className="text-yellow-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  const resolveAlert = (alertId) => {
    setSystemAlerts(prev => prev?.map(alert =>
      alert?.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const manualRefresh = () => {
    updateRealTimeData();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Monitoring</h3>
          <p className="text-gray-600">Live system status, matching activity, and performance monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Auto-refresh:</span>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'On' : 'Off'}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={manualRefresh}
            iconName="RefreshCw"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Matches</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeData?.activeMatches}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity size={16} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Queue Length</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeData?.queueLength}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={16} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">{matchingRules?.length}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Zap size={16} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">System Status</p>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(realTimeData?.systemStatus)}`}>
                {realTimeData?.systemStatus?.charAt(0)?.toUpperCase() + realTimeData?.systemStatus?.slice(1)}
              </div>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Activity Feed */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Activity Feed</h4>
            <div className="text-sm text-gray-500">
              Last updated: {format(realTimeData?.lastUpdate, 'HH:mm:ss')}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity?.map((activity) => (
              <div
                key={activity?.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity?.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity?.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(activity?.timestamp, 'HH:mm:ss')}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(activity?.severity)}`}>
                  {activity?.severity}
                </div>
              </div>
            ))}

            {recentActivity?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity size={32} className="mx-auto mb-2 text-gray-400" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">System Alerts</h4>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {systemAlerts?.filter(a => !a?.resolved)?.length} active
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {systemAlerts?.filter(alert => !alert?.resolved)?.map((alert) => (
              <div
                key={alert?.id}
                className={`border rounded-lg p-3 ${getSeverityColor(alert?.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert?.message}</p>
                    <p className="text-xs mt-1 opacity-80">
                      {format(alert?.timestamp, 'HH:mm:ss')} • {alert?.type}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolveAlert(alert?.id)}
                    className="text-xs"
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}

            {systemAlerts?.filter(a => !a?.resolved)?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
                <p>No active alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matching Queue */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Current Matching Queue</h4>
          <div className="text-sm text-gray-500">
            {matchingQueue?.length} items in queue
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Priority</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Wait Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Preferred Provider</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {matchingQueue?.map((item) => (
                <tr key={item?.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{item?.patientName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">{item?.serviceType}</div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item?.priority)}`}>
                      {item?.priority}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="text-gray-900">{item?.waitTime}m</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">{item?.preferredProvider}</div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                      <span className="ml-2 text-xs text-gray-600">Matching.</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {matchingQueue?.length === 0 && (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Queue is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Provider Status Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Provider Status Overview</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers?.map((provider) => (
            <div key={provider?.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900">{provider?.name}</div>
                  <div className="text-sm text-gray-600">{provider?.role}</div>
                </div>
                <div className={`w-3 h-3 rounded-full ${provider?.workload >= 90 ? 'bg-red-500' :
                    provider?.workload >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Workload</span>
                  <span className="font-medium">{provider?.workload}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${provider?.workload >= 90 ? 'bg-red-500' :
                        provider?.workload >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${provider?.workload}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next Available</span>
                  <span className="font-medium">
                    {format(provider?.nextAvailable, 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;