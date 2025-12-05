import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { format } from 'date-fns';

const BookingModal = ({ 
  appointment, 
  providers, 
  appointmentTypes, 
  onSave, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    phone: '',
    email: '',
    provider: '',
    type: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 60,
    notes: '',
    depositRequired: 0,
    isRecurring: false,
    recurringType: 'weekly',
    recurringEnd: ''
  });

  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientName: appointment?.patientName || '',
        patientId: appointment?.patientId || '',
        phone: appointment?.phone || '',
        email: appointment?.email || '',
        provider: appointment?.provider || '',
        type: appointment?.type || '',
        date: appointment?.date ? format(appointment?.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        time: appointment?.date ? format(appointment?.date, 'HH:mm') : '09:00',
        duration: appointment?.duration || 60,
        notes: appointment?.notes || '',
        depositRequired: appointment?.depositRequired || 0,
        isRecurring: false,
        recurringType: 'weekly',
        recurringEnd: ''
      });
    }
  }, [appointment]);

  // Mock time slots
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // Start from 8 AM
    const minute = (i % 2) * 30;
    const time = `${hour?.toString()?.padStart(2, '0')}:${minute?.toString()?.padStart(2, '0')}`;
    return { value: time, label: time };
  });

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  const recurringOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ .....prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ .....prev, [field]: '' }));
    }

    // Auto-calculate deposit based on treatment type
    if (field === 'type') {
      const depositAmounts = {
        consultation: 50,
        cleaning: 0,
        treatment: 100,
        surgery: 200,
        followup: 25
      };
      setFormData(prev => ({ 
        ...prev, 
        depositRequired: depositAmounts?.[value] || 0 
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.patientName?.trim()) {
      newErrors.patientName = 'Patient name is required';
    }

    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData?.email?.trim() || !formData?.email?.includes('@')) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData?.provider) {
      newErrors.provider = 'Provider is required';
    }

    if (!formData?.type) {
      newErrors.type = 'Appointment type is required';
    }

    if (!formData?.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData?.time) {
      newErrors.time = 'Time is required';
    }

    if (formData?.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const appointmentDateTime = new Date(`${formData?.date}T${formData?.time}`);
    
    const bookingData = {
      .formData,
      date: appointmentDateTime,
      patientId: formData?.patientId || `P${Date.now()}`,
      status: 'pending',
      depositPaid: false,
      reminderSent: false
    };

    onSave(bookingData);
  };

  const checkAvailability = () => {
    // Mock availability check
    const mockSlots = [
      { time: '09:00', available: true },
      { time: '09:30', available: false, reason: 'Dr. Smith unavailable' },
      { time: '10:00', available: true },
      { time: '10:30', available: true },
      { time: '11:00', available: false, reason: 'Existing appointment' },
    ];
    setAvailableSlots(mockSlots);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {appointment ? 'Reschedule Appointment' : 'Book New Appointment'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Patient Information */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-foreground border-b border-border pb-2">
              Patient Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Patient Name *
                </label>
                <Input
                  value={formData?.patientName}
                  onChange={(e) => handleChange('patientName', e?.target?.value)}
                  placeholder="Enter patient name"
                  error={errors?.patientName}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Patient ID
                </label>
                <Input
                  value={formData?.patientId}
                  onChange={(e) => handleChange('patientId', e?.target?.value)}
                  placeholder="Auto-generated"
                  disabled={!appointment}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Phone Number *
                </label>
                <Input
                  value={formData?.phone}
                  onChange={(e) => handleChange('phone', e?.target?.value)}
                  placeholder="+44 7700 900000"
                  error={errors?.phone}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData?.email}
                  onChange={(e) => handleChange('email', e?.target?.value)}
                  placeholder="patient@email.com"
                  error={errors?.email}
                />
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-foreground border-b border-border pb-2">
              Appointment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Provider *
                </label>
                <Select
                  value={formData?.provider}
                  onValueChange={(value) => handleChange('provider', value)}
                  options={providers}
                  placeholder="Select provider"
                  error={errors?.provider}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Treatment Type *
                </label>
                <Select
                  value={formData?.type}
                  onValueChange={(value) => handleChange('type', value)}
                  options={appointmentTypes}
                  placeholder="Select treatment type"
                  error={errors?.type}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData?.date}
                  onChange={(e) => handleChange('date', e?.target?.value)}
                  error={errors?.date}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Time *
                </label>
                <Select
                  value={formData?.time}
                  onValueChange={(value) => handleChange('time', value)}
                  options={timeSlots}
                  placeholder="Select time"
                  error={errors?.time}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Duration
                </label>
                <Select
                  value={formData?.duration}
                  onValueChange={(value) => handleChange('duration', parseInt(value))}
                  options={durationOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Deposit Required
                </label>
                <Input
                  type="number"
                  value={formData?.depositRequired}
                  onChange={(e) => handleChange('depositRequired', parseFloat(e?.target?.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Availability Check */}
            <div className="mt-4">
              <Button variant="outline" onClick={checkAvailability}>
                <Icon name="Clock" size={16} />
                Check Availability
              </Button>
            </div>

            {/* Recurring Appointment */}
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData?.isRecurring}
                  onChange={(e) => handleChange('isRecurring', e?.target?.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-foreground">
                  Recurring Appointment
                </label>
              </div>

              {formData?.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Frequency
                    </label>
                    <Select
                      value={formData?.recurringType}
                      onValueChange={(value) => handleChange('recurringType', value)}
                      options={recurringOptions}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={formData?.recurringEnd}
                      onChange={(e) => handleChange('recurringEnd', e?.target?.value)}
                      min={formData?.date}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Notes
              </label>
              <textarea
                value={formData?.notes}
                onChange={(e) => handleChange('notes', e?.target?.value)}
                placeholder="Add any special notes or instructions."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Conflicts Warning */}
          {conflicts?.length > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning mb-2">Scheduling Conflicts Detected</h4>
                  <ul className="text-sm text-warning space-y-1">
                    {conflicts?.map((conflict, index) => (
                      <li key={index}>• {conflict}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              {appointment ? 'Update Appointment' : 'Book Appointment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;