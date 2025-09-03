import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import MetricsStrip from './components/MetricsStrip';
import FilterHeader from './components/FilterHeader';
import ConversionFunnel from './components/ConversionFunnel';
import LeadScoreLeaderboard from './components/LeadScoreLeaderboard';
import SourcePerformanceRankings from './components/SourcePerformanceRankings';
import GeographicHeatmap from './components/GeographicHeatmap';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { getMemoizedData, clearDataCache } from '../../data/mockData';

const LeadGenerationConversionAnalyticsDashboard = () => {
  const [filters, setFilters] = useState({
    dateRange: '30d',
    comparison: 'previous',
    campaign: '',
    sources: ['google-ads', 'facebook'],
    utmSource: '',
    utmMedium: '',
    utmCampaign: ''
  });

  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Mock data for metrics - keep small objects in component
  const metricsData = useMemo(() => ({
    costPerLead: 45,
    costPerLeadChange: -12.5,
    targetCostPerLead: 50,
    leadToConsultation: 24.8,
    leadToConsultationChange: 8.3,
    industryAvgConversion: 22.5,
    marketingROI: 285.6,
    marketingROIChange: 15.2,
    totalRevenue: 125000,
    totalSpend: 32000,
    totalLeads: 1247,
    totalLeadsChange: 18.7,
    qualifiedLeads: 892
  }), []);

  const dateRangeData = useMemo(() => ({
    current: '1 Dec - 31 Dec 2024',
    comparison: filters?.comparison === 'previous' ? 'Previous period' : 'Year over year'
  }), [filters?.comparison]);

  // Use memoized data for large datasets
  const funnelData = useMemo(() => 
    getMemoizedData('funnel'), 
    [filters?.dateRange]
  );

  const highValueLeads = useMemo(() => 
    getMemoizedData('leads', { 
      paginated: true, 
      page: currentPage, 
      pageSize: pageSize 
    }), 
    [currentPage, pageSize, filters?.dateRange]
  );

  const sourcePerformanceData = useMemo(() => 
    getMemoizedData('sources', { 
      paginated: false, 
      count: 6 
    }), 
    [filters?.sources]
  );

  const geographicData = useMemo(() => 
    getMemoizedData('geographic', { 
      paginated: false, 
      count: 8 
    }), 
    [filters?.dateRange]
  );

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Simulate new high-value lead alerts
      if (Math.random() > 0.7) {
        const newAlert = {
          id: Date.now(),
          type: 'high-value-lead',
          message: 'New high-value lead detected: £8,500 estimated value',
          timestamp: new Date(),
          priority: 'high'
        };
        setRealTimeAlerts(prev => [newAlert, ...prev?.slice(0, 4)]);
      }
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Clear cache when filters change significantly
  useEffect(() => {
    const significantFilterChange = filters?.dateRange;
    clearDataCache();
  }, [filters?.dateRange]);

  const handleStageClick = (stage) => {
    console.log('Funnel stage clicked:', stage);
  };

  const handleLeadClick = (lead) => {
    console.log('Lead clicked:', lead);
  };

  const handleSourceClick = (source) => {
    console.log('Source clicked:', source);
  };

  const handleRegionClick = (region) => {
    console.log('Region clicked:', region);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Lead Generation & Conversion Analytics
            </h1>
            <p className="text-muted-foreground">
              Optimize acquisition strategies through detailed funnel analysis and source attribution
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* Real-time Status */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Live data • Updated {formatTime(lastUpdate)}</span>
            </div>
            
            {/* Quick Actions */}
            <Button
              variant="outline"
              iconName="Calendar"
              iconPosition="left"
            >
              Schedule Report
            </Button>
            
            <Button
              iconName="Download"
              iconPosition="left"
            >
              Export Dashboard
            </Button>
          </div>
        </div>

        {/* Real-time Alerts */}
        {realTimeAlerts?.length > 0 && (
          <div className="mb-6">
            <div className="clinical-card p-4 border-l-4 border-l-warning">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon name="Bell" size={16} className="text-warning" />
                  <h3 className="text-sm font-medium text-foreground">Real-time Alerts</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRealTimeAlerts([])}
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-2">
                {realTimeAlerts?.slice(0, 2)?.map(alert => (
                  <div key={alert?.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{alert?.message}</span>
                    <span className="text-muted-foreground">{formatTime(alert?.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <FilterHeader 
          filters={filters} 
          onFiltersChange={setFilters} 
        />

        {/* Key Metrics */}
        <MetricsStrip 
          metrics={metricsData} 
          dateRange={dateRangeData} 
        />

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
          {/* Conversion Funnel - Main Content */}
          <div className="xl:col-span-8">
            <ConversionFunnel 
              funnelData={funnelData?.stages || []}
              onStageClick={handleStageClick}
            />
          </div>

          {/* Lead Scoring Sidebar with Pagination */}
          <div className="xl:col-span-4">
            <LeadScoreLeaderboard 
              leads={highValueLeads?.data || []}
              pagination={highValueLeads?.pagination}
              onLeadClick={handleLeadClick}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>

        {/* Source Performance */}
        <div className="mb-8">
          <SourcePerformanceRankings 
            sourceData={sourcePerformanceData || []}
            onSourceClick={handleSourceClick}
          />
        </div>

        {/* Geographic Analysis */}
        <div className="mb-8">
          <GeographicHeatmap 
            geoData={geographicData || []}
            onRegionClick={handleRegionClick}
          />
        </div>

        {/* Advanced Analytics Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="clinical-card p-6 text-center">
            <Icon name="TrendingUp" size={32} className="text-success mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">A/B Testing</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Compare campaign variations and optimize conversion paths
            </p>
            <Button variant="outline" size="sm">
              View Tests
            </Button>
          </div>

          <div className="clinical-card p-6 text-center">
            <Icon name="Users" size={32} className="text-clinical-blue mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Cohort Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track lead behavior patterns and retention over time
            </p>
            <Button variant="outline" size="sm">
              Analyze Cohorts
            </Button>
          </div>

          <div className="clinical-card p-6 text-center">
            <Icon name="Target" size={32} className="text-warning mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Attribution</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Multi-touch attribution modeling and journey mapping
            </p>
            <Button variant="outline" size="sm">
              View Attribution
            </Button>
          </div>

          <div className="clinical-card p-6 text-center">
            <Icon name="Zap" size={32} className="text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Automation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Automated lead scoring and follow-up recommendations
            </p>
            <Button variant="outline" size="sm">
              Configure Rules
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeadGenerationConversionAnalyticsDashboard;