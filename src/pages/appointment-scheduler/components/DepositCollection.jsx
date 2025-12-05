import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import Icon from '../../../components/AppIcon';

const DepositCollection = ({ appointment, onProcess, onClose }) => {
  const [paymentData, setPaymentData] = useState({
    amount: appointment?.depositRequired || 0,
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    billingAddress: {
      line1: '',
      city: '',
      postcode: '',
      country: 'GB'
    },
    saveCard: false,
    sendReceipt: true
  });

  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: 'CreditCard' },
    { value: 'bank', label: 'Bank Transfer', icon: 'Building' },
    { value: 'cash', label: 'Cash Payment', icon: 'Banknote' }
  ];

  const treatmentPricing = {
    consultation: { deposit: 50, total: 150 },
    cleaning: { deposit: 0, total: 80 },
    treatment: { deposit: 100, total: 500 },
    surgery: { deposit: 200, total: 800 },
    followup: { deposit: 25, total: 75 }
  };

  const handleInputChange = (field, value) => {
    if (field?.includes('.')) {
      const [parent, child] = field?.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: { ...prev?.[parent], [child]: value }
      }));
    } else {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentData?.paymentMethod === 'card') {
      if (!paymentData?.cardNumber || paymentData?.cardNumber?.length < 16) {
        newErrors.cardNumber = 'Valid card number is required';
      }
      
      if (!paymentData?.expiryDate || !/^\d{2}\/\d{2}$/?.test(paymentData?.expiryDate)) {
        newErrors.expiryDate = 'Valid expiry date (MM/YY) is required';
      }
      
      if (!paymentData?.cvv || paymentData?.cvv?.length < 3) {
        newErrors.cvv = 'Valid CVV is required';
      }
      
      if (!paymentData?.cardHolderName?.trim()) {
        newErrors.cardHolderName = 'Cardholder name is required';
      }
    }

    if (paymentData?.amount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentSuccess(true);
      setTimeout(() => {
        onProcess?.(appointment?.id, paymentData?.amount);
      }, 1500);
      
    } catch (error) {
      setErrors({ general: 'Payment processing failed. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value?.replace(/\s+/g, '')?.replace(/[^0-9]/gi, '');
    const matches = v?.match(/\d{4,16}/g);
    const match = matches && matches?.[0] || '';
    const parts = [];

    for (let i = 0, len = match?.length; i < len; i += 4) {
      parts?.push(match?.substring(i, i + 4));
    }

    if (parts?.length) {
      return parts?.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e?.target?.value);
    if (formatted?.length <= 19) { // Max length with spaces
      handleInputChange('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (e) => {
    let value = e?.target?.value?.replace(/\D/g, '');
    if (value?.length >= 2) {
      value = value?.substring(0, 2) + '/' + value?.substring(2, 4);
    }
    handleInputChange('expiryDate', value);
  };

  const renderPaymentForm = () => {
    if (paymentData?.paymentMethod === 'card') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Card Number *
            </label>
            <Input
              value={paymentData?.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              error={errors?.cardNumber}
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Expiry Date *
              </label>
              <Input
                value={paymentData?.expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                error={errors?.expiryDate}
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                CVV *
              </label>
              <Input
                value={paymentData?.cvv}
                onChange={(e) => handleInputChange('cvv', e?.target?.value?.replace(/\D/g, ''))}
                placeholder="123"
                error={errors?.cvv}
                maxLength={4}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Cardholder Name *
            </label>
            <Input
              value={paymentData?.cardHolderName}
              onChange={(e) => handleInputChange('cardHolderName', e?.target?.value)}
              placeholder="John Smith"
              error={errors?.cardHolderName}
            />
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Billing Address</h4>
            <Input
              value={paymentData?.billingAddress?.line1}
              onChange={(e) => handleInputChange('billingAddress.line1', e?.target?.value)}
              placeholder="Address Line 1"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={paymentData?.billingAddress?.city}
                onChange={(e) => handleInputChange('billingAddress.city', e?.target?.value)}
                placeholder="City"
              />
              <Input
                value={paymentData?.billingAddress?.postcode}
                onChange={(e) => handleInputChange('billingAddress.postcode', e?.target?.value)}
                placeholder="Postcode"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="saveCard"
              checked={paymentData?.saveCard}
              onChange={(e) => handleInputChange('saveCard', e?.target?.checked)}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="saveCard" className="text-sm text-foreground">
              Save card for future payments
            </label>
          </div>
        </div>
      );
    }

    if (paymentData?.paymentMethod === 'bank') {
      return (
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-2">Bank Transfer Details</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Account Name:</strong> Dental Practice Ltd</p>
                <p><strong>Sort Code:</strong> 12-34-56</p>
                <p><strong>Account Number:</strong> 12345678</p>
                <p><strong>Reference:</strong> {appointment?.patientId}-DEP</p>
              </div>
              <p className="text-xs text-warning mt-3">
                Please use the reference number and allow 2-3 business days for processing.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (paymentData?.paymentMethod === 'cash') {
      return (
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Banknote" size={20} className="text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-2">Cash Payment</h4>
              <p className="text-sm text-muted-foreground">
                Mark this payment as received when the patient pays cash at the front desk.
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-success" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-4">
            Deposit of £{paymentData?.amount?.toFixed(2)} has been processed successfully.
          </p>
          <div className="animate-pulse text-sm text-muted-foreground">
            Updating appointment status.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Collect Deposit</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Patient & Appointment Info */}
          <div className="bg-muted/30 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{appointment?.patientName}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {appointment?.type} - {appointment?.duration} minutes
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Deposit Required:</span>
                <span className="font-semibold text-foreground ml-2">
                  £{appointment?.depositRequired?.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Treatment:</span>
                <span className="font-semibold text-foreground ml-2">
                  £{treatmentPricing?.[appointment?.type]?.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Payment Amount
            </label>
            <Input
              type="number"
              value={paymentData?.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e?.target?.value) || 0)}
              min="0"
              step="0.01"
              error={errors?.amount}
            />
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods?.map((method) => (
                <button
                  key={method?.value}
                  onClick={() => handleInputChange('paymentMethod', method?.value)}
                  className={`p-4 border border-border rounded-lg text-center hover:bg-muted/50 transition-colors ${
                    paymentData?.paymentMethod === method?.value
                      ? 'bg-primary/10 border-primary/20 text-primary' :'text-foreground'
                  }`}
                >
                  <Icon name={method?.icon} size={24} className="mx-auto mb-2" />
                  <div className="text-sm font-medium">{method?.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="mb-6">
            {renderPaymentForm()}
          </div>

          {/* Receipt Option */}
          <div className="flex items-center space-x-2 mb-6">
            <input
              type="checkbox"
              id="sendReceipt"
              checked={paymentData?.sendReceipt}
              onChange={(e) => handleInputChange('sendReceipt', e?.target?.checked)}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="sendReceipt" className="text-sm text-foreground">
              Send receipt to patient email ({appointment?.email})
            </label>
          </div>

          {/* Error Message */}
          {errors?.general && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-6">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <span className="text-sm text-error">{errors?.general}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing.
                </>
              ) : (
                `Process £${paymentData?.amount?.toFixed(2)}`
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="mt-4 text-xs text-muted-foreground text-center">
            <Icon name="Shield" size={12} className="inline mr-1" />
            All payment information is encrypted and secure
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositCollection;