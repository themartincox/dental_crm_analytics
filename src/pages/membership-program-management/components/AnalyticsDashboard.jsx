import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, FileText, DollarSign, BarChart, Activity } from 'lucide-react';
import { membershipAnalyticsService } from '../../../services/membershipService';

const AnalyticsDashboard = ({ analytics }) => {
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadTrends();
  }, [timeRange]);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const { data, error } = await membershipAnalyticsService?.getMembershipTrends(null, timeRange);
      if (error) {
        console.error('Failed to load trends:', error);
      } else {
        setTrendsData(data || []);
      }
    } catch (err) {
      console.error('Trends error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthPercentage = () => {
    if (!trendsData?.length || trendsData?.length < 2) return 0;
    
    const recent = trendsData?.slice(-7); // Last 7 days
    const previous = trendsData?.slice(-14, -7); // Previous 7 days
    
    const recentTotal = recent?.reduce((sum, day) => sum + (day?.count || 0), 0);
    const previousTotal = previous?.reduce((sum, day) => sum + (day?.count || 0), 0);
    
    if (previousTotal === 0) return recentTotal > 0 ? 100 : 0;
    
    return ((recentTotal - previousTotal) / previousTotal * 100)?.toFixed(1);
  };

  const growthPercentage = getGrowthPercentage();
  const isGrowthPositive = parseFloat(growthPercentage) >= 0;

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Membership Program Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Applications */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-800 truncate">Total Applications</dt>
                  <dd className="text-2xl font-bold text-blue-900">{analytics?.totalApplications || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Active Members */}
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-800 truncate">Active Members</dt>
                  <dd className="text-2xl font-bold text-green-900">{analytics?.activeMemberships || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-yellow-800 truncate">Monthly Revenue</dt>
                  <dd className="text-2xl font-bold text-yellow-900">£{analytics?.monthlyRevenue || '0.00'}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-purple-800 truncate">Conversion Rate</dt>
                  <dd className="text-2xl font-bold text-purple-900">{analytics?.conversionRate || '0'}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Growth Trend Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Membership Growth Trend</h3>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e?.target?.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Growth Indicator */}
            <div className="mb-6">
              <div className="flex items-center">
                {isGrowthPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={`text-sm font-medium ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isGrowthPositive ? '+' : ''}{growthPercentage}% vs. previous period
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Comparing last 7 days to previous 7 days
              </p>
            </div>

            {/* Simple Trend Chart */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Daily New Memberships</h4>
              
              {trendsData?.length > 0 ? (
                <div className="grid grid-cols-7 gap-2 h-32">
                  {trendsData?.slice(-7)?.map((day, index) => {
                    const maxCount = Math.max(.trendsData?.slice(-7)?.map(d => d?.count || 0));
                    const height = maxCount > 0 ? ((day?.count || 0) / maxCount) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center justify-end">
                        <div 
                          className="bg-blue-500 rounded-t w-full"
                          style={{ height: `${height}%` }}
                          title={`${day?.count || 0} new members on ${new Date(day.date)?.toLocaleDateString()}`}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(day.date)?.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-xs font-medium text-gray-700">
                          {day?.count || 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No trend data available</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Application Approval Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics?.totalApplications > 0 ? 
                  (((analytics?.activeMemberships || 0) / analytics?.totalApplications) * 100)?.toFixed(1) : 0}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Revenue per Member</span>
              <span className="text-sm font-medium text-gray-900">
                £{analytics?.activeMemberships > 0 ? 
                  ((parseFloat(analytics?.monthlyRevenue || 0)) / analytics?.activeMemberships)?.toFixed(2) : 
                  '0.00'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Growth Rate (Last 7 days)</span>
              <span className={`text-sm font-medium ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isGrowthPositive ? '+' : ''}{growthPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Insights</h3>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  {analytics?.totalApplications || 0} total membership applications submitted
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  {analytics?.activeMemberships || 0} members currently active in the program
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  £{analytics?.monthlyRevenue || '0.00'} in monthly recurring revenue
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  {analytics?.conversionRate || '0'}% conversion rate from applications to memberships
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;