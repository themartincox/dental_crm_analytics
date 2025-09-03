import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const PaymentForm = ({
  appointment,
  paymentMethods,
  savedPayments,
  paymentMethod,
  setPaymentMethod,
  selectedSavedPayment,
  setSelectedSavedPayment,
  cardDetails,
  setCardDetails,
  savePayment,
  setSavePayment,
  isProcessingPayment,
  onSubmit
}) => {
  // Format card number input
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

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value?.replace(/\s+/g, '')?.replace(/[^0-9]/gi, '');
    if (v?.length >= 2) {
      return v?.substring(0, 2) + '/' + v?.substring(2, 4);
    }
    return v;
  };

  // Handle card input changes
  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = value?.replace(/[^0-9]/gi, '')?.substring(0, 4);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  // Calculate total payment amount
  const totalAmount = () => {
    const servicesCost = appointment?.estimated_cost || 0;
    const depositRequired = appointment?.deposit_required || 0;
    const convenienceFee = servicesCost * 0.02;
    
    if (depositRequired > 0) {
      return depositRequired + convenienceFee;
    }
    return servicesCost + convenienceFee;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    })?.format(amount);
  };

  return (
    <form onSubmit={onSubmit} className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-semibold text-foreground mb-6 flex items-center">
        <Icon name="CreditCard" size={20} className="mr-2" />
        Payment Information
      </h3>
      {/* Payment Method Selection */}
      <div className="space-y-4 mb-6">
        <label className="text-sm font-medium text-foreground">Payment Method</label>
        <div className="grid grid-cols-1 gap-3">
          {paymentMethods?.map((method) => (
            <div
              key={method?.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === method?.value
                  ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
              onClick={() => setPaymentMethod(method?.value)}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method?.value}
                checked={paymentMethod === method?.value}
                onChange={() => setPaymentMethod(method?.value)}
                className="sr-only"
              />
              <Icon name={method?.icon} size={20} className="mr-3 text-muted-foreground" />
              <span className="font-medium text-foreground">{method?.label}</span>
              {method?.value === 'card' && (
                <div className="ml-auto flex space-x-1">
                  <div className="w-8 h-5 bg-blue-500 rounded text-xs text-white flex items-center justify-center">VISA</div>
                  <div className="w-8 h-5 bg-red-500 rounded text-xs text-white flex items-center justify-center">MC</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Saved Payment Methods (for returning patients) */}
      {paymentMethod === 'card' && savedPayments?.length > 0 && (
        <div className="mb-6">
          <Select
            value={selectedSavedPayment}
            onValueChange={setSelectedSavedPayment}
            options={[
              { value: '', label: 'Use new payment method' },
              ...savedPayments
            ]}
            placeholder="Select saved payment method"
            label="Saved payment methods"
          />
        </div>
      )}
      {/* Credit Card Form */}
      {paymentMethod === 'card' && !selectedSavedPayment && (
        <div className="space-y-4 mb-6">
          <Input
            label="Card Number"
            value={cardDetails?.number}
            onChange={(e) => handleCardInputChange('number', e?.target?.value)}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
            icon="CreditCard"
          />
          
          <Input
            label="Cardholder Name"
            value={cardDetails?.name}
            onChange={(e) => handleCardInputChange('name', e?.target?.value)}
            placeholder="John Smith"
            required
            icon="User"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date"
              value={cardDetails?.expiry}
              onChange={(e) => handleCardInputChange('expiry', e?.target?.value)}
              placeholder="MM/YY"
              maxLength={5}
              required
            />
            <Input
              label="CVC"
              value={cardDetails?.cvc}
              onChange={(e) => handleCardInputChange('cvc', e?.target?.value)}
              placeholder="123"
              maxLength={4}
              required
              icon="Shield"
            />
          </div>

          {/* Save Payment Option */}
          <Checkbox
            checked={savePayment}
            onChange={setSavePayment}
            label="Save this payment method for future use"
          />
        </div>
      )}
      {/* Bank Transfer Details */}
      {paymentMethod === 'bank_transfer' && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-foreground mb-3">Bank Transfer Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Name:</span>
              <span className="text-foreground">Central Dental Practice Ltd</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sort Code:</span>
              <span className="text-foreground">12-34-56</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Number:</span>
              <span className="text-foreground">87654321</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="text-foreground">{appointment?.appointment_number}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Please use the reference number above for faster payment processing.
          </p>
        </div>
      )}
      {/* Direct Debit Setup */}
      {paymentMethod === 'direct_debit' && (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sort Code"
              placeholder="12-34-56"
              required
              icon="Building2"
            />
            <Input
              label="Account Number"
              placeholder="12345678"
              required
              icon="Hash"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Direct Debit setup will be processed within 3-5 working days.
          </p>
        </div>
      )}
      {/* Payment Plan Options */}
      {paymentMethod === 'finance' && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-foreground mb-3">Payment Plan Options</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">6 Months - 0% APR</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(totalAmount() / 6)} per month
                </p>
              </div>
              <Button type="button" variant="outline" size="sm">Select</Button>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">12 Months - 4.9% APR</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency((totalAmount() * 1.049) / 12)} per month
                </p>
              </div>
              <Button type="button" variant="outline" size="sm">Select</Button>
            </div>
          </div>
        </div>
      )}
      {/* Insurance Claim */}
      {paymentMethod === 'insurance_claim' && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start space-x-2 mb-3">
            <Icon name="Shield" size={20} className="text-primary" />
            <div>
              <h4 className="font-medium text-foreground">Insurance Claim Processing</h4>
              <p className="text-sm text-muted-foreground">
                We'll process your insurance claim directly. You may need to pay any excess amount.
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Insurance Provider:</span>
              <span className="text-foreground capitalize">
                {appointment?.patient?.insurance_provider?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Policy Number:</span>
              <span className="text-foreground">{appointment?.patient?.insurance_number}</span>
            </div>
          </div>
        </div>
      )}
      {/* Payment Summary */}
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Total Amount</span>
          <span className="font-bold text-primary text-xl">
            {formatCurrency(totalAmount())}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Payment will be processed securely through our encrypted payment gateway
        </p>
      </div>
      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isProcessingPayment}
      >
        {isProcessingPayment ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Icon name="Lock" size={20} className="mr-2" />
            Secure Payment - {formatCurrency(totalAmount())}
          </div>
        )}
      </Button>
      {/* Payment Security Info */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Icon name="Shield" size={14} className="mr-1" />
            SSL Encrypted
          </div>
          <div className="flex items-center">
            <Icon name="Lock" size={14} className="mr-1" />
            PCI Compliant
          </div>
          <div className="flex items-center">
            <Icon name="CheckCircle" size={14} className="mr-1" />
            256-bit Security
          </div>
        </div>
      </div>
    </form>
  );
};

export default PaymentForm;