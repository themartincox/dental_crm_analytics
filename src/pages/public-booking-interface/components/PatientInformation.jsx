import React, { useState } from 'react';
import { format } from 'date-fns';
import { User, Mail, Phone, MapPin, Shield, ChevronLeft } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';


const PatientInformation = ({ initialData, onComplete, onBack, compact = false }) => {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    address: initialData?.address || '',
    postcode: initialData?.postcode || '',
    emergencyContactName: initialData?.emergencyContactName || '',
    emergencyContactPhone: initialData?.emergencyContactPhone || '',
    insuranceProvider: initialData?.insuranceProvider || 'NHS',
    medicalConditions: initialData?.medicalConditions || '',
    currentMedications: initialData?.currentMedications || '',
    allergies: initialData?.allergies || '',
    communicationPreference: initialData?.communicationPreference || 'email',
    agreeToTerms: initialData?.agreeToTerms || false,
    agreeToMarketing: initialData?.agreeToMarketing || false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const insuranceOptions = [
    { value: 'NHS', label: 'NHS' },
    { value: 'Bupa', label: 'Bupa' },
    { value: 'AXA', label: 'AXA' },
    { value: 'Denplan', label: 'Denplan' },
    { value: 'Vitality', label: 'Vitality' },
    { value: 'Simply_Health', label: 'Simply Health' },
    { value: 'WPA', label: 'WPA' },
    { value: 'Private', label: 'Private (Self-Pay)' }
  ];

  const communicationOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'sms', label: 'Text Message' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData?.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    if (!formData?.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData?.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData?.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    // Email validation
    if (formData?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (UK format)
    if (formData?.phone && !/^(\+44|0)[1-9]\d{8,9}$/?.test(formData?.phone?.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid UK phone number';
    }

    // Age validation (must be at least 16)
    if (formData?.dateOfBirth) {
      const birthDate = new Date(formData?.dateOfBirth);
      const today = new Date();
      let age = today?.getFullYear() - birthDate?.getFullYear();
      const monthDiff = today?.getMonth() - birthDate?.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today?.getDate() < birthDate?.getDate())) {
        age--;
      }
      
      if (age < 16) {
        newErrors.dateOfBirth = 'Patients must be at least 16 years old to book online';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete?.(formData);
    } catch (error) {
      console.error('Error submitting patient information:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add compact mode check
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
              Tell Us About Yourself
            </h2>
            <p className="text-gray-600">
              Please provide your details to complete the booking. All information is kept secure and confidential.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData?.firstName}
                onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                error={errors?.firstName}
                required
                placeholder="Enter your first name"
              />
              
              <Input
                label="Last Name"
                value={formData?.lastName}
                onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                error={errors?.lastName}
                required
                placeholder="Enter your last name"
              />
              
              <Input
                label="Email Address"
                type="email"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                error={errors?.email}
                required
                placeholder="your.email@example.com"
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={formData?.phone}
                onChange={(e) => handleInputChange('phone', e?.target?.value)}
                error={errors?.phone}
                required
                placeholder="+44 20 1234 5678"
              />
              
              <Input
                label="Date of Birth"
                type="date"
                value={formData?.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
                error={errors?.dateOfBirth}
                required
                max={format(new Date(), 'yyyy-MM-dd')}
              />

              <Select
                label="Preferred Communication Method"
                value={formData?.communicationPreference}
                onValueChange={(value) => handleInputChange('communicationPreference', value)}
                options={communicationOptions}
                placeholder="Select communication preference"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Address</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  value={formData?.address}
                  onChange={(e) => handleInputChange('address', e?.target?.value)}
                  placeholder="123 Main Street, City"
                />
              </div>
              
              <Input
                label="Postcode"
                value={formData?.postcode}
                onChange={(e) => handleInputChange('postcode', e?.target?.value)}
                placeholder="SW1A 1AA"
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData?.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e?.target?.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  required
                />
                <div className="flex-1">
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700 cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    . I understand the cancellation policy and payment terms.
                  </label>
                  {errors?.agreeToTerms && (
                    <p className="text-red-600 text-sm mt-1">{errors?.agreeToTerms}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToMarketing"
                  checked={formData?.agreeToMarketing}
                  onChange={(e) => handleInputChange('agreeToMarketing', e?.target?.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="agreeToMarketing" className="text-sm text-gray-700 cursor-pointer">
                  I would like to receive appointment reminders, health tips, and promotional offers via my preferred communication method.
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6">
            <div className="text-sm text-gray-500">
              <Shield size={16} className="inline mr-2" />
              Your information is encrypted and secure
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </div>
        </form>
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
            Tell Us About Yourself
          </h2>
          <p className="text-gray-600">
            Please provide your details to complete the booking. All information is kept secure and confidential.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData?.firstName}
              onChange={(e) => handleInputChange('firstName', e?.target?.value)}
              error={errors?.firstName}
              required
              placeholder="Enter your first name"
            />
            
            <Input
              label="Last Name"
              value={formData?.lastName}
              onChange={(e) => handleInputChange('lastName', e?.target?.value)}
              error={errors?.lastName}
              required
              placeholder="Enter your last name"
            />
            
            <Input
              label="Email Address"
              type="email"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              error={errors?.email}
              required
              placeholder="your.email@example.com"
            />
            
            <Input
              label="Phone Number"
              type="tel"
              value={formData?.phone}
              onChange={(e) => handleInputChange('phone', e?.target?.value)}
              error={errors?.phone}
              required
              placeholder="+44 20 1234 5678"
            />
            
            <Input
              label="Date of Birth"
              type="date"
              value={formData?.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
              error={errors?.dateOfBirth}
              required
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            
            <Select
              label="Insurance Provider"
              value={formData?.insuranceProvider}
              onValueChange={(value) => handleInputChange('insuranceProvider', value)}
              options={insuranceOptions}
              placeholder="Select insurance provider"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Address</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Address"
                value={formData?.address}
                onChange={(e) => handleInputChange('address', e?.target?.value)}
                placeholder="123 Main Street, City"
              />
            </div>
            
            <Input
              label="Postcode"
              value={formData?.postcode}
              onChange={(e) => handleInputChange('postcode', e?.target?.value)}
              placeholder="SW1A 1AA"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Emergency Contact Name"
              value={formData?.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e?.target?.value)}
              placeholder="Enter emergency contact name"
            />
            
            <Input
              label="Emergency Contact Phone"
              type="tel"
              value={formData?.emergencyContactPhone}
              onChange={(e) => handleInputChange('emergencyContactPhone', e?.target?.value)}
              placeholder="+44 20 1234 5678"
            />
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Conditions
              </label>
              <textarea
                value={formData?.medicalConditions}
                onChange={(e) => handleInputChange('medicalConditions', e?.target?.value)}
                rows={3}
                placeholder="Please list any medical conditions or write 'None' if not applicable"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications
              </label>
              <textarea
                value={formData?.currentMedications}
                onChange={(e) => handleInputChange('currentMedications', e?.target?.value)}
                rows={3}
                placeholder="Please list all current medications or write 'None' if not applicable"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              <textarea
                value={formData?.allergies}
                onChange={(e) => handleInputChange('allergies', e?.target?.value)}
                rows={2}
                placeholder="Please list any allergies or write 'None' if not applicable"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Communication Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Communication Preferences</h3>
          </div>

          <Select
            label="Preferred Communication Method"
            value={formData?.communicationPreference}
            onValueChange={(value) => handleInputChange('communicationPreference', value)}
            options={communicationOptions}
            placeholder="Select communication preference"
          />
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData?.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e?.target?.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                required
              />
              <div className="flex-1">
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  . I understand the cancellation policy and payment terms.
                </label>
                {errors?.agreeToTerms && (
                  <p className="text-red-600 text-sm mt-1">{errors?.agreeToTerms}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToMarketing"
                checked={formData?.agreeToMarketing}
                onChange={(e) => handleInputChange('agreeToMarketing', e?.target?.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="agreeToMarketing" className="text-sm text-gray-700 cursor-pointer">
                I would like to receive appointment reminders, health tips, and promotional offers via my preferred communication method.
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6">
          <div className="text-sm text-gray-500">
            <Shield size={16} className="inline mr-2" />
            Your information is encrypted and secure
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? 'Processing...' : 'Continue to Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientInformation;