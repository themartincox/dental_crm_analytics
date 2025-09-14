/**
 * Accessibility utilities for AES CRM
 * Provides tools for improving accessibility and WCAG compliance
 */

// Color contrast ratios for WCAG compliance
export const CONTRAST_RATIOS = {
  AA: 4.5,
  AAA: 7.0,
  LARGE_TEXT_AA: 3.0,
  LARGE_TEXT_AAA: 4.5
};

// ARIA roles and attributes
export const ARIA_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  TABLIST: 'tablist',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  ROW: 'row',
  COLUMNHEADER: 'columnheader',
  ROWHEADER: 'rowheader'
};

// Focus management
export class FocusManager {
  constructor() {
    this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.focusHistory = [];
  }

  /**
   * Get all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {NodeList} Focusable elements
   */
  getFocusableElements(container = document) {
    return container.querySelectorAll(this.focusableElements);
  }

  /**
   * Trap focus within a container
   * @param {HTMLElement} container - Container to trap focus in
   * @param {HTMLElement} firstFocusable - First focusable element
   * @param {HTMLElement} lastFocusable - Last focusable element
   */
  trapFocus(container, firstFocusable, lastFocusable) {
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }

  /**
   * Save current focus position
   */
  saveFocus() {
    this.focusHistory.push(document.activeElement);
  }

  /**
   * Restore previous focus position
   */
  restoreFocus() {
    const previousFocus = this.focusHistory.pop();
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    }
  }

  /**
   * Move focus to first focusable element
   * @param {HTMLElement} container - Container element
   */
  focusFirst(container = document) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Move focus to last focusable element
   * @param {HTMLElement} container - Container element
   */
  focusLast(container = document) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }
}

// Color contrast utilities
export class ColorContrast {
  /**
   * Calculate luminance of a color
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @returns {number} Luminance value
   */
  static getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Parse hex color to RGB
   * @param {string} hex - Hex color string
   * @returns {Object} RGB values
   */
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @returns {number} Contrast ratio
   */
  static getContrastRatio(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if contrast ratio meets WCAG standards
   * @param {string} foreground - Foreground color (hex)
   * @param {string} background - Background color (hex)
   * @param {string} level - WCAG level ('AA' or 'AAA')
   * @param {boolean} isLargeText - Is large text (18px+ or 14px+ bold)
   * @returns {Object} Contrast check results
   */
  static checkContrast(foreground, background, level = 'AA', isLargeText = false) {
    const ratio = this.getContrastRatio(foreground, background);
    const requiredRatio = isLargeText ? 
      (level === 'AAA' ? CONTRAST_RATIOS.LARGE_TEXT_AAA : CONTRAST_RATIOS.LARGE_TEXT_AA) :
      (level === 'AAA' ? CONTRAST_RATIOS.AAA : CONTRAST_RATIOS.AA);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      required: requiredRatio,
      passes: ratio >= requiredRatio,
      level,
      isLargeText
    };
  }
}

// Screen reader utilities
export class ScreenReader {
  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level ('polite' or 'assertive')
   */
  static announce(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Create screen reader only text
   * @param {string} text - Text for screen readers
   * @returns {HTMLElement} Screen reader element
   */
  static createScreenReaderText(text) {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  }
}

// Keyboard navigation utilities
export class KeyboardNavigation {
  /**
   * Handle arrow key navigation in a list
   * @param {KeyboardEvent} event - Keyboard event
   * @param {NodeList} items - List items
   * @param {string} orientation - 'horizontal' or 'vertical'
   */
  static handleArrowKeys(event, items, orientation = 'vertical') {
    const currentIndex = Array.from(items).indexOf(document.activeElement);
    let nextIndex = currentIndex;
    
    if (orientation === 'vertical') {
      if (event.key === 'ArrowDown') {
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
      } else if (event.key === 'ArrowUp') {
        nextIndex = Math.max(currentIndex - 1, 0);
      }
    } else {
      if (event.key === 'ArrowRight') {
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
      } else if (event.key === 'ArrowLeft') {
        nextIndex = Math.max(currentIndex - 1, 0);
      }
    }
    
    if (nextIndex !== currentIndex) {
      event.preventDefault();
      items[nextIndex].focus();
    }
  }

  /**
   * Handle Enter and Space key activation
   * @param {KeyboardEvent} event - Keyboard event
   * @param {Function} callback - Callback function
   */
  static handleActivation(event, callback) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }
}

// Form accessibility utilities
export class FormAccessibility {
  /**
   * Add error message to form field
   * @param {HTMLElement} field - Form field
   * @param {string} message - Error message
   */
  static addErrorMessage(field, message) {
    const fieldId = field.id || field.name;
    const errorId = `${fieldId}-error`;
    
    // Remove existing error message
    const existingError = document.getElementById(errorId);
    if (existingError) {
      existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = message;
    
    field.setAttribute('aria-describedby', errorId);
    field.setAttribute('aria-invalid', 'true');
    
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }

  /**
   * Remove error message from form field
   * @param {HTMLElement} field - Form field
   */
  static removeErrorMessage(field) {
    const fieldId = field.id || field.name;
    const errorId = `${fieldId}-error`;
    
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.remove();
    }
    
    field.removeAttribute('aria-describedby');
    field.removeAttribute('aria-invalid');
  }

  /**
   * Validate form field accessibility
   * @param {HTMLElement} field - Form field
   * @returns {Object} Validation results
   */
  static validateField(field) {
    const issues = [];
    
    // Check for label
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (!label && !field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')) {
      issues.push('Missing label or aria-label');
    }
    
    // Check for required indicator
    if (field.required && !field.getAttribute('aria-required')) {
      issues.push('Missing aria-required for required field');
    }
    
    // Check for error handling
    if (field.getAttribute('aria-invalid') === 'true' && !field.getAttribute('aria-describedby')) {
      issues.push('Missing error message for invalid field');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

// Export utilities
export default {
  FocusManager,
  ColorContrast,
  ScreenReader,
  KeyboardNavigation,
  FormAccessibility,
  CONTRAST_RATIOS,
  ARIA_ROLES
};