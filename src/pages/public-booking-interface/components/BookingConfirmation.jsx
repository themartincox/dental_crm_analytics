import React from 'react';
import { format, addMinutes } from 'date-fns';
import { CheckCircle, Calendar, MapPin, Phone, Mail, Download, Clock, CreditCard, User } from 'lucide-react';
import Button from '../../../components/ui/Button';

const BookingConfirmation = ({ bookingData, practiceInfo, onNewBooking }) => {
  const appointmentDateTime = bookingData?.dateTime?.dateTime;
  const appointmentEnd = addMinutes(appointmentDateTime, bookingData?.service?.duration);
  
  const handleDownloadReceipt = () => {
    // Mock download functionality
    console.log('Downloading receipt...');
  };

  const handleAddToCalendar = () => {
    // Generate calendar event
    const startTime = format(appointmentDateTime, "yyyyMMdd'T'HHmmss");
    const endTime = format(appointmentEnd, "yyyyMMdd'T'HHmmss");
    
    const calendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:Dental Appointment - ${bookingData?.service?.name}
DESCRIPTION:Appointment with ${bookingData?.dentist?.name} at ${practiceInfo?.name}
LOCATION:${practiceInfo?.address}
END:VEVENT
END:VCALENDAR`;
    
    const link = document.createElement('a');
    link.href = encodeURI(calendarUrl);
    link.download = 'dental-appointment.ics';
    link?.click();
  };

  const generateBookingReference = () => {
    return `DEN-${Date.now()?.toString()?.slice(-8)}`;
  };

  const bookingReference = generateBookingReference();

  return (
    <div className="p-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-lg text-gray-600">
          Your appointment has been successfully booked and confirmed.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-full">
          <span className="font-medium">Booking Reference: {bookingReference}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Details */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Service</div>
                  <div className="font-medium text-gray-900">{bookingData?.service?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="font-medium text-gray-900">{bookingData?.service?.duration} minutes</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Dentist</div>
                <div className="font-medium text-gray-900">{bookingData?.dentist?.name}</div>
                <div className="text-sm text-gray-600">{bookingData?.dentist?.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Date</div>
                  <div className="font-medium text-gray-900">
                    {format(appointmentDateTime, 'EEEE, MMMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Time</div>
                  <div className="font-medium text-gray-900">
                    {format(appointmentDateTime, 'HH:mm')} - {format(appointmentEnd, 'HH:mm')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="font-medium text-gray-900">
                  {bookingData?.patientInfo?.firstName} {bookingData?.patientInfo?.lastName}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Email</div>
                  <div className="font-medium break-all">{bookingData?.patientInfo?.email}</div>
                </div>
                <div>
                  <div className="text-gray-600">Phone</div>
                  <div className="font-medium">{bookingData?.patientInfo?.phone}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium capitalize">{bookingData?.paymentInfo?.method}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">£{bookingData?.paymentInfo?.amount}</span>
              </div>
              
              {bookingData?.paymentInfo?.remainingAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Balance</span>
                  <span className="font-medium text-orange-600">£{bookingData?.paymentInfo?.remainingAmount}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-medium text-xs">{bookingData?.paymentInfo?.transactionId}</span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle size={16} />
                  <span>Payment Successful</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Information & Actions */}
        <div className="space-y-6">
          {/* Practice Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Practice Location</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="font-medium text-gray-900 mb-1">{practiceInfo?.name}</div>
                <div className="text-sm text-gray-600">{practiceInfo?.address}</div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span>{practiceInfo?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span>{practiceInfo?.email}</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-3">
                Get Directions
              </Button>
            </div>
          </div>

          {/* Important Reminders */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Before Your Appointment</h3>
            </div>

            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Arrive 15 minutes early for check-in</li>
              <li>• Bring a valid form of ID</li>
              <li>• Bring your insurance information if applicable</li>
              <li>• Please eat a light meal beforehand</li>
              <li>• Avoid alcohol 24 hours before treatment</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCalendar}
              variant="outline"
              className="w-full"
              iconName="Calendar"
            >
              Add to Calendar
            </Button>
            
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="w-full"
              iconName="Download"
            >
              Download Receipt
            </Button>
            
            <Button
              onClick={onNewBooking}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Book Another Appointment
            </Button>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Need to Make Changes?</h4>
            <p className="text-sm text-gray-600 mb-3">
              If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                Call Practice: {practiceInfo?.phone}
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Email: {practiceInfo?.email}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Notification Notice */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-900">Confirmation Email Sent</span>
        </div>
        <p className="text-sm text-green-800">
          A confirmation email with all the details has been sent to{' '}
          <span className="font-medium break-all">{bookingData?.patientInfo?.email}</span>.
          Please check your inbox and add our email to your contacts to ensure you receive appointment reminders.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;