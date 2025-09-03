import React from 'react';
        import Icon from '../../../components/AppIcon';

        const PatientStats = ({ patients = [] }) => {
          const stats = {
            total: patients?.length || 0,
            active: patients?.filter(p => p?.status === 'active')?.length || 0,
            inactive: patients?.filter(p => p?.status === 'inactive')?.length || 0,
            prospective: patients?.filter(p => p?.status === 'prospective')?.length || 0,
            totalBalance: patients?.reduce((sum, p) => sum + (p?.outstandingBalance || 0), 0) || 0,
            overduePayments: patients?.filter(p => p?.outstandingBalance > 0)?.length || 0
          };

          const statCards = [
            {
              title: 'Total Patients',
              value: stats?.total?.toString(),
              icon: 'Users',
              color: 'text-primary',
              bgColor: 'bg-primary/10'
            },
            {
              title: 'Active Patients',
              value: stats?.active?.toString(),
              icon: 'UserCheck',
              color: 'text-success',
              bgColor: 'bg-success/10'
            },
            {
              title: 'Outstanding Balance',
              value: `£${stats?.totalBalance?.toFixed(2)}`,
              icon: 'DollarSign',
              color: 'text-warning',
              bgColor: 'bg-warning/10'
            },
            {
              title: 'Overdue Payments',
              value: stats?.overduePayments?.toString(),
              icon: 'AlertTriangle',
              color: 'text-error',
              bgColor: 'bg-error/10'
            }
          ];

          return (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Patient Statistics</h3>
              <div className="space-y-4">
                {statCards?.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat?.bgColor}`}>
                      <Icon name={stat?.icon} size={18} className={stat?.color} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{stat?.value}</p>
                      <p className="text-xs text-muted-foreground">{stat?.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Breakdown */}
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Status Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Active</span>
                    <span className="text-xs font-medium text-success">{stats?.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Inactive</span>
                    <span className="text-xs font-medium text-muted-foreground">{stats?.inactive}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Prospective</span>
                    <span className="text-xs font-medium text-warning">{stats?.prospective}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default PatientStats;