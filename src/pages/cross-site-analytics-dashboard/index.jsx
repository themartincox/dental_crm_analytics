import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import SiteSelector from './components/SiteSelector';
import MetricsSummary from './components/MetricsSummary';
import PerformanceCharts from './components/PerformanceCharts';
import ConversionFunnel from './components/ConversionFunnel';
import SiteHealthMonitor from './components/SiteHealthMonitor';
import BookingNotifications from './components/BookingNotifications';
import SitePerformanceTable from './components/SitePerformanceTable';
import ABTestingResults from './components/ABTestingResults';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const CrossSiteAnalyticsDashboard = () => {
  const [selectedSites, setSelectedSites] = useState(['site-1', 'site-2']);
  const [dateRange, setDateRange] = useState('30d');
  const [widgetVersion, setWidgetVersion] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realTimeNotifications, setRealTimeNotifications] = useState([]);

  // Mock data for metrics summary
  const metricsData = {
    totalBookings: 2847,
    totalBookingsChange: 18.7,
    avgConversionRate: 12.4,
    avgConversionRateChange: 5.2,
    avgSessionDuration: 245,
    avgSessionDurationChange: -8.3,
    totalRevenue: 487520,
    totalRevenueChange: 22.1,
    activeDeployments: 15,
    errorRate: 0.08
  };

  // Mock data for sites
  const sitesData = [
    {
      id: 'site-1',
      name: 'Smile Dental Clinic',
      domain: 'smileclinic.com',
      status: 'active',
      bookings: 1245,
      conversionRate: 14.2,
      avgSessionTime: 287,
      revenue: 142500,
      errors: 2,
      lastBooking: new Date(Date.now() - 300000),
      widgetVersion: '2.1.0'
    },
    {
      id: 'site-2',
      name: 'Perfect Teeth Practice',
      domain: 'perfectteeth.co.uk',
      status: 'active',
      bookings: 892,
      conversionRate: 11.8,
      avgSessionTime: 231,
      revenue: 98400,
      errors: 0,
      lastBooking: new Date(Date.now() - 180000),
      widgetVersion: '2.1.0'
    },
    {
      id: 'site-3',
      name: 'City Dental Center',
      domain: 'citydental.com',
      status: 'warning',
      bookings: 456,
      conversionRate: 8.9,
      avgSessionTime: 195,
      revenue: 62300,
      errors: 5,
      lastBooking: new Date(Date.now() - 1200000),
      widgetVersion: '2.0.8'
    },
    {
      id: 'site-4',
      name: 'Family Dentistry',
      domain: 'familydentist.net',
      status: 'active',
      bookings: 254,
      conversionRate: 15.7,
      avgSessionTime: 342,
      revenue: 89320,
      errors: 1,
      lastBooking: new Date(Date.now() - 600000),
      widgetVersion: '2.1.0'
    }
  ];

  // Mock funnel data
  const funnelData = [
    { stage: 'Widget Load', count: 45672, conversionRate: 100, dropOffRate: 0 },
    { stage: 'Service Selection', count: 38901, conversionRate: 85.2, dropOffRate: 14.8 },
    { stage: 'Time Selection', count: 32847, conversionRate: 84.4, dropOffRate: 15.6 },
    { stage: 'Patient Info', count: 28453, conversionRate: 86.6, dropOffRate: 13.4 },
    { stage: 'Payment', count: 12847, conversionRate: 45.1, dropOffRate: 54.9 },
    { stage: 'Confirmation', count: 11892, conversionRate: 92.6, dropOffRate: 7.4 }
  ];

  // Mock performance chart data
  const performanceData = {
    bookingsByDay: [
      {
        day: 'Mon', totalBookings: 145, siteData: [
          { siteId: 'site-1', siteName: 'Smile Dental', bookings: 82 },
          { siteId: 'site-2', siteName: 'Perfect Teeth', bookings: 63 }
        ]
      },
      {
        day: 'Tue', totalBookings: 187, siteData: [
          { siteId: 'site-1', siteName: 'Smile Dental', bookings: 98 },
          { siteId: 'site-2', siteName: 'Perfect Teeth', bookings: 89 }
        ]
      },
      {
        day: 'Wed', totalBookings: 234, siteData: [
          { siteId: 'site-1', siteName: 'Smile Dental', bookings: 142 },
          { siteId: 'site-2', siteName: 'Perfect Teeth', bookings: 92 }
        ]
      },
      {
        day: 'Thu', totalBookings: 198, siteData: [
          { siteId: 'site-1', siteName: 'Smile Dental', bookings: 115 },
          { siteId: 'site-2', siteName: 'Perfect Teeth', bookings: 83 }
        ]
      },
      {
        day: 'Fri', totalBookings: 267, siteData: [
          { siteId: 'site-1', siteName: 'Smile Dental', bookings: 156 },
          { siteId: 'site-2', siteName: 'Perfect Teeth', bookings: 111 }
        ]
      },
      {
        day: 'Sat', totalBookings: 312, siteData: [
          { siteId: 'site-1', siteName: 'Smile Dental', bookings: 187 },
          { siteId: 'site-2', siteName: 'Perfect Teeth', bookings: 125 }
        ]
      },
      {
        day: 'Sun', totalBookings: 289, siteData: [
          { siteId: 'site-1', siteName: 'Smile Dental', bookings: 167 },
          { siteId: 'site-2', siteName: 'Perfect Teeth', bookings: 122 }
        ]
      }
    ],
    heatmapData: [
      { hour: 9, day: 'Monday', interactions: 245 },
      { hour: 10, day: 'Monday', interactions: 387 },
      { hour: 11, day: 'Monday', interactions: 456 },
      { hour: 14, day: 'Monday', interactions: 523 },
      { hour: 15, day: 'Monday', interactions: 612 },
      { hour: 16, day: 'Monday', interactions: 445 },
      { hour: 17, day: 'Monday', interactions: 234 }
    ]
  };

  // Mock A/B testing data
  const abTestData = [
    {
      id: 'test-1',
      name: 'Button Color Test',
      variants: [
        { name: 'Control (Blue)', conversionRate: 12.4, bookings: 456, confidence: 95 },
        { name: 'Variant A (Green)', conversionRate: 14.7, bookings: 523, confidence: 98 }
      ],
      status: 'running',
      startDate: new Date('2024-12-01'),
      significance: 'significant'
    },
    {
      id: 'test-2',
      name: 'Form Layout Test',
      variants: [
        { name: 'Single Step', conversionRate: 8.9, bookings: 234, confidence: 89 },
        { name: 'Multi Step', conversionRate: 11.2, bookings: 287, confidence: 94 }
      ],
      status: 'completed',
      startDate: new Date('2024-11-15'),
      significance: 'significant'
    }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());

      // Simulate new booking notifications
      if (Math.random() > 0.8) {
        const sites = ['Smile Dental Clinic', 'Perfect Teeth Practice', 'Family Dentistry'];
        const services = ['Dental Implants', 'Teeth Whitening', 'General Checkup', 'Orthodontics'];

        const newNotification = {
          id: Date.now(),
          type: 'booking',
          siteName: sites?.[Math.floor(Math.random() * sites?.length)],
          service: services?.[Math.floor(Math.random() * services?.length)],
          value: Math.floor(Math.random() * 5000) + 500,
          timestamp: new Date(),
          patientInitial: String.fromCharCode(65 + Math.floor(Math.random() * 26))
        };

        setRealTimeNotifications(prev => [newNotification, ...prev?.slice(0, 9)]);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSiteSelection = (siteIds) => {
    setSelectedSites(siteIds);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleWidgetVersionChange = (version) => {
    setWidgetVersion(version);
  };

  const formatTime = (timestamp) => {
    return timestamp?.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Cross-Site Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor booking widget performance and optimization across multiple client websites
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 xl:mt-0">
            {/* Real-time Status */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Live data • Updated {formatTime(lastUpdate)}</span>
            </div>

            {/* Quick Actions */}
            <Button
              variant="outline"
              iconName="Settings"
              iconPosition="left"
            >
              Widget Settings
            </Button>

            <Button
              iconName="Download"
              iconPosition="left"
            >
              Export Report
            </Button>
          </div>
        </div>

        {/* Site Selector & Filters */}
        <SiteSelector
          sites={sitesData}
          selectedSites={selectedSites}
          onSiteSelection={handleSiteSelection}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          widgetVersion={widgetVersion}
          onWidgetVersionChange={handleWidgetVersionChange}
        />

        {/* Metrics Summary */}
        <MetricsSummary
          metrics={metricsData}
          selectedSites={selectedSites}
          sitesData={sitesData}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
          {/* Performance Charts - Main Content */}
          <div className="xl:col-span-8 space-y-8">
            <PerformanceCharts
              data={performanceData}
              selectedSites={selectedSites}
              sitesData={sitesData}
            />

            <ConversionFunnel
              funnelData={funnelData}
              selectedSites={selectedSites}
            />
          </div>

          {/* Side Panel */}
          <div className="xl:col-span-4 space-y-6">
            <BookingNotifications
              notifications={realTimeNotifications}
            />

            <SiteHealthMonitor
              sites={sitesData}
              selectedSites={selectedSites}
            />
          </div>
        </div>

        {/* Site Performance Table */}
        <SitePerformanceTable
          sites={sitesData}
          selectedSites={selectedSites}
        />

        {/* A/B Testing Results */}
        <ABTestingResults
          testData={abTestData}
        />

        {/* Advanced Analytics Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="clinical-card p-6 text-center">
            <Icon name="BarChart3" size={32} className="text-clinical-blue mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Traffic Sources</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze booking widget traffic by source and device type
            </p>
            <Button variant="outline" size="sm">
              View Sources
            </Button>
          </div>

          <div className="clinical-card p-6 text-center">
            <Icon name="MapPin" size={32} className="text-success mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Geographic Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Location-based booking patterns and regional performance
            </p>
            <Button variant="outline" size="sm">
              View Map
            </Button>
          </div>

          <div className="clinical-card p-6 text-center">
            <Icon name="Clock" size={32} className="text-warning mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Session Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Deep dive into user sessions and interaction patterns
            </p>
            <Button variant="outline" size="sm">
              Analyze Sessions
            </Button>
          </div>

          <div className="clinical-card p-6 text-center">
            <Icon name="Zap" size={32} className="text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Performance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Widget loading times and technical performance metrics
            </p>
            <Button variant="outline" size="sm">
              View Metrics
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CrossSiteAnalyticsDashboard;