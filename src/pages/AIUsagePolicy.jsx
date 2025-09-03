import React from 'react';
import AIUsagePolicy from '../components/AIUsagePolicy';
import SEOHead from '../components/SEOHead';

const AIUsagePolicyPage = () => {
  return (
    <>
      <SEOHead 
        title="AI Usage Policy - Data Protection & GDPR Compliance"
        description="Comprehensive AI usage policy for dental practice ensuring GDPR compliance, data protection, and patient confidentiality in AI-powered systems."
        keywords="AI policy, GDPR compliance, data protection, dental practice, patient confidentiality, special category data"
        canonical="/ai-policy"
        image="/images/ai-policy-og.jpg"
        canonicalUrl="https://yoursite.com/ai-policy"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "AI Usage Policy",
          "description": "Comprehensive AI usage policy for dental practice ensuring GDPR compliance, data protection, and patient confidentiality in AI-powered systems."
        }}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <AIUsagePolicy />
        </div>
      </div>
    </>
  );
};

export default AIUsagePolicyPage;