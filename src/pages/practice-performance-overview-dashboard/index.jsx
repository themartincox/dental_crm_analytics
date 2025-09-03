import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import MetricCard from './components/MetricCard';
import GlobalControls from './components/GlobalControls';
import RevenueChart from './components/RevenueChart';
import LeadPipeline from './components/LeadPipeline';
import RecentActivity from './components/RecentActivity';
import { usePracticeStats, useRevenueData, useLeadPipelineData, useRecentActivities } from '../../hooks/useSupabaseData';
import { useAuth } from '../../contexts/AuthContext';

const PracticePerformanceOverviewDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 days');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data using custom hooks
  const { data: practiceStats, loading: statsLoading, refetch: refetchStats } = usePracticeStats();
  const { data: revenueData, loading: revenueLoading, refetch: refetchRevenue } = useRevenueData(30);
  const { data: pipelineData, loading: pipelineLoading, refetch: refetchPipeline } = useLeadPipelineData();
  const { data: recentActivities, loading: activitiesLoading, refetch: refetchActivities } = useRecentActivities(10);

  const isLoading = authLoading || statsLoading || revenueLoading || pipelineLoading || activitiesLoading;

  // Transform practice stats into KPI metrics format
  const kpiMetrics = [
    {
      title: 'Monthly Revenue',
      value: `£${(practiceStats?.monthlyRevenue || 0)?.toLocaleString()}`,
      change: 12.5, // Calculate actual change from previous month
      trend: 'up',
      icon: 'DollarSign',
      color: 'primary',
      sparklineData: revenueData?.slice(-6)?.map(d => d?.revenue) || []
    },
    {
      title: 'Lead Conversion Rate',
      value: `${(practiceStats?.conversionRate || 0)?.toFixed(1)}%`,
      change: 3.2, // Calculate actual change
      trend: 'up',
      icon: 'TrendingUp',
      color: 'success',
      sparklineData: [18.5, 20.2, 22.1, 21.8, 23.5, practiceStats?.conversionRate || 24.8]
    },
    {
      title: 'Patient Lifetime Value',
      value: `£${(practiceStats?.avgPatientValue || 0)?.toLocaleString()}`,
      change: 8.7, // Calculate actual change
      trend: 'up',
      icon: 'Users',
      color: 'secondary',
      sparklineData: [2100, 2150, 2200, 2180, 2280, practiceStats?.avgPatientValue || 2340]
    },
    {
      title: 'Active Patients',
      value: (practiceStats?.activePatients || 0)?.toString(),
      change: ((practiceStats?.activePatients || 0) / (practiceStats?.totalPatients || 1) * 100)?.toFixed(1),
      trend: 'up',
      icon: 'Shield',
      color: 'warning',
      sparklineData: [95, 96, 94, 97, 95, (practiceStats?.activePatients || 0)]
    }
  ];

  // Transform revenue data for chart
  const revenueChartData = revenueData?.map(record => ({
    month: new Date(record?.date)?.toLocaleDateString('en-GB', { month: 'short' }),
    revenue: record?.revenue || 0,
    leads: record?.patients || 0
  })) || [];

  // Mock high-value alerts (these could come from treatments or appointments)
  const highValueAlerts = [
    {
      id: 1,
      patientName: 'Sarah Mitchell',
      treatment: 'Full Mouth Reconstruction',
      value: 15000,
      timeAgo: '2h ago'
    },
    {
      id: 2,
      patientName: 'James Wilson',
      treatment: 'Dental Implants (4 units)',
      value: 8500,
      timeAgo: '4h ago'
    },
    {
      id: 3,
      patientName: 'Emma Thompson',
      treatment: 'Orthodontic Treatment',
      value: 6200,
      timeAgo: '6h ago'
    }
  ];

  useEffect(() => {
    // Auto-refresh functionality
    if (autoRefresh && user) {
      const interval = setInterval(() => {
        refetchStats();
        refetchRevenue();
        refetchPipeline();
        refetchActivities();
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, user, refetchStats, refetchRevenue, refetchPipeline, refetchActivities]);

  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
    console.log('Date range changed to:', range);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    console.log('Location changed to:', location);
  };

  const handleRefreshToggle = (enabled) => {
    setAutoRefresh(enabled);
    console.log('Auto-refresh:', enabled ? 'enabled' : 'disabled');
  };

  const handleChartDataClick = (data) => {
    console.log('Chart data clicked:', data);
    // Implement drill-down functionality
  };

  const handleManualRefresh = () => {
    refetchStats();
    refetchRevenue();
    refetchPipeline();
    refetchActivities();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Practice Performance Overview - Dental CRM Analytics</title>
          <meta name="description" content="Comprehensive business intelligence dashboard for dental practice performance monitoring and analytics" />
        </Helmet>
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)]?.map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded-lg" />
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth required message for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Practice Performance Overview - Dental CRM Analytics</title>
          <meta name="description" content="Comprehensive business intelligence dashboard for dental practice performance monitoring and analytics" />
        </Helmet>
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access the practice performance dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Practice Performance Overview - Dental CRM Analytics</title>
        <meta name="description" content="Comprehensive business intelligence dashboard for dental practice performance monitoring and analytics" />
        <meta name="keywords" content="dental practice, analytics, performance, KPI, revenue, leads, conversion" />
      </Helmet>
      <Header />
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Practice Performance Overview
          </h1>
          <p className="text-muted-foreground">
            Strategic command center for comprehensive business intelligence and performance monitoring
          </p>
        </div>

        {/* Global Controls */}
        <GlobalControls
          onDateRangeChange={handleDateRangeChange}
          onLocationChange={handleLocationChange}
          onRefreshToggle={handleRefreshToggle}
          onManualRefresh={handleManualRefresh}
        />

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiMetrics?.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric?.title}
              value={metric?.value}
              change={metric?.change}
              trend={metric?.trend}
              icon={metric?.icon}
              color={metric?.color}
              sparklineData={metric?.sparklineData}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart - 8 columns equivalent */}
          <div className="lg:col-span-2">
            <RevenueChart
              data={revenueChartData}
              onDataPointClick={handleChartDataClick}
            />
          </div>

          {/* Lead Pipeline - 4 columns equivalent */}
          <div className="lg:col-span-1">
            <LeadPipeline
              pipelineData={pipelineData}
              highValueAlerts={highValueAlerts}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1">
          <RecentActivity activities={recentActivities} />
        </div>
      </main>
    </div>
  );
};

export default PracticePerformanceOverviewDashboard;