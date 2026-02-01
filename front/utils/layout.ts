/**
 * Layout utilities for calculating responsive padding
 * between header and main content
 */

export interface HeaderPaddingConfig {
  /** 
   * Bottom edge position of the header in pixels (from viewport top).
   * This is typically obtained via element.getBoundingClientRect().bottom
   * and represents exactly where the main content should start.
   */
  headerBottomPosition: number;
  /** Whether the header is currently visible */
  isHeaderVisible: boolean;
  /** Current breakpoint - mobile or desktop */
  breakpoint: 'mobile' | 'desktop';
  /** Optional view-specific offset (in pixels) */
  viewOffset?: number;
  /** Additional offset to add to the calculated padding */
  additionalOffset?: number;
}

export interface CalculatedPadding {
  /** Numeric padding value in pixels */
  value: number;
  /** CSS value string (e.g., "120px") */
  cssValue: string;
  /** CSS-in-JS style object */
  style: { paddingTop: string };
  /** Whether this is using fallback values */
  isFallback: boolean;
}

/** Default configuration values - only for initial render before measurement */
const DEFAULTS = {
  mobile: {
    fallbackPadding: 140, // Conservative estimate for mobile header height
    minPadding: 80,
    maxPadding: 300,
  },
  desktop: {
    fallbackPadding: 180, // Conservative estimate for desktop header height  
    minPadding: 100,
    maxPadding: 400,
  },
} as const;

/**
 * Calculates the optimal padding between header and main content.
 * 
 * The headerBottomPosition parameter should be the actual measured bottom edge
 * of the header (from getBoundingClientRect().bottom), which already accounts
 * for all header content including safe areas and controls.
 * 
 * We only add minimal breathing room (viewOffset) on top of this measurement.
 * 
 * @example
 * ```typescript
 * const padding = calculateHeaderPadding({
 *   headerBottomPosition: 160, // measured from rect.bottom
 *   isHeaderVisible: true,
 *   breakpoint: 'desktop',
 *   viewOffset: 8, // small breathing room
 * });
 * 
 * // Use in component:
 * <main style={padding.style}>...</main>
 * ```
 */
export function calculateHeaderPadding(
  config: HeaderPaddingConfig
): CalculatedPadding {
  const {
    headerBottomPosition,
    isHeaderVisible,
    breakpoint,
    viewOffset = 0,
    additionalOffset = 0,
  } = config;

  const defaults = DEFAULTS[breakpoint];
  
  // If we have a valid measurement, use it directly with minimal adjustments
  if (headerBottomPosition > 0) {
    // Add only small breathing room and view-specific offset
    // The headerBottomPosition already includes safe area and all header content
    let totalPadding = headerBottomPosition + viewOffset + additionalOffset;
    
    // Ensure minimum padding even if header is hidden (shouldn't happen with fixed header)
    if (!isHeaderVisible) {
      // When header is hidden, we still need minimal padding
      totalPadding = Math.max(totalPadding * 0.3, defaults.minPadding);
    }
    
    // Clamp to reasonable bounds
    totalPadding = Math.max(
      defaults.minPadding,
      Math.min(defaults.maxPadding, totalPadding)
    );
    
    // Round to nearest 4px for cleaner Tailwind alignment
    totalPadding = Math.round(totalPadding / 4) * 4;

    return {
      value: totalPadding,
      cssValue: `${totalPadding}px`,
      style: { paddingTop: `${totalPadding}px` },
      isFallback: false,
    };
  }
  
  // Fallback for initial render before measurement
  const fallbackPadding = defaults.fallbackPadding;
  
  return {
    value: fallbackPadding,
    cssValue: `${fallbackPadding}px`,
    style: { paddingTop: `${fallbackPadding}px` },
    isFallback: true,
  };
}

/**
 * Pre-defined view offsets for different screens
 * Fine-tune these based on your specific UI needs
 * These are SMALL breathing room values added on top of the measured header position
 */
export const VIEW_OFFSETS: Record<string, number> = {
  // Shots grid is dense, needs minimal extra space
  shots: 8,
  'shot-detail': 16,
  
  // Inventory has cards, medium breathing room
  inventory: 12,
  'equipment-detail': 16,
  
  // Postprod tasks are list-based
  postprod: 12,
  'task-detail': 16,
  
  // Notes need breathing room for text
  notes: 16,
  'note-detail': 20,
  
  // Overview is dashboard, balanced padding
  overview: 12,
  
  // Settings has forms, needs more space
  settings: 16,
  
  // Project management
  'manage-projects': 12,
};

/**
 * Get view-specific offset for a given view type
 */
export function getViewOffset(viewType: string | undefined): number {
  if (!viewType) return 8; // Default 8px breathing room
  return VIEW_OFFSETS[viewType] ?? 8;
}

/**
 * Calculate safe area inset top for mobile devices
 * Returns 0 on desktop or if safe-area-inset-top is not supported
 */
export function getSafeAreaInsetTop(): number {
  if (typeof window === 'undefined') return 0;
  
  // Check if it's a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return 0;

  // Get safe area inset from CSS env variable
  const safeAreaTop = getComputedStyle(document.documentElement)
    .getPropertyValue('--safe-area-inset-top');
  
  if (safeAreaTop) {
    return parseInt(safeAreaTop, 10) || 0;
  }

  // Fallback: detect iOS notch devices
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
  
  if (isIOS && (window.screen.height >= 812 || window.screen.width >= 812)) {
    // iPhone X and later have 44px safe area, older have 20px
    return isStandalone ? 44 : 20;
  }

  return 0;
}

/**
 * Detect current breakpoint based on window width
 * Matches Tailwind's default breakpoints
 */
export function getBreakpoint(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  // lg breakpoint in Tailwind is 1024px
  return window.innerWidth >= 1024 ? 'desktop' : 'mobile';
}

/**
 * Smoothly interpolate between two padding values
 * Useful for animations when header visibility changes
 */
export function interpolatePadding(
  from: number,
  to: number,
  progress: number
): number {
  // Ease out cubic for smooth deceleration
  const eased = 1 - Math.pow(1 - progress, 3);
  return Math.round(from + (to - from) * eased);
}

/**
 * Debounce function for resize/orientation events
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
