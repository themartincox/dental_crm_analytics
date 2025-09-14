/**
 * Analytics Service for AES CRM
 * Comprehensive user behavior tracking and analytics
 */

import { logger } from '../utils/logger';
import { supabase } from '../lib/supabase';

// Event types
export const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  USER_ACTION: 'user_action',
  FORM_SUBMIT: 'form_submit',
  BUTTON_CLICK: 'button_click',
  LINK_CLICK: 'link_click',
  SEARCH: 'search',
  CONVERSION: 'conversion',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  FEATURE_USAGE: 'feature_usage'
};

// Conversion events
export const CONVERSION_EVENTS = {
  WAITLIST_SIGNUP: 'waitlist_signup',
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  PRICING_VIEW: 'pricing_view',
  DEMO_REQUEST: 'demo_request',
  TRIAL_START: 'trial_start',
  SUBSCRIPTION_START: 'subscription_start'
};

class AnalyticsService {
  constructor() {
    this.eventQueue = [];
    this.maxQueueSize = 50;
    this.flushInterval = 10000; // 10 seconds
    this.sessionId = this.getSessionId();
    this.userId = this.getCurrentUserId();
    this.isOnline = navigator.onLine;
    
    this.setupEventListeners();
    this.startFlushTimer();
    this.trackPageView();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent(EVENT_TYPES.USER_ACTION, {
        action: document.hidden ? 'page_hidden' : 'page_visible',
        timestamp: Date.now()
      });
    });

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      this.trackEvent(EVENT_TYPES.USER_ACTION, {
        action: 'page_unload',
        timestamp: Date.now()
      });
      this.flushEvents();
    });
  }

  /**
   * Track a custom event
   * @param {string} eventType - Type of event
   * @param {Object} eventData - Event data
   */
  trackEvent(eventType, eventData = {}) {
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventType,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      data: eventData,
      userContext: this.getUserContext()
    };

    this.eventQueue.push(event);
    logger.info('Event tracked', event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flushEvents();
    }
  }

  /**
   * Track page view
   * @param {string} page - Page name
   * @param {Object} additionalData - Additional data
   */
  trackPageView(page = null, additionalData = {}) {
    const pageName = page || this.getPageName();
    this.trackEvent(EVENT_TYPES.PAGE_VIEW, {
      page: pageName,
      title: document.title,
      ...additionalData
    });
  }

  /**
   * Track user action
   * @param {string} action - Action name
   * @param {Object} additionalData - Additional data
   */
  trackUserAction(action, additionalData = {}) {
    this.trackEvent(EVENT_TYPES.USER_ACTION, {
      action,
      ...additionalData
    });
  }

  /**
   * Track button click
   * @param {string} buttonName - Button name
   * @param {Object} additionalData - Additional data
   */
  trackButtonClick(buttonName, additionalData = {}) {
    this.trackEvent(EVENT_TYPES.BUTTON_CLICK, {
      buttonName,
      ...additionalData
    });
  }

  /**
   * Track link click
   * @param {string} linkText - Link text
   * @param {string} linkUrl - Link URL
   * @param {Object} additionalData - Additional data
   */
  trackLinkClick(linkText, linkUrl, additionalData = {}) {
    this.trackEvent(EVENT_TYPES.LINK_CLICK, {
      linkText,
      linkUrl,
      ...additionalData
    });
  }

  /**
   * Track form submission
   * @param {string} formName - Form name
   * @param {Object} formData - Form data
   * @param {Object} additionalData - Additional data
   */
  trackFormSubmit(formName, formData = {}, additionalData = {}) {
    this.trackEvent(EVENT_TYPES.FORM_SUBMIT, {
      formName,
      formData: this.sanitizeFormData(formData),
      ...additionalData
    });
  }

  /**
   * Track search
   * @param {string} searchTerm - Search term
   * @param {string} searchType - Type of search
   * @param {Object} additionalData - Additional data
   */
  trackSearch(searchTerm, searchType = 'general', additionalData = {}) {
    this.trackEvent(EVENT_TYPES.SEARCH, {
      searchTerm,
      searchType,
      ...additionalData
    });
  }

  /**
   * Track conversion
   * @param {string} conversionType - Type of conversion
   * @param {Object} conversionData - Conversion data
   * @param {Object} additionalData - Additional data
   */
  trackConversion(conversionType, conversionData = {}, additionalData = {}) {
    this.trackEvent(EVENT_TYPES.CONVERSION, {
      conversionType,
      conversionData,
      ...additionalData
    });
  }

  /**
   * Track feature usage
   * @param {string} featureName - Feature name
   * @param {Object} usageData - Usage data
   * @param {Object} additionalData - Additional data
   */
  trackFeatureUsage(featureName, usageData = {}, additionalData = {}) {
    this.trackEvent(EVENT_TYPES.FEATURE_USAGE, {
      featureName,
      usageData,
      ...additionalData
    });
  }

  /**
   * Track performance metrics
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   * @param {Object} additionalData - Additional data
   */
  trackPerformance(metricName, value, additionalData = {}) {
    this.trackEvent(EVENT_TYPES.PERFORMANCE, {
      metricName,
      value,
      ...additionalData
    });
  }

  /**
   * Track user journey
   * @param {string} step - Journey step
   * @param {Object} stepData - Step data
   * @param {Object} additionalData - Additional data
   */
  trackUserJourney(step, stepData = {}, additionalData = {}) {
    this.trackEvent(EVENT_TYPES.USER_ACTION, {
      action: 'user_journey',
      journeyStep: step,
      stepData,
      ...additionalData
    });
  }

  /**
   * Flush events to server
   */
  async flushEvents() {
    if (this.eventQueue.length === 0 || !this.isOnline) {
      return;
    }

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsToFlush);

      if (error) {
        throw error;
      }

      logger.info(`Flushed ${eventsToFlush.length} events to server`);
    } catch (error) {
      logger.error('Failed to flush events to server', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  /**
   * Start flush timer
   */
  startFlushTimer() {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Generate unique event ID
   * @returns {string} Event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get session ID
   * @returns {string} Session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get current user ID
   * @returns {string|null} User ID
   */
  getCurrentUserId() {
    return localStorage.getItem('userId') || null;
  }

  /**
   * Get page name from URL
   * @returns {string} Page name
   */
  getPageName() {
    const path = window.location.pathname;
    if (path === '/') return 'homepage';
    if (path === '/pricing') return 'pricing';
    if (path === '/contact') return 'contact';
    if (path === '/dashboard') return 'dashboard';
    return path.replace('/', '') || 'unknown';
  }

  /**
   * Get user context
   * @returns {Object} User context
   */
  getUserContext() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }

  /**
   * Sanitize form data for privacy
   * @param {Object} formData - Form data
   * @returns {Object} Sanitized form data
   */
  sanitizeFormData(formData) {
    const sanitized = { ...formData };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'cvv', 'ssn'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Get analytics dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData() {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('eventType, timestamp, data')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const dashboardData = {
        totalEvents: data.length,
        uniqueSessions: new Set(data.map(e => e.sessionId)).size,
        pageViews: data.filter(e => e.eventType === EVENT_TYPES.PAGE_VIEW).length,
        conversions: data.filter(e => e.eventType === EVENT_TYPES.CONVERSION).length,
        topPages: this.getTopPages(data),
        topActions: this.getTopActions(data),
        conversionRate: this.getConversionRate(data)
      };

      return dashboardData;
    } catch (error) {
      logger.error('Failed to get analytics dashboard data', error);
      return null;
    }
  }

  /**
   * Get top pages
   * @param {Array} events - Events data
   * @returns {Array} Top pages
   */
  getTopPages(events) {
    const pageViews = events.filter(e => e.eventType === EVENT_TYPES.PAGE_VIEW);
    const pageCounts = {};
    
    pageViews.forEach(event => {
      const page = event.data.page || 'unknown';
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });

    return Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));
  }

  /**
   * Get top actions
   * @param {Array} events - Events data
   * @returns {Array} Top actions
   */
  getTopActions(events) {
    const userActions = events.filter(e => e.eventType === EVENT_TYPES.USER_ACTION);
    const actionCounts = {};
    
    userActions.forEach(event => {
      const action = event.data.action || 'unknown';
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));
  }

  /**
   * Get conversion rate
   * @param {Array} events - Events data
   * @returns {number} Conversion rate
   */
  getConversionRate(events) {
    const pageViews = events.filter(e => e.eventType === EVENT_TYPES.PAGE_VIEW).length;
    const conversions = events.filter(e => e.eventType === EVENT_TYPES.CONVERSION).length;
    
    return pageViews > 0 ? (conversions / pageViews) * 100 : 0;
  }

  /**
   * Clear event queue
   */
  clearQueue() {
    this.eventQueue = [];
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Export for use in components
export default analyticsService;
