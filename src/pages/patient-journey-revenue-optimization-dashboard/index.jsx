import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import PatientLifecycleCard from './components/PatientLifecycleCard';
import GlobalControlsBar from './components/GlobalControlsBar';
import PatientJourneyMap from './components/PatientJourneyMap';
import TreatmentTrendingPanel from './components/TreatmentTrendingPanel';
import RevenueAnalyticsSection from './components/RevenueAnalyticsSection';
import PredictiveInsightsPanel from './components/PredictiveInsightsPanel';
import Icon from '../../components/AppIcon';

const PatientJourneyRevenueDashboard = () => {
  const [activeFilters, setActiveFilters] = useState({
    segment: 'all',
    treatment: 'all',
    dateRange: '30d',
    cohortPeriod: 'monthly'
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock lifecycle metrics data
  const lifecycleMetrics = [
    {
      title: 'New Patient Acquisition',
      value: '456',
      change: '+12.3%',
      changeType: 'positive',
      icon: 'UserPlus',
      description: 'New patients this month',
      trend: 78
    },
    {
      title: 'Retention Rate',
      value: '87.4%',
      change: '+2.1%',
      changeType: 'positive',
      icon: 'Users',
      description: '12-month retention',
      trend: 87
    },
    {
      title: 'Average Treatment Value',
      value: '£1,847',
      change: '+5.7%',
      changeType: 'positive',
      icon: 'DollarSign',
      description: 'Per patient revenue',
      trend: 65
    },
    {
      title: 'Appointment Completion',
      value: '92.1%',
      change: '-1.2%',
      changeType: 'negative',
      icon: 'Calendar',
      description: 'Show-up rate',
      trend: 92
    },
    {
      title: 'Referral Generation',
      value: '34',
      change: '+18.5%',
      changeType: 'positive',
      icon: 'Share2',
      description: 'Patient referrals',
      trend: 45
    },
    {
      title: 'Lifetime Value',
      value: '£4,230',
      change: '+8.9%',
      changeType: 'positive',
      icon: 'TrendingUp',
      description: 'Average LTV progression',
      trend: 73
    }
  ];

  // Simulate real-time updates
  useEffect(() => {
    setIsLoading(false);
    
    const interval = setInterval(() => {
      const updates = [
        'New booking confirmed: Sarah Mitchell - Implant consultation',
        'Payment completed: £2,400 - James Wilson',
        'Treatment plan accepted: Emma Thompson - Orthodontics',
        'Follow-up scheduled: Michael Brown - Crown check-up',
        'Review received: 5-star rating from Lisa Davis'
      ];
      
      const randomUpdate = updates?.[Math.floor(Math.random() * updates?.length)];
      setRealTimeUpdates(prev => [
        { id: Date.now(), message: randomUpdate, timestamp: new Date() },
        ...prev?.slice(0, 4)
      ]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
    // In a real app, this would trigger data refetch
    console.log('Filters changed:', filters);
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading patient analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Patient Journey & Revenue Optimization
              </h1>
              <p className="text-muted-foreground">
                Comprehensive lifecycle analytics for retention and revenue maximization
              </p>
            </div>
            
            {/* Real-time Updates */}
            <div className="hidden lg:block">
              <div className="bg-card border border-border rounded-lg p-4 w-80">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">Live Updates</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {realTimeUpdates?.length > 0 ? (
                    realTimeUpdates?.map((update) => (
                      <div key={update?.id} className="text-xs text-muted-foreground">
                        <span className="text-success font-medium">
                          {formatTime(update?.timestamp)}
                        </span>
                        {' - '}
                        {update?.message}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Waiting for updates...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <GlobalControlsBar onFiltersChange={handleFiltersChange} />

        {/* Patient Lifecycle Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {lifecycleMetrics?.map((metric, index) => (
            <PatientLifecycleCard
              key={index}
              title={metric?.title}
              value={metric?.value}
              change={metric?.change}
              changeType={metric?.changeType}
              icon={metric?.icon}
              description={metric?.description}
              trend={metric?.trend}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Patient Journey Map - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <PatientJourneyMap />
          </div>
          
          {/* Treatment Trending Panel - Takes 1 column */}
          <div className="xl:col-span-1">
            <TreatmentTrendingPanel />
          </div>
        </div>

        {/* Revenue Analytics Section */}
        <div className="mb-8">
          <RevenueAnalyticsSection />
        </div>

        {/* Predictive Insights Panel */}
        <div className="mb-8">
          <PredictiveInsightsPanel />
        </div>

        {/* Mobile Real-time Updates */}
        <div className="lg:hidden">
          <div className="clinical-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Live Updates</span>
            </div>
            <div className="space-y-2">
              {realTimeUpdates?.length > 0 ? (
                realTimeUpdates?.slice(0, 3)?.map((update) => (
                  <div key={update?.id} className="text-xs text-muted-foreground">
                    <span className="text-success font-medium">
                      {formatTime(update?.timestamp)}
                    </span>
                    {' - '}
                    {update?.message}
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">
                  Waiting for updates...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Icon name="Users" size={20} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Total Patients</span>
              </div>
              <p className="text-2xl font-bold text-foreground">2,847</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Icon name="DollarSign" size={20} className="text-success" />
                <span className="text-sm font-medium text-muted-foreground">Monthly Revenue</span>
              </div>
              <p className="text-2xl font-bold text-foreground">£486,200</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={20} className="text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Growth Rate</span>
              </div>
              <p className="text-2xl font-bold text-foreground">+12.4%</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Icon name="Target" size={20} className="text-warning" />
                <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
              </div>
              <p className="text-2xl font-bold text-foreground">68.7%</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientJourneyRevenueDashboard;