import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { format } from 'date-fns';

const ConfirmationModal = ({ receiptData, appointment, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    })?.format(amount);
  };

  const downloadReceipt = () => {
    // Generate receipt download
    const receiptContent = `
      APPOINTMENT CONFIRMATION RECEIPT
      ================================
      
      Payment Reference: ${receiptData?.paymentReference}
      Date: ${format(receiptData?.date, 'dd/MM/yyyy HH:mm')}
      Amount: ${formatCurrency(receiptData?.amount)}
      Payment Method: ${receiptData?.paymentMethod?.toUpperCase()}
      
      APPOINTMENT DETAILS
      ===================
      Date: ${format(new Date(receiptData?.appointment?.date), 'EEEE, dd MMMM yyyy')}
      Time: ${receiptData?.appointment?.time}
      Provider: ${receiptData?.appointment?.provider}
      Treatment: ${receiptData?.appointment?.treatment}
      Location: ${receiptData?.appointment?.location}
      
      PATIENT INFORMATION
      ===================
      Name: ${receiptData?.patient?.name}
      Email: ${receiptData?.patient?.email}
      
      Thank you for choosing our dental practice!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `receipt-${receiptData?.paymentReference}.txt`;
    document.body?.appendChild(a);
    a?.click();
    window.URL?.revokeObjectURL(url);
    document.body?.removeChild(a);
  };

  const addToCalendar = (type) => {
    const appointmentDate = new Date(receiptData?.appointment?.date + 'T' + receiptData?.appointment?.time);
    const endDate = new Date(appointmentDate.getTime() + (60 * 60 * 1000)); // 1 hour duration
    
    const title = `Dental Appointment - ${receiptData?.appointment?.treatment}`;
    const details = `Appointment with ${receiptData?.appointment?.provider} at ${receiptData?.appointment?.location}`;
    const location = receiptData?.appointment?.location;
    
    const formatDate = (date) => {
      return date?.toISOString()?.replace(/[-:]/g, '')?.replace(/\.\d{3}/, '');
    };
    
    if (type === 'google') {
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(appointmentDate)}/${formatDate(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      window.open(googleUrl, '_blank');
    } else if (type === 'outlook') {
      const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${formatDate(appointmentDate)}&enddt=${formatDate(endDate)}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      window.open(outlookUrl, '_blank');
    } else if (type === 'apple') {
      // Generate ICS file for Apple Calendar
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Dental Practice//EN
BEGIN:VEVENT
DTSTART:${formatDate(appointmentDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${details}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
      
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = window.URL?.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'appointment.ics';
      document.body?.appendChild(a);
      a?.click();
      window.URL?.revokeObjectURL(url);
      document.body?.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground">Your appointment has been confirmed</p>
        </div>

        {/* Receipt Details */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Receipt" size={20} className="mr-2" />
            Payment Receipt
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Reference:</span>
              <span className="font-mono text-foreground">{receiptData?.paymentReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-semibold text-foreground">{formatCurrency(receiptData?.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="text-foreground capitalize">{receiptData?.paymentMethod?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Date:</span>
              <span className="text-foreground">{format(receiptData?.date, 'dd/MM/yyyy HH:mm')}</span>
            </div>
          </div>
        </div>

        {/* Appointment Summary */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Calendar" size={20} className="mr-2" />
            Appointment Confirmed
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-semibold text-foreground">
                {format(new Date(receiptData?.appointment?.date), 'EEEE, dd MMMM yyyy')}
              </p>
              <p className="text-foreground">{receiptData?.appointment?.time}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-semibold text-foreground">{receiptData?.appointment?.provider}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Treatment</p>
              <p className="font-semibold text-foreground capitalize">{receiptData?.appointment?.treatment}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold text-foreground">{receiptData?.appointment?.location}</p>
            </div>
          </div>
        </div>

        {/* Digital Wallet Integration */}
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-3">Add to Calendar</h4>
          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addToCalendar('google')}
              className="flex items-center justify-center"
            >
              <Icon name="Calendar" size={16} className="mr-1" />
              Google
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addToCalendar('outlook')}
              className="flex items-center justify-center"
            >
              <Icon name="Calendar" size={16} className="mr-1" />
              Outlook
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addToCalendar('apple')}
              className="flex items-center justify-center"
            >
              <Icon name="Calendar" size={16} className="mr-1" />
              Apple
            </Button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-foreground mb-3 flex items-center">
            <Icon name="CheckSquare" size={18} className="mr-2" />
            What happens next?
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <Icon name="Mail" size={14} className="mr-2 mt-0.5 text-primary" />
              You'll receive a confirmation email with appointment details
            </li>
            <li className="flex items-start">
              <Icon name="Bell" size={14} className="mr-2 mt-0.5 text-primary" />
              We'll send reminders based on your preferences
            </li>
            <li className="flex items-start">
              <Icon name="Phone" size={14} className="mr-2 mt-0.5 text-primary" />
              Our team may contact you for pre-appointment instructions
            </li>
            <li className="flex items-start">
              <Icon name="MapPin" size={14} className="mr-2 mt-0.5 text-primary" />
              Arrive 15 minutes early for check-in and preparation
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={downloadReceipt} variant="outline" className="flex-1">
            <Icon name="Download" size={18} className="mr-2" />
            Download Receipt
          </Button>
          <Button onClick={onClose} className="flex-1">
            <Icon name="ArrowRight" size={18} className="mr-2" />
            Continue to Dashboard
          </Button>
        </div>

        {/* Contact Information */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at <span className="font-semibold text-foreground">08007723291</span> or{' '}
            <span className="font-semibold text-foreground">info@centraldental.co.uk</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;