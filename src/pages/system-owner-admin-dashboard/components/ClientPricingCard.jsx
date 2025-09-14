import React from 'react';
import { CreditCard, Users, Calendar, TrendingUp } from 'lucide-react';
import { pricingService } from '../../../services/pricingService';

const ClientPricingCard = ({ client }) => {
  if (!client) return null;

  const pricing = pricingService.getClientPricingSummary(client);
  const isInFreeTrial = new Date(client.free_trial_ends_at) > new Date();
  const daysRemaining = isInFreeTrial 
    ? Math.ceil((new Date(client.free_trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pricing Details</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isInFreeTrial 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {isInFreeTrial ? 'Free Trial' : 'Paid Plan'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Pricing */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Service Providers</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{pricing.userCount}</div>
          <div className="text-sm text-gray-600">
            {pricing.includedSeats} included + {pricing.additionalSeats} additional
          </div>

          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Monthly Cost</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{pricing.monthlyCost}</div>
          {pricing.additionalSeats > 0 && (
            <div className="text-sm text-gray-600">
              £50 per additional seat
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Installation Fee</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{pricing.breakdown.installation}</div>
        </div>

        {/* Trial Status */}
        <div className="space-y-4">
          {isInFreeTrial && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Free Trial Active</span>
              </div>
              <div className="text-sm text-green-700">
                <p className="mb-1">
                  {pricing.includedSeats} seats included for free
                </p>
                <p className="font-medium">
                  {daysRemaining} days remaining
                </p>
              </div>
            </div>
          )}

          {!isInFreeTrial && pricing.additionalSeats === 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">No Additional Cost</span>
              </div>
              <div className="text-sm text-blue-700">
                <p>Using only included seats</p>
                <p className="font-medium">£0 monthly cost</p>
              </div>
            </div>
          )}

          {!isInFreeTrial && pricing.additionalSeats > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Paid Plan</span>
              </div>
              <div className="text-sm text-yellow-700">
                <p className="mb-1">
                  {pricing.additionalSeats} additional seats
                </p>
                <p className="font-medium">
                  {pricing.monthlyCost} per month
                </p>
              </div>
            </div>
          )}

          {/* Next Billing */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600 mb-1">Next Billing</div>
            <div className="text-lg font-semibold text-gray-900">
              {isInFreeTrial 
                ? `After ${daysRemaining} days`
                : pricing.monthlyCost
              }
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Pricing Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Installation Fee (one-time):</span>
            <span className="font-medium">{pricing.breakdown.installation}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Included Seats (2):</span>
            <span className="font-medium">
              {isInFreeTrial ? 'Free for 12 months' : '£50/month each'}
            </span>
          </div>
          
          {pricing.additionalSeats > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Additional Seats ({pricing.additionalSeats}):</span>
              <span className="font-medium">£50/month each</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Monthly:</span>
              <span className="text-blue-600">{pricing.monthlyCost}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPricingCard;
