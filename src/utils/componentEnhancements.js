// Component enhancement utilities for better UX

import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

/**
 * Higher-order component to add loading state
 */
export const withLoading = (WrappedComponent, loadingProps = {}) => {
  return function WithLoadingComponent(props) {
    const { isLoading, loadingMessage, ...restProps } = props;
    
    if (isLoading) {
      return (
        <LoadingSpinner
          text={loadingMessage || 'Loading...'}
          {...loadingProps}
        />
      );
    }
    
    return <WrappedComponent {...restProps} />;
  };
};

/**
 * Higher-order component to add empty state
 */
export const withEmptyState = (WrappedComponent, emptyStateProps = {}) => {
  return function WithEmptyStateComponent(props) {
    const { 
      data, 
      emptyMessage = 'No data available',
      emptyDescription = 'There is no data to display at the moment.',
      emptyAction,
      ...restProps 
    } = props;
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <EmptyState
          title={emptyMessage}
          description={emptyDescription}
          action={emptyAction}
          {...emptyStateProps}
        />
      );
    }
    
    return <WrappedComponent {...restProps} />;
  };
};

/**
 * Higher-order component to add error handling
 */
export const withErrorHandling = (WrappedComponent, errorProps = {}) => {
  return function WithErrorHandlingComponent(props) {
    const { error, onRetry, ...restProps } = props;
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto h-12 w-12 text-red-400 mb-4">
              <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {errorProps.title || 'Something went wrong'}
            </h3>
            
            <p className="text-sm text-gray-500 mb-6">
              {errorProps.description || error?.message || 'An unexpected error occurred.'}
            </p>
            
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...restProps} />;
  };
};

/**
 * Hook for managing component states
 */
export const useComponentState = (initialState = {}) => {
  const [state, setState] = React.useState({
    isLoading: false,
    error: null,
    data: null,
    ...initialState
  });

  const setLoading = (isLoading, message = 'Loading...') => {
    setState(prev => ({
      ...prev,
      isLoading,
      loadingMessage: message,
      error: isLoading ? null : prev.error
    }));
  };

  const setError = (error) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false
    }));
  };

  const setData = (data) => {
    setState(prev => ({
      ...prev,
      data,
      error: null,
      isLoading: false
    }));
  };

  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      data: null
    });
  };

  return {
    ...state,
    setLoading,
    setError,
    setData,
    reset
  };
};

/**
 * Utility to add loading states to async functions
 */
export const withAsyncLoading = (asyncFunction) => {
  return async (...args) => {
    try {
      const result = await asyncFunction(...args);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };
};

/**
 * Utility to add retry logic to functions
 */
export const withRetry = (fn, maxRetries = 3, delay = 1000) => {
  return async (...args) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  };
};

/**
 * Utility to add timeout to functions
 */
export const withTimeout = (fn, timeout = 5000) => {
  return async (...args) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeout);
    });
    
    return Promise.race([fn(...args), timeoutPromise]);
  };
};

/**
 * Utility to add caching to functions
 */
export const withCache = (fn, ttl = 300000) => { // 5 minutes default
  const cache = new Map();
  
  return async (...args) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    
    const result = await fn(...args);
    cache.set(key, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  };
};

export default {
  withLoading,
  withEmptyState,
  withErrorHandling,
  useComponentState,
  withAsyncLoading,
  withRetry,
  withTimeout,
  withCache
};
