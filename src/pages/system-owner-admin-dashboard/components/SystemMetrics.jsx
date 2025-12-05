import React from 'react';
import { Building, Users, DollarSign, Activity, TrendingUp } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const SystemMetrics = ({ metrics }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    })?.format(amount || 0);
  };

  const metricCards = [
    {
      title: 'Total Clients',
      value: metrics?.totalClients || 0,
      icon: Building,
      color: 'blue',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Active Clients',
      value: metrics?.activeClients || 0,
      icon: Activity,
      color: 'green',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Total Users',
      value: metrics?.totalUsers || 0,
      icon: Users,
      color: 'purple',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(metrics?.totalRevenue),
      icon: DollarSign,
      color: 'yellow',
      trend: '+22%',
      trendUp: true
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
      red: 'bg-red-500 text-red-600 bg-red-50'
    };
    return colors?.[color] || colors?.blue;
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metricCards?.map((metric) => {
          const [iconBg, textColor, cardBg] = (getColorClasses(metric?.color)?.split(' ') || []);
          const Icon = metric?.icon;

          return (
            <div key={metric?.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric?.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{metric?.value}</p>
                  {metric?.trend && (
                    <div className="flex items-center mt-2">
                      <TrendingUp className={`h-4 w-4 mr-1 ${metric?.trendUp ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-sm font-medium ${metric?.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {metric?.trend}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${cardBg}`}>
                  <Icon className={`h-6 w-6 ${textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Health Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Database: Healthy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">API: Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Storage: Online</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-2xl font-semibold text-green-600">
                {metrics?.systemHealth?.toFixed(1) || '98.5'}%
              </span>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500">Uptime (30 days)</p>
          </div>
        </div>

        {/* Health Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics?.systemHealth || 98.5}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;