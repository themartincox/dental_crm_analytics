import React, { useState } from 'react';
import { format, isValid } from 'date-fns';
import { Star, Award, Calendar, ChevronLeft } from 'lucide-react';
import Button from '../../../components/ui/Button';

const DentistSelection = ({ 
  dentists = [], 
  selectedDentist, 
  selectedService,
  onDentistSelect,
  onBack,
  compact = false
}) => {
  const [hoveredDentist, setHoveredDentist] = useState(null);

  const formatExperience = (years) => {
    return years === 1 ? '1 year' : `${years} years`;
  };

  const calculatePrice = (dentist) => {
    if (!selectedService || !dentist) return 0;
    return Math.round(selectedService?.priceFrom * dentist?.priceMultiplier);
  };

  const formatNextAvailable = (dateValue) => {
    if (!dateValue) return 'Contact for availability';
    
    // Handle string dates by converting to Date object
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    
    // Check if the date is valid
    if (!isValid(date)) return 'Contact for availability';
    
    try {
      return format(date, 'MMM dd, HH:mm');
    } catch (error) {
      console.warn('Date formatting error:', error);
      return 'Contact for availability';
    }
  };

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
              Choose Your Dentist
            </h2>
            <p className="text-gray-600">
              Select from our experienced team for your {selectedService?.name?.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Dentist Cards - Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {dentists?.map((dentist) => (
            <div
              key={dentist?.id}
              className={`bg-white border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                selectedDentist?.id === dentist?.id
                  ? 'border-primary ring-2 ring-primary/20 shadow-lg transform scale-105'
                  : hoveredDentist === dentist?.id
                  ? 'border-primary/50 shadow-md transform -translate-y-1'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onDentistSelect?.(dentist)}
              onMouseEnter={() => setHoveredDentist(dentist?.id)}
              onMouseLeave={() => setHoveredDentist(null)}
            >
              <div className="flex items-start p-4 gap-4">
                {/* Dentist Photo */}
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-lg font-bold text-primary">
                    {dentist?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                  </div>
                </div>

                {/* Dentist Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 leading-tight">
                      {dentist?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dentist?.title}
                    </p>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)]?.map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={`${
                            i < Math.floor(dentist?.rating || 0)
                              ? 'text-yellow-400 fill-current' :'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      {dentist?.rating || 0} ({dentist?.reviewCount || 0})
                    </span>
                  </div>

                  {/* Experience & Specialization */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Award size={12} />
                      <span>{formatExperience(dentist?.experience || 8)} experience</span>
                    </div>
                    {dentist?.specializations?.[0] && (
                      <div className="text-xs text-primary bg-primary/10 inline-block px-2 py-0.5 rounded-full">
                        {dentist?.specializations?.[0]}
                      </div>
                    )}
                  </div>

                  {/* Price & Availability */}
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        £{calculatePrice(dentist)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dentist?.priceMultiplier > 1.0 ? 'Premium' : 'Standard'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar size={12} />
                      <span>Available today</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection indicator */}
              {selectedDentist?.id === dentist?.id && (
                <div className="w-full h-1 bg-primary"></div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Help */}
        <div className="mt-6 bg-green-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">👨‍⚕️</div>
            <div>
              <h4 className="font-medium text-green-900 mb-1">All Our Dentists Are:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• GDC registered professionals</li>
                <li>• Experienced in your chosen treatment</li>
                <li>• Committed to gentle, patient care</li>
              </ul>
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
            Choose Your Dentist
          </h2>
          <p className="text-gray-600">
            Select from our experienced team of dental professionals for your {selectedService?.name?.toLowerCase()}.
          </p>
        </div>
      </div>

      {/* Dentist Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dentists?.map((dentist) => (
          <div
            key={dentist?.id}
            className={`bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
              selectedDentist?.id === dentist?.id
                ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                : hoveredDentist === dentist?.id
                ? 'border-primary/50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onDentistSelect?.(dentist)}
            onMouseEnter={() => setHoveredDentist(dentist?.id)}
            onMouseLeave={() => setHoveredDentist(null)}
          >
            {/* Dentist Photo */}
            <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                {dentist?.name?.split(' ')?.map(n => n?.[0])?.join('')}
              </div>
            </div>

            {/* Dentist Info */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {dentist?.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {dentist?.title}
                </p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)]?.map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < Math.floor(dentist?.rating || 0)
                            ? 'text-yellow-400 fill-current' :'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {dentist?.rating || 0} ({dentist?.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Award size={16} />
                <span>{formatExperience(dentist?.experience || 0)} experience</span>
              </div>

              {/* Specializations */}
              {dentist?.specializations && dentist?.specializations?.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Specializations:</div>
                  <div className="flex flex-wrap gap-1">
                    {dentist?.specializations?.slice(0, 3)?.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                    {dentist?.specializations?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{dentist?.specializations?.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {dentist?.qualifications && dentist?.qualifications?.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Qualifications:</div>
                  <div className="text-sm text-gray-600">
                    {dentist?.qualifications?.join(', ')}
                  </div>
                </div>
              )}

              {/* Next Available */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar size={16} />
                <span>Next available: {formatNextAvailable(dentist?.nextAvailable)}</span>
              </div>

              {/* Price */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Your treatment cost:</div>
                    <div className="text-lg font-bold text-gray-900">
                      £{calculatePrice(dentist)}
                    </div>
                  </div>
                  {dentist?.priceMultiplier !== 1.0 && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {dentist?.priceMultiplier > 1.0 ? 'Premium' : 'Standard'} pricing
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              <div className={`transition-all duration-200 mt-4 ${
                selectedDentist?.id === dentist?.id ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="w-full h-1 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Need Help Choosing?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Consider These Factors:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Specialization in your treatment area</li>
              <li>• Experience level and qualifications</li>
              <li>• Patient reviews and ratings</li>
              <li>• Available appointment times</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Still Unsure?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Our reception team can help match you with the best dentist for your specific needs.
            </p>
            <Button variant="outline" size="sm">
              Call for Guidance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentistSelection;