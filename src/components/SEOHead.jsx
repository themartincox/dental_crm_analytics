import React from 'react';
import { Helmet } from 'react-helmet';

const SEOHead = ({ 
  title = 'Dental CRM', 
  description = 'Professional dental practice management system', 
  keywords = 'dental, crm, practice management, appointments, patients',
  image = null,
  url = null 
}) => {
  const siteUrl = window.location.origin || 'https://dentalcrm.com';
  const fullUrl = url || window?.location?.href || siteUrl;
  const imageUrl = image || `${siteUrl}/assets/images/dental-crm-og.jpg`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Dental CRM" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Dental CRM Team" />
      <meta name="theme-color" content="#2563eb" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data for Healthcare */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Dental CRM",
          "description": description,
          "url": siteUrl,
          "applicationCategory": "Healthcare Management Software",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;