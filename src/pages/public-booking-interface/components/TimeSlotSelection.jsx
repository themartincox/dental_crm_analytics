import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar, Zap } from 'lucide-react';
import Button from '../../../components/ui/Button';

const TimeSlotSelection = ({ 
  selectedDate,
  availableSlots = [],
  selectedService,
  selectedDentist,
  onDateSelect,
  onTimeSelect,
  onBack,
  calculatePrice,
  compact = false
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Get week view dates
  const getCurrentWeek = () => {
    const baseDate = addDays(new Date(), weekOffset * 7);
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday start
    return eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });
  };

  const weekDays = getCurrentWeek();

  // Filter slots for selected date
  const dailySlots = availableSlots?.filter(slot => 
    isSameDay(slot?.time, selectedDate)
  )?.sort((a, b) => a?.time?.getTime() - b?.time?.getTime());

  const handleSlotSelect = (slot) => {
    if (!slot?.available) return;
    
    setSelectedSlot(slot);
    onTimeSelect?.({
      dateTime: slot?.time,
      price: slot?.price
    });
  };

  const handleWeekNavigation = (direction) => {
    setWeekOffset(prev => prev + direction);
  };

  const isPastDate = (date) => {
    const today = new Date();
    today?.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getAvailableSlotsCount = (date) => {
    return availableSlots?.filter(slot => 
      isSameDay(slot?.time, date) && slot?.available
    )?.length || 0;
  };

  const formatTimeSlot = (time) => {
    return format(time, 'HH:mm');
  };

  const getPeakTimeLabel = (time) => {
    const hour = time?.getHours();
    if (hour >= 16) return 'Peak Time';
    if (hour >= 12 && hour < 14) return 'Lunch';
    return null;
  };

  // Add pricing logic based on service cost
  const calculatePricingOptions = (servicePrice) => {
    if (servicePrice < 1000) {
      return {
        option1: { amount: servicePrice, label: 'Pay Full Amount', balance: 0 },
        option2: { amount: 100, label: 'Pay £100 Now', balance: servicePrice - 100 }
      };
    } else {
      const depositAmount = Math.round(servicePrice * 0.1); // 10% deposit
      const balanceAmount = servicePrice - depositAmount;
      return {
        option1: { amount: servicePrice, label: 'Pay Full Amount', balance: 0 },
        option2: { amount: depositAmount, label: `Pay ${depositAmount} (10%) Now`, balance: balanceAmount }
      };
    }
  };

  // Mock available slots for demonstration
  useEffect(() => {
    if (availableSlots?.length === 0) {
      // Generate mock slots for demo
      const mockSlots = [];
      const today = new Date();
      for (let day = 0; day < 7; day++) {
        const date = addDays(today, day);
        const hours = [9, 10, 11, 14, 15, 16, 17];
        hours?.forEach(hour => {
          mockSlots?.push({
            time: new Date(date.setHours(hour, 0, 0, 0)),
            available: Math.random() > 0.3,
            price: selectedService?.priceFrom || 75
          });
        });
      }
      // This would normally come from props, but for demo purposes
      if (typeof availableSlots?.push === 'function') {
        availableSlots?.push(.mockSlots);
      }
    }
  }, [selectedService?.priceFrom]);

  // Add compact mode rendering
  if (compact) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            iconName="ChevronLeft"
          >
            Back
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Select Date & Time
            </h2>
            <p className="text-gray-600">
              Choose your preferred appointment time with {selectedDentist?.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Week View Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Week Navigation */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWeekNavigation(-1)}
                  disabled={weekOffset <= 0}
                  iconName="ChevronLeft"
                >
                  Previous
                </Button>
                
                <div className="font-medium text-gray-700">
                  {format(weekDays?.[0], 'MMM dd')} - {format(weekDays?.[6], 'MMM dd')}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWeekNavigation(1)}
                  iconName="ChevronRight"
                >
                  Next
                </Button>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-0">
                {weekDays?.map((day) => {
                  const isPast = isPastDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const availableCount = getAvailableSlotsCount(day);
                  const isWeekend = day?.getDay() === 0 || day?.getDay() === 6;

                  return (
                    <div
                      key={day?.toISOString()}
                      className={`aspect-square p-3 border-b border-r border-gray-200 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary text-white'
                          : isPast || isWeekend
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : availableCount > 0
                          ? 'hover:bg-gray-50 hover:shadow-sm' :'bg-gray-100 text-gray-400'
                      }`}
                      onClick={() => {
                        if (!isPast && !isWeekend && availableCount > 0) {
                          onDateSelect?.(day);
                        }
                      }}
                    >
                      <div className="text-center h-full flex flex-col justify-center">
                        <div className="text-xs font-medium mb-1">
                          {format(day, 'EEE')}
                        </div>
                        <div className="text-lg font-semibold mb-1">
                          {format(day, 'd')}
                        </div>
                        <div className="text-xs">
                          {isPast ? (
                            'Past'
                          ) : isWeekend ? (
                            'Closed'
                          ) : availableCount > 0 ? (
                            `${availableCount}+`
                          ) : (
                            'Full'
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-600" />
                  <span className="font-medium text-gray-900 text-sm">
                    {format(selectedDate, 'EEE, MMM dd')}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {dailySlots?.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dailySlots?.slice(0, 8)?.map((slot, index) => {
                      const peakLabel = getPeakTimeLabel(slot?.time);
                      const isSelected = selectedSlot?.time?.getTime() === slot?.time?.getTime();
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleSlotSelect(slot)}
                          disabled={!slot?.available}
                          className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : slot?.available
                              ? 'border-gray-200 hover:border-primary hover:bg-primary/5' :'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span className="font-medium">
                                {formatTimeSlot(slot?.time)}
                              </span>
                            </div>
                            {peakLabel && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                {peakLabel}
                              </span>
                            )}
                          </div>
                          <div className="text-sm mt-1 opacity-80">
                            From £{slot?.price}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-1">No slots available</p>
                    <p className="text-xs text-gray-400">Try another date</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Options */}
            {selectedSlot && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-3 text-sm">
                  Payment Options
                </h4>
                {(() => {
                  const servicePrice = selectedSlot?.price;
                  const pricingOptions = calculatePricingOptions(servicePrice);
                  
                  return (
                    <div className="space-y-2">
                      <div className="text-sm text-blue-800">
                        <div className="font-medium">{selectedService?.name}</div>
                        <div>{format(selectedSlot?.time, 'MMM dd, HH:mm')}</div>
                        <div className="mt-2 space-y-1">
                          <div className="font-medium">
                            Option 1: {pricingOptions?.option1?.label} - £{pricingOptions?.option1?.amount}
                          </div>
                          <div className="font-medium">
                            Option 2: {pricingOptions?.option2?.label} - £{pricingOptions?.option2?.amount}
                            {pricingOptions?.option2?.balance > 0 && (
                              <div className="text-xs opacity-80">
                                Balance: £{pricingOptions?.option2?.balance} due at appointment
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Section */}
        <div className="mt-6 bg-red-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚨</div>
            <div>
              <h4 className="font-medium text-red-900 mb-1">Dental Emergency?</h4>
              <p className="text-sm text-red-800 mb-2">
                Call immediately for urgent care: +44 20 7123 4567
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          iconName="ChevronLeft"
        >
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Select Date & Time
          </h2>
          <p className="text-gray-600">
            Choose your preferred appointment time with {selectedDentist?.name} for {selectedService?.name?.toLowerCase()}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Week Navigation */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleWeekNavigation(-1)}
                disabled={weekOffset <= 0}
                iconName="ChevronLeft"
              >
                Previous Week
              </Button>
              
              <div className="text-sm font-medium text-gray-700">
                {format(weekDays?.[0], 'MMM dd')} - {format(weekDays?.[6], 'MMM dd, yyyy')}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleWeekNavigation(1)}
                iconName="ChevronRight"
              >
                Next Week
              </Button>
            </div>

            {/* Week View */}
            <div className="grid grid-cols-7 gap-0">
              {weekDays?.map((day) => {
                const isPast = isPastDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const availableCount = getAvailableSlotsCount(day);
                const isWeekend = day?.getDay() === 0 || day?.getDay() === 6;

                return (
                  <div
                    key={day?.toISOString()}
                    className={`p-4 border-b border-r border-gray-200 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-white'
                        : isPast || isWeekend
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        : availableCount > 0
                        ? 'hover:bg-gray-50' :'bg-gray-100 text-gray-400'
                    }`}
                    onClick={() => {
                      if (!isPast && !isWeekend && availableCount > 0) {
                        onDateSelect?.(day);
                      }
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium mb-1">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-lg font-semibold mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="text-xs">
                        {isPast ? (
                          'Past'
                        ) : isWeekend ? (
                          'Closed'
                        ) : availableCount > 0 ? (
                          `${availableCount} slots`
                        ) : (
                          'Fully booked'
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
              <span>Fully booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-50 border border-gray-300 rounded-full"></div>
              <span>Available</span>
            </div>
          </div>
        </div>

        {/* Time Slots Section */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-600" />
                <span className="font-medium text-gray-900">
                  {format(selectedDate, 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
                </span>
              </div>
            </div>

            <div className="p-4">
              {dailySlots?.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-3">
                    Available time slots:
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {dailySlots?.map((slot, index) => {
                      const peakLabel = getPeakTimeLabel(slot?.time);
                      const isSelected = selectedSlot?.time?.getTime() === slot?.time?.getTime();
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleSlotSelect(slot)}
                          disabled={!slot?.available}
                          className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : slot?.available
                              ? 'border-gray-200 hover:border-primary hover:bg-primary/5' :'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span className="text-sm font-medium">
                                {formatTimeSlot(slot?.time)}
                              </span>
                            </div>
                            {peakLabel && (
                              <div className="flex items-center gap-1">
                                <Zap size={10} />
                                <span className="text-xs">{peakLabel}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs mt-1">
                            £{slot?.price}
                            {peakLabel === 'Peak Time' && (
                              <span className="ml-1 text-xs opacity-70">(+15%)</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar size={32} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No available slots</p>
                  <p className="text-sm text-gray-400">
                    Please select a different date or contact us for assistance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Info */}
          {selectedSlot && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Selected Appointment
              </h3>
              <div className="text-sm text-blue-800">
                <div>{selectedService?.name} with {selectedDentist?.name}</div>
                <div className="mt-1">
                  {format(selectedSlot?.time, 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
                </div>
                <div className="mt-1 font-medium">
                  Total: £{selectedSlot?.price}
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">
              Need an Emergency Appointment?
            </h3>
            <p className="text-sm text-red-800 mb-2">
              For urgent dental care, call us immediately at +44 20 7123 4567
            </p>
            <Button variant="outline" size="sm" className="border-red-300 text-red-700">
              Call Emergency Line
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelection;