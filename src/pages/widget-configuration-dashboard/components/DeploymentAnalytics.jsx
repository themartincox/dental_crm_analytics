import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CreditCard, Clock, MapPin, Calendar, Download } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const DeploymentAnalytics = ({ widget }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, widget?.id]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Mock analytics data - replace with actual API
    const mockData = {
      summary: {
        totalViews: 1247,
        totalBookings: 89,
        conversionRate: 7.1,
        avgSessionTime: '3:24',
        bounceRate: 32.5,
        topReferrer: 'Google Organic'
      },
      timeSeriesData: [
        { date: '2024-02-24', views: 45, bookings: 3, conversions: 6.7 },
        { date: '2024-02-25', views: 52, bookings: 4, conversions: 7.7 },
        { date: '2024-02-26', views: 38, bookings: 2, conversions: 5.3 },
        { date: '2024-02-27', views: 41, bookings: 5, conversions: 12.2 },
        { date: '2024-02-28', views: 48, bookings: 3, conversions: 6.3 },
        { date: '2024-03-01', views: 55, bookings: 4, conversions: 7.3 },
        { date: '2024-03-02', views: 43, bookings: 6, conversions: 14.0 }
      ],
      serviceBreakdown: [
        { name: 'Initial Consultation', bookings: 34, value: 38.2, color: '#0066cc' },
        { name: 'Professional Cleaning', bookings: 28, value: 31.5, color: '#00cc66' },
        { name: 'Teeth Whitening', bookings: 15, value: 16.9, color: '#cc6600' },
        { name: 'Emergency Treatment', bookings: 12, value: 13.4, color: '#cc0066' }
      ],
      geographicData: [
        { location: 'London', views: 456, bookings: 32 },
        { location: 'Manchester', views: 234, bookings: 18 },
        { location: 'Birmingham', views: 198, bookings: 14 },
        { location: 'Leeds', views: 167, bookings: 12 },
        { location: 'Other', views: 192, bookings: 13 }
      ],
      deviceBreakdown: [
        { device: 'Desktop', views: 623, bookings: 45, color: '#0066cc' },
        { device: 'Mobile', views: 467, bookings: 32, color: '#00cc66' },
        { device: 'Tablet', views: 157, bookings: 12, color: '#cc6600' }
      ],
      hourlyDistribution: [
        { hour: '9:00', bookings: 8 },
        { hour: '10:00', bookings: 12 },
        { hour: '11:00', bookings: 15 },
        { hour: '12:00', bookings: 6 },
        { hour: '13:00', bookings: 4 },
        { hour: '14:00', bookings: 11 },
        { hour: '15:00', bookings: 14 },
        { hour: '16:00', bookings: 10 },
        { hour: '17:00', bookings: 9 }
      ]
    };
    
    setTimeout(() => {
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1000);
  };

  const exportReport = () => {
    const reportData = {
      widget: widget?.name,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widget?.name?.replace(/\s+/g, '-')?.toLowerCase()}-analytics-${timeRange}.json`;
    a?.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000)?.toFixed(1) + 'k';
    }
    return num?.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={20} />
            Analytics Dashboard
          </h3>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </Select>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatNumber(analyticsData?.summary?.totalViews)}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Bookings</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {analyticsData?.summary?.totalBookings}
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {analyticsData?.summary?.conversionRate}%
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Avg Session</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {analyticsData?.summary?.avgSessionTime}
            </p>
          </div>
        </div>
      </div>
      {/* Performance Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Performance Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData?.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="views" fill="#e5e7eb" name="Views" />
            <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#0066cc" strokeWidth={2} name="Bookings" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Popular Services</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData?.serviceBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {analyticsData?.serviceBreakdown?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Device Types</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData?.deviceBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#e5e7eb" name="Views" />
              <Bar dataKey="bookings" fill="#0066cc" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Geographic Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin size={18} />
          Geographic Distribution
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-500">Location</th>
                <th className="text-right py-2 text-sm font-medium text-gray-500">Views</th>
                <th className="text-right py-2 text-sm font-medium text-gray-500">Bookings</th>
                <th className="text-right py-2 text-sm font-medium text-gray-500">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData?.geographicData?.map((location, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{location?.location}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{location?.views}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{location?.bookings}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">
                    {((location?.bookings / location?.views) * 100)?.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Hourly Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={18} />
          Booking Times
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analyticsData?.hourlyDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="bookings" fill="#0066cc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DeploymentAnalytics;