import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, LogIn } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import WaitlistModal from './components/WaitlistModal';
import TenantSignupModal from './components/TenantSignupModal';
import OptionCard from './components/OptionCard';

const GetStartedGatewayPage = () => {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);

  const openWaitlistModal = () => {
    setIsWaitlistModalOpen(true);
  };

  const closeWaitlistModal = () => {
    setIsWaitlistModalOpen(false);
  };

  const openTenantModal = () => setIsTenantModalOpen(true);
  const closeTenantModal = () => setIsTenantModalOpen(false);

  return (
    <>
      <SEOHead 
        title="Get Started - AES CRM"
        description="Choose your path to transform your practice with AES CRM. Join our waitlist for early access or access your existing account."
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-900">
                  AES CRM
                </div>
              </div>
              
              {/* Back to Home */}
              <Link 
                to="/"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Ready to Transform Your Practice?
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Choose your path forward with AES CRM. Whether you're exploring our platform for the first time 
                or ready to access your account, we've made it simple to get started.
              </p>
            </motion.div>

            {/* Options Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
              {/* Waitlist Option */}
              <OptionCard
                icon={Users}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
                title="Join Our Waitlist"
                subtitle="New to AES CRM"
                description="Get early access to the comprehensive aesthetic practice management system that's transforming dental practices worldwide."
                features={[
                  "Be first to access new features",
                  "Exclusive launch pricing",
                  "Priority onboarding support",
                  "Join 500+ practices waiting"
                ]}
                actionLabel="Join Waitlist"
                onClick={openWaitlistModal}
                variant="primary"
              />

              {/* Login Option */}
              <OptionCard
                icon={LogIn}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-100"
                title="Access Your Account"
                subtitle="Existing User"
                description="Welcome back! Sign in to access your practice dashboard, manage patients, and continue optimizing your practice operations."
                features={[
                  "Access your practice dashboard",
                  "Manage patient appointments",
                  "View analytics and reports",
                  "Continue where you left off"
                ]}
                actionLabel="Sign In"
                linkTo="/login"
                variant="secondary"
              />

              {/* Self-serve clinic sign-up */}
              <OptionCard
                icon={Users}
                iconColor="text-indigo-600"
                iconBg="bg-indigo-100"
                title="Create Your Clinic"
                subtitle="Self‑serve sign up"
                description="Spin up a tenant for your practice. Your request enters pending approval and we’ll email you next steps."
                features={[
                  "Tenant created as pending",
                  "Basic tier by default",
                  "Approval and onboarding by admin",
                  "Branding + modules configurable later"
                ]}
                actionLabel="Create Clinic"
                onClick={openTenantModal}
                variant="primary"
              />
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 text-center"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto">
                <p className="text-gray-500 text-sm mb-4">Trusted by practices worldwide</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-500">Practices on waitlist</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-sm text-gray-500">Support availability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">99.9%</div>
                    <div className="text-sm text-gray-500">Platform uptime</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Help Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 text-center"
            >
              <p className="text-gray-500 text-sm">
                Need help deciding? 
                <a 
                  href="mailto:support@aescrm.com" 
                  className="text-blue-600 hover:text-blue-700 ml-1 font-medium"
                >
                  Contact our team
                </a>
              </p>
            </motion.div>
          </div>
        </main>

        {/* Waitlist Modal */}
        <WaitlistModal 
          isOpen={isWaitlistModalOpen}
          onClose={closeWaitlistModal}
        />
        <TenantSignupModal isOpen={isTenantModalOpen} onClose={closeTenantModal} />
      </div>
    </>
  );
};

export default GetStartedGatewayPage;
