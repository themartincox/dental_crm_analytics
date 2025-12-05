// Performance monitoring utilities

/**
 * Performance timer for measuring execution time
 */
export class PerformanceTimer {
  constructor(name) {
    this.name = name;
    this.startTime = performance.now();
    this.marks = [];
  }

  mark(label) {
    const time = performance.now();
    this.marks.push({
      label,
      time: time - this.startTime,
      timestamp: time
    });
  }

  end() {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    if (process.env.NODE_ENV === 'development') {
      console.group(`⏱️ Performance: ${this.name}`);
      console.log(`Total duration: ${duration.toFixed(2)}ms`);

      if (this.marks.length > 0) {
        console.log('Marks:');
        this.marks.forEach(mark => {
          console.log(`  ${mark.label}: ${mark.time.toFixed(2)}ms`);
        });
      }
      console.groupEnd();
    }

    return {
      name: this.name,
      duration,
      marks: this.marks
    };
  }
}

/**
 * Create a performance timer
 */
export const createTimer = (name) => new PerformanceTimer(name);

/**
 * Measure function execution time
 */
export const measurePerformance = async (name, fn) => {
  const timer = createTimer(name);

  try {
    const result = await fn();
    timer.end();
    return result;
  } catch (error) {
    timer.end();
    throw error;
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = (func, limit) => {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = () => {
  if (typeof performance !== 'undefined' && performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
    };
  }
  return null;
};

/**
 * Check if device is low-end for performance optimization
 */
export const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') return false;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  return (
    hardwareConcurrency <= 2 ||
    (connection && connection.effectiveType && ['slow-2g', '2g', '3g'].includes(connection.effectiveType))
  );
};

/**
 * Lazy load images for better performance
 */
export const lazyLoadImage = (img, src) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  });

  observer.observe(img);
  return observer;
};

/**
 * Preload critical resources
 */
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
  return link;
};

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  constructor() {
    this.metrics = [];
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  record(metric) {
    if (!this.isEnabled) return;

    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    });
  }

  getMetrics() {
    return this.metrics;
  }

  clear() {
    this.metrics = [];
  }

  getAverage(metricName) {
    const metricValues = this.metrics
      .filter(m => m.name === metricName)
      .map(m => m.value);

    if (metricValues.length === 0) return 0;

    return metricValues.reduce((sum, value) => sum + value, 0) / metricValues.length;
  }
}

// Global performance metrics instance
export const performanceMetrics = new PerformanceMetrics();

/**
 * Web Vitals monitoring
 */
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Measure Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      performanceMetrics.record({
        name: 'LCP',
        value: lastEntry.startTime,
        unit: 'ms'
      });
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  // Measure First Input Delay (FID)
  if ('PerformanceObserver' in window) {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        performanceMetrics.record({
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          unit: 'ms'
        });
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });
  }
};

export default {
  PerformanceTimer,
  createTimer,
  measurePerformance,
  debounce,
  throttle,
  getMemoryUsage,
  isLowEndDevice,
  lazyLoadImage,
  preloadResource,
  PerformanceMetrics,
  performanceMetrics,
  measureWebVitals
};
