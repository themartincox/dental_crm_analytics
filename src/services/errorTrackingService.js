/**
 * Error Tracking Service for AES CRM
 * Comprehensive error tracking, monitoring, and alerting
 */

import { logger } from '../utils/logger';
import { supabase } from '../lib/supabase';

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error categories
export const ERROR_CATEGORY = {
  JAVASCRIPT: 'javascript',
  NETWORK: 'network',
  API: 'api',
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  USER_INTERACTION: 'user_interaction'
};

class ErrorTrackingService {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.flushInterval = 30000; // 30 seconds
    this.isOnline = navigator.onLine;

    this.setupEventListeners();
    this.setupGlobalErrorHandlers();
    this.startFlushTimer();
  }

  /**
   * Setup event listeners for online/offline status
   */
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrors();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        category: ERROR_CATEGORY.JAVASCRIPT,
        severity: ERROR_SEVERITY.HIGH
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        category: ERROR_CATEGORY.JAVASCRIPT,
        severity: ERROR_SEVERITY.HIGH,
        additionalData: {
          reason: event.reason,
          promise: event.promise
        }
      });
    });

    // React Error Boundary errors
    window.addEventListener('react-error', (event) => {
      this.trackError({
        message: event.detail.message,
        stack: event.detail.stack,
        componentStack: event.detail.componentStack,
        category: ERROR_CATEGORY.JAVASCRIPT,
        severity: ERROR_SEVERITY.HIGH,
        additionalData: {
          componentName: event.detail.componentName,
          errorBoundary: event.detail.errorBoundary
        }
      });
    });
  }

  /**
   * Track an error
   * @param {Object} errorData - Error information
   */
  trackError(errorData) {
    const error = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      severity: errorData.severity || ERROR_SEVERITY.MEDIUM,
      category: errorData.category || ERROR_CATEGORY.JAVASCRIPT,
      message: errorData.message,
      stack: errorData.stack,
      filename: errorData.filename,
      lineno: errorData.lineno,
      colno: errorData.colno,
      componentStack: errorData.componentStack,
      additionalData: errorData.additionalData || {},
      userContext: this.getUserContext(),
      performance: this.getPerformanceContext(),
      isOnline: this.isOnline
    };

    // Add to queue
    this.errorQueue.push(error);

    // Log locally
    logger.error('Error tracked', error);

    // Flush if queue is full or critical error
    if (this.errorQueue.length >= this.maxQueueSize || error.severity === ERROR_SEVERITY.CRITICAL) {
      this.flushErrors();
    }
  }

  /**
   * Track API errors
   * @param {Object} apiError - API error information
   */
  trackApiError(apiError) {
    this.trackError({
      message: apiError.message || 'API Error',
      stack: apiError.stack,
      category: ERROR_CATEGORY.API,
      severity: this.getApiErrorSeverity(apiError.status),
      additionalData: {
        url: apiError.url,
        method: apiError.method,
        status: apiError.status,
        statusText: apiError.statusText,
        requestData: apiError.requestData,
        responseData: apiError.responseData
      }
    });
  }

  /**
   * Track network errors
   * @param {Object} networkError - Network error information
   */
  trackNetworkError(networkError) {
    this.trackError({
      message: networkError.message || 'Network Error',
      category: ERROR_CATEGORY.NETWORK,
      severity: ERROR_SEVERITY.MEDIUM,
      additionalData: {
        url: networkError.url,
        method: networkError.method,
        timeout: networkError.timeout,
        retryCount: networkError.retryCount
      }
    });
  }

  /**
   * Track performance errors
   * @param {Object} performanceError - Performance error information
   */
  trackPerformanceError(performanceError) {
    this.trackError({
      message: performanceError.message || 'Performance Error',
      category: ERROR_CATEGORY.PERFORMANCE,
      severity: ERROR_SEVERITY.LOW,
      additionalData: {
        metric: performanceError.metric,
        value: performanceError.value,
        threshold: performanceError.threshold,
        url: performanceError.url
      }
    });
  }

  /**
   * Track user interaction errors
   * @param {Object} interactionError - User interaction error information
   */
  trackUserInteractionError(interactionError) {
    this.trackError({
      message: interactionError.message || 'User Interaction Error',
      category: ERROR_CATEGORY.USER_INTERACTION,
      severity: ERROR_SEVERITY.LOW,
      additionalData: {
        action: interactionError.action,
        element: interactionError.element,
        page: interactionError.page,
        userAgent: navigator.userAgent
      }
    });
  }

  /**
   * Flush errors to server
   */
  async flushErrors() {
    if (this.errorQueue.length === 0 || !this.isOnline) {
      return;
    }

    const errorsToFlush = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const { error } = await supabase
        .from('error_logs')
        .insert(errorsToFlush);

      if (error) {
        throw error;
      }

      logger.info(`Flushed ${errorsToFlush.length} errors to server`);
    } catch (error) {
      logger.error('Failed to flush errors to server', error);
      // Re-add errors to queue for retry
      this.errorQueue.unshift(...errorsToFlush);
    }
  }

  /**
   * Start flush timer
   */
  startFlushTimer() {
    setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);
  }

  /**
   * Generate unique error ID
   * @returns {string} Error ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID
   * @returns {string|null} User ID
   */
  getCurrentUserId() {
    // This would typically come from your auth context
    return localStorage.getItem('userId') || null;
  }

  /**
   * Get session ID
   * @returns {string} Session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Get user context
   * @returns {Object} User context
   */
  getUserContext() {
    return {
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    };
  }

  /**
   * Get performance context
   * @returns {Object} Performance context
   */
  getPerformanceContext() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null
    };
  }

  /**
   * Get API error severity based on status code
   * @param {number} status - HTTP status code
   * @returns {string} Severity level
   */
  getApiErrorSeverity(status) {
    if (status >= 500) return ERROR_SEVERITY.HIGH;
    if (status >= 400) return ERROR_SEVERITY.MEDIUM;
    return ERROR_SEVERITY.LOW;
  }

  /**
   * Get error statistics
   * @returns {Promise<Object>} Error statistics
   */
  async getErrorStatistics() {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('severity, category, timestamp')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = {
        total: data.length,
        bySeverity: {},
        byCategory: {},
        last24Hours: data.length
      };

      data.forEach(error => {
        stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get error statistics', error);
      return null;
    }
  }

  /**
   * Clear error queue
   */
  clearQueue() {
    this.errorQueue = [];
  }
}

// Create singleton instance
export const errorTrackingService = new ErrorTrackingService();

// Export for use in components
export default errorTrackingService;
