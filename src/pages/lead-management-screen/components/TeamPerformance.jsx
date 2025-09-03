import React from 'react';
        import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


        const TeamPerformance = () => {
          const teamMembers = [
            {
              name: 'Dr. Smith',
              leadsAssigned: 15,
              leadsConverted: 8,
              conversionRate: 53.3,
              avgResponseTime: '2.5 hours'
            },
            {
              name: 'Dr. Johnson',
              leadsAssigned: 12,
              leadsConverted: 6,
              conversionRate: 50.0,
              avgResponseTime: '3.2 hours'
            },
            {
              name: 'Unassigned',
              leadsAssigned: 5,
              leadsConverted: 0,
              conversionRate: 0,
              avgResponseTime: 'N/A'
            }
          ];

          const getPerformanceColor = (rate) => {
            if (rate >= 50) return 'text-success';
            if (rate >= 30) return 'text-warning';
            return 'text-error';
          };

          return (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Team Performance</h3>
                <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
              </div>

              <div className="space-y-4">
                {teamMembers?.map((member, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="User" size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{member?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member?.leadsAssigned} leads assigned
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-bold text-sm ${getPerformanceColor(member?.conversionRate)}`}>
                          {member?.conversionRate?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">conversion</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Converted</p>
                        <p className="font-medium text-foreground">{member?.leadsConverted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Response</p>
                        <p className="font-medium text-foreground">{member?.avgResponseTime}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs text-muted-foreground">
                          {member?.leadsConverted}/{member?.leadsAssigned}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            member?.conversionRate >= 50 ? 'bg-success' :
                            member?.conversionRate >= 30 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${member?.conversionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Team Stats */}
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Team Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-foreground">32</p>
                    <p className="text-xs text-muted-foreground">Total Leads</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-success">14</p>
                    <p className="text-xs text-muted-foreground">Converted</p>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default TeamPerformance;