import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';

import Select from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import Icon from '../../components/AppIcon';
import AppointmentSummary from './components/AppointmentSummary';
import PaymentForm from './components/PaymentForm';
import SecurityIndicators from './components/SecurityIndicators';
import ConfirmationModal from './components/ConfirmationModal';
import AlternativeTimesModal from './components/AlternativeTimesModal';
import { format, addMinutes } from 'date-fns';
import secureApiService from '../../services/secureApiService';

const BookingConfirmationPaymentProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL params from booking flow
  const appointmentId = searchParams?.get('appointmentId');
  const patientId = searchParams?.get('patientId');
  
  // State management
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [provider, setProvider] = useState(null);
  const [practiceLocation, setPracticeLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [availabilityConflict, setAvailabilityConflict] = useState(false);
  const [alternativeTimes, setAlternativeTimes] = useState([]);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  
  // Form state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [savedPayments, setSavedPayments] = useState([]);
  const [selectedSavedPayment, setSelectedSavedPayment] = useState('');
  const [savePayment, setSavePayment] = useState(false);
  const [reminderPreferences, setReminderPreferences] = useState({
    email: true,
    sms: false,
    call: false,
    timeBeforeAppointment: '24'
  });
  const [calendarIntegration, setCalendarIntegration] = useState({
    google: false,
    outlook: false,
    apple: false
  });
  const [referralEnrollment, setReferralEnrollment] = useState(false);
  const [preparationInstructions, setPreparationInstructions] = useState('');
  const [parkingInfo, setParkingInfo] = useState('');
  
  // Payment method options
  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: 'CreditCard' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: 'Building2' },
    { value: 'direct_debit', label: 'Direct Debit', icon: 'PiggyBank' },
    { value: 'finance', label: 'Payment Plan', icon: 'Calendar' },
    { value: 'insurance_claim', label: 'Insurance Claim', icon: 'Shield' }
  ];

  // Reminder timing options
  const reminderTimes = [
    { value: '1', label: '1 hour before' },
    { value: '2', label: '2 hours before' },
    { value: '24', label: '1 day before' },
    { value: '48', label: '2 days before' },
    { value: '168', label: '1 week before' }
  ];

  // Load appointment and related data
  useEffect(() => {
    const loadAppointmentData = async () => {
      if (!appointmentId) {
        navigate('/appointment-scheduler');
        return;
      }

      try {
        setIsLoading(true);
        
        // Load appointment summary via secure API
        const summaryRes = await secureApiService.makeSecureRequest(`/appointments/${appointmentId}/summary`, { method: 'GET' });
        const appointmentData = summaryRes?.data?.appointment || summaryRes?.appointment || null;

        if (!appointmentData) throw new Error('Appointment not found');

        setAppointment(appointmentData);
        setPatient(appointmentData?.patient);
        setProvider(appointmentData?.dentist);
        setPracticeLocation(appointmentData?.practice_location);

        // Load saved payment methods for returning patients
        if (appointmentData?.patient?.id) {
          const paymentsData = (summaryRes?.data?.payments || []);
          if (paymentsData?.length > 0) {
            setSavedPayments(paymentsData?.map(payment => ({
              value: payment?.payment_reference,
              label: `${payment?.payment_method?.toUpperCase()} ending in ${payment?.payment_reference?.slice(-4)}`
            })));
          }
        }

        // Load treatment preparation instructions
        const treatmentData = (summaryRes?.data?.treatments || [])?.[0] || null;
        if (treatmentData) {
          setPreparationInstructions(treatmentData?.notes || treatmentData?.description || '');
        }

        // Check for real-time availability conflicts
        await checkAvailabilityConflicts(appointmentData);

      } catch (error) {
        console.error('Error loading appointment:', error);
        navigate('/appointment-scheduler');
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointmentData();
  }, [appointmentId, navigate]);

  // Check for availability conflicts
  const checkAvailabilityConflicts = async (appointmentData) => {
    try {
      const appointmentStart = new Date(`${appointmentData?.appointment_date}T${appointmentData?.start_time}`);
      const appointmentEnd = new Date(`${appointmentData?.appointment_date}T${appointmentData?.end_time}`);

      // Check for conflicting appointments
      const conflictsRes = await secureApiService.makeSecureRequest(`/appointments/conflicts?dentist_id=${appointmentData?.dentist_id}&appointment_date=${appointmentData?.appointment_date}&exclude_id=${appointmentData?.id}`, { method: 'GET' });
      const conflicts = conflictsRes?.data || [];

      if (conflicts?.length > 0) {
        const hasTimeConflict = conflicts?.some(conflict => {
          const conflictStart = new Date(`${conflict?.appointment_date}T${conflict?.start_time}`);
          const conflictEnd = new Date(`${conflict?.appointment_date}T${conflict?.end_time}`);
          
          return (appointmentStart < conflictEnd && appointmentEnd > conflictStart);
        });

        if (hasTimeConflict) {
          setAvailabilityConflict(true);
          await generateAlternativeTimes(appointmentData);
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  // Generate alternative appointment times
  const generateAlternativeTimes = async (appointmentData) => {
    try {
      const alternatives = [];
      const baseDate = new Date(appointmentData?.appointment_date);
      const duration = calculateDuration(appointmentData?.start_time, appointmentData?.end_time);

      // Generate 5 alternative time slots
      for (let i = 1; i <= 5; i++) {
        const altDate = new Date(baseDate);
        altDate?.setDate(altDate?.getDate() + i);
        
        // Check 9 AM, 11 AM, 2 PM, 4 PM slots
        const timeSlots = ['09:00', '11:00', '14:00', '16:00'];
        
        for (const timeSlot of timeSlots) {
          const availableRes = await secureApiService.makeSecureRequest(`/appointments/availability?dentist_id=${appointmentData?.dentist_id}&date=${format(altDate, 'yyyy-MM-dd')}&start_time=${timeSlot}&duration=${duration}`, { method: 'GET' });
          const available = availableRes?.data || [];

          if (!available?.length && alternatives?.length < 3) {
            alternatives?.push({
              date: altDate,
              time: timeSlot,
              provider: appointmentData?.dentist?.full_name,
              available: true
            });
          }
        }
      }

      setAlternativeTimes(alternatives);
    } catch (error) {
      console.error('Error generating alternatives:', error);
    }
  };

  // Calculate appointment duration in minutes
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.round((end - start) / (1000 * 60));
  };

  // Handle payment processing
  const handlePaymentSubmit = async (e) => {
    e?.preventDefault();
    
    if (availabilityConflict) {
      setShowAlternativesModal(true);
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData = {
        appointment_id: appointment?.id,
        patient_id: patient?.id,
        amount: appointment?.deposit_required || appointment?.estimated_cost,
        payment_method: paymentMethod,
        payment_reference: `PAY${Date.now()}`,
        status: 'paid',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        description: `Deposit for ${appointment?.treatment_type} appointment`
      };

      // Process payment in database
      const { data: payment, error: paymentError } = await secureApiService.makeSecureRequest('/payments', { method: 'POST', body: JSON.stringify(paymentData) });

      if (paymentError) throw paymentError;

      // Update appointment status and deposit status
      const { error: appointmentError } = await secureApiService.makeSecureRequest(`/appointments/${appointment?.id}`, { method: 'PUT', body: JSON.stringify({
          status: 'confirmed',
          deposit_paid: appointment?.deposit_required || appointment?.estimated_cost,
          updated_at: new Date()?.toISOString()
        }) }, 'receptionist');

      if (appointmentError) throw appointmentError;

      // Generate receipt data
      const receipt = {
        paymentReference: payment?.payment_reference,
        amount: payment?.amount,
        paymentMethod: payment?.payment_method,
        date: new Date(),
        appointment: {
          date: appointment?.appointment_date,
          time: appointment?.start_time,
          provider: provider?.full_name,
          treatment: appointment?.treatment_type,
          location: practiceLocation?.name
        },
        patient: {
          name: `${patient?.first_name} ${patient?.last_name}`,
          email: patient?.email
        }
      };

      setReceiptData(receipt);
      setPaymentCompleted(true);
      setShowConfirmationModal(true);

      // Send confirmation email (mock)
      console.log('Sending confirmation email to:', patient?.email);
      console.log('Receipt data:', receipt);

    } catch (error) {
      console.error('Payment processing error:', error);
      // Handle payment error
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle alternative time selection
  const handleAlternativeTimeSelect = async (selectedTime) => {
    try {
      const newDate = format(selectedTime?.date, 'yyyy-MM-dd');
      const newStartTime = selectedTime?.time;
      const duration = calculateDuration(appointment?.start_time, appointment?.end_time);
      const newEndTime = addMinutes(new Date(`2000-01-01T${newStartTime}`), duration)?.toTimeString()?.slice(0, 5);

      // Update appointment time
      const { error } = await secureApiService.makeSecureRequest(`/appointments/${appointment?.id}`, { method: 'PUT', body: JSON.stringify({
          appointment_date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          updated_at: new Date()?.toISOString()
        }) }, 'receptionist');

      if (error) throw error;

      // Update local state
      setAppointment(prev => ({
        ...prev,
        appointment_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime
      }));

      setAvailabilityConflict(false);
      setShowAlternativesModal(false);

      // Continue with payment processing
      handlePaymentSubmit(new Event('submit'));

    } catch (error) {
      console.error('Error updating appointment time:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading appointment details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Booking Confirmation & Payment
          </h1>
          <p className="text-muted-foreground">
            Secure payment processing for your dental appointment
          </p>
        </div>

        {/* Security Indicators */}
        <SecurityIndicators />

        {/* 8-Column Centered Layout */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Appointment Summary */}
            <div className="space-y-6">
              <AppointmentSummary
                appointment={appointment}
                patient={patient}
                provider={provider}
                practiceLocation={practiceLocation}
                preparationInstructions={preparationInstructions}
                parkingInfo={parkingInfo}
                availabilityConflict={availabilityConflict}
              />

              {/* Office Location & Contact */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="MapPin" size={20} className="mr-2" />
                  Office Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-foreground">{practiceLocation?.name}</p>
                    <p className="text-sm text-muted-foreground">{practiceLocation?.address}</p>
                    <p className="text-sm text-muted-foreground">{practiceLocation?.postcode}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon name="Phone" size={16} className="mr-1" />
                      {practiceLocation?.phone}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon name="Mail" size={16} className="mr-1" />
                      {practiceLocation?.email}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Icon name="Navigation" size={16} className="mr-2" />
                    Get Directions
                  </Button>
                </div>
              </div>

              {/* Parking Information */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Car" size={20} className="mr-2" />
                  Parking Information
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Free patient parking available on-site. Enter through main reception for validation.
                  </p>
                  <div className="flex items-center text-sm text-success">
                    <Icon name="CheckCircle" size={16} className="mr-1" />
                    Wheelchair accessible parking
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Processing */}
            <div className="space-y-6">
              <PaymentForm
                appointment={appointment}
                paymentMethods={paymentMethods}
                savedPayments={savedPayments}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                selectedSavedPayment={selectedSavedPayment}
                setSelectedSavedPayment={setSelectedSavedPayment}
                cardDetails={cardDetails}
                setCardDetails={setCardDetails}
                savePayment={savePayment}
                setSavePayment={setSavePayment}
                isProcessingPayment={isProcessingPayment}
                onSubmit={handlePaymentSubmit}
              />

              {/* Reminder Preferences */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Bell" size={20} className="mr-2" />
                  Reminder Preferences
                </h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Checkbox
                      checked={reminderPreferences?.email}
                      onChange={(checked) => setReminderPreferences(prev => ({ ...prev, email: checked }))}
                      label="Email reminders"
                    />
                    <Checkbox
                      checked={reminderPreferences?.sms}
                      onChange={(checked) => setReminderPreferences(prev => ({ ...prev, sms: checked }))}
                      label="SMS reminders"
                    />
                    <Checkbox
                      checked={reminderPreferences?.call}
                      onChange={(checked) => setReminderPreferences(prev => ({ ...prev, call: checked }))}
                      label="Phone call reminders"
                    />
                  </div>
                  <Select
                    value={reminderPreferences?.timeBeforeAppointment}
                    onValueChange={(value) => setReminderPreferences(prev => ({ ...prev, timeBeforeAppointment: value }))}
                    options={reminderTimes}
                    placeholder="When to remind"
                    label="Reminder timing"
                  />
                </div>
              </div>

              {/* Calendar Integration */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Calendar" size={20} className="mr-2" />
                  Calendar Integration
                </h3>
                <div className="space-y-3">
                  <Checkbox
                    checked={calendarIntegration?.google}
                    onChange={(checked) => setCalendarIntegration(prev => ({ ...prev, google: checked }))}
                    label="Add to Google Calendar"
                  />
                  <Checkbox
                    checked={calendarIntegration?.outlook}
                    onChange={(checked) => setCalendarIntegration(prev => ({ ...prev, outlook: checked }))}
                    label="Add to Outlook Calendar"
                  />
                  <Checkbox
                    checked={calendarIntegration?.apple}
                    onChange={(checked) => setCalendarIntegration(prev => ({ ...prev, apple: checked }))}
                    label="Add to Apple Calendar"
                  />
                </div>
              </div>

              {/* Referral Program */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Users" size={20} className="mr-2" />
                  Referral Program
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Refer friends and family for exclusive benefits and discounts on future treatments.
                  </p>
                  <Checkbox
                    checked={referralEnrollment}
                    onChange={setReferralEnrollment}
                    label="Enroll in referral program"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Times Modal */}
        {showAlternativesModal && (
          <AlternativeTimesModal
            alternativeTimes={alternativeTimes}
            onSelect={handleAlternativeTimeSelect}
            onClose={() => setShowAlternativesModal(false)}
          />
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <ConfirmationModal
            receiptData={receiptData}
            appointment={appointment}
            onClose={() => {
              setShowConfirmationModal(false);
              navigate('/appointment-scheduler');
            }}
          />
        )}
      </main>
    </div>
  );
};

export default BookingConfirmationPaymentProcessing;
