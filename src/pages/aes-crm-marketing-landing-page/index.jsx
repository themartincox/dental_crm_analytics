import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { measureWebVitals } from '../../utils/performance';
import { logger } from '../../utils/logger';
import { useSEO } from '../../utils/seo';
import OptimizedImage from '../../components/OptimizedImage';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, TrendingUp, Shield, Calendar, MessageSquare, BarChart3, Sparkles, Mail } from 'lucide-react';

// Lazy load non-critical components for better performance
const WaitlistForm = lazy(() => import('./components/WaitlistForm'));
const TestimonialCard = lazy(() => import('./components/TestimonialCard'));
const FAQSection = lazy(() => import('./components/FAQSection'));

// Loading component for lazy loaded components
const ComponentLoader = ({ children }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }>
    {children}
  </Suspense>
);

const AESCRMMarketingLandingPage = () => {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  // SEO optimization
  const seoData = useSEO({
    pageType: 'homepage',
    title: 'AES CRM — The Aesthetic CRM',
    description: 'AES CRM — The Aesthetic CRM platform for comprehensive aesthetic practice management',
    keywords: 'aesthetic CRM, dental CRM, practice management, patient management, appointment booking',
    canonical: '/',
    ogType: 'website'
  });

  // Performance monitoring
  useEffect(() => {
    // Start Web Vitals monitoring
    measureWebVitals();
    
    // Log page load performance
    logger.info('Marketing page loaded', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }, []);

  const features = [
    {
      icon: Users,
      title: "Lead Capture",
      description: "Forms, ads, and website enquiries go straight in",
      benefit: "No more missed opportunities"
    },
    {
      icon: MessageSquare,
      title: "Automated Journeys",
      description: "Email, SMS & WhatsApp flows",
      benefit: "Patients never slip through the cracks"
    },
    {
      icon: Calendar,
      title: "Online Booking",
      description: "Appointments & deposits in one place",
      benefit: "Less admin, more revenue"
    },
    {
      icon: BarChart3,
      title: "Growth Dashboard",
      description: "Clear ROI & patient journey analytics",
      benefit: "Data you can act on"
    },
    {
      icon: Shield,
      title: "Secure by Design",
      description: "AES-level encryption & GDPR compliance",
      benefit: "Trust and safety built in"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Mitchell",
      practice: "Pear Tree Dental",
      location: "London",
      content: "AES CRM transformed our patient journey. We\'ve seen a 40% increase in booking conversions since implementing their automated follow-up sequences.",
      rating: 5
    },
    {
      name: "Dr. James Thompson",
      practice: "Elite Dental Clinic",
      location: "Manchester",
      content: "The aesthetic design impressed our patients immediately. Finally, a CRM that matches our practice's premium brand.",
      rating: 5
    },
    {
      name: "Dr. Emma Richardson",
      practice: "Smile Studio",
      location: "Edinburgh", 
      content: "ROI tracking is incredible. We can see exactly which marketing channels bring the highest-value patients.",
      rating: 5
    }
  ];

  return (
    <>
      <Helmet>
        <title>AES CRM — Transform Your Dental Practice with Intelligent CRM</title>
        <meta name="description" content="The aesthetic CRM built for dental and cosmetic practices. Capture leads, automate follow-ups, and grow your clinic — securely, beautifully, and efficiently." />
        <meta name="keywords" content="dental CRM, aesthetic CRM, patient journey CRM, dental practice management, cosmetic dentistry software" />
        <meta property="og:title" content="AES CRM — Transform Your Dental Practice" />
        <meta property="og:description" content="The aesthetic CRM for private dental and cosmetic clinics — capture leads, automate follow-ups, take deposits, and track ROI." />
        <meta property="og:image" content="/assets/images/aes-crm-og-cover.jpg" />
        <meta property="og:url" content="https://aescrm.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AES CRM — The Aesthetic CRM" />
        <meta name="twitter:description" content="Ace your patient journey with AES CRM — built for dental and cosmetic practices." />
        
        {/* JSON-LD Schema */}
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["Organization","Brand"],
          "@id": "https://aescrm.com/#org",
          "name": "AES CRM",
          "alternateName": "Ace CRM",
          "slogan": "The Aesthetic CRM — Ace your patient journey.",
          "url": "https://aescrm.com/",
          "logo": "https://aescrm.com/_assets/logo.png",
          "sameAs": [
            "https://www.linkedin.com/company/aes-crm",
            "https://x.com/aescrm"
          ],
          "parentOrganization": {
            "@type": "Organization",
            "@id": "https://postino.cc/#org",
            "name": "Postino Studios (a division of Postino Ltd)",
            "url": "https://postino.cc/",
            "brand": "Delivered by Postino"
          },
          "foundingDate": "2025-01-01",
          "areaServed": ["GB","IE","EU","US"],
          "contactPoint": [{
            "@type": "ContactPoint",
            "contactType": "sales",
            "email": "hello@aescrm.com",
            "availableLanguage": ["en-GB","en-US"]
          }]
        })}
        </script>

        <script type="application/ld+json">
        {JSON.stringify({
          "@context":"https://schema.org",
          "@type":"WebSite",
          "@id":"https://aescrm.com/#website",
          "url":"https://aescrm.com/",
          "name":"AES CRM",
          "publisher":{"@id":"https://aescrm.com/#org"},
          "potentialAction":{
            "@type":"SearchAction",
            "target":"https://aescrm.com/search?q={query}",
            "query-input":"required name=query"
          }
        })}
        </script>

        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["SoftwareApplication","Product"],
          "@id": "https://aescrm.com/#app",
          "name": "AES CRM",
          "applicationCategory": "BusinessApplication",
          "applicationSubCategory": "Customer Relationship Management",
          "operatingSystem": "Web",
          "softwareVersion": "v1",
          "description": "AES CRM is the aesthetic CRM for private dental and cosmetic clinics — capture leads, automate follow-ups, take deposits, and track ROI.",
          "image": "https://aescrm.com/_assets/og-cover.jpg",
          "url": "https://aescrm.com/",
          "brand": {"@id":"https://aescrm.com/#org"},
          "isPartOf": {"@id":"https://aescrm.com/#website"},
          "creator": {"@id":"https://postino.cc/#org"},
          "publisher": {"@id":"https://aescrm.com/#org"},
          "audience": {
            "@type": "Audience",
            "audienceType": ["Private dentists","Cosmetic dentists","Aesthetics clinics","Med-spa operators"]
          },
          "offers": {
            "@type": "Offer",
            "url": "https://aescrm.com/#waitlist",
            "price": "0",
            "priceCurrency": "GBP",
            "category": "Pre-launch waitlist",
            "availability": "https://schema.org/PreOrder",
            "eligibleRegion": ["GB","EU","US"]
          },
          "featureList": [
            "Lead capture from forms and ads",
            "Automated email/SMS/WhatsApp journeys",
            "Online booking with deposits",
            "Growth dashboard & ROI tracking",
            "GDPR-ready, security-first design"
          ]
        })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        {/* Navigation Header */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">AES CRM</span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Features</a>
                  <a href="#testimonials" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Testimonials</a>
                  <a href="#faq" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">FAQ</a>
                </div>
              </div>
              <div>
                <a 
                  href="/get-started"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-16 pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Delivered by Postino
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                    <span className="block">✨ Ace your patient</span>
                    <span className="block text-blue-600">journey with AES CRM</span>
                  </h1>
                  <p className="mt-6 text-xl text-gray-600 max-w-2xl">
                    The <strong>aesthetic CRM</strong> built for dental and cosmetic practices. Capture leads, automate follow-ups, and grow your clinic — securely, beautifully, and efficiently.
                  </p>
                  <div className="mt-8">
                    <button
                      onClick={() => setIsWaitlistOpen(true)}
                      className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      Join the Waitlist
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                    <p className="mt-2 text-sm text-gray-500">Early access • No spam • GDPR compliant</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Dashboard Preview</h3>
                      <p className="text-sm text-gray-600 mt-2">Beautiful, data-driven insights</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Features Table */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Features That Matter</h2>
              <p className="text-xl text-gray-600">Everything you need, nothing you don't</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-2xl shadow-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feature</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">What It Means for Clinics</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Why It Matters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {features?.map((feature, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <feature.icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-semibold text-gray-900">{feature?.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-gray-700">{feature?.description}</td>
                      <td className="px-6 py-6 text-green-600 font-medium">{feature?.benefit}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why AES CRM Section */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  A CRM designed for <em>aesthetic</em> practices
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  Most CRMs look like they were made for accountants. <strong>AES CRM</strong> is different — clean design, intuitive flow, and made to impress both your team and your patients.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Built for <strong>private dentists, cosmetic clinics, and med-spas</strong></span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Designed with <strong>aesthetic branding</strong> in mind</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Backed by <strong>Postino Studios</strong> — the innovation arm of Postino</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Users, label: "Lead Capture", value: "99%" },
                      { icon: MessageSquare, label: "Automation", value: "24/7" },
                      { icon: Calendar, label: "Bookings", value: "+40%" },
                      { icon: BarChart3, label: "ROI Growth", value: "3.2x" }
                    ]?.map((stat, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{stat?.value}</div>
                        <div className="text-sm text-gray-600">{stat?.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Practices</h2>
              <p className="text-xl text-gray-600">See what dental professionals say about AES CRM</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials?.map((testimonial, index) => (
                <ComponentLoader key={index}>
                  <TestimonialCard testimonial={testimonial} index={index} />
                </ComponentLoader>
              ))}
            </div>

            {/* Practice Logos */}
            <div className="mt-16 border-t border-gray-200 pt-16">
              <h3 className="text-center text-lg font-semibold text-gray-600 mb-8">
                Practices using AES CRM see an average 40% increase in conversions
              </h3>
              <div className="flex justify-center items-center space-x-12 opacity-60">
                <div className="text-lg font-bold text-gray-400">Pear Tree Dental</div>
                <div className="text-lg font-bold text-gray-400">Elite Dental</div>
                <div className="text-lg font-bold text-gray-400">Smile Studio</div>
              </div>
            </div>
          </div>
        </section>

        {/* Built for Dental & Beyond */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">Built for Dental & Beyond</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                AES CRM launches with <strong>cosmetic dentistry in mind</strong> — but its workflows extend naturally into:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                {[
                  "Aesthetic medicine & med-spa",
                  "Skin clinics", 
                  "Cosmetic surgery",
                  "Private healthcare"
                ]?.map((item, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                    <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setIsWaitlistOpen(true)}
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              >
                See How It Works
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <ComponentLoader>
          <FAQSection />
        </ComponentLoader>

        {/* Delivered by Postino */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Delivered by Postino</h2>
              <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
                AES CRM is a product of <strong>Postino Studios</strong>, the development arm of Postino.cc.
                This means you're not just getting software — you're getting the combined power of design, growth, and AI automation.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-gray-700 font-medium">Powered by Postino.cc</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                👋 Ready to ace your patient journey?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join our early access list and be first to transform your clinic's growth.
              </p>
              <button
                onClick={() => setIsWaitlistOpen(true)}
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                  <span className="ml-2 text-xl font-bold">AES CRM</span>
                </div>
                <p className="text-gray-400 text-sm">
                  The aesthetic CRM for dental and cosmetic practices.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Product</h3>
                <div className="space-y-2">
                  <a href="#features" className="text-gray-400 hover:text-white text-sm block">Features</a>
                  <a href="#testimonials" className="text-gray-400 hover:text-white text-sm block">Testimonials</a>
                  <a href="#faq" className="text-gray-400 hover:text-white text-sm block">FAQ</a>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Company</h3>
                <div className="space-y-2">
                  <a href="https://postino.cc" className="text-gray-400 hover:text-white text-sm block">Postino Studios</a>
                  <a href="/privacy" className="text-gray-400 hover:text-white text-sm block">Privacy Policy</a>
                  <a href="/terms" className="text-gray-400 hover:text-white text-sm block">Terms</a>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Mail className="h-4 w-4 mr-2" />
                    hello@aescrm.com
                  </div>
                  <div className="text-gray-400 text-sm">
                    <em>Delivered by Postino</em>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 AES CRM. <em>Delivered by Postino</em> (postino.cc)
              </p>
            </div>
          </div>
        </footer>

        {/* Waitlist Modal */}
        <ComponentLoader>
          <WaitlistForm 
            isOpen={isWaitlistOpen} 
            onClose={() => setIsWaitlistOpen(false)} 
          />
        </ComponentLoader>
      </div>
    </>
  );
};

export default AESCRMMarketingLandingPage;