import React, { useState, useEffect, useRef } from 'react';
import { Check, Calendar, Shield, X, Minimize2, Maximize2 } from 'lucide-react';

import ServiceSelection from '../public-booking-interface/components/ServiceSelection';
import TimeSlotSelection from '../public-booking-interface/components/TimeSlotSelection';
import PatientInformation from '../public-booking-interface/components/PatientInformation';
import PaymentForm from '../public-booking-interface/components/PaymentForm';
import BookingConfirmation from '../public-booking-interface/components/BookingConfirmation';
import GDCFooter from '../../components/GDCFooter';

const EmbeddableBookingWidget = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [practiceData, setPracticeData] = useState({});
  const [bookingData, setBookingData] = useState({
    service: null,
    dentist: null,
    dateTime: null,
    patientInfo: null,
    paymentInfo: null
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const widgetRef = useRef(null);

  // Add handlePostMessage function declaration here before it's used
  const handlePostMessage = (event) => {
    // Security check
    if (widgetConfig?.allowedOrigins && 
        !widgetConfig?.allowedOrigins?.includes('*') && 
        !widgetConfig?.allowedOrigins?.includes(event?.origin)) {
      return;
    }

    const { type, data } = event?.data;

    switch (type) {
      case 'widget:updateConfig':
        setWidgetConfig(prev => ({ .....prev, .data }));
        if (data?.theme) applyTheme(data?.theme);
        break;
      case 'widget:minimize':
        setIsMinimized(true);
        break;
      case 'widget:maximize':
        setIsMinimized(false);
        break;
      case 'widget:resize':
        handleResize(data);
        break;
      case 'widget:reset':
        resetBooking();
        break;
      default:
        break;
    }
  };

  // Initialize widget from URL parameters or PostMessage
  useEffect(() => {
    initializeWidget();
    setupPostMessageListener();
    setupCrossOriginSecurity();
    
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

  const initializeWidget = () => {
    // Extract configuration from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const practiceId = urlParams?.get('practiceId');
    const theme = urlParams?.get('theme');
    const services = urlParams?.get('services');
    const language = urlParams?.get('language') || 'en';

    // Load configuration
    const config = {
      practiceId,
      theme: theme ? JSON.parse(decodeURIComponent(theme)) : getDefaultTheme(),
      allowedServices: services ? services?.split(',') : null,
      language,
      autoResize: urlParams?.get('autoResize') !== 'false',
      showHeader: urlParams?.get('showHeader') !== 'false',
      showGDCInfo: urlParams?.get('showGDCInfo') === 'true',
      enableAnalytics: urlParams?.get('analytics') !== 'false'
    };

    setWidgetConfig(config);
    loadPracticeData(practiceId);
    applyTheme(config?.theme);
    
    // Send initialization confirmation to parent
    postMessageToParent('widget:initialized', { config });
  };

  const getDefaultTheme = () => ({
    primaryColor: '#0066cc',
    secondaryColor: '#004499',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderRadius: '8px',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    spacing: '16px'
  });

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.style?.setProperty('--widget-primary', theme?.primaryColor);
    root.style?.setProperty('--widget-secondary', theme?.secondaryColor);
    root.style?.setProperty('--widget-background', theme?.backgroundColor);
    root.style?.setProperty('--widget-text', theme?.textColor);
    root.style?.setProperty('--widget-radius', theme?.borderRadius);
    root.style?.setProperty('--widget-font', theme?.fontFamily);
    root.style?.setProperty('--widget-font-size', theme?.fontSize);
    root.style?.setProperty('--widget-spacing', theme?.spacing);
  };

  const loadPracticeData = async (practiceId) => {
    try {
      // Mock API call - replace with actual API
      const mockPracticeData = {
        id: practiceId,
        name: "Central Dental Practice",
        address: "123 High Street, London SW1A 1AA",
        phone: "+44 20 7123 4567",
        email: "bookings@centraldental.co.uk",
        rating: 4.8,
        reviewCount: 247,
        services: [
          // Preventive Care
          {
            id: 'consultation',
            name: 'Initial Consultation',
            description: 'Comprehensive dental examination and treatment planning',
            duration: 60,
            priceFrom: 75,
            popular: true,
            category: 'preventive'
          },
          {
            id: 'cleaning',
            name: 'Professional Cleaning',
            description: 'Deep cleaning and polishing with plaque removal',
            duration: 45,
            priceFrom: 85,
            popular: true,
            category: 'preventive'
          },
          {
            id: 'checkup',
            name: 'Dental Check-up',
            description: 'Routine examination and oral health assessment',
            duration: 30,
            priceFrom: 55,
            popular: false,
            category: 'preventive'
          },
          {
            id: 'fluoride-treatment',
            name: 'Fluoride Treatment',
            description: 'Protective fluoride application for cavity prevention',
            duration: 20,
            priceFrom: 35,
            popular: false,
            category: 'preventive'
          },
          
          // Restorative Treatments
          {
            id: 'filling',
            name: 'Dental Filling',
            description: 'Tooth-colored composite or amalgam fillings',
            duration: 45,
            priceFrom: 95,
            popular: true,
            category: 'restorative'
          },
          {
            id: 'crown',
            name: 'Dental Crown',
            description: 'Custom-fitted cap to restore damaged teeth',
            duration: 90,
            priceFrom: 450,
            popular: false,
            category: 'restorative'
          },
          {
            id: 'root-canal',
            name: 'Root Canal Treatment',
            description: 'Endodontic therapy to save infected teeth',
            duration: 120,
            priceFrom: 350,
            popular: false,
            category: 'restorative'
          },
          {
            id: 'bridge',
            name: 'Dental Bridge',
            description: 'Fixed restoration to replace missing teeth',
            duration: 120,
            priceFrom: 650,
            popular: false,
            category: 'restorative'
          },
          
          // Cosmetic Treatments
          {
            id: 'whitening',
            name: 'Teeth Whitening',
            description: 'Professional bleaching for brighter smile',
            duration: 90,
            priceFrom: 195,
            popular: true,
            category: 'cosmetic'
          },
          {
            id: 'veneers',
            name: 'Dental Veneers',
            description: 'Thin porcelain shells for smile transformation',
            duration: 120,
            priceFrom: 425,
            popular: false,
            category: 'cosmetic'
          },
          {
            id: 'bonding',
            name: 'Cosmetic Bonding',
            description: 'Tooth-colored resin to repair minor imperfections',
            duration: 60,
            priceFrom: 155,
            popular: false,
            category: 'cosmetic'
          },
          
          // Surgical Procedures
          {
            id: 'extraction',
            name: 'Tooth Extraction',
            description: 'Safe removal of damaged or problematic teeth',
            duration: 45,
            priceFrom: 125,
            popular: false,
            category: 'surgical'
          },
          {
            id: 'wisdom-teeth',
            name: 'Wisdom Teeth Removal',
            description: 'Extraction of third molars under local anesthesia',
            duration: 90,
            priceFrom: 185,
            popular: false,
            category: 'surgical'
          },
          {
            id: 'implant',
            name: 'Dental Implant',
            description: 'Titanium post to replace missing tooth root',
            duration: 120,
            priceFrom: 1250,
            popular: false,
            category: 'surgical'
          },
          
          // Orthodontic Services
          {
            id: 'braces-consultation',
            name: 'Orthodontic Consultation',
            description: 'Assessment for braces and alignment treatment',
            duration: 45,
            priceFrom: 65,
            popular: false,
            category: 'orthodontic'
          },
          {
            id: 'invisalign',
            name: 'Invisalign Treatment',
            description: 'Clear aligners for discreet teeth straightening',
            duration: 60,
            priceFrom: 2500,
            popular: true,
            category: 'orthodontic'
          },
          
          // Pediatric Dentistry
          {
            id: 'child-checkup',
            name: 'Children\'s Check-up',
            description: 'Gentle dental care specifically for young patients',
            duration: 30,
            priceFrom: 45,
            popular: false,
            category: 'pediatric'
          },
          {
            id: 'child-cleaning',
            name: 'Children\'s Cleaning',
            description: 'Kid-friendly professional cleaning and education',
            duration: 30,
            priceFrom: 55,
            popular: false,
            category: 'pediatric'
          },
          
          // Emergency Services
          {
            id: 'emergency',
            name: 'Emergency Appointment',
            description: 'Urgent care for dental pain and trauma',
            duration: 30,
            priceFrom: 95,
            popular: false,
            category: 'emergency'
          }
        ],
        dentists: [
          {
            id: 'dr-smith',
            name: 'Dr. Sarah Smith',
            title: 'Principal Dentist',
            specializations: ['General Dentistry', 'Cosmetic Dentistry'],
            rating: 4.9,
            priceMultiplier: 1.2
          }
        ]
      };

      setPracticeData(mockPracticeData);
      postMessageToParent('widget:dataLoaded', { practiceData: mockPracticeData });
    } catch (error) {
      console.error('Failed to load practice data:', error);
      postMessageToParent('widget:error', { error: error?.message });
    }
  };

  const setupPostMessageListener = () => {
    window.addEventListener('message', handlePostMessage);
  };

  const setupCrossOriginSecurity = () => {
    // Validate parent origin
    const allowedOrigins = widgetConfig?.allowedOrigins || ['*'];
    if (allowedOrigins?.includes('*')) return;

    const parentOrigin = document.referrer ? new URL(document.referrer)?.origin : '*';
    if (!allowedOrigins?.includes(parentOrigin)) {
      console.warn('Widget loaded from unauthorized origin:', parentOrigin);
      postMessageToParent('widget:unauthorized', { origin: parentOrigin });
    }
  };

  const postMessageToParent = (type, data = {}) => {
    const message = { type, data, timestamp: Date.now() };
    window.parent?.postMessage(message, '*');
  };

  const handleResize = (dimensions) => {
    if (widgetRef?.current && dimensions) {
      widgetRef.current.style.width = dimensions?.width ? `${dimensions?.width}px` : 'auto';
      widgetRef.current.style.height = dimensions?.height ? `${dimensions?.height}px` : 'auto';
    }
  };

  const autoResize = () => {
    if (!widgetConfig?.autoResize) return;
    
    const rect = widgetRef?.current?.getBoundingClientRect();
    if (rect) {
      postMessageToParent('widget:sizeChanged', {
        width: rect?.width,
        height: rect?.height,
        step: currentStep
      });
    }
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setShowSuccessScreen(false);
    setBookingData({
      service: null,
      dentist: null,
      dateTime: null,
      patientInfo: null,
      paymentInfo: null
    });
  };

  const handleStepComplete = (stepData) => {
    setBookingData(prev => ({ .....prev, .stepData }));
    
    // Auto-select default dentist when service is selected
    if (stepData?.service && !bookingData?.dentist && practiceData?.dentists?.length > 0) {
      const defaultDentist = practiceData?.dentists?.[0];
      setBookingData(prev => ({ .....prev, .stepData, dentist: defaultDentist }));
    }
    
    // Track analytics
    if (widgetConfig?.enableAnalytics) {
      postMessageToParent('widget:analytics', {
        event: 'step_completed',
        step: currentStep,
        data: stepData
      });
    }

    // Move to next step or show success screen
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Payment completed - show success screen
      setShowSuccessScreen(true);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Auto-resize on step changes
  useEffect(() => {
    setTimeout(autoResize, 100);
  }, [currentStep, isMinimized, isFullScreen]);

  const steps = [
    { id: 1, title: 'Service', icon: 'List' },
    { id: 2, title: 'Date & Time', icon: 'Calendar' },
    { id: 3, title: 'Personal Details', icon: 'UserCheck' },
    { id: 4, title: 'Payment', icon: 'CreditCard' }
  ];

  const renderMiniProgress = () => (
    <div className="flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-gray-200 p-3">
      <div className="flex items-center space-x-2">
        {!showSuccessScreen && steps?.map((step) => (
          <div
            key={step?.id}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step?.id <= currentStep
                ? 'bg-primary text-white' :'bg-gray-200 text-gray-400'
            }`}
          >
            {step?.id < currentStep ? (
              <Check size={12} />
            ) : (
              step?.id
            )}
          </div>
        ))}
        {showSuccessScreen && (
          <div className="flex items-center space-x-2 text-green-600">
            <Check size={16} />
            <span className="text-sm font-medium">Booking Confirmed</span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
        <button
          onClick={() => postMessageToParent('widget:close')}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (isMinimized) return null;

    const filteredServices = widgetConfig?.allowedServices
      ? practiceData?.services?.filter(s => widgetConfig?.allowedServices?.includes(s?.id))
      : practiceData?.services;

    // Show success screen
    if (showSuccessScreen) {
      return (
        <BookingConfirmation
          bookingData={bookingData}
          practiceInfo={practiceData}
          onNewBooking={resetBooking}
          compact={true}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            services={filteredServices || []}
            selectedService={bookingData?.service}
            onServiceSelect={(service) => handleStepComplete({ service })}
            compact={true}
          />
        );
      case 2:
        return (
          <TimeSlotSelection
            selectedDate={selectedDate}
            availableSlots={availableSlots}
            selectedService={bookingData?.service}
            selectedDentist={bookingData?.dentist}
            onDateSelect={setSelectedDate}
            onTimeSelect={(dateTime) => handleStepComplete({ dateTime })}
            onBack={handleBackStep}
            calculatePrice={() => bookingData?.service?.priceFrom || 0}
            compact={true}
          />
        );
      case 3:
        return (
          <PatientInformation
            initialData={bookingData?.patientInfo}
            onComplete={(patientInfo) => handleStepComplete({ patientInfo })}
            onBack={handleBackStep}
            compact={true}
          />
        );
      case 4:
        return (
          <PaymentForm
            bookingData={bookingData}
            onPaymentComplete={(paymentInfo) => handleStepComplete({ paymentInfo })}
            onBack={handleBackStep}
            compact={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={widgetRef}
      className={`widget-container bg-white shadow-lg border border-gray-200 ${
        isFullScreen ? 'fixed inset-0 z-50' : 'rounded-lg max-w-4xl'
      } ${isMinimized ? 'h-16' : 'min-h-96'}`}
      style={{
        fontFamily: 'var(--widget-font, Inter, system-ui, sans-serif)',
        fontSize: 'var(--widget-font-size, 14px)',
        '--primary': 'var(--widget-primary, #0066cc)',
        '--secondary': 'var(--widget-secondary, #004499)'
      }}
    >
      {/* Widget Header */}
      {widgetConfig?.showHeader !== false && renderMiniProgress()}
      
      {/* Widget Content */}
      <div className={`${isMinimized ? 'hidden' : 'block'}`}>
        {practiceData?.name && !isMinimized && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-primary" />
              <span className="font-medium text-gray-900">
                {practiceData?.name}
              </span>
              <div className="ml-auto flex items-center text-sm text-gray-500">
                <span>Secure Booking</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="widget-content">
          {renderStepContent()}
        </div>
      </div>

      {/* Powered By */}
      {!isMinimized && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
          <div className="flex items-center justify-center text-sm text-gray-400">
            <span>Powered by DentalCRM</span>
          </div>
        </div>
      )}
      
      {/* Conditionally render GDC Footer for widget */}
      {widgetConfig?.showGDCInfo && !isMinimized && (
        <div className="border-t border-gray-200">
          <GDCFooter />
        </div>
      )}
    </div>
  );
};

export default EmbeddableBookingWidget;