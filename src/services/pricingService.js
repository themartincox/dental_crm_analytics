// Pricing service for AES CRM SaaS model
export class PricingService {
  constructor() {
    this.pricing = {
      installationFee: 1000, // £1,000 one-time installation fee
      includedSeats: 2, // 2 seats included for 12 months FOC
      additionalSeatPrice: 50, // £50 per month per additional seat
      freeTrialMonths: 12, // 12 months free for included seats
      currency: 'GBP',
      currencySymbol: '£'
    };
  }

  // Calculate pricing for a client based on user count
  calculateClientPricing(userCount, months = 1) {
    const { installationFee, includedSeats, additionalSeatPrice, freeTrialMonths } = this.pricing;
    
    const additionalSeats = Math.max(0, userCount - includedSeats);
    const monthlyCost = additionalSeats * additionalSeatPrice;
    
    // For the first 12 months, included seats are free
    const freeMonths = Math.min(months, freeTrialMonths);
    const paidMonths = Math.max(0, months - freeTrialMonths);
    
    const totalMonthlyCost = (additionalSeats * additionalSeatPrice) + 
                            (paidMonths > 0 ? (includedSeats * additionalSeatPrice) : 0);
    
    return {
      installationFee,
      includedSeats,
      additionalSeats,
      monthlyCost,
      totalMonthlyCost,
      totalCost: installationFee + (totalMonthlyCost * months),
      breakdown: {
        installation: installationFee,
        includedSeatsCost: paidMonths > 0 ? (includedSeats * additionalSeatPrice * paidMonths) : 0,
        additionalSeatsCost: additionalSeats * additionalSeatPrice * months,
        freeTrialMonths: freeMonths,
        paidMonths: paidMonths
      }
    };
  }

  // Calculate revenue for multiple clients
  calculateSystemRevenue(clients, months = 1) {
    let totalInstallation = 0;
    let totalMonthly = 0;
    let totalRevenue = 0;

    clients.forEach(client => {
      const pricing = this.calculateClientPricing(client.total_users || 0, months);
      totalInstallation += pricing.installationFee;
      totalMonthly += pricing.totalMonthlyCost;
      totalRevenue += pricing.totalCost;
    });

    return {
      totalInstallation,
      totalMonthly,
      totalRevenue,
      averagePerClient: clients.length > 0 ? totalRevenue / clients.length : 0,
      currency: this.pricing.currency,
      currencySymbol: this.pricing.currencySymbol
    };
  }

  // Get pricing tiers based on user count
  getPricingTiers() {
    return [
      {
        name: 'Starter',
        userCount: 2,
        description: 'Perfect for small practices',
        monthlyCost: 0, // First 12 months free
        installationFee: this.pricing.installationFee,
        features: [
          '2 service provider seats included',
          '12 months free for included seats',
          'Basic patient management',
          'Appointment scheduling',
          'Lead management'
        ]
      },
      {
        name: 'Professional',
        userCount: 5,
        description: 'Ideal for growing practices',
        monthlyCost: this.calculateClientPricing(5).monthlyCost,
        installationFee: this.pricing.installationFee,
        features: [
          '2 seats included + 3 additional',
          'All Starter features',
          'Advanced analytics',
          'Membership management',
          'Widget configuration'
        ]
      },
      {
        name: 'Enterprise',
        userCount: 10,
        description: 'For large multi-location practices',
        monthlyCost: this.calculateClientPricing(10).monthlyCost,
        installationFee: this.pricing.installationFee,
        features: [
          '2 seats included + 8 additional',
          'All Professional features',
          'Cross-site analytics',
          'Compliance monitoring',
          'Priority support'
        ]
      }
    ];
  }

  // Format currency
  formatCurrency(amount) {
    return `${this.pricing.currencySymbol}${amount.toLocaleString('en-GB')}`;
  }

  // Get pricing summary for a client
  getClientPricingSummary(client) {
    const userCount = client.total_users || 0;
    const pricing = this.calculateClientPricing(userCount);
    
    return {
      clientName: client.organization_name,
      userCount,
      includedSeats: pricing.includedSeats,
      additionalSeats: pricing.additionalSeats,
      monthlyCost: this.formatCurrency(pricing.monthlyCost),
      totalCost: this.formatCurrency(pricing.totalCost),
      breakdown: {
        installation: this.formatCurrency(pricing.breakdown.installation),
        monthly: this.formatCurrency(pricing.monthlyCost),
        freeTrialMonths: pricing.breakdown.freeTrialMonths
      }
    };
  }

  // Calculate ROI for a client
  calculateROI(client, monthlySavings) {
    const pricing = this.calculateClientPricing(client.total_users || 0);
    const monthlyROI = monthlySavings - pricing.monthlyCost;
    const annualROI = monthlyROI * 12;
    const roiPercentage = pricing.monthlyCost > 0 ? (monthlyROI / pricing.monthlyCost) * 100 : 0;
    
    return {
      monthlyROI,
      annualROI,
      roiPercentage,
      paybackPeriod: pricing.installationFee / monthlyROI, // months
      isProfitable: monthlyROI > 0
    };
  }

  // Get pricing recommendations based on practice size
  getPricingRecommendation(practiceSize) {
    const recommendations = {
      '1-2 providers': {
        tier: 'Starter',
        userCount: 2,
        reasoning: 'Perfect for solo practitioners or small partnerships'
      },
      '3-5 providers': {
        tier: 'Professional', 
        userCount: 5,
        reasoning: 'Ideal for growing practices with multiple dentists and hygienists'
      },
      '6+ providers': {
        tier: 'Enterprise',
        userCount: 10,
        reasoning: 'Best for large practices with multiple locations and staff'
      }
    };

    return recommendations[practiceSize] || recommendations['1-2 providers'];
  }
}

export const pricingService = new PricingService();
export default pricingService;
