import React, { useState, useEffect } from 'react';
import { Calculator, Users, CreditCard, TrendingUp } from 'lucide-react';
import { pricingService } from '../../../services/pricingService';

const PricingCalculator = ({ client, onPricingUpdate }) => {
  const [userCount, setUserCount] = useState(client?.total_users || 2);
  const [months, setMonths] = useState(12);
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    if (userCount) {
      const calculatedPricing = pricingService.calculateClientPricing(userCount, months);
      setPricing(calculatedPricing);
    }
  }, [userCount, months]);

  const handleUserCountChange = (newCount) => {
    setUserCount(Math.max(1, newCount));
    if (onPricingUpdate) {
      onPricingUpdate(pricingService.calculateClientPricing(newCount, months));
    }
  };

  const handleMonthsChange = (newMonths) => {
    setMonths(Math.max(1, newMonths));
  };

  if (!pricing) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Calculator className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Pricing Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Service Providers
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleUserCountChange(userCount - 1)}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={userCount <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={userCount}
                onChange={(e) => handleUserCountChange(parseInt(e.target.value) || 1)}
                className="w-20 text-center border border-gray-300 rounded-md px-3 py-2"
                min="1"
              />
              <button
                onClick={() => handleUserCountChange(userCount + 1)}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Duration (Months)
            </label>
            <select
              value={months}
              onChange={(e) => handleMonthsChange(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={1}>1 Month</option>
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
              <option value={24}>24 Months</option>
              <option value={36}>36 Months</option>
            </select>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Pricing Breakdown</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Installation Fee:</span>
                <span className="font-medium">{pricingService.formatCurrency(pricing.breakdown.installation)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Included Seats (2):</span>
                <span className="font-medium">
                  {pricing.breakdown.freeTrialMonths > 0 
                    ? `Free for ${pricing.breakdown.freeTrialMonths} months` 
                    : pricingService.formatCurrency(pricing.breakdown.includedSeatsCost)
                  }
                </span>
              </div>
              
              {pricing.additionalSeats > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Seats ({pricing.additionalSeats}):</span>
                  <span className="font-medium">{pricingService.formatCurrency(pricing.breakdown.additionalSeatsCost)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Cost:</span>
                  <span className="text-blue-600">{pricingService.formatCurrency(pricing.totalCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Cost Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Monthly Cost</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {pricingService.formatCurrency(pricing.totalMonthlyCost)}
            </div>
            <div className="text-sm text-blue-700">
              {pricing.additionalSeats > 0 
                ? `£50 per additional seat (${pricing.additionalSeats} seats)`
                : 'No additional monthly cost'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-4">Recommended Pricing Tiers</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricingService.getPricingTiers().map((tier, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                userCount <= tier.userCount && userCount > (index > 0 ? pricingService.getPricingTiers()[index-1].userCount : 0)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-center">
                <h5 className="font-semibold text-gray-900">{tier.name}</h5>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {pricingService.formatCurrency(tier.monthlyCost)}
                </div>
                <div className="text-sm text-gray-600">per month</div>
                <div className="text-xs text-gray-500 mt-1">
                  {tier.userCount} service providers
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="mt-6 bg-green-50 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
          <span className="font-medium text-green-900">Value Proposition</span>
        </div>
        <div className="text-sm text-green-700">
          <p className="mb-2">
            <strong>£1,000 installation fee</strong> includes setup, training, and 2 service provider seats for 12 months free.
          </p>
          <p>
            Additional seats are just <strong>£50 per month</strong> - significantly less than hiring additional staff or using multiple systems.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
