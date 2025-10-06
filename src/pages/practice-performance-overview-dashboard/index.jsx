import React, { useState, useEffect } from 'react';
import SEOHead from '../../components/SEOHead';
import Header from '../../components/ui/Header';
import MetricCard from './components/MetricCard';
import GlobalControls from './components/GlobalControls';
import RevenueChart from './components/RevenueChart';
import LeadPipeline from './components/LeadPipeline';
import RecentActivity from './components/RecentActivity';
import { usePracticeStats, useRevenueData, useLeadPipelineData, useRecentActivities } from '../../hooks/useSupabaseData';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { logger } from '../../utils/logger';

const PracticePerformanceOverviewDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 days');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initialize accessibility testing
  useAccessibility({ enableInDevelopment: true });

  // Fetch data using custom hooks
  const { data: practiceStats, loading: statsLoading, refetch: refetchStats } = usePracticeStats();
  const { data: revenueData, loading: revenueLoading, refetch: refetchRevenue } = useRevenueData(30);
  const { data: pipelineData, loading: pipelineLoading, refetch: refetchPipeline } = useLeadPipelineData();
  const { data: recentActivities, loading: activitiesLoading, refetch: refetchActivities } = useRecentActivities(10);

  const isLoading = authLoading || statsLoading || revenueLoading || pipelineLoading || activitiesLoading;

  // SEO structured data for this specific page
  const practiceStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Practice Performance Overview Dashboard",
    "description": "Real-time analytics and performance metrics for dental practice management",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Postino's Yolo CRM"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Dashboard",
          "item": window?.location?.href
        }
      ]
    }
  };

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
    let interval;
    
    // Auto-refresh functionality
    if (autoRefresh && user) {
      const refreshData = () => {
        refetchStats();
        refetchRevenue();
        refetchPipeline();
        refetchActivities();
      };

      interval = setInterval(refreshData, 300000); // 5 minutes
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, user, refetchStats, refetchRevenue, refetchPipeline, refetchActivities]);

  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
    logger.info('Date range changed', { 
      newRange: range, 
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    logger.info('Location changed', { 
      newLocation: location, 
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  const handleRefreshToggle = (enabled) => {
    setAutoRefresh(enabled);
    logger.info('Auto-refresh toggled', { 
      enabled, 
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  const handleChartDataClick = (data) => {
    logger.info('Chart data clicked', { 
      data, 
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
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
        <SEOHead 
          title="Loading Practice Dashboard - Dental CRM Analytics"
          description="Loading comprehensive business intelligence dashboard for dental practice performance monitoring"
          image=""
          canonicalUrl=""
          structuredData={[]}
          noIndex={true}
        />
        <Header />
        <main className="container mx-auto px-6 py-8" role="main">
          <div className="animate-pulse space-y-6" aria-label="Loading dashboard content">
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
        </main>
      </div>
    );
  }

  // Show auth required message for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Authentication Required - Practice Dashboard"
          description="Sign in to access comprehensive dental practice performance analytics and management tools"
          image=""
          canonicalUrl=""
          structuredData={[]}
          noIndex={true}
        />
        <Header />
        <main className="container mx-auto px-6 py-8" role="main">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access the practice performance dashboard.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Practice Performance Overview - Dental CRM Analytics"
        description="Comprehensive business intelligence dashboard for dental practice performance monitoring and analytics. Track revenue, patient metrics, lead conversion, and operational efficiency in real-time."
        keywords="dental practice analytics, healthcare dashboard, patient management, revenue tracking, lead conversion, practice KPIs, dental CRM, business intelligence"
        canonicalUrl={`${window?.location?.origin}/practice-performance-overview-dashboard`}
        structuredData={[practiceStructuredData]}
        noIndex={true} // Private dashboard should not be indexed
      />
      <Header />
      <main className="container mx-auto px-6 py-8" role="main">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Practice Performance Overview
          </h1>
          <p className="text-muted-foreground">
            Strategic command center for comprehensive business intelligence and performance monitoring
          </p>
        </header>

        {/* Global Controls */}
        <section aria-labelledby="controls-heading" className="mb-8">
          <h2 id="controls-heading" className="sr-only">Dashboard Controls</h2>
          <GlobalControls
            onDateRangeChange={handleDateRangeChange}
            onLocationChange={handleLocationChange}
            onRefreshToggle={handleRefreshToggle}
            onManualRefresh={handleManualRefresh}
          />
        </section>

        {/* KPI Metrics Grid */}
        <section aria-labelledby="kpi-heading" className="mb-8">
          <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </section>

        {/* Main Content Grid */}
        <section aria-labelledby="analytics-heading" className="mb-8">
          <h2 id="analytics-heading" className="sr-only">Analytics and Performance Data</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </section>

        {/* Recent Activity */}
        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="sr-only">Recent Activity</h2>
          <div className="grid grid-cols-1">
            <RecentActivity activities={recentActivities} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default PracticePerformanceOverviewDashboard;