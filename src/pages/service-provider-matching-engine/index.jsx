import React, { useState, useEffect } from 'react';

import { Settings, TrendingUp, Users, Clock, Star, AlertCircle, Filter } from 'lucide-react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

import Icon from '../../components/AppIcon';
import ProviderServiceMatrix from './components/ProviderServiceMatrix';
import MatchingRulesBuilder from './components/MatchingRulesBuilder';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import RealTimeMonitoring from './components/RealTimeMonitoring';

const ServiceProviderMatchingEngine = () => {
  const [activeTab, setActiveTab] = useState('matrix');
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [matchingRules, setMatchingRules] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    provider: 'all',
    service: 'all',
    competencyLevel: 'all',
    status: 'active'
  });
  const [advancedSettings, setAdvancedSettings] = useState({
    // Assuming defaultSettings is defined elsewhere or meant to be an empty object
    // and fixing the syntax error in caching property
    caching: true,
    competencyLevel: 'all',
    status: 'active'
  });

  // Mock data
  const mockProviders = [
    {
      id: 'dr-smith',
      name: 'Dr. Sarah Smith',
      role: 'Principal Dentist',
      specializations: ['General Dentistry', 'Cosmetic Dentistry', 'Implants'],
      competencyLevel: 5,
      experienceYears: 12,
      averageRating: 4.9,
      totalAppointments: 1247,
      utilizationRate: 87,
      patientSatisfaction: 96,
      nextAvailable: new Date(2025, 0, 3, 9, 0),
      workload: 85, // percentage
      status: 'active'
    },
    {
      id: 'dr-johnson',
      name: 'Dr. Michael Johnson',
      role: 'Senior Dentist',
      specializations: ['General Dentistry', 'Orthodontics', 'Endodontics'],
      competencyLevel: 4,
      experienceYears: 8,
      averageRating: 4.8,
      totalAppointments: 892,
      utilizationRate: 78,
      patientSatisfaction: 94,
      nextAvailable: new Date(2025, 0, 2, 14, 0),
      workload: 72,
      status: 'active'
    },
    {
      id: 'dr-wilson',
      name: 'Dr. Emma Wilson',
      role: 'Associate Dentist',
      specializations: ['General Dentistry', 'Pediatric Dentistry', 'Preventive Care'],
      competencyLevel: 3,
      experienceYears: 5,
      averageRating: 4.7,
      totalAppointments: 634,
      utilizationRate: 65,
      patientSatisfaction: 92,
      nextAvailable: new Date(2025, 0, 2, 10, 30),
      workload: 58,
      status: 'active'
    }
  ];

  const mockServices = [
    {
      id: 'consultation',
      name: 'Initial Consultation',
      category: 'General',
      duration: 60,
      complexity: 2,
      basePrice: 75,
      requiresSpecialization: false,
      bufferTime: 15
    },
    {
      id: 'cleaning',
      name: 'Professional Cleaning',
      category: 'Preventive',
      duration: 45,
      complexity: 1,
      basePrice: 85,
      requiresSpecialization: false,
      bufferTime: 15
    },
    {
      id: 'filling',
      name: 'Dental Filling',
      category: 'Restorative',
      duration: 60,
      complexity: 3,
      basePrice: 120,
      requiresSpecialization: false,
      bufferTime: 20
    },
    {
      id: 'crown',
      name: 'Dental Crown',
      category: 'Restorative',
      duration: 120,
      complexity: 4,
      basePrice: 450,
      requiresSpecialization: true,
      bufferTime: 30
    },
    {
      id: 'implant',
      name: 'Dental Implant',
      category: 'Surgery',
      duration: 180,
      complexity: 5,
      basePrice: 1200,
      requiresSpecialization: true,
      bufferTime: 45
    },
    {
      id: 'orthodontic',
      name: 'Orthodontic Treatment',
      category: 'Orthodontics',
      duration: 90,
      complexity: 4,
      basePrice: 200,
      requiresSpecialization: true,
      bufferTime: 25
    }
  ];

  const mockMatchingRules = [
    {
      id: 1,
      name: 'High-Value Patient Priority',
      description: 'Priority matching for patients with treatment value >£500',
      conditions: {
        treatmentValue: { min: 500 },
        patientType: 'returning'
      },
      actions: {
        preferredCompetency: 4,
        allowOverride: true,
        notificationLevel: 'high'
      },
      weight: 85,
      isActive: true
    },
    {
      id: 2,
      name: 'Emergency Appointment Routing',
      description: 'Route emergency cases to available senior dentists',
      conditions: {
        appointmentType: 'emergency',
        urgencyLevel: 'high'
      },
      actions: {
        minimumCompetency: 3,
        skipWorkloadCheck: true,
        notificationLevel: 'urgent'
      },
      weight: 95,
      isActive: true
    },
    {
      id: 3,
      name: 'Workload Balancing',
      description: 'Distribute appointments to maintain balanced workloads',
      conditions: {
        workloadThreshold: 80
      },
      actions: {
        redistributeAppointments: true,
        considerAlternativeProviders: true
      },
      weight: 70,
      isActive: true
    }
  ];

  const tabs = [
    { id: 'matrix', label: 'Service-Provider Matrix', icon: 'Grid3x3' },
    { id: 'rules', label: 'Matching Rules', icon: 'Settings' },
    { id: 'analytics', label: 'Performance Analytics', icon: 'BarChart3' },
    { id: 'monitoring', label: 'Real-time Monitoring', icon: 'Activity' }
  ];

  const filterOptions = {
    provider: [
      { value: 'all', label: 'All Providers' },
      ...(mockProviders?.map(p => ({ value: p?.id, label: p?.name })))
    ],
    service: [
      { value: 'all', label: 'All Services' },
      ...(mockServices?.map(s => ({ value: s?.id, label: s?.name })))
    ],
    competencyLevel: [
      { value: 'all', label: 'All Levels' },
      { value: '5', label: 'Expert (5)' },
      { value: '4', label: 'Advanced (4)' },
      { value: '3', label: 'Intermediate (3)' },
      { value: '2', label: 'Basic (2)' },
      { value: '1', label: 'Trainee (1)' }
    ],
    status: [
      { value: 'active', label: 'Active Only' },
      { value: 'all', label: 'All Status' },
      { value: 'inactive', label: 'Inactive Only' }
    ]
  };

  useEffect(() => {
    // Simulate API call to fetch data
    setTimeout(() => {
      setProviders(mockProviders);
      setServices(mockServices);
      setMatchingRules(mockMatchingRules);
      setPerformanceData({
        totalMatches: 1247,
        successRate: 94.2,
        averageWaitTime: 12.5,
        patientSatisfaction: 4.7,
        providerUtilization: 78.3
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const getWorkloadColor = (workload) => {
    if (workload >= 90) return 'text-red-600 bg-red-100';
    if (workload >= 75) return 'text-yellow-600 bg-yellow-100';
    if (workload >= 50) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getCompetencyBadge = (level) => {
    const badges = {
      5: { label: 'Expert', color: 'bg-purple-100 text-purple-800' },
      4: { label: 'Advanced', color: 'bg-blue-100 text-blue-800' },
      3: { label: 'Intermediate', color: 'bg-green-100 text-green-800' },
      2: { label: 'Basic', color: 'bg-yellow-100 text-yellow-800' },
      1: { label: 'Trainee', color: 'bg-gray-100 text-gray-800' }
    };

    const badge = badges?.[level] || badges?.[1];
    return badge;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleRuleToggle = (ruleId) => {
    setMatchingRules(prev => prev?.map(rule =>
      rule?.id === ruleId
        ? { ...rule, isActive: !rule?.isActive }
        : rule
    ));
  };

  const handleRuleUpdate = (ruleId, updatedRule) => {
    setMatchingRules(prev => prev?.map(rule =>
      rule?.id === ruleId ? { ...rule, ...updatedRule } : rule
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading matching engine.</span>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Service-Provider Matching Engine
            </h1>
            <p className="text-muted-foreground">
              Intelligent appointment routing and provider optimization for maximum efficiency and patient satisfaction
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" iconName="Download">
              Export Rules
            </Button>
            <Button iconName="Settings" className="bg-primary hover:bg-primary/90">
              Algorithm Settings
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{performanceData?.successRate}%</p>
              </div>
              <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                <TrendingUp size={16} className="text-success" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold text-foreground">{performanceData?.totalMatches?.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Users size={16} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                <p className="text-2xl font-bold text-foreground">{performanceData?.averageWaitTime}m</p>
              </div>
              <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                <Clock size={16} className="text-warning" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patient Rating</p>
                <p className="text-2xl font-bold text-foreground">{performanceData?.patientSatisfaction}</p>
              </div>
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <Star size={16} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold text-foreground">{performanceData?.providerUtilization}%</p>
              </div>
              <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
                <Settings size={16} className="text-info" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-card border border-border rounded-lg mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab?.id
                      ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={filters?.provider}
                onValueChange={(value) => handleFilterChange('provider', value)}
                options={filterOptions?.provider}
                placeholder="Provider"
                className="w-48"
              />

              <Select
                value={filters?.service}
                onValueChange={(value) => handleFilterChange('service', value)}
                options={filterOptions?.service}
                placeholder="Service"
                className="w-48"
              />

              <Select
                value={filters?.competencyLevel}
                onValueChange={(value) => handleFilterChange('competencyLevel', value)}
                options={filterOptions?.competencyLevel}
                placeholder="Competency"
                className="w-48"
              />

              <Select
                value={filters?.status}
                onValueChange={(value) => handleFilterChange('status', value)}
                options={filterOptions?.status}
                placeholder="Status"
                className="w-48"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  provider: 'all',
                  service: 'all',
                  competencyLevel: 'all',
                  status: 'active'
                })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card border border-border rounded-lg">
          {activeTab === 'matrix' && (
            <ProviderServiceMatrix
              providers={providers}
              services={services}
              filters={filters}
              onProviderUpdate={(providerId, updates) => {
                setProviders(prev => prev?.map(p =>
                  p?.id === providerId ? { ...p, ...updates } : p
                ));
              }}
            />
          )}

          {activeTab === 'rules' && (
            <MatchingRulesBuilder
              rules={matchingRules}
              providers={providers}
              services={services}
              onRuleToggle={handleRuleToggle}
              onRuleUpdate={handleRuleUpdate}
              onRuleCreate={(newRule) => {
                setMatchingRules(prev => [...prev, { ...newRule, id: Date.now() }]);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <PerformanceAnalytics
              providers={providers}
              performanceData={performanceData}
              filters={filters}
            />
          )}

          {activeTab === 'monitoring' && (
            <RealTimeMonitoring
              providers={providers}
              services={services}
              matchingRules={matchingRules?.filter(rule => rule?.isActive)}
            />
          )}
        </div>

        {/* Alert Panel */}
        <div className="mt-8 bg-warning/10 border border-warning/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
            <div>
              <h3 className="font-medium text-warning-foreground">System Status</h3>
              <p className="text-sm text-warning-foreground/80 mt-1">
                Matching engine is running optimally. 2 providers approaching workload capacity - consider redistributing appointments.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceProviderMatchingEngine;