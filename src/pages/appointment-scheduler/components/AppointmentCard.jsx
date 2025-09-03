import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { format } from 'date-fns';

const AppointmentCard = ({ 
  appointment, 
  onEdit, 
  onCancel, 
  onClose, 
  onPayment 
}) => {
  if (!appointment) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'cancelled': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 border-success/20';
      case 'pending': return 'bg-warning/10 border-warning/20';
      case 'cancelled': return 'bg-error/10 border-error/20';
      default: return 'bg-muted/10 border-border';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Appointment Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Patient Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{appointment?.patientName}</h3>
                <p className="text-sm text-muted-foreground">ID: {appointment?.patientId}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Icon name="Phone" size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">{appointment?.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground truncate">{appointment?.email}</span>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                <p className="text-sm text-foreground mt-1">
                  {format(appointment?.date, 'EEEE, MMM dd, yyyy')}
                  <br />
                  {format(appointment?.date, 'HH:mm')} ({appointment?.duration} min)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className={`inline-flex items-center space-x-2 mt-1 px-2 py-1 rounded-lg border ${getStatusBg(appointment?.status)}`}>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(appointment?.status)?.replace('text-', 'bg-')}`}></div>
                  <span className={`text-sm font-medium capitalize ${getStatusColor(appointment?.status)}`}>
                    {appointment?.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Treatment Type</label>
                <p className="text-sm text-foreground mt-1 capitalize">{appointment?.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Provider</label>
                <p className="text-sm text-foreground mt-1">
                  {appointment?.provider?.replace('dr-', 'Dr. ')?.replace('-', ' ')}
                </p>
              </div>
            </div>

            {appointment?.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm text-foreground mt-1 bg-muted/50 p-3 rounded-lg">
                  {appointment?.notes}
                </p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          {appointment?.depositRequired > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Deposit Required</span>
                <span className="text-lg font-semibold text-foreground">
                  £{appointment?.depositRequired?.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {appointment?.depositPaid ? (
                    <>
                      <Icon name="CheckCircle" size={16} className="text-success" />
                      <span className="text-sm text-success">Deposit Paid</span>
                    </>
                  ) : (
                    <>
                      <Icon name="AlertCircle" size={16} className="text-warning" />
                      <span className="text-sm text-warning">Payment Pending</span>
                    </>
                  )}
                </div>
                {!appointment?.depositPaid && (
                  <Button size="sm" onClick={onPayment}>
                    Collect Payment
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Communication Status */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Reminder Status</span>
              <div className="flex items-center space-x-2">
                {appointment?.reminderSent ? (
                  <>
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-sm text-success">Reminder Sent</span>
                  </>
                ) : (
                  <>
                    <Icon name="Clock" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">No Reminder</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onEdit}
              iconName="Edit"
            >
              Reschedule
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => onCancel(appointment?.id)}
              iconName="X"
            >
              Cancel
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" size="sm" iconName="Phone">
                Call Patient
              </Button>
              <Button variant="ghost" size="sm" iconName="MessageSquare">
                Send Message
              </Button>
              <Button variant="ghost" size="sm" iconName="Calendar">
                View History
              </Button>
              <Button variant="ghost" size="sm" iconName="FileText">
                Treatment Notes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;