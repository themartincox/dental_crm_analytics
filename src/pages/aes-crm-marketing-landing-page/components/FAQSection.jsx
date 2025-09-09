import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Is AES CRM built for dental practices?",
      answer: "Yes. AES CRM launches with private and cosmetic dentists in mind, and expands naturally to aesthetics clinics. Our workflows are specifically designed for patient journey management in dental and cosmetic practices."
    },
    {
      question: "Is AES CRM GDPR compliant?",
      answer: "AES CRM is designed with GDPR in mind and will provide data processing addenda and UK/EU hosting options at launch. We take data protection seriously and ensure full compliance with privacy regulations."
    },
    {
      question: "Can I take deposits for bookings?",
      answer: "Yes — online booking with deposits is built in to lower no-shows and secure chair time. Our payment system integrates seamlessly with your booking flow to reduce cancellations and improve cash flow."
    },
    {
      question: "How does AES CRM compare to other dental software?",
      answer: "Unlike traditional dental practice management software, AES CRM focuses specifically on patient acquisition, journey automation, and conversion optimization. We're designed for growth-focused practices that want beautiful, modern tools."
    },
    {
      question: "When will AES CRM be available?",
      answer: "We\'re currently in pre-launch phase with early access beginning Q2 2025. Waitlist members will be the first to get access and receive special launch pricing."
    },
    {
      question: "What kind of support do you provide?",
      answer: "As a Postino Studios product, you get white-glove onboarding, dedicated account management, and priority support. We're committed to your practice's success, not just software deployment."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Everything you need to know about AES CRM</p>
        </div>

        <div className="space-y-4">
          {faqs?.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq?.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <p className="text-gray-700 leading-relaxed">{faq?.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* JSON-LD for FAQ */}
        <script type="application/ld+json">
        {JSON.stringify({
          "@context":"https://schema.org",
          "@type":"FAQPage",
          "mainEntity": faqs?.map(faq => ({
            "@type":"Question",
            "name": faq?.question,
            "acceptedAnswer": {
              "@type":"Answer",
              "text": faq?.answer
            }
          }))
        })}
        </script>
      </div>
    </section>
  );
};

export default FAQSection;