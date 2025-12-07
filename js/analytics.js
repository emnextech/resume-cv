/**
 * Vercel Web Analytics Integration
 * 
 * This module provides utilities for Vercel Web Analytics in the CareerCraft application.
 * 
 * IMPLEMENTATION DETAILS:
 * 1. For plain HTML sites: Analytics are loaded via the <script> tag in the HTML head
 *    (see index.html, mainBuilder.html, 404.html)
 * 
 * 2. For JavaScript module-based usage: The inject() function from @vercel/analytics
 *    can be called from this module to initialize analytics programmatically
 * 
 * 3. Custom event tracking: Use trackEvent() to manually track custom events
 * 
 * Note: The inject() function does not include route support, so navigation tracking
 * relies on page load events and manual tracking for SPA-like navigation.
 */

/**
 * Initialize Vercel Web Analytics using the inject() function from @vercel/analytics
 * This is called automatically when this module is loaded in a JavaScript context
 */
function initializeVercelAnalytics() {
  try {
    // Dynamically import and initialize analytics if available
    // This uses a dynamic approach to avoid breaking in static HTML contexts
    import('@vercel/analytics').then(({ inject }) => {
      if (typeof inject === 'function') {
        inject();
      }
    }).catch((error) => {
      // Analytics module may not be available in all contexts (e.g., static HTML)
      // This is expected and not an error
      console.debug('Vercel Analytics inject() not available in this context');
    });
  } catch (error) {
    // Gracefully handle any initialization errors
    console.debug('Vercel Web Analytics initialization skipped');
  }
}

/**
 * Utility function to manually track custom events with Vercel Web Analytics
 * @param {string} eventName - The name of the event to track
 * @param {Object} eventData - Optional event data to send with the event
 */
export function trackEvent(eventName, eventData = {}) {
  try {
    // Check if Vercel analytics is available
    if (window.vercelAnalytics && typeof window.vercelAnalytics.track === 'function') {
      window.vercelAnalytics.track(eventName, eventData);
    }
  } catch (error) {
    console.warn('Failed to track event with Vercel Analytics:', error);
  }
}

/**
 * Example usage: Track CV download event
 * Usage in other scripts: trackEvent('cv-download', { template: 'modern', format: 'docx' })
 */

// Initialize analytics when module loads (in browser context)
if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available, otherwise use setTimeout
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => initializeVercelAnalytics(), { timeout: 2000 });
  } else {
    window.addEventListener('load', initializeVercelAnalytics, { once: true });
  }
}

// Export for ES6 module usage
export { trackEvent };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { trackEvent, initializeVercelAnalytics };
}
