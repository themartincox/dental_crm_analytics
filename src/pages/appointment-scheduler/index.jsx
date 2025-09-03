import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import CalendarView from './components/CalendarView';
import AppointmentCard from './components/AppointmentCard';
import BookingModal from './components/BookingModal';

import ReminderSettings from './components/ReminderSettings';
import DepositCollection from './components/DepositCollection';
import { format, isSameDay } from 'date-fns';

const AppointmentScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // day, week, month
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [appointmentType, setAppointmentType] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [dailySchedule, setDailySchedule] = useState([]);
  const [upcomingAlerts, setUpcomingAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedAppointment, setDraggedAppointment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  // Mock providers data
  const providers = [
    { value: 'all', label: 'All Providers' },
    { value: 'dr-smith', label: 'Dr. Sarah Smith' },
    { value: 'dr-johnson', label: 'Dr. Michael Johnson' },
    { value: 'dr-wilson', label: 'Dr. Emma Wilson' }
  ];

  // Mock appointment types
  const appointmentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'followup', label: 'Follow-up' },
    { value: 'surgery', label: 'Surgery' }
  ];

  // Mock appointments data
  const mockAppointments = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      provider: 'dr-smith',
      type: 'consultation',
      date: new Date(2025, 0, 2, 9, 0), // Jan 2, 2025 9:00 AM
      duration: 60,
      status: 'confirmed',
      depositRequired: 50,
      depositPaid: true,
      reminderSent: true,
      notes: 'New patient consultation',
      phone: '+44 7700 900123',
      email: 'sarah.johnson@email.com'
    },
    {
      id: 2,
      patientName: 'Michael Brown',
      patientId: 'P002',
      provider: 'dr-johnson',
      type: 'treatment',
      date: new Date(2025, 0, 2, 10, 30), // Jan 2, 2025 10:30 AM
      duration: 90,
      status: 'confirmed',
      depositRequired: 100,
      depositPaid: false,
      reminderSent: true,
      notes: 'Root canal treatment',
      phone: '+44 7700 900456',
      email: 'michael.brown@email.com'
    },
    {
      id: 3,
      patientName: 'Emma Wilson',
      patientId: 'P003',
      provider: 'dr-smith',
      type: 'cleaning',
      date: new Date(2025, 0, 2, 14, 0), // Jan 2, 2025 2:00 PM
      duration: 45,
      status: 'pending',
      depositRequired: 0,
      depositPaid: false,
      reminderSent: false,
      notes: 'Regular cleaning appointment',
      phone: '+44 7700 900789',
      email: 'emma.wilson@email.com'
    },
    {
      id: 4,
      patientName: 'James Thompson',
      patientId: 'P004',
      provider: 'dr-wilson',
      type: 'followup',
      date: new Date(2025, 0, 3, 11, 0), // Jan 3, 2025 11:00 AM
      duration: 30,
      status: 'confirmed',
      depositRequired: 25,
      depositPaid: true,
      reminderSent: true,
      notes: 'Post-surgery follow-up',
      phone: '+44 7700 900012',
      email: 'james.thompson@email.com'
    },
    {
      id: 5,
      patientName: 'Lisa Davis',
      patientId: 'P005',
      provider: 'dr-smith',
      type: 'surgery',
      date: new Date(2025, 0, 4, 9, 0), // Jan 4, 2025 9:00 AM
      duration: 120,
      status: 'confirmed',
      depositRequired: 200,
      depositPaid: true,
      reminderSent: true,
      notes: 'Wisdom tooth extraction',
      phone: '+44 7700 900345',
      email: 'lisa.davis@email.com'
    }
  ];

  // Mock upcoming alerts
  const mockAlerts = [
    {
      id: 1,
      type: 'checkin',
      message: 'Sarah Johnson checked in for 9:00 AM appointment',
      timestamp: new Date(),
      priority: 'low'
    },
    {
      id: 2,
      type: 'late',
      message: 'Michael Brown is 15 minutes late for appointment',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      priority: 'high'
    },
    {
      id: 3,
      type: 'deposit',
      message: 'Deposit pending for Emma Wilson appointment',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      priority: 'medium'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAppointments(mockAppointments);
      setUpcomingAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter appointments based on selected date and filters
  useEffect(() => {
    if (appointments?.length > 0) {
      const dayAppointments = appointments?.filter(apt => 
        isSameDay(apt?.date, selectedDate) &&
        (selectedProvider === 'all' || apt?.provider === selectedProvider) &&
        (appointmentType === 'all' || apt?.type === appointmentType)
      )?.sort((a, b) => a?.date?.getTime() - b?.date?.getTime());
      
      setDailySchedule(dayAppointments);
    }
  }, [selectedDate, selectedProvider, appointmentType, appointments]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleNewBooking = () => {
    setSelectedAppointment(null);
    setIsBookingModalOpen(true);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setIsBookingModalOpen(true);
  };

  const handleAppointmentCancel = (appointmentId) => {
    setAppointments(prev => prev?.filter(apt => apt?.id !== appointmentId));
    setSelectedAppointment(null);
  };

  const handleBookingSave = (bookingData) => {
    if (selectedAppointment) {
      // Update existing appointment
      setAppointments(prev => prev?.map(apt => 
        apt?.id === selectedAppointment?.id 
          ? { ...apt, ...bookingData }
          : apt
      ));
    } else {
      // Add new appointment
      const newAppointment = {
        ...bookingData,
        id: Date.now(),
        status: 'confirmed',
        reminderSent: false
      };
      setAppointments(prev => [...prev, newAppointment]);
    }
    setIsBookingModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleDragStart = (appointment) => {
    setDraggedAppointment(appointment);
  };

  const handleDrop = (newDate, newTime) => {
    if (draggedAppointment) {
      const updatedAppointment = {
        ...draggedAppointment,
        date: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newTime?.hour || draggedAppointment?.date?.getHours(), newTime?.minute || draggedAppointment?.date?.getMinutes())
      };
      
      setAppointments(prev => prev?.map(apt => 
        apt?.id === draggedAppointment?.id ? updatedAppointment : apt
      ));
      setDraggedAppointment(null);
    }
  };

  const handlePaymentProcess = (appointmentId, amount) => {
    setAppointments(prev => prev?.map(apt => 
      apt?.id === appointmentId 
        ? { ...apt, depositPaid: true }
        : apt
    ));
    setPaymentModalOpen(false);
  };

  const handleReminderSend = (appointmentId, reminderType) => {
    setAppointments(prev => prev?.map(apt => 
      apt?.id === appointmentId 
        ? { ...apt, reminderSent: true }
        : apt
    ));
    setReminderModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'cancelled': return 'bg-error';
      default: return 'bg-muted';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'consultation': return 'bg-primary';
      case 'treatment': return 'bg-accent';
      case 'cleaning': return 'bg-success';
      case 'surgery': return 'bg-error';
      case 'followup': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading appointment schedule...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Appointment Scheduler
            </h1>
            <p className="text-muted-foreground">
              Comprehensive calendar management with automated communication and payments
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" iconName="Calendar" onClick={() => setReminderModalOpen(true)}>
              Reminder Settings
            </Button>
            <Button iconName="Plus" onClick={handleNewBooking} className="bg-primary hover:bg-primary/90">
              Book Appointment
            </Button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
                options={providers}
                placeholder="Select Provider"
                className="w-48"
              />
              <Select
                value={appointmentType}
                onValueChange={setAppointmentType}
                options={appointmentTypes}
                placeholder="Appointment Type"
                className="w-48"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('day')}
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('week')}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('month')}
                >
                  Month
                </Button>
              </div>
              <Button variant="outline" iconName="Download">
                Export
              </Button>
              <Button variant="outline" iconName="Settings">
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Calendar Area - 3 columns */}
          <div className="xl:col-span-3">
            <CalendarView
              viewMode={viewMode}
              selectedDate={selectedDate}
              appointments={appointments}
              onDateChange={handleDateChange}
              onAppointmentClick={handleAppointmentClick}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
            />
          </div>

          {/* Right Panel - 1 column */}
          <div className="xl:col-span-1 space-y-6">
            {/* Daily Schedule Overview */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  Daily Schedule
                </h3>
                <span className="text-sm text-muted-foreground">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </span>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {dailySchedule?.length > 0 ? (
                  dailySchedule?.map((appointment) => (
                    <div
                      key={appointment?.id}
                      className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(appointment?.type)}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {appointment?.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(appointment?.date, 'HH:mm')} - {appointment?.type}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(appointment?.status)}`}></div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Calendar" size={32} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No appointments today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Check-in Status */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Check-in Status</h3>
              <div className="space-y-3">
                {dailySchedule?.filter(apt => apt?.status === 'confirmed')?.map((appointment) => (
                  <div key={appointment?.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{appointment?.patientName}</p>
                      <p className="text-xs text-muted-foreground">{format(appointment?.date, 'HH:mm')}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment?.depositPaid ? (
                        <Icon name="CreditCard" size={14} className="text-success" />
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setPaymentModalOpen(true)}
                        >
                          Collect
                        </Button>
                      )}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(appointment?.status)}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Alerts */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Upcoming Alerts</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {upcomingAlerts?.map((alert) => (
                  <div key={alert?.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert?.priority === 'high' ? 'bg-error' : 
                      alert?.priority === 'medium' ? 'bg-warning' : 'bg-success'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{alert?.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(alert?.timestamp, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Today's Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {dailySchedule?.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Appts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success mb-1">
                    {dailySchedule?.filter(apt => apt?.status === 'confirmed')?.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning mb-1">
                    {dailySchedule?.filter(apt => !apt?.depositPaid && apt?.depositRequired > 0)?.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending Pay</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    £{dailySchedule?.reduce((sum, apt) => sum + (apt?.depositRequired || 0), 0)?.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Expected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && !isBookingModalOpen && (
          <AppointmentCard
            appointment={selectedAppointment}
            onEdit={() => handleAppointmentEdit(selectedAppointment)}
            onCancel={() => handleAppointmentCancel(selectedAppointment?.id)}
            onClose={() => setSelectedAppointment(null)}
            onPayment={() => setPaymentModalOpen(true)}
          />
        )}

        {/* Booking Modal */}
        {isBookingModalOpen && (
          <BookingModal
            appointment={selectedAppointment}
            providers={providers?.filter(p => p?.value !== 'all')}
            appointmentTypes={appointmentTypes?.filter(t => t?.value !== 'all')}
            onSave={handleBookingSave}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedAppointment(null);
            }}
          />
        )}

        {/* Payment Modal */}
        {paymentModalOpen && (
          <DepositCollection
            appointment={selectedAppointment}
            onProcess={handlePaymentProcess}
            onClose={() => setPaymentModalOpen(false)}
          />
        )}

        {/* Reminder Settings Modal */}
        {reminderModalOpen && (
          <ReminderSettings
            onSave={handleReminderSend}
            onClose={() => setReminderModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default AppointmentScheduler;