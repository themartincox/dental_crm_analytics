import React from 'react';
        import Button from '../../../components/ui/Button';
        import Icon from '../../../components/AppIcon';
        import { cn } from '../../../utils/cn';
        import { format } from 'date-fns';

        const LeadCard = ({ lead, onDragStart, onClick }) => {
          const getPriorityColor = (priority) => {
            switch (priority) {
              case 'high':
                return 'text-error bg-error/10';
              case 'medium':
                return 'text-warning bg-warning/10';
              case 'low':
                return 'text-success bg-success/10';
              default:
                return 'text-muted-foreground bg-muted/10';
            }
          };

          const getSourceIcon = (source) => {
            switch (source) {
              case 'website':
                return 'Globe';
              case 'referral':
                return 'Users';
              case 'social_media':
                return 'Share2';
              case 'google_ads':
                return 'Search';
              default:
                return 'Inbox';
            }
          };

          const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
              return format(new Date(dateString), 'MMM dd');
            } catch {
              return 'N/A';
            }
          };

          const getScoreColor = (score) => {
            if (score >= 80) return 'text-success';
            if (score >= 60) return 'text-warning';
            return 'text-error';
          };

          return (
            <div
              className="bg-white border border-border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
              draggable
              onDragStart={(e) => onDragStart?.(e, lead)}
              onClick={() => onClick?.(lead)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm mb-1">
                    {lead?.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {lead?.email}
                  </p>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                    getPriorityColor(lead?.priority)
                  )}>
                    {lead?.priority}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <Icon name={getSourceIcon(lead?.source)} size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground capitalize">
                      {lead?.source?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Qualification Score */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      lead?.qualificationScore >= 80 ? "bg-success" :
                      lead?.qualificationScore >= 60 ? "bg-warning" : "bg-error"
                    )}
                    style={{ width: `${lead?.qualificationScore}%` }}
                  />
                </div>
                <span className={cn("text-xs font-medium", getScoreColor(lead?.qualificationScore))}>
                  {lead?.qualificationScore}%
                </span>
              </div>

              {/* Treatment Interest */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Treatment Interest:</p>
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium capitalize">
                  {lead?.treatmentInterest}
                </span>
              </div>

              {/* Next Action */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Next Action:</p>
                <p className="text-xs font-medium text-foreground">{lead?.nextAction}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Created: {formatDate(lead?.createdAt)}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e?.stopPropagation();
                      console.log('Call lead:', lead?.name);
                    }}
                    title="Call Lead"
                  >
                    <Icon name="Phone" size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e?.stopPropagation();
                      console.log('Email lead:', lead?.name);
                    }}
                    title="Email Lead"
                  >
                    <Icon name="Mail" size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e?.stopPropagation();
                      console.log('Schedule consultation for:', lead?.name);
                    }}
                    title="Schedule Consultation"
                  >
                    <Icon name="Calendar" size={12} />
                  </Button>
                </div>
              </div>

              {/* Assigned To */}
              <div className="mt-2 pt-2 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Icon name="User" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Assigned to: {lead?.assignedTo}
                  </span>
                </div>
              </div>
            </div>
          );
        };

        export default LeadCard;