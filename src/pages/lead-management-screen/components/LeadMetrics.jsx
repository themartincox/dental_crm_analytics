import React from 'react';
        import Icon from '../../../components/AppIcon';

        const LeadMetrics = ({ metrics }) => {
          const metricCards = [
            {
              title: 'Total Leads',
              value: metrics?.totalLeads?.toString() || '0',
              icon: 'Users',
              color: 'text-primary',
              bgColor: 'bg-primary/10'
            },
            {
              title: 'New Inquiries',
              value: metrics?.newInquiries?.toString() || '0',
              icon: 'Plus',
              color: 'text-blue-600',
              bgColor: 'bg-blue-100'
            },
            {
              title: 'In Progress',
              value: metrics?.inProgress?.toString() || '0',
              icon: 'Clock',
              color: 'text-warning',
              bgColor: 'bg-warning/10'
            },
            {
              title: 'Converted',
              value: metrics?.converted?.toString() || '0',
              icon: 'CheckCircle',
              color: 'text-success',
              bgColor: 'bg-success/10'
            },
            {
              title: 'Conversion Rate',
              value: `${metrics?.conversionRate || 0}%`,
              icon: 'TrendingUp',
              color: 'text-purple-600',
              bgColor: 'bg-purple-100'
            }
          ];

          return (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Lead Pipeline Metrics</h2>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Icon name="Clock" size={12} />
                  <span>Updated 2 min ago</span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {metricCards?.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-2 ${metric?.bgColor}`}>
                      <Icon name={metric?.icon} size={20} className={metric?.color} />
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">{metric?.value}</p>
                    <p className="text-sm text-muted-foreground">{metric?.title}</p>
                  </div>
                ))}
              </div>

              {/* Funnel Visualization */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-4">Conversion Funnel</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 text-xs text-muted-foreground">Inquiry</div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="w-8 text-xs text-muted-foreground text-right">{metrics?.newInquiries}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-16 text-xs text-muted-foreground">Contact</div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ 
                        width: metrics?.totalLeads > 0 ? `${((metrics?.inProgress || 0) / metrics?.totalLeads * 100)}%` : '0%' 
                      }}></div>
                    </div>
                    <div className="w-8 text-xs text-muted-foreground text-right">{metrics?.inProgress}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-16 text-xs text-muted-foreground">Convert</div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ 
                        width: metrics?.totalLeads > 0 ? `${((metrics?.converted || 0) / metrics?.totalLeads * 100)}%` : '0%' 
                      }}></div>
                    </div>
                    <div className="w-8 text-xs text-muted-foreground text-right">{metrics?.converted}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default LeadMetrics;