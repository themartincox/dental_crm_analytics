import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';
import { replaceConsole } from './utils/consoleReplacer';
import { measureWebVitals } from './utils/performance';
import { register as registerSW } from './utils/serviceWorker';
import { errorTrackingService } from './services/errorTrackingService';
import { analyticsService } from './services/analyticsService';
import { performanceMonitoringService } from './services/performanceMonitoringService';

function App() {
  useEffect(() => {
    // Initialize console replacement for better logging
    replaceConsole();

    // Start Web Vitals monitoring
    measureWebVitals();

    // Initialize monitoring services
    errorTrackingService.trackUserAction('app_initialized', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });

    // Start analytics tracking
    analyticsService.trackPageView('app', {
      appVersion: process.env.REACT_APP_VERSION || '1.0.0',
      buildTime: process.env.REACT_APP_BUILD_TIME || new Date().toISOString()
    });

    // Start performance monitoring
    performanceMonitoringService.startMonitoring();

    // Register service worker for caching and offline support
    registerSW({
      onSuccess: (registration) => {
        logger.info('Service Worker registered successfully', {
          registrationId: registration.id,
          scope: registration.scope,
          active: registration.active?.state
        });
        analyticsService.trackEvent('service_worker_registered', {
          registrationId: registration.id,
          scope: registration.scope
        });
      },
      onUpdate: (registration) => {
        logger.info('Service Worker updated', {
          registrationId: registration.id,
          scope: registration.scope,
          waiting: registration.waiting?.state
        });
        analyticsService.trackEvent('service_worker_updated', {
          registrationId: registration.id,
          scope: registration.scope
        });
        // Optionally show update notification to user
      }
    });

    // Track app performance
    const trackAppPerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        performanceMonitoringService.recordMetric('app_load_time', loadTime, {
          url: window.location.href,
          userAgent: navigator.userAgent
        });
      }
    };

    // Track performance after load
    if (document.readyState === 'complete') {
      trackAppPerformance();
    } else {
      window.addEventListener('load', trackAppPerformance);
    }

    // Cleanup function
    return () => {
      window.removeEventListener('load', trackAppPerformance);
      performanceMonitoringService.stopMonitoring();
    };
  }, []);

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App