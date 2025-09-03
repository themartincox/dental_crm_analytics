import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Clock, Star, Target, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';


const PerformanceAnalytics = ({ providers = [], performanceData = {}, filters }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('efficiency');

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    efficiency: [],
    utilization: [],
    satisfaction: [],
    revenue: []
  });

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const metricOptions = [
    { value: 'efficiency', label: 'Matching Efficiency' },
    { value: 'utilization', label: 'Provider Utilization' },
    { value: 'satisfaction', label: 'Patient Satisfaction' },
    { value: 'revenue', label: 'Revenue Impact' }
  ];

  useEffect(() => {
    // Generate mock analytics data
    const generateData = () => {
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const dataPoints = timeRange === '24h' ? 24 : days;
      
      const data = {
        efficiency: Array.from({ length: dataPoints }, (_, i) => ({
          period: timeRange === '24h' ? `${i}:00` : `Day ${i + 1}`,
          value: 85 + Math.random() * 10,
          matches: Math.floor(50 + Math.random() * 30),
          success: 90 + Math.random() * 8
        })),
        utilization: providers?.map(provider => ({
          name: provider?.name?.split(' ')?.[1] || provider?.name,
          value: provider?.utilizationRate,
          appointments: provider?.totalAppointments,
          available: Math.floor(Math.random() * 20) + 10
        })),
        satisfaction: Array.from({ length: dataPoints }, (_, i) => ({
          period: timeRange === '24h' ? `${i}:00` : `Day ${i + 1}`,
          overall: 4.5 + Math.random() * 0.4,
          speed: 4.3 + Math.random() * 0.5,
          accuracy: 4.6 + Math.random() * 0.3
        })),
        revenue: Array.from({ length: dataPoints }, (_, i) => ({
          period: timeRange === '24h' ? `${i}:00` : `Day ${i + 1}`,
          total: 2500 + Math.random() * 1000,
          deposit: 750 + Math.random() * 300,
          full: 1750 + Math.random() * 700
        }))
      };
      
      setAnalyticsData(data);
    };

    generateData();
  }, [timeRange, providers]);

  // Performance summary data
  const performanceSummary = [
    {
      title: 'Matching Success Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Average Response Time',
      value: '1.2s',
      change: '-0.3s',
      trend: 'down',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Provider Utilization',
      value: '78.3%',
      change: '+5.4%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Revenue Optimization',
      value: '£12.4K',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  // Service distribution data
  const serviceDistribution = [
    { name: 'General', value: 35, color: '#8884d8' },
    { name: 'Cosmetic', value: 25, color: '#82ca9d' },
    { name: 'Orthodontics', value: 20, color: '#ffc658' },
    { name: 'Surgery', value: 15, color: '#ff7300' },
    { name: 'Emergency', value: 5, color: '#e74c3c' }
  ];

  const renderChart = () => {
    const data = analyticsData?.[selectedMetric];
    
    switch (selectedMetric) {
      case 'efficiency':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value?.toFixed(1)}%`, 'Efficiency Rate']}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'utilization':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, 'Utilization Rate']}
              />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'satisfaction':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[4, 5]} />
              <Tooltip 
                formatter={(value, name) => [value?.toFixed(2), name]}
              />
              <Line type="monotone" dataKey="overall" stroke="#8884d8" name="Overall" />
              <Line type="monotone" dataKey="speed" stroke="#82ca9d" name="Speed" />
              <Line type="monotone" dataKey="accuracy" stroke="#ffc658" name="Accuracy" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`£${value?.toFixed(0)}`, name]}
              />
              <Bar dataKey="total" fill="#8884d8" name="Total Revenue" />
              <Bar dataKey="deposit" fill="#82ca9d" name="Deposits" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Analytics</h3>
          <p className="text-gray-600">Monitor and analyze matching engine performance metrics and trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            {timeRangeOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            {metricOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceSummary?.map((item, index) => {
          const Icon = item?.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{item?.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{item?.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {item?.trend === 'up' ? (
                      <TrendingUp size={14} className="text-green-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                    <span className={`text-sm ${item?.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {item?.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item?.bgColor}`}>
                  <Icon size={24} className={item?.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Main Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">
            {metricOptions?.find(m => m?.value === selectedMetric)?.label} Trends
          </h4>
          <div className="text-sm text-gray-500">
            {timeRangeOptions?.find(t => t?.value === timeRange)?.label}
          </div>
        </div>
        {renderChart()}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Service Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={serviceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {serviceDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Distribution']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {serviceDistribution?.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item?.color }}
                />
                <span className="text-sm text-gray-600">{item?.name}</span>
                <span className="text-sm font-medium text-gray-900">{item?.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Providers */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Providers</h4>
          <div className="space-y-3">
            {providers
              ?.sort((a, b) => b?.patientSatisfaction - a?.patientSatisfaction)
              ?.slice(0, 5)
              ?.map((provider, index) => (
                <div key={provider?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800': 'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{provider?.name}</div>
                      <div className="text-sm text-gray-600">{provider?.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{provider?.patientSatisfaction}%</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {provider?.totalAppointments} appointments
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {/* Detailed Analytics Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Provider Performance Details</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Provider</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Appointments</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Utilization</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Rating</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Satisfaction</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Workload</th>
              </tr>
            </thead>
            <tbody>
              {providers?.map((provider) => (
                <tr key={provider?.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{provider?.name}</div>
                      <div className="text-xs text-gray-600">{provider?.role}</div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">{provider?.totalAppointments}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      provider?.utilizationRate >= 80 
                        ? 'bg-green-100 text-green-800'
                        : provider?.utilizationRate >= 60
                        ? 'bg-yellow-100 text-yellow-800' :'bg-red-100 text-red-800'
                    }`}>
                      {provider?.utilizationRate}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span>{provider?.averageRating}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">{provider?.patientSatisfaction}%</td>
                  <td className="text-center py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          provider?.workload >= 90 ? 'bg-red-500' :
                          provider?.workload >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${provider?.workload}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{provider?.workload}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;