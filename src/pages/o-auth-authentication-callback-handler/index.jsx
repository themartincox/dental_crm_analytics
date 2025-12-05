import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

const OAuthAuthenticationCallbackHandler = () => {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing authentication.');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('processing');
        setMessage('Exchanging authorization code for session.');

        // Exchange the code for a session
        const { data, error } = await supabase?.auth?.exchangeCodeForSession(window.location?.href);

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(`Authentication failed: ${error?.message || 'Unknown error occurred'}`);
          
          // Redirect to login with error after 3 seconds
          setTimeout(() => {
            navigate('/login?auth=error', { replace: true });
          }, 3000);
          return;
        }

        if (data?.session) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting to dashboard.');
          
          // Redirect to dashboard after successful auth
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage('No session created. Please try signing in again.');
          
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        }
      } catch (err) {
        console.error('Callback handler error:', err);
        setStatus('error');
        setMessage('Network error occurred. Please check your connection and try again.');
        
        setTimeout(() => {
          navigate('/login?auth=error', { replace: true });
        }, 3000);
      }
    };

    // Only process if there's a code in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams?.get('code');
    
    if (code) {
      handleAuthCallback();
    } else {
      // No code present, redirect to login
      setStatus('error');
      setMessage('No authorization code found. Redirecting to login.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }
  }, [navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader className="h-8 w-8 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader className="h-8 w-8 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {/* App Branding */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dental CRM</h1>
              <p className="text-sm text-gray-500 mt-1">Secure Authentication</p>
            </div>

            {/* Status Icon */}
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>

            {/* Status Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {status === 'processing' && 'Processing Authentication'}
              {status === 'success' && 'Authentication Successful'}
              {status === 'error' && 'Authentication Error'}
            </h2>

            {/* Status Message */}
            <p className={`text-sm ${getStatusColor()} mb-6`}>
              {message}
            </p>

            {/* Progress Steps */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700">Authorization received</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700">Token exchange</span>
                {status === 'processing' ? (
                  <Loader className="h-4 w-4 text-blue-500 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700">Session establishment</span>
                {status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                )}
              </div>
            </div>

            {/* Security Indicators */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Secure connection</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>CSRF protection enabled</span>
              </div>
            </div>

            {/* Error Actions */}
            {status === 'error' && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Sign In
                </button>
                <p className="text-xs text-gray-500">
                  Need help? Contact{' '}
                  <a href="mailto:support@dentalcrm.com" className="text-blue-600 hover:underline">
                    support@dentalcrm.com
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthAuthenticationCallbackHandler;