import React, { useState } from 'react';
import { format } from 'date-fns';
import { CreditCard, Shield, Lock, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';


const PaymentForm = ({ bookingData, onPaymentComplete, onBack, compact = false }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    billingPostcode: ''
  });
  const [depositOption, setDepositOption] = useState('full'); // 'full' or 'deposit'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculate pricing with new logic
  const servicePrice = bookingData?.dateTime?.price || bookingData?.service?.priceFrom || 0;
  
  // Apply pricing logic based on user requirements
  const getPricingOptions = () => {
    if (servicePrice < 1000) {
      return {
        fullPayment: { amount: servicePrice, label: 'Pay Full Amount', balance: 0 },
        partialPayment: { amount: 100, label: 'Pay £100 Now', balance: servicePrice - 100 }
      };
    } else {
      const depositAmount = Math.round(servicePrice * 0.1); // 10% deposit for services over £1000
      const balanceAmount = servicePrice - depositAmount;
      return {
        fullPayment: { amount: servicePrice, label: 'Pay Full Amount', balance: 0 },
        partialPayment: { amount: depositAmount, label: `Pay £${depositAmount} (10%) Now`, balance: balanceAmount }
      };
    }
  };

  const pricingOptions = getPricingOptions();
  const paymentAmount = depositOption === 'full' ? pricingOptions?.fullPayment?.amount : pricingOptions?.partialPayment?.amount;
  const remainingAmount = depositOption === 'full' ? 0 : pricingOptions?.partialPayment?.balance;

  const paymentMethodOptions = [
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'klarna', label: 'Pay Later with Klarna' }
  ];

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;

    // Format card number
    if (field === 'number') {
      formattedValue = value?.replace(/\D/g, '')?.replace(/(\d{4})(?=\d)/g, '$1 ');
      if (formattedValue?.length > 19) return; // Limit to 16 digits + spaces
    }

    // Format expiry date
    if (field === 'expiry') {
      formattedValue = value?.replace(/\D/g, '');
      if (formattedValue?.length >= 2) {
        formattedValue = formattedValue?.substring(0, 2) + '/' + formattedValue?.substring(2, 4);
      }
      if (formattedValue?.length > 5) return; // Limit to MM/YY
    }

    // Format CVV
    if (field === 'cvv') {
      formattedValue = value?.replace(/\D/g, '')?.substring(0, 4); // Limit to 4 digits
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateCardData = () => {
    const newErrors = {};

    if (paymentMethod === 'card') {
      // Card number validation (simple Luhn algorithm check)
      const cardNumber = cardData?.number?.replace(/\s/g, '');
      if (!cardNumber) {
        newErrors.number = 'Card number is required';
      } else if (cardNumber?.length < 13 || cardNumber?.length > 19) {
        newErrors.number = 'Please enter a valid card number';
      }

      // Expiry validation
      if (!cardData?.expiry) {
        newErrors.expiry = 'Expiry date is required';
      } else {
        const [month, year] = cardData?.expiry?.split('/');
        const currentDate = new Date();
        const currentYear = currentDate?.getFullYear() % 100;
        const currentMonth = currentDate?.getMonth() + 1;

        if (!month || !year || month > 12 || month < 1) {
          newErrors.expiry = 'Please enter a valid expiry date';
        } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
          newErrors.expiry = 'Card has expired';
        }
      }

      // CVV validation
      if (!cardData?.cvv) {
        newErrors.cvv = 'Security code is required';
      } else if (cardData?.cvv?.length < 3) {
        newErrors.cvv = 'Please enter a valid security code';
      }

      // Cardholder name validation
      if (!cardData?.name?.trim()) {
        newErrors.name = 'Cardholder name is required';
      }

      // Billing postcode validation
      if (!cardData?.billingPostcode?.trim()) {
        newErrors.billingPostcode = 'Billing postcode is required';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const validationErrors = validateCardData();
    if (Object.keys(validationErrors)?.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock payment success
      const paymentInfo = {
        method: paymentMethod,
        amount: paymentAmount,
        depositAmount: depositOption === 'deposit' ? depositAmount : 0,
        remainingAmount: depositOption === 'deposit' ? remainingAmount : 0,
        transactionId: `txn_${Date.now()}`,
        cardLast4: paymentMethod === 'card' ? cardData?.number?.slice(-4) : null,
        status: 'completed'
      };

      onPaymentComplete?.(paymentInfo);
    } catch (error) {
      console.error('Payment processing error:', error);
      // Handle payment error
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardType = (number) => {
    const num = number?.replace(/\s/g, '');
    if (num?.match(/^4/)) return 'Visa';
    if (num?.match(/^5[1-5]/)) return 'Mastercard';
    if (num?.match(/^3[47]/)) return 'American Express';
    return 'Card';
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
              Payment Details
            </h2>
            <p className="text-gray-600">
              Secure payment to confirm your appointment booking.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Form */}
          <div className="space-y-4">
            {/* Payment Options */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Payment Options
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="full-payment-compact"
                    name="deposit-option-compact"
                    checked={depositOption === 'full'}
                    onChange={() => setDepositOption('full')}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor="full-payment-compact" className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900">
                      {pricingOptions?.fullPayment?.label} - £{pricingOptions?.fullPayment?.amount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Complete payment now, no balance remaining
                    </div>
                  </label>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="partial-payment-compact"
                    name="deposit-option-compact"
                    checked={depositOption === 'deposit'}
                    onChange={() => setDepositOption('deposit')}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor="partial-payment-compact" className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900">
                      {pricingOptions?.partialPayment?.label} - £{pricingOptions?.partialPayment?.amount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Remaining £{pricingOptions?.partialPayment?.balance} due at appointment
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Payment Method
              </h3>
              
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                options={paymentMethodOptions}
                placeholder="Select payment method"
              />
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <Input
                    label="Card Number"
                    value={cardData?.number}
                    onChange={(e) => handleCardInputChange('number', e?.target?.value)}
                    placeholder="1234 5678 9012 3456"
                    error={errors?.number}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Expiry Date"
                      value={cardData?.expiry}
                      onChange={(e) => handleCardInputChange('expiry', e?.target?.value)}
                      placeholder="MM/YY"
                      error={errors?.expiry}
                      required
                    />
                    
                    <Input
                      label="Security Code"
                      value={cardData?.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e?.target?.value)}
                      placeholder="123"
                      error={errors?.cvv}
                      required
                    />
                  </div>

                  <Input
                    label="Cardholder Name"
                    value={cardData?.name}
                    onChange={(e) => handleCardInputChange('name', e?.target?.value)}
                    placeholder="Name on card"
                    error={errors?.name}
                    required
                  />

                  <Input
                    label="Billing Postcode"
                    value={cardData?.billingPostcode}
                    onChange={(e) => handleCardInputChange('billingPostcode', e?.target?.value)}
                    placeholder="SW1A 1AA"
                    error={errors?.billingPostcode}
                    required
                  />
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Booking Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Booking Summary
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{bookingData?.service?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {format(bookingData?.dateTime?.dateTime, 'MMM dd, HH:mm')}
                  </span>
                </div>

                <hr className="my-2" />
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Cost:</span>
                  <span className="font-medium">£{servicePrice}</span>
                </div>
                
                {depositOption === 'deposit' && (
                  <div className="flex justify-between text-orange-600">
                    <span>Due at appointment:</span>
                    <span>£{remainingAmount}</span>
                  </div>
                )}

                <hr className="my-2" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Due Today:</span>
                  <span>£{paymentAmount}</span>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-900 text-sm">Secure Payment</h4>
              </div>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• SSL encrypted connection</li>
                <li>• Your card details are not stored</li>
                <li>• Instant booking confirmation</li>
              </ul>
            </div>

            {/* Payment Button */}
            {paymentMethod === 'card' && (
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary/90 py-3"
                onClick={handleSubmit}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing Payment.
                  </div>
                ) : (
                  `Pay £${paymentAmount} Now`
                )}
              </Button>
            )}
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
            Payment Details
          </h2>
          <p className="text-gray-600">
            Secure payment to confirm your appointment booking.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          {/* Payment Options */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Options
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="full-payment"
                  name="deposit-option"
                  checked={depositOption === 'full'}
                  onChange={() => setDepositOption('full')}
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="full-payment" className="flex-1">
                  <div className="font-medium text-gray-900">
                    {pricingOptions?.fullPayment?.label} - £{pricingOptions?.fullPayment?.amount}
                  </div>
                  <div className="text-sm text-gray-600">
                    Complete payment now, no balance remaining
                  </div>
                </label>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="partial-payment"
                  name="deposit-option"
                  checked={depositOption === 'deposit'}
                  onChange={() => setDepositOption('deposit')}
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="partial-payment" className="flex-1">
                  <div className="font-medium text-gray-900">
                    {pricingOptions?.partialPayment?.label} - £{pricingOptions?.partialPayment?.amount}
                  </div>
                  <div className="text-sm text-gray-600">
                    Remaining £{pricingOptions?.partialPayment?.balance} due at appointment
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Method
            </h3>
            
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              options={paymentMethodOptions}
              placeholder="Select payment method"
            />
          </div>

          {/* Card Details */}
          {paymentMethod === 'card' && (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
                <Lock className="w-4 h-4 text-gray-400" />
              </div>

              <div className="space-y-4">
                <Input
                  label="Card Number"
                  value={cardData?.number}
                  onChange={(e) => handleCardInputChange('number', e?.target?.value)}
                  placeholder="1234 5678 9012 3456"
                  error={errors?.number}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    value={cardData?.expiry}
                    onChange={(e) => handleCardInputChange('expiry', e?.target?.value)}
                    placeholder="MM/YY"
                    error={errors?.expiry}
                    required
                  />
                  
                  <Input
                    label="Security Code"
                    value={cardData?.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e?.target?.value)}
                    placeholder="123"
                    error={errors?.cvv}
                    required
                  />
                </div>

                <Input
                  label="Cardholder Name"
                  value={cardData?.name}
                  onChange={(e) => handleCardInputChange('name', e?.target?.value)}
                  placeholder="Name on card"
                  error={errors?.name}
                  required
                />

                <Input
                  label="Billing Postcode"
                  value={cardData?.billingPostcode}
                  onChange={(e) => handleCardInputChange('billingPostcode', e?.target?.value)}
                  placeholder="SW1A 1AA"
                  error={errors?.billingPostcode}
                  required
                />
              </div>
            </form>
          )}

          {/* Alternative Payment Methods */}
          {paymentMethod === 'paypal' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  PayPal Payment
                </h3>
                <p className="text-gray-600 mb-4">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? 'Processing.' : `Pay £${paymentAmount} with PayPal`}
                </Button>
              </div>
            </div>
          )}

          {paymentMethod === 'klarna' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Pay Later with Klarna
                </h3>
                <p className="text-gray-600 mb-4">
                  Split your payment into 3 interest-free installments.
                </p>
                <div className="text-sm text-gray-600 mb-4">
                  <div>Today: £0</div>
                  <div>In 30 days: £{Math.round(paymentAmount / 3)}</div>
                  <div>In 60 days: £{Math.round(paymentAmount / 3)}</div>
                  <div>In 90 days: £{paymentAmount - Math.round(paymentAmount / 3) * 2}</div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {isProcessing ? 'Processing.' : 'Continue with Klarna'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{bookingData?.service?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Dentist:</span>
                <span className="font-medium">{bookingData?.dentist?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">
                  {format(bookingData?.dateTime?.dateTime, 'EEE, MMM dd, yyyy')}
                  <br />
                  {format(bookingData?.dateTime?.dateTime, 'HH:mm')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{bookingData?.service?.duration} minutes</span>
              </div>

              <hr className="my-3" />
              
              <div className="flex justify-between">
                <span className="text-gray-600">Service Cost:</span>
                <span className="font-medium">£{servicePrice}</span>
              </div>
              
              {depositOption === 'deposit' && (
                <div className="flex justify-between text-orange-600">
                  <span>Due at appointment:</span>
                  <span>£{remainingAmount}</span>
                </div>
              )}

              <hr className="my-3" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Due Today:</span>
                <span>£{paymentAmount}</span>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">Secure Payment</h4>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• SSL encrypted connection</li>
              <li>• PCI DSS compliant payment processing</li>
              <li>• Your card details are not stored</li>
              <li>• Instant booking confirmation</li>
            </ul>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Cancellation Policy</h4>
            </div>
            <div className="text-sm text-yellow-800">
              <p>Free cancellation up to 24 hours before your appointment.</p>
              <p className="mt-1">Cancellations within 24 hours may incur a £25 fee.</p>
            </div>
          </div>

          {/* Payment Button for Card */}
          {paymentMethod === 'card' && (
            <Button
              form="payment-form"
              type="submit"
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary/90 py-3"
              onClick={handleSubmit}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing Payment.
                </div>
              ) : (
                `Pay £${paymentAmount} Now`
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;