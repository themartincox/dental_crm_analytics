import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { format } from 'date-fns';

const AlternativeTimesModal = ({ alternativeTimes, onSelect, onClose }) => {
  const formatTime = (time) => {
    const [hours, minutes] = time?.split(':');
    return format(new Date(2000, 0, 1, parseInt(hours), parseInt(minutes)), 'h:mm a');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Scheduling Conflict Detected</h2>
            <p className="text-muted-foreground">Please select an alternative time slot</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Conflict Notice */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Time Conflict</h3>
              <p className="text-sm text-muted-foreground">
                Another appointment has been scheduled during your selected time. 
                Please choose from one of the available alternatives below, and we'll 
                proceed with your payment and confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Times */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Available Alternative Times</h3>
          
          {alternativeTimes?.length > 0 ? (
            alternativeTimes?.map((timeSlot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => onSelect(timeSlot)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="Calendar" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {format(timeSlot?.date, 'EEEE, MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(timeSlot?.time)} with {timeSlot?.provider}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-success">
                    <Icon name="CheckCircle" size={16} className="mr-1" />
                    Available
                  </div>
                  <Button size="sm">
                    Select Time
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">No Alternative Times Available</p>
              <p className="text-sm text-muted-foreground">
                Please contact our office directly to schedule your appointment.
              </p>
            </div>
          )}
        </div>

        {/* Manual Scheduling Option */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Icon name="Phone" size={20} className="text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Need Different Times?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                If none of these times work for you, please call us directly and we'll find 
                the perfect time that fits your schedule.
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-foreground">
                  <span className="font-medium">Phone:</span> +44 20 7123 4567
                </p>
                <p className="text-foreground">
                  <span className="font-medium">Email:</span> info@centraldental.co.uk
                </p>
                <p className="text-muted-foreground">
                  Office hours: Monday - Friday, 8:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Cancel & Go Back
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1"
            onClick={() => window.open('tel:+442071234567')}
          >
            <Icon name="Phone" size={18} className="mr-2" />
            Call to Reschedule
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Icon name="Clock" size={14} className="mr-1" />
              Real-time availability
            </div>
            <div className="flex items-center">
              <Icon name="RefreshCw" size={14} className="mr-1" />
              Updated every 5 minutes
            </div>
            <div className="flex items-center">
              <Icon name="Shield" size={14} className="mr-1" />
              Secure booking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlternativeTimesModal;