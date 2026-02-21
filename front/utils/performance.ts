/**
 * Web Vitals Performance Monitoring
 * Tracks INP (Interaction to Next Paint) and other Core Web Vitals
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  navigationType?: string;
}

// INP thresholds based on Google's Core Web Vitals
const INP_THRESHOLDS = {
  good: 200,
  poor: 500
};

// Report queue to batch metrics
const reportQueue: PerformanceMetric[] = [];
let reportTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Get rating based on value and thresholds
 */
function getRating(value: number, thresholds: { good: number; poor: number }): PerformanceMetric['rating'] {
  if (value <= thresholds.good) return 'good';
  if (value >= thresholds.poor) return 'poor';
  return 'needs-improvement';
}

/**
 * Report metrics to console (and optionally to analytics)
 */
function reportMetrics(metrics: PerformanceMetric[]) {
  // Log to console in development
  if (import.meta.env.DEV) {
    metrics.forEach(metric => {
      const style = metric.rating === 'good' 
        ? 'color: green' 
        : metric.rating === 'poor' 
          ? 'color: red' 
          : 'color: orange';
      console.log(`%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`, style);
    });
  }

  // Here you could send to analytics service (e.g., Vercel Analytics, Google Analytics)
  // Example: sendToAnalytics(metrics);
}

/**
 * Queue metric for batch reporting
 */
function queueMetric(metric: PerformanceMetric) {
  reportQueue.push(metric);
  
  if (reportTimeout) {
    clearTimeout(reportTimeout);
  }
  
  // Batch reports every 5 seconds
  reportTimeout = setTimeout(() => {
    if (reportQueue.length > 0) {
      reportMetrics([...reportQueue]);
      reportQueue.length = 0;
    }
  }, 5000);
}

/**
 * Track INP using PerformanceObserver
 * Uses the Event Timing API to capture interaction delays
 */
function trackINP() {
  if (!('PerformanceObserver' in window)) return;

  try {
    // Create a buffer to track the longest interactions
    const longestInteractions: Array<{
      duration: number;
      id: number;
      name: string;
      target?: string;
    }> = [];
    const MAX_INTERACTIONS = 10;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        // Cast to any to access Event Timing API properties
        const eventEntry = entry as any;
        
        // Check if this is an interaction event with an interactionId
        if (eventEntry.interactionId && eventEntry.interactionId > 0) {
          // Calculate duration (processingEnd - startTime)
          const duration = eventEntry.processingEnd - eventEntry.startTime;
          
          // Only track interactions > 40ms
          if (duration > 40) {
            // Add to buffer
            longestInteractions.push({
              duration,
              id: eventEntry.interactionId,
              name: eventEntry.name,
              target: eventEntry.target?.nodeName
            });
            
            // Keep only the longest interactions
            longestInteractions.sort((a, b) => b.duration - a.duration);
            if (longestInteractions.length > MAX_INTERACTIONS) {
              longestInteractions.length = MAX_INTERACTIONS;
            }
            
            const metric: PerformanceMetric = {
              name: 'INP',
              value: duration,
              rating: getRating(duration, INP_THRESHOLDS),
              id: `inp-${eventEntry.interactionId}-${Date.now()}`,
              navigationType: 'navigate'
            };
            
            queueMetric(metric);
            
            // Log slow interactions immediately for debugging
            if (duration > 200) {
              console.warn(`[INP] Slow interaction detected: ${duration.toFixed(2)}ms`, {
                type: eventEntry.name,
                target: eventEntry.target?.nodeName,
                duration
              });
            }
          }
        }
      });
    });

    // Observe event entries - note: durationThreshold is part of the Event Timing API spec
    // but TypeScript types might not include it yet, so we cast to any
    const observeOptions: PerformanceObserverInit = { 
      type: 'event', 
      buffered: true
    };
    
    // @ts-ignore - durationThreshold is valid per Event Timing API spec
    observeOptions.durationThreshold = 40;
    
    observer.observe(observeOptions);
  } catch (e) {
    // PerformanceObserver not supported or failed
    console.warn('INP tracking not supported:', e);
  }
}

/**
 * Track CLS (Cumulative Layout Shift)
 */
function trackCLS() {
  if (!('PerformanceObserver' in window)) return;

  try {
    let clsValue = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const layoutShift = entry as any;
        // Only count layout shifts without recent user input
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      });

      const metric: PerformanceMetric = {
        name: 'CLS',
        value: clsValue,
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
        id: 'cls-' + Date.now()
      };

      queueMetric(metric);
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS tracking not supported:', e);
  }
}

/**
 * Track LCP (Largest Contentful Paint)
 */
function trackLCP() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (lastEntry) {
        const metric: PerformanceMetric = {
          name: 'LCP',
          value: lastEntry.startTime,
          rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor',
          id: 'lcp-' + Date.now()
        };

        queueMetric(metric);
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP tracking not supported:', e);
  }
}

/**
 * Track FID (First Input Delay) - legacy, replaced by INP
 */
function trackFID() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const eventEntry = entry as any;
        const delay = eventEntry.processingStart - entry.startTime;
        
        const metric: PerformanceMetric = {
          name: 'FID',
          value: delay,
          rating: delay < 100 ? 'good' : delay < 300 ? 'needs-improvement' : 'poor',
          id: 'fid-' + Date.now()
        };

        queueMetric(metric);
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID tracking not supported:', e);
  }
}

/**
 * Track TTFB (Time to First Byte)
 */
function trackTTFB() {
  if (!('performance' in window)) return;

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.startTime;
      
      const metric: PerformanceMetric = {
        name: 'TTFB',
        value: ttfb,
        rating: ttfb < 600 ? 'good' : ttfb < 1000 ? 'needs-improvement' : 'poor',
        id: 'ttfb-' + Date.now()
      };

      queueMetric(metric);
    }
  } catch (e) {
    console.warn('TTFB tracking not supported:', e);
  }
}

/**
 * Initialize all performance tracking
 */
export function initPerformanceTracking() {
  // Only run in production or when explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_PERFORMANCE_TRACKING === 'true') {
    trackINP();
    trackCLS();
    trackLCP();
    trackFID();
    trackTTFB();

    // Report any remaining metrics when page unloads
    window.addEventListener('beforeunload', () => {
      if (reportQueue.length > 0) {
        reportMetrics([...reportQueue]);
      }
    });
  }
}

/**
 * Get current INP value (for debugging)
 * Returns the longest interaction duration from the current page session
 */
export function getCurrentINP(): number | null {
  if (!('performance' in window)) return null;
  
  try {
    const entries = performance.getEntriesByType('event') as any[];
    let maxDuration = 0;
    
    entries.forEach(entry => {
      if (entry.interactionId && entry.interactionId > 0 && entry.processingEnd) {
        const duration = entry.processingEnd - entry.startTime;
        if (duration > maxDuration) {
          maxDuration = duration;
        }
      }
    });
    
    return maxDuration > 0 ? maxDuration : null;
  } catch (e) {
    return null;
  }
}

export default {
  init: initPerformanceTracking,
  getCurrentINP
};
