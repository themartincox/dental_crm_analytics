import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Check, Users, CreditCard, Calculator, TrendingUp, Shield, MessageSquare } from 'lucide-react';
import { pricingService } from '../../services/pricingService';
import ContactForm from '../../components/ContactForm';

const PricingPage = () => {
  const [selectedTier, setSelectedTier] = useState('professional');
  const [userCount, setUserCount] = useState(5);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const tiers = pricingService.getPricingTiers();
  const pricing = pricingService.calculateClientPricing(userCount);

  const features = [
    {
      category: 'Core Features',
      items: [
        'Patient Management System',
        'Appointment Scheduling',
        'Lead Management & Tracking',
        'Treatment Planning',
        'Clinical Notes & Records'
      ]
    },
    {
      category: 'Analytics & Reporting',
      items: [
        'Practice Performance Dashboard',
        'Revenue Analytics',
        'Patient Journey Tracking',
        'Lead Conversion Reports',
        'Custom Report Builder'
      ]
    },
    {
      category: 'Marketing & Growth',
      items: [
        'Embeddable Booking Widget',
        'Email & SMS Automation',
        'Membership Program Management',
        'Cross-site Analytics',
        'ROI Tracking'
      ]
    },
    {
      category: 'Compliance & Security',
      items: [
        'GDPR Compliance Tools',
        'AES-level Encryption',
        'Audit Trail & Logging',
        'Data Backup & Recovery',
        'Role-based Access Control'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>AES CRM Pricing - Transparent, Value-Driven Pricing for Dental Practices</title>
        <meta name="description" content="Simple, transparent pricing for dental practices. £1,000 installation with 2 seats included for 12 months free. Additional seats just £50/month." />
        <meta name="keywords" content="dental CRM pricing, practice management software cost, dental software pricing" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                One installation fee, 2 seats included for 12 months free, then just £50 per additional seat. 
                No hidden costs, no surprises.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Calculator */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Calculate Your Cost
              </h2>
              <p className="text-lg text-gray-600">
                See exactly what your practice will pay
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calculator */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Service Providers
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setUserCount(Math.max(1, userCount - 1))}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-xl"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={userCount}
                      onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 text-center text-2xl font-bold border border-gray-300 rounded-lg px-4 py-3"
                      min="1"
                    />
                    <button
                      onClick={() => setUserCount(userCount + 1)}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Calculator className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-900">Your Pricing</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Installation Fee:</span>
                      <span className="font-semibold">{pricingService.formatCurrency(pricing.breakdown.installation)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Included Seats (2):</span>
                      <span className="font-semibold text-green-600">
                        Free for 12 months
                      </span>
                    </div>
                    
                    {pricing.additionalSeats > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Additional Seats ({pricing.additionalSeats}):</span>
                        <span className="font-semibold">
                          {pricingService.formatCurrency(pricing.breakdown.additionalSeatsCost)}/month
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t border-blue-200 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Monthly Cost:</span>
                        <span className="text-blue-600">
                          {pricingService.formatCurrency(pricing.totalMonthlyCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Proposition */}
              <div className="space-y-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-green-900">Why This Pricing Works</h3>
                  </div>
                  
                  <ul className="space-y-3 text-sm text-green-700">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>No monthly fees for your first 2 service providers for 12 months</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Additional seats cost less than hiring a receptionist</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>One-time setup includes training and configuration</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Scale up or down as your practice grows</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">ROI Example</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>For a 5-provider practice:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Installation: £1,000 (one-time)</li>
                      <li>Monthly cost: £150 (3 additional seats)</li>
                      <li>Annual cost: £2,800</li>
                      <li>Typical savings: £15,000+ per year</li>
                    </ul>
                    <p className="font-semibold text-green-600 mt-2">
                      ROI: 435% in first year
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-lg text-gray-600">
                All plans include the same features - only the number of seats differs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiers.map((tier, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl border-2 p-8 ${
                    tier.userCount === 5 
                      ? 'border-blue-500 shadow-lg scale-105' 
                      : 'border-gray-200'
                  }`}
                >
                  {tier.userCount === 5 && (
                    <div className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-6">{tier.description}</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      {pricingService.formatCurrency(tier.monthlyCost)}
                    </div>
                    <div className="text-gray-600">per month</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {tier.userCount} service providers
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-gray-600">
                Comprehensive features included in all plans
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((category, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {category.category}
                  </h3>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of dental practices already using AES CRM to grow their business
            </p>
            <div className="space-x-4">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button 
                onClick={() => setIsContactOpen(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors flex items-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactForm 
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        title="Contact Sales"
        subtitle="Get in touch with our sales team to discuss your practice's needs"
        defaultSubject="Pricing Inquiry"
      />
    </>
  );
};

export default PricingPage;
