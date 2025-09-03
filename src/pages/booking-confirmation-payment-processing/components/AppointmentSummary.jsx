import React from 'react';
import Icon from '../../../components/AppIcon';
import { format } from 'date-fns';

const AppointmentSummary = ({ 
  appointment, 
  patient, 
  provider, 
  practiceLocation, 
  preparationInstructions,
  parkingInfo,
  availabilityConflict 
}) => {
  // Calculate total cost with fees
  const servicesCost = appointment?.estimated_cost || 0;
  const depositRequired = appointment?.deposit_required || 0;
  const convenienceFee = servicesCost * 0.02; // 2% convenience fee
  const totalCost = servicesCost + convenienceFee;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    })?.format(amount);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time?.split(':');
    return format(new Date(2000, 0, 1, parseInt(hours), parseInt(minutes)), 'h:mm a');
  };

  return (
    <div className="space-y-6">
      {/* Appointment Details Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Appointment Summary</h3>
          {availabilityConflict && (
            <div className="flex items-center text-warning text-sm">
              <Icon name="AlertTriangle" size={16} className="mr-1" />
              Conflict Detected
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Provider Information */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{provider?.full_name}</p>
              <p className="text-sm text-muted-foreground capitalize">{provider?.role}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">
                  {appointment?.appointment_date ? format(new Date(appointment?.appointment_date), 'EEEE, MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium text-foreground">
                  {formatTime(appointment?.start_time)} - {formatTime(appointment?.end_time)}
                </p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-2">Service</p>
            <p className="font-medium text-foreground capitalize mb-1">
              {appointment?.treatment_type?.replace('_', ' ')} Treatment
            </p>
            {appointment?.notes && (
              <p className="text-sm text-muted-foreground">{appointment?.notes}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Cost Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Service fee</span>
            <span className="text-foreground">{formatCurrency(servicesCost)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Convenience fee (2%)</span>
            <span className="text-foreground">{formatCurrency(convenienceFee)}</span>
          </div>
          
          {depositRequired > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Deposit required</span>
              <span className="text-foreground">{formatCurrency(depositRequired)}</span>
            </div>
          )}
          
          <div className="border-t border-border pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">
                {depositRequired > 0 ? 'Total due today' : 'Total cost'}
              </span>
              <span className="font-semibold text-foreground text-lg">
                {formatCurrency(depositRequired > 0 ? depositRequired + convenienceFee : totalCost)}
              </span>
            </div>
            {depositRequired > 0 && depositRequired < servicesCost && (
              <p className="text-xs text-muted-foreground mt-1">
                Remaining balance: {formatCurrency(servicesCost - depositRequired)} due at appointment
              </p>
            )}
          </div>
        </div>
        
        {/* Payment Terms */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Payment Terms</p>
              <ul className="space-y-1">
                <li>• Deposits are non-refundable but transferable</li>
                <li>• Full payment due at time of service</li>
                <li>• Cancellation required 48 hours in advance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Treatment Preparation */}
      {preparationInstructions && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="FileText" size={20} className="mr-2" />
            Treatment Preparation
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{preparationInstructions}</p>
            
            {/* Common preparation guidelines */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">General Guidelines:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Arrive 15 minutes early for check-in</li>
                <li>• Bring valid ID and insurance cards</li>
                <li>• Inform us of any medication changes</li>
                <li>• Avoid eating 2 hours before certain procedures</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Patient Information Review */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <Icon name="User" size={20} className="mr-2" />
          Patient Information
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">
                {patient?.first_name} {patient?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Patient ID</p>
              <p className="font-medium text-foreground">{patient?.patient_number}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{patient?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{patient?.phone}</p>
            </div>
          </div>

          {patient?.insurance_provider && patient?.insurance_provider !== 'Private' && (
            <div>
              <p className="text-sm text-muted-foreground">Insurance</p>
              <p className="font-medium text-foreground capitalize">
                {patient?.insurance_provider?.replace('_', ' ')}
                {patient?.insurance_number && ` - ${patient?.insurance_number}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <Icon name="AlertCircle" size={20} className="mr-2" />
          Cancellation Policy
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• 48+ hours notice: Full refund of deposit</p>
          <p>• 24-48 hours notice: 50% refund of deposit</p>
          <p>• Less than 24 hours: No refund, deposit forfeited</p>
          <p>• Emergency cancellations will be reviewed case-by-case</p>
          <div className="mt-3 p-3 bg-muted/30 rounded text-xs">
            <p className="font-medium text-foreground">Contact us:</p>
            <p>{practiceLocation?.phone} | {practiceLocation?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSummary;