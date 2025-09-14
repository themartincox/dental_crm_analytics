/**
 * Service Worker registration and management utilities
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

const PUBLIC_URL = process.env.PUBLIC_URL || '';

/**
 * Register service worker
 * @param {Object} config - Configuration options
 * @returns {Promise<ServiceWorkerRegistration>}
 */
export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        // Localhost service worker registration
        checkValidServiceWorker(swUrl, config);
        
        // Additional logging for localhost
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
            'worker. To learn more, visit https://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Production service worker registration
        registerValidSW(swUrl, config);
      }
    });
  }
}

/**
 * Register valid service worker
 * @param {string} swUrl - Service worker URL
 * @param {Object} config - Configuration options
 */
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      console.log('Service Worker registered successfully:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available, show update notification
              console.log(
                'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
              );
              
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Content is cached for offline use
              console.log('Content is cached for offline use.');
              
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

/**
 * Check if service worker is valid
 * @param {string} swUrl - Service worker URL
 * @param {Object} config - Configuration options
 */
function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

/**
 * Unregister service worker
 * @returns {Promise<boolean>}
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

/**
 * Check if service worker is supported
 * @returns {boolean}
 */
export function isServiceWorkerSupported() {
  return 'serviceWorker' in navigator;
}

/**
 * Get service worker registration
 * @returns {Promise<ServiceWorkerRegistration>}
 */
export function getServiceWorkerRegistration() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready;
  }
  return Promise.reject(new Error('Service Worker not supported'));
}

/**
 * Send message to service worker
 * @param {Object} message - Message to send
 * @returns {Promise<void>}
 */
export function sendMessageToSW(message) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

/**
 * Clear all caches
 * @returns {Promise<void>}
 */
export function clearAllCaches() {
  return sendMessageToSW({ type: 'CLEAR_CACHE' });
}

/**
 * Skip waiting for service worker update
 * @returns {Promise<void>}
 */
export function skipWaiting() {
  return sendMessageToSW({ type: 'SKIP_WAITING' });
}

/**
 * Check for service worker updates
 * @returns {Promise<boolean>}
 */
export async function checkForUpdates() {
  try {
    const registration = await getServiceWorkerRegistration();
    await registration.update();
    return true;
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
}

/**
 * Service worker update handler
 * @param {Function} callback - Callback function
 */
export function onServiceWorkerUpdate(callback) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', callback);
  }
}

/**
 * Service worker ready handler
 * @param {Function} callback - Callback function
 */
export function onServiceWorkerReady(callback) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(callback);
  }
}

// Default export
export default {
  register,
  unregister,
  isServiceWorkerSupported,
  getServiceWorkerRegistration,
  sendMessageToSW,
  clearAllCaches,
  skipWaiting,
  checkForUpdates,
  onServiceWorkerUpdate,
  onServiceWorkerReady
};
