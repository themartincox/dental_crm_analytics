import React, { useState, useEffect } from 'react';

import { Check, Calendar, Clock, CreditCard, Shield, Star, MapPin, Phone, Mail } from 'lucide-react';


import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import GDCFooter from '../../components/GDCFooter';
import ServiceSelection from './components/ServiceSelection';
import DentistSelection from './components/DentistSelection';
import TimeSlotSelection from './components/TimeSlotSelection';
import PatientInformation from './components/PatientInformation';
import PaymentForm from './components/PaymentForm';
import BookingConfirmation from './components/BookingConfirmation';

const PublicBookingInterface = ({ showGDCInfo = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    service: null,
    dentist: null,
    dateTime: null,
    patientInfo: null,
    paymentInfo: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock practice data - would come from API
  const practiceInfo = {
    name: "Central Dental Practice",
    address: "123 High Street, London SW1A 1AA",
    phone: "+44 20 7123 4567",
    email: "bookings@centraldental.co.uk",
    rating: 4.8,
    reviewCount: 247
  };

  // Mock services data
  const services = [
    {
      id: 'consultation',
      name: 'Initial Consultation',
      description: 'Comprehensive dental examination with X-rays and treatment planning',
      duration: 60,
      priceFrom: 75,
      popular: true,
      image: 'consultation.jpg'
    },
    {
      id: 'cleaning',
      name: 'Professional Cleaning',
      description: 'Deep cleaning and polishing to maintain optimal oral health',
      duration: 45,
      priceFrom: 85,
      popular: true,
      image: 'cleaning.jpg'
    },
    {
      id: 'whitening',
      name: 'Teeth Whitening',
      description: 'Professional whitening treatment for a brighter smile',
      duration: 90,
      priceFrom: 295,
      popular: false,
      image: 'whitening.jpg'
    },
    {
      id: 'filling',
      name: 'Dental Filling',
      description: 'Tooth-colored fillings to restore damaged teeth',
      duration: 60,
      priceFrom: 120,
      popular: false,
      image: 'filling.jpg'
    },
    {
      id: 'crown',
      name: 'Dental Crown',
      description: 'Custom crown to protect and strengthen damaged teeth',
      duration: 120,
      priceFrom: 450,
      popular: false,
      image: 'crown.jpg'
    },
    {
      id: 'implant',
      name: 'Dental Implant',
      description: 'Permanent tooth replacement with titanium implant',
      duration: 180,
      priceFrom: 1200,
      popular: false,
      image: 'implant.jpg'
    }
  ];

  // Mock dentists data
  const dentists = [
    {
      id: 'dr-smith',
      name: 'Dr. Sarah Smith',
      title: 'Principal Dentist',
      specializations: ['General Dentistry', 'Cosmetic Dentistry', 'Implants'],
      experience: 12,
      qualifications: ['BDS', 'MSc Implantology'],
      rating: 4.9,
      reviewCount: 124,
      image: 'dr-smith.jpg',
      nextAvailable: new Date(2025, 0, 3, 9, 0),
      priceMultiplier: 1.2
    },
    {
      id: 'dr-johnson',
      name: 'Dr. Michael Johnson',
      title: 'Senior Dentist',
      specializations: ['General Dentistry', 'Orthodontics', 'Endodontics'],
      experience: 8,
      qualifications: ['BDS', 'PgCert Orthodontics'],
      rating: 4.8,
      reviewCount: 98,
      image: 'dr-johnson.jpg',
      nextAvailable: new Date(2025, 0, 2, 14, 0),
      priceMultiplier: 1.0
    },
    {
      id: 'dr-wilson',
      name: 'Dr. Emma Wilson',
      title: 'Associate Dentist',
      specializations: ['General Dentistry', 'Pediatric Dentistry', 'Preventive Care'],
      experience: 5,
      qualifications: ['BDS', 'Dip Pediatric Dentistry'],
      rating: 4.7,
      reviewCount: 67,
      image: 'dr-wilson.jpg',
      nextAvailable: new Date(2025, 0, 2, 10, 30),
      priceMultiplier: 0.9
    }
  ];

  // Steps configuration
  const steps = [
    { id: 1, title: 'Select Service', icon: 'List' },
    { id: 2, title: 'Choose Dentist', icon: 'User' },
    { id: 3, title: 'Pick Time', icon: 'Calendar' },
    { id: 4, title: 'Your Details', icon: 'UserCheck' },
    { id: 5, title: 'Payment', icon: 'CreditCard' },
    { id: 6, title: 'Confirmation', icon: 'CheckCircle' }
  ];

  // Generate available time slots based on selected date and dentist
  useEffect(() => {
    if (bookingData?.dentist && selectedDate) {
      generateAvailableSlots();
    }
  }, [bookingData?.dentist, selectedDate]);

  const generateAvailableSlots = () => {
    // Mock slot generation - would come from real availability API
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    const slotDuration = bookingData?.service?.duration || 60;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 12 && minute === 0) continue; // Lunch break
        if (hour === 12 && minute === 30) continue; // Lunch break
        
        const slotTime = new Date(selectedDate);
        slotTime?.setHours(hour, minute, 0, 0);
        
        // Randomly mark some slots as unavailable (simulating bookings)
        const isAvailable = Math.random() > 0.3;
        
        slots?.push({
          time: slotTime,
          available: isAvailable,
          price: calculateSlotPrice(slotTime)
        });
      }
    }
    
    setAvailableSlots(slots);
  };

  const calculateSlotPrice = (slotTime) => {
    if (!bookingData?.service || !bookingData?.dentist) return 0;
    
    const basePrice = bookingData?.service?.priceFrom;
    const dentistMultiplier = bookingData?.dentist?.priceMultiplier || 1.0;
    
    // Peak time pricing (evening slots cost more)
    let hour = slotTime?.getHours();
    const peakMultiplier = hour >= 16 ? 1.15 : 1.0;
    
    return Math.round(basePrice * dentistMultiplier * peakMultiplier);
  };

  const handleStepComplete = (stepData) => {
    setBookingData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < steps?.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const renderProgressBar = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps?.map((step, index) => (
          <div key={step?.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
              step?.id <= currentStep
                ? 'bg-primary text-white' :'bg-gray-100 text-gray-400'
            }`}>
              {step?.id < currentStep ? (
                <Check size={16} />
              ) : (
                <Icon name={step?.icon} size={16} />
              )}
            </div>
            <div className="ml-3 hidden sm:block">
              <div className={`text-sm font-medium ${
                step?.id <= currentStep ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step?.title}
              </div>
            </div>
            {index < steps?.length - 1 && (
              <div className={`w-full h-px mx-4 ${
                step?.id < currentStep ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPracticeHeader = () => (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-bold">{practiceInfo?.name}</h1>
            </div>
            <div className="flex items-center gap-6 text-white/90 mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="text-sm">{practiceInfo?.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span className="text-sm">{practiceInfo?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span className="text-sm">{practiceInfo?.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)]?.map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < Math.floor(practiceInfo?.rating)
                        ? 'text-yellow-400 fill-current' :'text-white/40'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">
                {practiceInfo?.rating} ({practiceInfo?.reviewCount} reviews)
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
              <Shield className="w-6 h-6" />
              <div className="text-sm">
                <div className="font-medium">Secure Booking</div>
                <div className="text-white/80">Your data is protected</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
              <Calendar className="w-6 h-6" />
              <div className="text-sm">
                <div className="font-medium">Easy Rescheduling</div>
                <div className="text-white/80">Change anytime online</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            services={services}
            selectedService={bookingData?.service}
            onServiceSelect={(service) => handleStepComplete({ service })}
          />
        );
      case 2:
        return (
          <DentistSelection
            dentists={dentists?.filter(d => 
              !bookingData?.service?.specializations ||
              d?.specializations?.some(spec => 
                bookingData?.service?.specializations?.includes(spec)
              )
            )}
            selectedDentist={bookingData?.dentist}
            selectedService={bookingData?.service}
            onDentistSelect={(dentist) => handleStepComplete({ dentist })}
            onBack={handleBackStep}
          />
        );
      case 3:
        return (
          <TimeSlotSelection
            selectedDate={selectedDate}
            availableSlots={availableSlots}
            selectedService={bookingData?.service}
            selectedDentist={bookingData?.dentist}
            onDateSelect={handleDateSelect}
            onTimeSelect={(dateTime) => handleStepComplete({ dateTime })}
            onBack={handleBackStep}
            calculatePrice={calculateSlotPrice}
          />
        );
      case 4:
        return (
          <PatientInformation
            initialData={bookingData?.patientInfo}
            onComplete={(patientInfo) => handleStepComplete({ patientInfo })}
            onBack={handleBackStep}
          />
        );
      case 5:
        return (
          <PaymentForm
            bookingData={bookingData}
            onPaymentComplete={(paymentInfo) => handleStepComplete({ paymentInfo })}
            onBack={handleBackStep}
          />
        );
      case 6:
        return (
          <BookingConfirmation
            bookingData={bookingData}
            practiceInfo={practiceInfo}
            onNewBooking={() => {
              setCurrentStep(1);
              setBookingData({
                service: null,
                dentist: null,
                dateTime: null,
                patientInfo: null,
                paymentInfo: null
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Practice Header */}
      {renderPracticeHeader()}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {renderStepContent()}
        </div>

        {/* Trust Indicators */}
        {currentStep < 6 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <div className="font-medium text-gray-900">Secure & Private</div>
                <div className="text-sm text-gray-500">Your information is protected</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <div className="font-medium text-gray-900">Quick & Easy</div>
                <div className="text-sm text-gray-500">Book in just 5 minutes</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <div className="font-medium text-gray-900">Flexible Payment</div>
                <div className="text-sm text-gray-500">Pay online or at appointment</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Conditionally render GDC Footer */}
      {showGDCInfo && <GDCFooter />}
    </div>
  );
};

export default PublicBookingInterface;