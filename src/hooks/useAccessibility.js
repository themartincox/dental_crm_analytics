import { useEffect, useRef } from 'react';

/**
 * Custom hook for accessibility testing and management
 * Integrates with axe-core for runtime accessibility testing
 */
export const useAccessibility = (options = {}) => {
  const { 
    enableInDevelopment = process.env?.NODE_ENV === 'development',
    enableInProduction = false,
    runOnMount = true,
    debounceDelay = 1000
  } = options;

  const timeoutRef = useRef(null);
  const shouldRun = enableInDevelopment || enableInProduction;

  useEffect(() => {
    // Only run accessibility tests if enabled and axe-core is available
    if (!shouldRun || typeof window === 'undefined') return;

    const runAccessibilityCheck = async () => {
      try {
        // Dynamic import to avoid bundle size impact in production
        const axe = await import('@axe-core/react');
        
        if (axe?.default && typeof axe?.default === 'function') {
          axe?.default(window.React, window.ReactDOM, debounceDelay);
        }
      } catch (error) {
        console.warn('Accessibility testing not available:', error?.message);
      }
    };

    if (runOnMount) {
      // Debounce the accessibility check to avoid excessive runs
      if (timeoutRef?.current) {
        clearTimeout(timeoutRef?.current);
      }
      
      timeoutRef.current = setTimeout(runAccessibilityCheck, debounceDelay);
    }

    return () => {
      if (timeoutRef?.current) {
        clearTimeout(timeoutRef?.current);
      }
    };
  }, [shouldRun, runOnMount, debounceDelay]);

  /**
   * Manually run accessibility check on specific element
   */
  const checkElement = async (element) => {
    if (!shouldRun) return null;

    try {
      const { default: axe } = await import('axe-core');
      const results = await axe?.run(element || document);
      
      if (results?.violations?.length > 0) {
        console.group('🚨 Accessibility Violations Found');
        results?.violations?.forEach(violation => {
          console.error(`${violation?.impact}: ${violation?.description}`, violation?.nodes);
        });
        console.groupEnd();
      }
      
      return results;
    } catch (error) {
      console.warn('Manual accessibility check failed:', error?.message);
      return null;
    }
  };

  /**
   * Focus management utilities
   */
  const focusUtils = {
    // Trap focus within an element (useful for modals)
    trapFocus: (element) => {
      if (!element) return;

      const focusableElements = element?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabIndex="-1"])'
      );
      
      const firstFocusable = focusableElements?.[0];
      const lastFocusable = focusableElements?.[focusableElements?.length - 1];

      const handleTabKey = (e) => {
        if (e?.key !== 'Tab') return;

        if (e?.shiftKey) {
          if (document?.activeElement === firstFocusable) {
            lastFocusable?.focus();
            e?.preventDefault();
          }
        } else {
          if (document?.activeElement === lastFocusable) {
            firstFocusable?.focus();
            e?.preventDefault();
          }
        }
      };

      element?.addEventListener('keydown', handleTabKey);
      return () => element?.removeEventListener('keydown', handleTabKey);
    },

    // Set focus to element with announcement
    announceFocus: (element, message) => {
      if (!element) return;
      
      element?.focus();
      
      if (message) {
        // Create temporary live region for announcement
        const announcement = document?.createElement('div');
        announcement?.setAttribute('aria-live', 'polite');
        announcement?.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
        announcement.textContent = message;
        
        document?.body?.appendChild(announcement);
        
        setTimeout(() => {
          document?.body?.removeChild(announcement);
        }, 1000);
      }
    }
  };

  return {
    checkElement,
    focusUtils,
    isEnabled: shouldRun
  };
};

/**
 * Hook for managing keyboard navigation
 */
export const useKeyboardNavigation = (options = {}) => {
  const {
    enableArrowKeys = true,
    enableEnterSpace = true,
    enableEscape = true,
    onNavigate,
    onActivate,
    onEscape
  } = options;

  const handleKeyDown = (event) => {
    const { key, target } = event;

    // Arrow key navigation
    if (enableArrowKeys && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']?.includes(key)) {
      event?.preventDefault();
      onNavigate?.(key, target);
    }

    // Enter/Space activation
    if (enableEnterSpace && ['Enter', ' ']?.includes(key)) {
      if (target?.tagName !== 'INPUT' && target?.tagName !== 'TEXTAREA') {
        event?.preventDefault();
        onActivate?.(target);
      }
    }

    // Escape key
    if (enableEscape && key === 'Escape') {
      event?.preventDefault();
      onEscape?.(target);
    }
  };

  useEffect(() => {
    document?.addEventListener('keydown', handleKeyDown);
    return () => document?.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, onActivate, onEscape]);

  return { handleKeyDown };
};

export default { useAccessibility, useKeyboardNavigation };