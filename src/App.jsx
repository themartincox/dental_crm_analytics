import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';
import { replaceConsole } from './utils/consoleReplacer';
import { measureWebVitals } from './utils/performance';
import { logger } from './utils/logger';

function App() {
  useEffect(() => {
    // Initialize console replacement for better logging
    replaceConsole();
    
    // Start performance monitoring
    measureWebVitals();
    
    // Log app initialization
    logger.info('AES CRM Application initialized', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.VITE_APP_VERSION || '1.0.0'
    });
  }, []);

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App