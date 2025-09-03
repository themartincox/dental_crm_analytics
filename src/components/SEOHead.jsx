import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ 
  title = 'Dental CRM Analytics', 
  description = 'Comprehensive dental practice management and analytics platform',
  keywords = 'dental practice, CRM, analytics, patient management, appointments',
  image,
  noIndex = false,
  noFollow = false,
  canonicalUrl,
  structuredData,
  children
}) => {
  const location = useLocation();
  const currentUrl = `${window?.location?.origin}${location?.pathname}`;
  const canonical = canonicalUrl || currentUrl;

  // Default structured data for the organization
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Postino\'s Yolo CRM",
    "description": "Healthcare Intelligence Platform for Dental Practices",
    "applicationCategory": "HealthcareApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Postino\'s Yolo CRM"
    }
  };

  const combinedStructuredData = structuredData 
    ? [defaultStructuredData, ...structuredData] 
    : [defaultStructuredData];

  // Create robots meta content
  const robotsContent = [];
  if (noIndex) robotsContent?.push('noindex');
  if (noFollow) robotsContent?.push('nofollow');
  if (robotsContent?.length === 0) robotsContent?.push('index', 'follow');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent?.join(', ')} />
      <link rel="canonical" href={canonical} />
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Postino's Yolo CRM" />
      {image && <meta property="og:image" content={image} />}
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {/* Additional SEO Meta Tags */}
      <meta name="author" content="Postino's Yolo CRM" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="format-detection" content="telephone=no" />
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Structured Data */}
      {combinedStructuredData?.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      {/* Custom head elements */}
      {children}
    </Helmet>
  );
};

export default SEOHead;