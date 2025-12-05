import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  Database, 
  Eye, 
  Memory, 
  RefreshCw, 
  TrendingUp, 
  Users,
  Zap
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { performanceMonitoringService } from '../services/performanceMonitoringService';
import { errorTrackingService } from '../services/errorTrackingService';

/**
 * Monitoring Dashboard - Real-time monitoring of application performance and health
 * Features:
 * - Real-time performance metrics
 * - Error tracking and alerts
 * - Analytics overview
 * - System health monitoring
 */

const MonitoringDashboard = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('performance');
  const [performanceData, setPerformanceData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch all monitoring data
  const fetchMonitoringData = async () => {
    setIsLoading(true);
    try {
      const [perfData, analytics, errors] = await Promise.all([
        performanceMonitoringService.getDashboardData(),
        analyticsService.getDashboardData(),
        errorTrackingService.getErrorStatistics()
      ]);

      setPerformanceData(perfData);
      setAnalyticsData(analytics);
      setErrorData(errors);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (isOpen) {
      fetchMonitoringData();
      const interval = setInterval(fetchMonitoringData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Performance metric card component
  const MetricCard = ({ title, value, unit, icon: Icon, status, description }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'excellent': return 'text-green-600 bg-green-100';
        case 'good': return 'text-blue-600 bg-blue-100';
        case 'needs_improvement': return 'text-yellow-600 bg-yellow-100';
        case 'poor': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <p className="text-2xl font-bold text-gray-900">
                {value}{unit && <span className="text-lg text-gray-500">{unit}</span>}
              </p>
            </div>
          </div>
        </div>
        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
      </div>
    );
  };

  // Performance tab content
  const PerformanceTab = () => {
    if (!performanceData) return <div>Loading performance data.</div>;

    const { coreWebVitals, navigation, resources, alerts, memory } = performanceData;

    return (
      <div className="space-y-6">
        {/* Core Web Vitals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Largest Contentful Paint"
              value={Math.round(coreWebVitals.LCP)}
              unit="ms"
              icon={Eye}
              status={coreWebVitals.LCP < 2500 ? 'good' : 'needs_improvement'}
              description="Time to render the largest content element"
            />
            <MetricCard
              title="First Contentful Paint"
              value={Math.round(coreWebVitals.FCP)}
              unit="ms"
              icon={Zap}
              status={coreWebVitals.FCP < 1800 ? 'good' : 'needs_improvement'}
              description="Time to first content render"
            />
            <MetricCard
              title="Cumulative Layout Shift"
              value={coreWebVitals.CLS.toFixed(3)}
              icon={RefreshCw}
              status={coreWebVitals.CLS < 0.1 ? 'good' : 'needs_improvement'}
              description="Visual stability measure"
            />
            <MetricCard
              title="Total Blocking Time"
              value={Math.round(coreWebVitals.TBT)}
              unit="ms"
              icon={Clock}
              status={coreWebVitals.TBT < 300 ? 'good' : 'needs_improvement'}
              description="Time blocked by long tasks"
            />
            <MetricCard
              title="First Input Delay"
              value={Math.round(coreWebVitals.FID)}
              unit="ms"
              icon={Activity}
              status={coreWebVitals.FID < 100 ? 'good' : 'needs_improvement'}
              description="Time to first user interaction"
            />
            <MetricCard
              title="Interaction to Next Paint"
              value={Math.round(coreWebVitals.INP)}
              unit="ms"
              icon={TrendingUp}
              status={coreWebVitals.INP < 200 ? 'good' : 'needs_improvement'}
              description="Responsiveness measure"
            />
          </div>
        </div>

        {/* Navigation Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Time to First Byte"
              value={Math.round(navigation.TTFB)}
              unit="ms"
              icon={Database}
              status={navigation.TTFB < 600 ? 'good' : 'needs_improvement'}
              description="Server response time"
            />
            <MetricCard
              title="Time to Interactive"
              value={Math.round(navigation.TTI)}
              unit="ms"
              icon={Activity}
              status={navigation.TTI < 3800 ? 'good' : 'needs_improvement'}
              description="Time until page is fully interactive"
            />
            <MetricCard
              title="First Meaningful Paint"
              value={Math.round(navigation.FMP)}
              unit="ms"
              icon={Eye}
              status={navigation.FMP < 2000 ? 'good' : 'needs_improvement'}
              description="Time to meaningful content"
            />
          </div>
        </div>

        {/* Resources & Memory */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources & Memory</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Slow Resources"
              value={resources.slowResources}
              icon={AlertTriangle}
              status={resources.slowResources === 0 ? 'good' : 'needs_improvement'}
              description="Resources taking >1s to load"
            />
            <MetricCard
              title="Large Resources"
              value={resources.largeResources}
              icon={BarChart3}
              status={resources.largeResources === 0 ? 'good' : 'needs_improvement'}
              description="Resources >100KB"
            />
            {memory && (
              <MetricCard
                title="Memory Usage"
                value={Math.round(memory.used / 1024 / 1024)}
                unit="MB"
                icon={Memory}
                status={memory.used / memory.limit < 0.8 ? 'good' : 'needs_improvement'}
                description={`${Math.round((memory.used / memory.limit) * 100)}% of limit`}
              />
            )}
          </div>
        </div>

        {/* Alerts */}
        {alerts > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                {alerts} performance alert{alerts !== 1 ? 's' : ''} detected
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Analytics tab content
  const AnalyticsTab = () => {
    if (!analyticsData) return <div>Loading analytics data.</div>;

    const { totalEvents, uniqueSessions, pageViews, conversions, topPages, topActions, conversionRate } = analyticsData;

    return (
      <div className="space-y-6">
        {/* Overview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Events"
              value={totalEvents}
              icon={Activity}
              status="good"
              description="All tracked events"
            />
            <MetricCard
              title="Unique Sessions"
              value={uniqueSessions}
              icon={Users}
              status="good"
              description="Active user sessions"
            />
            <MetricCard
              title="Page Views"
              value={pageViews}
              icon={Eye}
              status="good"
              description="Total page views"
            />
            <MetricCard
              title="Conversion Rate"
              value={conversionRate.toFixed(1)}
              unit="%"
              icon={TrendingUp}
              status={conversionRate > 5 ? 'good' : 'needs_improvement'}
              description="Conversion success rate"
            />
          </div>
        </div>

        {/* Top Pages */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{page.page}</span>
                    <span className="text-sm text-gray-500">{page.count} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Actions</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="space-y-3">
                {topActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{action.action}</span>
                    <span className="text-sm text-gray-500">{action.count} times</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Errors tab content
  const ErrorsTab = () => {
    if (!errorData) return <div>Loading error data.</div>;

    const { total, bySeverity, byCategory, last24Hours } = errorData;

    return (
      <div className="space-y-6">
        {/* Error Overview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Errors"
              value={total}
              icon={AlertTriangle}
              status={total === 0 ? 'good' : total < 10 ? 'needs_improvement' : 'poor'}
              description="All tracked errors"
            />
            <MetricCard
              title="Last 24 Hours"
              value={last24Hours}
              icon={Clock}
              status={last24Hours === 0 ? 'good' : last24Hours < 5 ? 'needs_improvement' : 'poor'}
              description="Recent errors"
            />
            <MetricCard
              title="Critical Errors"
              value={bySeverity.critical || 0}
              icon={AlertTriangle}
              status={bySeverity.critical === 0 ? 'good' : 'poor'}
              description="High severity errors"
            />
            <MetricCard
              title="High Severity"
              value={bySeverity.high || 0}
              icon={AlertTriangle}
              status={bySeverity.high === 0 ? 'good' : bySeverity.high < 5 ? 'needs_improvement' : 'poor'}
              description="High priority errors"
            />
          </div>
        </div>

        {/* Error Categories */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Categories</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(byCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</span>
                    <span className="text-sm text-gray-500">{count} errors</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Monitoring Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'performance', label: 'Performance', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'errors', label: 'Errors', icon: AlertTriangle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'performance' && <PerformanceTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'errors' && <ErrorsTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
