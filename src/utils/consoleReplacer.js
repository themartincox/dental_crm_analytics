// Console replacement utility for better logging control

import { logger } from './logger';

/**
 * Replace console methods with our logger
 * This should be called early in the application lifecycle
 */
export const replaceConsole = () => {
  if (typeof window === 'undefined') return;

  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };

  // Replace console methods
  console.log = (...args) => {
    originalConsole.log(...args);
    logger.info(args.join(' '));
  };

  console.warn = (...args) => {
    originalConsole.warn(...args);
    logger.warn(args.join(' '));
  };

  console.error = (...args) => {
    originalConsole.error(...args);
    logger.error(args.join(' '));
  };

  console.info = (...args) => {
    originalConsole.info(...args);
    logger.info(args.join(' '));
  };

  console.debug = (...args) => {
    originalConsole.debug(...args);
    logger.debug(args.join(' '));
  };

  // Add performance timing
  console.time = (label) => {
    originalConsole.time(label);
    logger.time(label);
  };

  console.timeEnd = (label) => {
    originalConsole.timeEnd(label);
    logger.timeEnd(label);
  };

  // Return original console for restoration
  return originalConsole;
};

/**
 * Restore original console methods
 */
export const restoreConsole = (originalConsole) => {
  if (!originalConsole) return;

  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
  console.time = originalConsole.time;
  console.timeEnd = originalConsole.timeEnd;
};

/**
 * Enhanced console for development
 */
export const devConsole = {
  log: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${message}`, data || '');
    }
  },
  
  warn: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ ${message}`, data || '');
    }
  },
  
  error: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${message}`, data || '');
    }
  },
  
  success: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${message}`, data || '');
    }
  },
  
  info: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`ℹ️ ${message}`, data || '');
    }
  },
  
  api: (method, url, status, duration) => {
    if (process.env.NODE_ENV === 'development') {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${emoji} API ${method} ${url} - ${status} (${duration}ms)`);
    }
  },
  
  performance: (name, duration) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration}ms`);
    }
  }
};

export default {
  replaceConsole,
  restoreConsole,
  devConsole
};
