import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityIndicators = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'SSL Certificate',
      description: 'Your connection is secured with 256-bit encryption'
    },
    {
      icon: 'Lock',
      title: 'PCI DSS Compliant',
      description: 'Payment processing meets industry security standards'
    },
    {
      icon: 'CheckCircle',
      title: 'Fraud Protection',
      description: 'Advanced fraud detection and prevention systems'
    },
    {
      icon: 'Eye',
      title: 'Privacy Protected',
      description: 'Your personal information is never stored or shared'
    }
  ];

  return (
    <div className="mb-8">
      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center space-x-2 text-success">
            <Icon name="Shield" size={24} />
            <h2 className="text-lg font-semibold">Secure Payment Processing</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityFeatures?.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                  <Icon name={feature?.icon} size={16} className="text-success" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">{feature?.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{feature?.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Your payment information is encrypted and never stored on our servers
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityIndicators;