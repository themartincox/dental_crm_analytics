import React from 'react';
import Header from '../../components/ui/Header';
import ComplianceHealthScore from './components/ComplianceHealthScore';
import StatusCards from './components/StatusCards';
import ActivityFeed from './components/ActivityFeed';
import IntegrationHealth from './components/IntegrationHealth';
import AuditVisualization from './components/AuditVisualization';

const ComplianceOperationsMonitoringDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Compliance & Operations Monitoring
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time regulatory adherence and operational efficiency monitoring
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle" />
            <span>System monitoring active</span>
          </div>
        </div>

        {/* Compliance Health Score */}
        <ComplianceHealthScore />

        {/* Status Cards */}
        <StatusCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed - 2 columns on desktop */}
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>

          {/* Integration Health - 1 column on desktop */}
          <div className="lg:col-span-1">
            <IntegrationHealth />
          </div>
        </div>

        {/* Audit Visualization */}
        <AuditVisualization />
      </main>
    </div>
  );
};

export default ComplianceOperationsMonitoringDashboard;