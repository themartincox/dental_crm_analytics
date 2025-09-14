// Centralized logging utility for better debugging and monitoring
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Log levels
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    };

    // In development, always log to console
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'info' ? 'info' : 'log';
      
      console[consoleMethod](`[${timestamp}] ${level.toUpperCase()}:`, message, data || '');
    }

    // In production, send to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring(logEntry);
    }
  }

  // Send logs to monitoring service (Sentry, DataDog, etc.)
  sendToMonitoring(logEntry) {
    // Example: Sentry.captureMessage(logEntry.message, logEntry.level);
    // Example: DataDog.log(logEntry);
    
    // For now, just store in localStorage for debugging
    if (typeof window !== 'undefined') {
      try {
        const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
        logs.push(logEntry);
        // Keep only last 100 logs
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100);
        }
        localStorage.setItem('app_logs', JSON.stringify(logs));
      } catch (error) {
        console.error('Failed to store log:', error);
      }
    }
  }

  // Convenience methods
  info(message, data = null) {
    this.log('info', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  debug(message, data = null) {
    if (this.isDevelopment) {
      this.log('debug', message, data);
    }
  }

  // Performance logging
  time(label) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // API call logging
  apiCall(method, url, status, duration, error = null) {
    this.log('info', `API ${method} ${url}`, {
      method,
      url,
      status,
      duration: `${duration}ms`,
      error: error?.message || null
    });
  }

  // User action logging
  userAction(action, data = null) {
    this.log('info', `User Action: ${action}`, data);
  }

  // Error logging with stack trace
  errorWithStack(message, error) {
    this.log('error', message, {
      error: error?.message || error,
      stack: error?.stack || null,
      name: error?.name || 'UnknownError'
    });
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const logInfo = (message, data) => logger.info(message, data);
export const logWarn = (message, data) => logger.warn(message, data);
export const logError = (message, data) => logger.error(message, data);
export const logDebug = (message, data) => logger.debug(message, data);
export const logApiCall = (method, url, status, duration, error) => 
  logger.apiCall(method, url, status, duration, error);
export const logUserAction = (action, data) => logger.userAction(action, data);
export const logErrorWithStack = (message, error) => logger.errorWithStack(message, error);

export default logger;
