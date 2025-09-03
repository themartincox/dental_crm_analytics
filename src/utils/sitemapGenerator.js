import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

// Define all public routes that should be indexed
const publicRoutes = [
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date()?.toISOString()
  },
  {
    url: '/public-booking-interface',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date()?.toISOString()
  },
  {
    url: '/login',
    changefreq: 'monthly',
    priority: 0.5,
    lastmod: new Date()?.toISOString()
  }
];

// Private dashboard routes (should not be indexed)
const privateRoutes = [
  '/practice-performance-overview-dashboard',
  '/patient-management-dashboard',
  '/appointment-scheduler',
  '/lead-management-screen',
  '/patient-journey-revenue-optimization-dashboard',
  '/lead-generation-conversion-analytics-dashboard',
  '/compliance-operations-monitoring-dashboard',
  '/widget-configuration-dashboard',
  '/cross-site-analytics-dashboard',
  '/service-provider-matching-engine',
  '/booking-confirmation-payment-processing'
];

/**
 * Generate sitemap XML for public routes only
 * Private dashboard routes are excluded to prevent indexing sensitive areas
 */
export const generateSitemap = async () => {
  try {
    // Create a stream to write to
    const stream = new SitemapStream({ 
      hostname: process.env.VITE_APP_BASE_URL || 'https://dentalcrm.com' 
    });

    // Create sitemap
    const sitemap = await streamToPromise(
      Readable?.from(publicRoutes)?.pipe(stream)
    );

    return sitemap?.toString();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
};

/**
 * Generate robots.txt content
 * Explicitly disallow private dashboard routes for security
 */
export const generateRobotsTxt = () => {
  const baseUrl = process.env?.VITE_APP_BASE_URL || 'https://dentalcrm.com';
  
  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *

# Allow public pages
Allow: /
Allow: /public-booking-interface
Allow: /login

# Disallow private dashboard and sensitive areas
${privateRoutes?.map(route => `Disallow: ${route}`)?.join('\n')}

# Disallow common sensitive directories
Disallow: /admin
Disallow: /api
Disallow: /dashboard
Disallow: /private
Disallow: /.env
Disallow: /config

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1
`;
};

/**
 * Build-time sitemap generation utility
 * Can be integrated into the build process
 */
export const buildSitemap = async () => {
  try {
    const sitemap = await generateSitemap();
    const robotsTxt = generateRobotsTxt();

    // In a real build process, these would be written to the public directory
    console.log('Generated sitemap.xml');
    console.log('Generated robots.txt');

    return {
      sitemap,
      robotsTxt
    };
  } catch (error) {
    console.error('Build sitemap failed:', error);
    throw error;
  }
};

export default {
  generateSitemap,
  generateRobotsTxt,
  buildSitemap
};