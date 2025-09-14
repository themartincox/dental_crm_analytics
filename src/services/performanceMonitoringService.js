/**
 * Advanced Performance Monitoring Service for AES CRM
 * Comprehensive performance tracking, alerting, and optimization
 */

import { logger } from '../utils/logger';
import { analyticsService } from './analyticsService';
import { errorTrackingService } from './errorTrackingService';

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FCP: 1800, // First Contentful Paint (ms)
  TBT: 300,  // Total Blocking Time (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  FID: 100,  // First Input Delay (ms)
  INP: 200,  // Interaction to Next Paint (ms)
  TTFB: 600, // Time to First Byte (ms)
  TTI: 3800, // Time to Interactive (ms)
  FMP: 2000, // First Meaningful Paint (ms)
  SI: 3400   // Speed Index (ms)
};

// Performance categories
export const PERFORMANCE_CATEGORY = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  NEEDS_IMPROVEMENT: 'needs_improvement',
  POOR: 'poor'
};

class PerformanceMonitoringService {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.alerts = [];
    this.isMonitoring = false;
    
    this.setupPerformanceObservers();
    this.startMonitoring();
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.observeWebVitals();
    this.observeResourceTiming();
    this.observeNavigationTiming();
    this.observeLongTasks();
    this.observeLayoutShifts();
    this.observeMemoryUsage();
    
    logger.info('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    logger.info('Performance monitoring stopped');
  }

  /**
   * Observe Core Web Vitals
   */
  observeWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Contentful Paint (FCP)
    this.observeFCP();
    
    // First Input Delay (FID)
    this.observeFID();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // Interaction to Next Paint (INP)
    this.observeINP();
  }

  /**
   * Observe Largest Contentful Paint
   */
  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.recordMetric('LCP', lastEntry.startTime, {
        element: lastEntry.element?.tagName,
        url: lastEntry.url,
        size: lastEntry.size
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.set('LCP', observer);
  }

  /**
   * Observe First Contentful Paint
   */
  observeFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        this.recordMetric('FCP', fcpEntry.startTime);
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.set('FCP', observer);
  }

  /**
   * Observe First Input Delay
   */
  observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric('FID', entry.processingStart - entry.startTime, {
          eventType: entry.name,
          target: entry.target?.tagName
        });
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.set('FID', observer);
  }

  /**
   * Observe Cumulative Layout Shift
   */
  observeCLS() {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
          
          if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }
        
          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            this.recordMetric('CLS', clsValue, {
              sources: entry.sources?.map(source => ({
                element: source.element?.tagName,
                previousRect: source.previousRect,
                currentRect: source.currentRect
              }))
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('CLS', observer);
  }

  /**
   * Observe Interaction to Next Paint
   */
  observeINP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric('INP', entry.processingEnd - entry.startTime, {
          eventType: entry.name,
          target: entry.target?.tagName,
          interactionId: entry.interactionId
        });
      });
    });

    observer.observe({ entryTypes: ['event'] });
    this.observers.set('INP', observer);
  }

  /**
   * Observe Resource Timing
   */
  observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.analyzeResource(entry);
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  /**
   * Observe Navigation Timing
   */
  observeNavigationTiming() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.analyzeNavigation(navigation);
      }
    });
  }

  /**
   * Observe Long Tasks
   */
  observeLongTasks() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric('long_task', entry.duration, {
          startTime: entry.startTime,
          name: entry.name
        });
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.set('longtask', observer);
  }

  /**
   * Observe Layout Shifts
   */
  observeLayoutShifts() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric('layout_shift', entry.value, {
          sources: entry.sources?.map(source => ({
            element: source.element?.tagName,
            previousRect: source.previousRect,
            currentRect: source.currentRect
          }))
        });
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('layout_shift', observer);
  }

  /**
   * Observe Memory Usage
   */
  observeMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.recordMetric('memory_usage', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Record a performance metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Object} metadata - Additional metadata
   */
  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      metadata
    };

    this.metrics.set(name, metric);
    
    // Track in analytics
    analyticsService.trackPerformance(name, value, metadata);
    
    // Check thresholds
    this.checkThresholds(name, value);
    
    logger.debug('Performance metric recorded', metric);
  }

  /**
   * Analyze resource performance
   * @param {PerformanceEntry} entry - Resource entry
   */
  analyzeResource(entry) {
    const resource = {
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      type: this.getResourceType(entry.name),
      timing: {
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        tcp: entry.connectEnd - entry.connectStart,
        request: entry.responseStart - entry.requestStart,
        response: entry.responseEnd - entry.responseStart
      }
    };

    // Check for slow resources
    if (resource.duration > 1000) {
      this.recordMetric('slow_resource', resource.duration, resource);
    }

    // Check for large resources
    if (resource.size > 100000) { // 100KB
      this.recordMetric('large_resource', resource.size, resource);
    }
  }

  /**
   * Analyze navigation performance
   * @param {PerformanceEntry} navigation - Navigation entry
   */
  analyzeNavigation(navigation) {
    const nav = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      ttfb: navigation.responseStart - navigation.navigationStart
    };

    // Record TTFB
    this.recordMetric('TTFB', nav.ttfb);
    
    // Record TTI (approximation)
    const tti = navigation.domContentLoadedEventEnd - navigation.navigationStart;
    this.recordMetric('TTI', tti);
    
    // Record FMP (approximation)
    const fmp = navigation.domContentLoadedEventEnd - navigation.navigationStart;
    this.recordMetric('FMP', fmp);
  }

  /**
   * Get resource type from URL
   * @param {string} url - Resource URL
   * @returns {string} Resource type
   */
  getResourceType(url) {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.webp')) return 'image';
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf') || url.includes('.eot')) return 'font';
    if (url.includes('api/') || url.includes('supabase')) return 'api';
    return 'other';
  }

  /**
   * Check performance thresholds
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   */
  checkThresholds(metricName, value) {
    const threshold = PERFORMANCE_THRESHOLDS[metricName];
    if (!threshold) return;

    const category = this.getPerformanceCategory(metricName, value);
    
    if (category === PERFORMANCE_CATEGORY.POOR || category === PERFORMANCE_CATEGORY.NEEDS_IMPROVEMENT) {
      this.createAlert(metricName, value, threshold, category);
    }
  }

  /**
   * Get performance category
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   * @returns {string} Performance category
   */
  getPerformanceCategory(metricName, value) {
    const threshold = PERFORMANCE_THRESHOLDS[metricName];
    if (!threshold) return PERFORMANCE_CATEGORY.GOOD;

    if (value <= threshold * 0.75) return PERFORMANCE_CATEGORY.EXCELLENT;
    if (value <= threshold) return PERFORMANCE_CATEGORY.GOOD;
    if (value <= threshold * 1.5) return PERFORMANCE_CATEGORY.NEEDS_IMPROVEMENT;
    return PERFORMANCE_CATEGORY.POOR;
  }

  /**
   * Create performance alert
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   * @param {number} threshold - Threshold value
   * @param {string} category - Performance category
   */
  createAlert(metricName, value, threshold, category) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metricName,
      value,
      threshold,
      category,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      severity: category === PERFORMANCE_CATEGORY.POOR ? 'high' : 'medium'
    };

    this.alerts.push(alert);
    
    // Track in analytics
    analyticsService.trackEvent('performance_alert', alert);
    
    // Track as error if critical
    if (category === PERFORMANCE_CATEGORY.POOR) {
      errorTrackingService.trackPerformanceError({
        message: `Performance threshold exceeded: ${metricName}`,
        metric: metricName,
        value,
        threshold,
        url: window.location.href
      });
    }
    
    logger.warn('Performance alert created', alert);
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getPerformanceSummary() {
    const summary = {
      metrics: Object.fromEntries(this.metrics),
      alerts: this.alerts,
      isMonitoring: this.isMonitoring,
      thresholds: PERFORMANCE_THRESHOLDS
    };

    return summary;
  }

  /**
   * Get performance dashboard data
   * @returns {Object} Dashboard data
   */
  getDashboardData() {
    const metrics = Object.fromEntries(this.metrics);
    const dashboardData = {
      coreWebVitals: {
        LCP: metrics.LCP?.value || 0,
        FCP: metrics.FCP?.value || 0,
        TBT: metrics.TBT?.value || 0,
        CLS: metrics.CLS?.value || 0,
        FID: metrics.FID?.value || 0,
        INP: metrics.INP?.value || 0
      },
      navigation: {
        TTFB: metrics.TTFB?.value || 0,
        TTI: metrics.TTI?.value || 0,
        FMP: metrics.FMP?.value || 0
      },
      resources: {
        slowResources: this.metrics.get('slow_resource')?.value || 0,
        largeResources: this.metrics.get('large_resource')?.value || 0
      },
      alerts: this.alerts.length,
      memory: metrics.memory_usage?.value || null
    };

    return dashboardData;
  }

  /**
   * Clear performance data
   */
  clearData() {
    this.metrics.clear();
    this.alerts = [];
  }

  /**
   * Setup performance observers
   */
  setupPerformanceObservers() {
    // This method is called in constructor
    // It's here for clarity and future extensions
  }
}

// Create singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();

// Export for use in components
export default performanceMonitoringService;
