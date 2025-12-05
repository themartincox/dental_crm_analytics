import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce hook for search and input handling
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll and resize events
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((.args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(.args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Memoized callback hook with dependency optimization
export const useOptimizedCallback = (callback, deps) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((.args) => {
    return callbackRef.current(.args);
  }, deps);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }

    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    measureRender: (fn) => {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} operation: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }
  };
};

// Virtual scrolling hook
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  };
};

// Memory optimization hook for large datasets
export const useMemoryOptimization = (data, maxItems = 1000) => {
  const [displayedData, setDisplayedData] = useState([]);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    if (data.length <= maxItems) {
      setDisplayedData(data);
    } else {
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      setDisplayedData(data.slice(startIndex, endIndex));
    }
  }, [data, page, maxItems]);

  const loadMore = useCallback(() => {
    if (data.length > maxItems) {
      setPage(prev => prev + 1);
    }
  }, [data.length, maxItems]);

  const hasMore = data.length > (page + 1) * pageSize;

  return {
    displayedData,
    loadMore,
    hasMore,
    page,
    totalPages: Math.ceil(data.length / pageSize)
  };
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        .options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { ref, isIntersecting, hasIntersected };
};

// Web worker hook for heavy computations
export const useWebWorker = (workerScript) => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const workerRef = useRef();

  useEffect(() => {
    if (workerScript) {
      workerRef.current = new Worker(workerScript);
      
      workerRef.current.onmessage = (e) => {
        setResult(e.data);
        setIsLoading(false);
      };

      workerRef.current.onerror = (error) => {
        setError(error);
        setIsLoading(false);
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [workerScript]);

  const postMessage = useCallback((data) => {
    if (workerRef.current) {
      setIsLoading(true);
      setError(null);
      workerRef.current.postMessage(data);
    }
  }, []);

  return { result, error, isLoading, postMessage };
};

// Batch state updates hook
export const useBatchedUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const timeoutRef = useRef();

  const batchUpdate = useCallback((update) => {
    setUpdates(prev => [...prev, update]);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      // Process all batched updates
      updates.forEach(updateFn => updateFn());
      setUpdates([]);
    }, 0);
  }, [updates]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

// Resource cleanup hook
export const useResourceCleanup = () => {
  const cleanupFunctions = useRef([]);

  const addCleanup = useCallback((cleanupFn) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, []);

  return addCleanup;
};
