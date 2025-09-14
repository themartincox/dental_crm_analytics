import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states
 * @param {boolean} initialLoading - Initial loading state
 * @returns {Object} Loading state and control functions
 */
export const useLoadingState = (initialLoading = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [loadingMessage, setLoadingMessage] = useState('');

  const startLoading = useCallback((message = 'Loading...') => {
    setIsLoading(true);
    setLoadingMessage(message);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  const withLoading = useCallback(async (asyncFunction, message = 'Loading...') => {
    try {
      startLoading(message);
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading
  };
};

export default useLoadingState;
