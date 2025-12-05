/**
 * SEO optimization utilities for AES CRM
 * Provides tools for improving search engine optimization
 */

// Default SEO configuration
export const SEO_CONFIG = {
  siteName: 'AES CRM',
  siteUrl: 'https://aescrm.com',
  defaultTitle: 'AES CRM — The Aesthetic CRM',
  defaultDescription: 'AES CRM — The Aesthetic CRM platform for comprehensive aesthetic practice management',
  defaultImage: '/assets/images/aes-crm-og-image.jpg',
  twitterHandle: '@aescrm',
  locale: 'en_US',
  type: 'website'
};

// Page-specific SEO data
export const PAGE_SEO = {
  '/': {
    title: 'AES CRM — The Aesthetic CRM',
    description: 'AES CRM — The Aesthetic CRM platform for comprehensive aesthetic practice management',
    keywords: 'aesthetic CRM, dental CRM, practice management, patient management, appointment booking',
    canonical: '/',
    ogType: 'website'
  },
  '/pricing': {
    title: 'Pricing - AES CRM',
    description: 'Transparent pricing for AES CRM. £1,000 installation with 2 seats included for 12 months. Additional seats £50/month.',
    keywords: 'aesthetic CRM pricing, dental CRM cost, practice management pricing, CRM subscription',
    canonical: '/pricing',
    ogType: 'website'
  },
  '/contact': {
    title: 'Contact - AES CRM',
    description: 'Get in touch with AES CRM. Contact our team for sales inquiries, support, or general questions.',
    keywords: 'contact AES CRM, sales inquiry, support, customer service',
    canonical: '/contact',
    ogType: 'website'
  },
  '/dashboard': {
    title: 'Dashboard - AES CRM',
    description: 'Access your AES CRM dashboard for practice management, patient records, and analytics.',
    keywords: 'CRM dashboard, practice dashboard, patient management, analytics',
    canonical: '/dashboard',
    ogType: 'website',
    noIndex: true
  }
};

/**
 * Generate structured data for different page types
 * @param {string} pageType - Type of page
 * @param {Object} data - Page-specific data
 * @returns {Object} Structured data object
 */
export function generateStructuredData(pageType, data = {}) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}/assets/images/logo.png`,
    description: SEO_CONFIG.defaultDescription,
    sameAs: [
      'https://twitter.com/aescrm',
      'https://linkedin.com/company/aescrm'
    ]
  };

  switch (pageType) {
    case 'homepage':
      return {
        ...baseStructuredData,
        '@type': 'WebSite',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };

    case 'product':
      return {
        ...baseStructuredData,
        '@type': 'SoftwareApplication',
        name: 'AES CRM',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '1000',
          priceCurrency: 'GBP',
          description: 'Installation fee with 2 seats included for 12 months'
        }
      };

    case 'pricing':
      return {
        ...baseStructuredData,
        '@type': 'Product',
        name: 'AES CRM Pricing',
        description: 'Transparent pricing for AES CRM practice management software',
        offers: [
          {
            '@type': 'Offer',
            name: 'Installation',
            price: '1000',
            priceCurrency: 'GBP',
            description: 'One-time installation fee'
          },
          {
            '@type': 'Offer',
            name: 'Additional Seats',
            price: '50',
            priceCurrency: 'GBP',
            priceSpecification: {
              '@type': 'RecurringPaymentsPriceSpecification',
              billingDuration: 'P1M',
              billingIncrement: 1
            },
            description: 'Per additional seat per month'
          }
        ]
      };

    case 'contact':
      return {
        ...baseStructuredData,
        '@type': 'ContactPage',
        mainEntity: {
          '@type': 'Organization',
          name: SEO_CONFIG.siteName,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+44-xxx-xxx-xxxx',
            contactType: 'customer service',
            email: 'hello@aescrm.com'
          }
        }
      };

    default:
      return baseStructuredData;
  }
}

/**
 * Generate meta tags for a page
 * @param {Object} seoData - SEO data for the page
 * @returns {Object} Meta tags object
 */
export function generateMetaTags(seoData) {
  const {
    title = SEO_CONFIG.defaultTitle,
    description = SEO_CONFIG.defaultDescription,
    keywords = '',
    image = SEO_CONFIG.defaultImage,
    canonical = '',
    ogType = 'website',
    noIndex = false
  } = seoData;

  const fullTitle = title.includes(SEO_CONFIG.siteName) ? title : `${title} | ${SEO_CONFIG.siteName}`;
  const fullImage = image.startsWith('http') ? image : `${SEO_CONFIG.siteUrl}${image}`;
  const fullCanonical = canonical.startsWith('http') ? canonical : `${SEO_CONFIG.siteUrl}${canonical}`;

  return {
    title: fullTitle,
    description,
    keywords,
    canonical: fullCanonical,
    noIndex,
    openGraph: {
      title: fullTitle,
      description,
      type: ogType,
      url: fullCanonical,
      image: fullImage,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_CONFIG.twitterHandle,
      creator: SEO_CONFIG.twitterHandle,
      title: fullTitle,
      description,
      image: fullImage
    }
  };
}

/**
 * Generate sitemap data
 * @returns {Array} Sitemap entries
 */
export function generateSitemap() {
  const sitemap = [
    {
      url: '/',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 1.0
    },
    {
      url: '/pricing',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      url: '/contact',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.7
    }
  ];

  return sitemap;
}

/**
 * Generate robots.txt content
 * @returns {string} Robots.txt content
 */
export function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${SEO_CONFIG.siteUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /_headers
Disallow: /sw.js

# Allow important pages
Allow: /
Allow: /pricing
Allow: /contact
Allow: /assets/
`;
}

/**
 * Generate breadcrumb structured data
 * @param {Array} breadcrumbs - Breadcrumb items
 * @returns {Object} Breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SEO_CONFIG.siteUrl}${item.url}`
    }))
  };
}

/**
 * Generate FAQ structured data
 * @param {Array} faqs - FAQ items
 * @returns {Object} FAQ structured data
 */
export function generateFAQStructuredData(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate review structured data
 * @param {Array} reviews - Review items
 * @returns {Object} Review structured data
 */
export function generateReviewStructuredData(reviews) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'AES CRM',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
      reviewCount: reviews.length
    },
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating
      },
      reviewBody: review.text
    }))
  };
}

/**
 * SEO hook for React components
 * @param {Object} seoData - SEO data
 * @returns {Object} SEO configuration
 */
export function useSEO(seoData) {
  const metaTags = generateMetaTags(seoData);
  const structuredData = generateStructuredData(seoData.pageType, seoData);
  
  return {
    metaTags,
    structuredData,
    breadcrumbs: seoData.breadcrumbs ? generateBreadcrumbStructuredData(seoData.breadcrumbs) : null,
    faqs: seoData.faqs ? generateFAQStructuredData(seoData.faqs) : null,
    reviews: seoData.reviews ? generateReviewStructuredData(seoData.reviews) : null
  };
}

// Export default configuration
export default {
  SEO_CONFIG,
  PAGE_SEO,
  generateStructuredData,
  generateMetaTags,
  generateSitemap,
  generateRobotsTxt,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateReviewStructuredData,
  useSEO
};
