import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import MetricsStrip from './components/MetricsStrip';
import FilterHeader from './components/FilterHeader';
import ConversionFunnel from './components/ConversionFunnel';
import LeadScoreLeaderboard from './components/LeadScoreLeaderboard';
import SourcePerformanceRankings from './components/SourcePerformanceRankings';
import GeographicHeatmap from './components/GeographicHeatmap';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

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

  // Mock data for metrics
  const metricsData = {
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
  };

  const dateRangeData = {
    current: '1 Dec - 31 Dec 2024',
    comparison: filters?.comparison === 'previous' ? 'Previous period' : 'Year over year'
  };

  // Mock funnel data
  const funnelData = [
    { stage: 'Lead Capture', count: 1247, conversionRate: 100, dropOffRate: 0 },
    { stage: 'Qualification', count: 892, conversionRate: 71.5, dropOffRate: 28.5 },
    { stage: 'Consultation Booked', count: 634, conversionRate: 71.1, dropOffRate: 28.9 },
    { stage: 'Consultation Attended', count: 487, conversionRate: 76.8, dropOffRate: 23.2 },
    { stage: 'Treatment Accepted', count: 312, conversionRate: 64.1, dropOffRate: 35.9 },
    { stage: 'Treatment Completed', count: 278, conversionRate: 89.1, dropOffRate: 10.9 }
  ];

  // Mock high-value leads data
  const highValueLeads = [
    {
      id: 'L001',
      name: 'Sarah Mitchell',
      source: 'Google Ads',
      score: 94,
      treatmentInterest: 'Dental Implants',
      estimatedValue: 8500,
      budgetRange: '£5,000-£10,000',
      timeframe: 'Within 2 weeks',
      urgency: 'high',
      timestamp: new Date(Date.now() - 300000),
      hasFollowUp: true,
      isNewLead: true,
      scoreBreakdown: [
        { name: 'Budget', score: 95 },
        { name: 'Intent', score: 90 },
        { name: 'Timeline', score: 98 },
        { name: 'Fit', score: 92 }
      ]
    },
    {
      id: 'L002',
      name: 'James Thompson',
      source: 'Facebook',
      score: 87,
      treatmentInterest: 'Orthodontics',
      estimatedValue: 4200,
      budgetRange: '£3,000-£5,000',
      timeframe: 'Within 1 month',
      urgency: 'medium',
      timestamp: new Date(Date.now() - 900000),
      hasFollowUp: false,
      isNewLead: false,
      scoreBreakdown: [
        { name: 'Budget', score: 85 },
        { name: 'Intent', score: 88 },
        { name: 'Timeline', score: 82 },
        { name: 'Fit', score: 93 }
      ]
    },
    {
      id: 'L003',
      name: 'Emma Rodriguez',
      source: 'Organic',
      score: 82,
      treatmentInterest: 'Teeth Whitening',
      estimatedValue: 650,
      budgetRange: '£500-£1,000',
      timeframe: 'Within 3 months',
      urgency: 'low',
      timestamp: new Date(Date.now() - 1800000),
      hasFollowUp: true,
      isNewLead: false,
      scoreBreakdown: [
        { name: 'Budget', score: 78 },
        { name: 'Intent', score: 85 },
        { name: 'Timeline', score: 75 },
        { name: 'Fit', score: 90 }
      ]
    },
    {
      id: 'L004',
      name: 'Michael Chen',
      source: 'Referral',
      score: 91,
      treatmentInterest: 'Full Mouth Reconstruction',
      estimatedValue: 15000,
      budgetRange: '£10,000+',
      timeframe: 'Within 1 week',
      urgency: 'high',
      timestamp: new Date(Date.now() - 600000),
      hasFollowUp: true,
      isNewLead: true,
      scoreBreakdown: [
        { name: 'Budget', score: 98 },
        { name: 'Intent', score: 95 },
        { name: 'Timeline', score: 88 },
        { name: 'Fit', score: 85 }
      ]
    },
    {
      id: 'L005',
      name: 'Lisa Parker',
      source: 'Email Marketing',
      score: 76,
      treatmentInterest: 'General Checkup',
      estimatedValue: 180,
      budgetRange: '£100-£300',
      timeframe: 'Within 6 months',
      urgency: 'low',
      timestamp: new Date(Date.now() - 2400000),
      hasFollowUp: false,
      isNewLead: false,
      scoreBreakdown: [
        { name: 'Budget', score: 70 },
        { name: 'Intent', score: 80 },
        { name: 'Timeline', score: 65 },
        { name: 'Fit', score: 88 }
      ]
    }
  ];

  // Mock source performance data
  const sourcePerformanceData = [
    {
      name: 'Google Ads',
      category: 'Paid Search',
      totalLeads: 342,
      conversionRate: 28.4,
      conversionRateChange: 12.3,
      costPerLead: 52,
      roi: 320.5,
      qualityScore: 8.7,
      avgDealSize: 3200,
      avgTimeToConvert: 14,
      lifetimeValue: 4800,
      performanceScore: 87,
      trendData: [
        { day: 'Mon', conversionRate: 26.2 },
        { day: 'Tue', conversionRate: 28.1 },
        { day: 'Wed', conversionRate: 29.3 },
        { day: 'Thu', conversionRate: 27.8 },
        { day: 'Fri', conversionRate: 30.1 },
        { day: 'Sat', conversionRate: 25.6 },
        { day: 'Sun', conversionRate: 28.4 }
      ]
    },
    {
      name: 'Facebook',
      category: 'Social Media',
      totalLeads: 189,
      conversionRate: 22.8,
      conversionRateChange: -3.2,
      costPerLead: 38,
      roi: 245.3,
      qualityScore: 7.2,
      avgDealSize: 2100,
      avgTimeToConvert: 18,
      lifetimeValue: 3200,
      performanceScore: 72,
      trendData: [
        { day: 'Mon', conversionRate: 24.1 },
        { day: 'Tue', conversionRate: 23.5 },
        { day: 'Wed', conversionRate: 21.8 },
        { day: 'Thu', conversionRate: 22.3 },
        { day: 'Fri', conversionRate: 23.9 },
        { day: 'Sat', conversionRate: 20.1 },
        { day: 'Sun', conversionRate: 22.8 }
      ]
    },
    {
      name: 'Organic Search',
      category: 'SEO',
      totalLeads: 156,
      conversionRate: 31.2,
      conversionRateChange: 5.7,
      costPerLead: 12,
      roi: 580.2,
      qualityScore: 9.1,
      avgDealSize: 2800,
      avgTimeToConvert: 21,
      lifetimeValue: 4200,
      performanceScore: 94,
      trendData: [
        { day: 'Mon', conversionRate: 29.8 },
        { day: 'Tue', conversionRate: 31.5 },
        { day: 'Wed', conversionRate: 32.1 },
        { day: 'Thu', conversionRate: 30.7 },
        { day: 'Fri', conversionRate: 31.8 },
        { day: 'Sat', conversionRate: 28.9 },
        { day: 'Sun', conversionRate: 31.2 }
      ]
    },
    {
      name: 'Referrals',
      category: 'Word of Mouth',
      totalLeads: 98,
      conversionRate: 45.9,
      conversionRateChange: 8.1,
      costPerLead: 25,
      roi: 720.4,
      qualityScore: 9.8,
      avgDealSize: 4500,
      avgTimeToConvert: 8,
      lifetimeValue: 6800,
      performanceScore: 98,
      trendData: [
        { day: 'Mon', conversionRate: 44.2 },
        { day: 'Tue', conversionRate: 46.1 },
        { day: 'Wed', conversionRate: 47.3 },
        { day: 'Thu', conversionRate: 45.8 },
        { day: 'Fri', conversionRate: 46.9 },
        { day: 'Sat', conversionRate: 43.1 },
        { day: 'Sun', conversionRate: 45.9 }
      ]
    },
    {
      name: 'Email Marketing',
      category: 'Email',
      totalLeads: 45,
      conversionRate: 18.7,
      conversionRateChange: -1.8,
      costPerLead: 15,
      roi: 180.3,
      qualityScore: 6.8,
      avgDealSize: 1200,
      avgTimeToConvert: 25,
      lifetimeValue: 2100,
      performanceScore: 65,
      trendData: [
        { day: 'Mon', conversionRate: 19.2 },
        { day: 'Tue', conversionRate: 18.5 },
        { day: 'Wed', conversionRate: 17.8 },
        { day: 'Thu', conversionRate: 18.9 },
        { day: 'Fri', conversionRate: 19.1 },
        { day: 'Sat', conversionRate: 16.8 },
        { day: 'Sun', conversionRate: 18.7 }
      ]
    },
    {
      name: 'Direct',
      category: 'Direct Traffic',
      totalLeads: 67,
      conversionRate: 26.9,
      conversionRateChange: 2.4,
      costPerLead: 8,
      roi: 420.1,
      qualityScore: 8.3,
      avgDealSize: 2600,
      avgTimeToConvert: 16,
      lifetimeValue: 3900,
      performanceScore: 81,
      trendData: [
        { day: 'Mon', conversionRate: 25.8 },
        { day: 'Tue', conversionRate: 27.2 },
        { day: 'Wed', conversionRate: 26.5 },
        { day: 'Thu', conversionRate: 27.8 },
        { day: 'Fri', conversionRate: 26.1 },
        { day: 'Sat', conversionRate: 24.9 },
        { day: 'Sun', conversionRate: 26.9 }
      ]
    }
  ];

  // Mock geographic data
  const geographicData = [
    {
      name: 'London Central',
      area: 'London',
      totalLeads: 234,
      conversionRate: 32.1,
      totalRevenue: 89500,
      costPerLead: 58,
      avgDealSize: 3800,
      demographics: [
        { segment: 'young-professionals', label: 'Young Professionals', percentage: 45 },
        { segment: 'families', label: 'Families', percentage: 30 },
        { segment: 'seniors', label: 'Seniors', percentage: 25 }
      ]
    },
    {
      name: 'Manchester',
      area: 'Northern England',
      totalLeads: 187,
      conversionRate: 28.4,
      totalRevenue: 67200,
      costPerLead: 42,
      avgDealSize: 3200,
      demographics: [
        { segment: 'families', label: 'Families', percentage: 40 },
        { segment: 'young-professionals', label: 'Young Professionals', percentage: 35 },
        { segment: 'seniors', label: 'Seniors', percentage: 25 }
      ]
    },
    {
      name: 'Birmingham',
      area: 'Midlands',
      totalLeads: 156,
      conversionRate: 25.6,
      totalRevenue: 52800,
      costPerLead: 38,
      avgDealSize: 2900,
      demographics: [
        { segment: 'families', label: 'Families', percentage: 50 },
        { segment: 'young-professionals', label: 'Young Professionals', percentage: 30 },
        { segment: 'seniors', label: 'Seniors', percentage: 20 }
      ]
    },
    {
      name: 'Edinburgh',
      area: 'Scotland',
      totalLeads: 143,
      conversionRate: 30.8,
      totalRevenue: 58900,
      costPerLead: 45,
      avgDealSize: 3500,
      demographics: [
        { segment: 'young-professionals', label: 'Young Professionals', percentage: 42 },
        { segment: 'families', label: 'Families', percentage: 33 },
        { segment: 'seniors', label: 'Seniors', percentage: 25 }
      ]
    },
    {
      name: 'Cardiff',
      area: 'Wales',
      totalLeads: 98,
      conversionRate: 27.5,
      totalRevenue: 34200,
      costPerLead: 35,
      avgDealSize: 2800,
      demographics: [
        { segment: 'families', label: 'Families', percentage: 45 },
        { segment: 'seniors', label: 'Seniors', percentage: 30 },
        { segment: 'young-professionals', label: 'Young Professionals', percentage: 25 }
      ]
    },
    {
      name: 'Bristol',
      area: 'South England',
      totalLeads: 134,
      conversionRate: 29.1,
      totalRevenue: 48600,
      costPerLead: 41,
      avgDealSize: 3100,
      demographics: [
        { segment: 'young-professionals', label: 'Young Professionals', percentage: 38 },
        { segment: 'families', label: 'Families', percentage: 37 },
        { segment: 'seniors', label: 'Seniors', percentage: 25 }
      ]
    },
    {
      name: 'Leeds',
      area: 'Northern England',
      totalLeads: 112,
      conversionRate: 26.8,
      totalRevenue: 41300,
      costPerLead: 39,
      avgDealSize: 2950,
      demographics: [
        { segment: 'families', label: 'Families', percentage: 42 },
        { segment: 'young-professionals', label: 'Young Professionals', percentage: 33 },
        { segment: 'seniors', label: 'Seniors', percentage: 25 }
      ]
    },
    {
      name: 'Glasgow',
      area: 'Scotland',
      totalLeads: 89,
      conversionRate: 24.7,
      totalRevenue: 28900,
      costPerLead: 36,
      avgDealSize: 2700,
      demographics: [
        { segment: 'families', label: 'Families', percentage: 48 },
        { segment: 'young-professionals', label: 'Young Professionals', percentage: 27 },
        { segment: 'seniors', label: 'Seniors', percentage: 25 }
      ]
    }
  ];

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
              funnelData={funnelData}
              onStageClick={handleStageClick}
            />
          </div>

          {/* Lead Scoring Sidebar */}
          <div className="xl:col-span-4">
            <LeadScoreLeaderboard 
              leads={highValueLeads}
              onLeadClick={handleLeadClick}
            />
          </div>
        </div>

        {/* Source Performance */}
        <div className="mb-8">
          <SourcePerformanceRankings 
            sourceData={sourcePerformanceData}
            onSourceClick={handleSourceClick}
          />
        </div>

        {/* Geographic Analysis */}
        <div className="mb-8">
          <GeographicHeatmap 
            geoData={geographicData}
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