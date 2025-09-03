import React from 'react';
        import Button from '../../../components/ui/Button';
        import Icon from '../../../components/AppIcon';
        import { cn } from '../../../utils/cn';
        import { format } from 'date-fns';

        const PatientCard = ({ patient, isSelected, onSelect, onClick }) => {
          const getStatusColor = (status) => {
            switch (status) {
              case 'active':
                return 'text-success bg-success/10';
              case 'inactive':
                return 'text-muted-foreground bg-muted/50';
              case 'prospective':
                return 'text-warning bg-warning/10';
              default:
                return 'text-muted-foreground bg-muted/50';
            }
          };

          const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
              return format(new Date(dateString), 'MMM dd, yyyy');
            } catch {
              return 'N/A';
            }
          };

          const formatBalance = (balance) => {
            if (balance === 0) return '£0.00';
            return `£${balance?.toFixed(2)}`;
          };

          return (
            <div 
              className={cn(
                "grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                isSelected && "bg-primary/5 border-l-4 border-l-primary"
              )}
              onClick={() => onClick?.(patient)}
            >
              {/* Checkbox */}
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e?.stopPropagation();
                    onSelect?.();
                  }}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
              </div>

              {/* Name and Profile */}
              <div className="col-span-3 flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {patient?.profileImage ? (
                    <img 
                      src={patient?.profileImage} 
                      alt={patient?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={18} className="text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{patient?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {patient?.id?.toString()?.padStart(4, '0')}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="col-span-2">
                <p className="text-sm text-foreground">{patient?.email}</p>
                <p className="text-xs text-muted-foreground">{patient?.phone}</p>
              </div>

              {/* Last Visit */}
              <div className="col-span-2">
                <p className="text-sm text-foreground">{formatDate(patient?.lastVisit)}</p>
                {patient?.nextAppointment && (
                  <p className="text-xs text-muted-foreground">
                    Next: {formatDate(patient?.nextAppointment)}
                  </p>
                )}
              </div>

              {/* Treatment Status */}
              <div className="col-span-2">
                <div className="flex flex-col space-y-2">
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                    getStatusColor(patient?.status)
                  )}>
                    {patient?.status}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {patient?.treatmentType}
                  </span>
                </div>
              </div>

              {/* Outstanding Balance */}
              <div className="col-span-1">
                <p className={cn(
                  "text-sm font-medium",
                  patient?.outstandingBalance > 0 ? "text-error" : "text-muted-foreground"
                )}>
                  {formatBalance(patient?.outstandingBalance)}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="col-span-1 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e?.stopPropagation();
                    console.log('Schedule appointment for', patient?.name);
                  }}
                  title="Schedule Appointment"
                >
                  <Icon name="Calendar" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e?.stopPropagation();
                    console.log('Send message to', patient?.name);
                  }}
                  title="Send Message"
                >
                  <Icon name="MessageSquare" size={14} />
                </Button>
              </div>
            </div>
          );
        };

        export default PatientCard;