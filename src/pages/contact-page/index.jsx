import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import ContactForm from '../../components/ContactForm';

const ContactPage = () => {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: 'hello@aescrm.com',
      description: 'Send us an email anytime'
    },
    {
      icon: Phone,
      title: 'Phone',
      details: '+44 20 1234 5678',
      description: 'Mon-Fri 9am-6pm GMT'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: '123 Business Street',
      subtitle: 'London, SW1A 1AA',
      description: 'United Kingdom'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday',
      subtitle: '9:00 AM - 6:00 PM GMT',
      description: 'Weekend support available'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - AES CRM</title>
        <meta name="description" content="Get in touch with the AES CRM team. We're here to help you transform your dental practice with our comprehensive CRM solution." />
        <meta name="keywords" content="contact, dental CRM, support, sales, AES CRM" />
        <link rel="canonical" href="https://aescrm.com/contact" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Contact Us
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ready to transform your dental practice? Get in touch with our team 
                to discuss how AES CRM can help you grow your business.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <item.icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {item.details}
                      </p>
                      {item.subtitle && (
                        <p className="text-gray-600">
                          {item.subtitle}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Why Choose AES CRM?
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Comprehensive patient management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Advanced analytics and reporting
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Lead generation and conversion tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    GDPR compliant and secure
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Send us a Message
              </h2>
              
              {isFormSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for your message. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsFormSubmitted(false)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <ContactForm
                  title=""
                  subtitle=""
                  showCompany={true}
                  showPhone={true}
                  defaultSubject="General Inquiry"
                  className="shadow-none border-0"
                />
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Quick answers to common questions about AES CRM
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How quickly can I get started?
                </h3>
                <p className="text-gray-600">
                  Most practices can be up and running within 24-48 hours. 
                  We provide full onboarding support to ensure a smooth transition.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you offer training?
                </h3>
                <p className="text-gray-600">
                  Yes! We provide comprehensive training for all team members, 
                  including video tutorials, live sessions, and ongoing support.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is my data secure?
                </h3>
                <p className="text-gray-600">
                  Absolutely. We use AES-level encryption, GDPR compliance, 
                  and regular security audits to protect your practice data.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I integrate with existing systems?
                </h3>
                <p className="text-gray-600">
                  Yes, AES CRM integrates with most popular dental software, 
                  payment processors, and calendar systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
