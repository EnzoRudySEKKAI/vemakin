import { useEffect, useRef, useState, useCallback } from 'react';
import { useLayout } from '../context/LayoutContext';

export interface UseSyncLayoutOptions {
  viewType?: string;
  additionalOffset?: number;
  filterTranslateY?: number; // Dynamic offset from drawer scroll
}

export interface UseSyncLayoutReturn {
  style: { paddingTop: string };
  isReady: boolean;
  padding: number;
}

const VIEW_OFFSETS: Record<string, number> = {
  shots: 12,
  inventory: 12,
  notes: 12,
  postprod: 12,
  overview: 12,
  settings: 12,
  'equipment-detail': 12,
  'shot-detail': 12,
  'note-detail': 12,
  'task-detail': 12,
  'manage-projects': 12,
};

const DEFAULT_HEIGHTS: Record<string, number> = {
  overview: 162,
  shots: 194,
  inventory: 252,
  postprod: 252,
  notes: 252,
  default: 160,
};

const getInitialPadding = (view: string | undefined, offset: number = 0) => {
  const height = DEFAULT_HEIGHTS[view || 'overview'] || DEFAULT_HEIGHTS.default;
  const viewOffset = view ? (VIEW_OFFSETS[view] ?? 8) : 8;
  return Math.round(height + viewOffset + offset);
};

/**
 * Hook for synchronizing content padding with header layout.
 * Uses per-view max height tracking to prevent padding issues when switching views.
 * Supports dynamic filter offset from drawer scroll for Airbnb-style effects.
 */
export function useSyncLayout(options: UseSyncLayoutOptions = {}): UseSyncLayoutReturn {
  const { viewType, additionalOffset = 0, filterTranslateY = 0 } = options;
  const { headerRef, updateMeasurements } = useLayout();

  // Base padding is the measured padding WITHOUT filter adjustment
  // Use measured default for the current viewType to prevent flicker
  const [basePadding, setBasePadding] = useState(() => getInitialPadding(viewType, additionalOffset));
  const [isReady, setIsReady] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const isMeasuringRef = useRef(false);

  // Per-view max height tracking - key is viewType, value is max height for that view
  const maxHeightPerViewRef = useRef<Record<string, number>>({});
  const currentViewRef = useRef(viewType);
  const isViewChangingRef = useRef(false);

  // Get or initialize max height for current view
  const getMaxHeightForView = useCallback((view: string | undefined) => {
    const key = view || 'default';
    if (!(key in maxHeightPerViewRef.current)) {
      maxHeightPerViewRef.current[key] = DEFAULT_HEIGHTS[key] || DEFAULT_HEIGHTS.default;
    }
    return maxHeightPerViewRef.current[key];
  }, []);

  // Update max height for current view
  const updateMaxHeightForView = useCallback((view: string | undefined, height: number) => {
    const key = view || 'default';
    // If we're just starting or the height is significantly different, update it
    const currentMax = maxHeightPerViewRef.current[key];
    const initialDefault = DEFAULT_HEIGHTS[key] || DEFAULT_HEIGHTS.default;
    if (currentMax === initialDefault || height > currentMax || Math.abs(height - currentMax) > 5) {
      maxHeightPerViewRef.current[key] = height;
    }
  }, []);

  // Handle view type changes
  useEffect(() => {
    if (viewType !== currentViewRef.current) {
      isViewChangingRef.current = true;
      currentViewRef.current = viewType;
      setIsReady(false);

      // Immediately set initial padding for the new view to avoid jump
      setBasePadding(getInitialPadding(viewType, additionalOffset));

      // Longer delay to let the header fully render with new content and any animations complete
      const timer = setTimeout(() => {
        isViewChangingRef.current = false;

        // Force immediate measurement for the new view
        const header = headerRef.current;
        if (!header) return;

        const rect = header.getBoundingClientRect();
        const row1El = header.querySelector('[data-header-row="1"]');
        // Row2 is a sibling div, not inside header - search in document
        const row2El = document.querySelector('[data-header-row="2"]');

        const row1Height = row1El?.getBoundingClientRect().height || 58;
        const row2Rect = row2El?.getBoundingClientRect();
        const row2Height = row2Rect?.height || 0;
        // Use row2's bottom position as the true total height (when filters are visible)
        const totalHeight = row2Rect ? row2Rect.bottom : rect.bottom;

        // Update max for this specific view
        updateMaxHeightForView(viewType, totalHeight);
        const stableHeight = getMaxHeightForView(viewType);

        const viewOffset = viewType ? (VIEW_OFFSETS[viewType] ?? 8) : 8;
        const newBasePadding = Math.round(stableHeight + viewOffset + additionalOffset);
        const clampedBasePadding = Math.max(80, Math.min(400, newBasePadding));

        setBasePadding(clampedBasePadding);
        setIsReady(true);

        updateMeasurements({
          headerHeight: stableHeight,
          row1Height,
          row2Height,
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [viewType, headerRef, additionalOffset, updateMeasurements, getMaxHeightForView, updateMaxHeightForView]);

  // Calculate padding from header measurements (for resize/initial load)
  const measureAndUpdate = useCallback(() => {
    // Skip if view is changing
    if (isViewChangingRef.current || isMeasuringRef.current) return;
    isMeasuringRef.current = true;

    const header = headerRef.current;
    if (!header) {
      isMeasuringRef.current = false;
      return;
    }

    // Cancel any pending RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      try {
        const rect = header.getBoundingClientRect();
        const row1El = header.querySelector('[data-header-row="1"]');
        // Row2 is a sibling div, not inside header - search in document
        const row2El = document.querySelector('[data-header-row="2"]');

        const row1Height = row1El?.getBoundingClientRect().height || 58;
        const row2Rect = row2El?.getBoundingClientRect();
        const row2Height = row2Rect?.height || 0;
        // Update max height for current view only
        // Fallback to rect.bottom if rows aren't found
        const measuredHeight = (row2Rect ? row2Rect.bottom : rect.bottom) || 160;
        updateMaxHeightForView(viewType, measuredHeight);
        const stableHeight = getMaxHeightForView(viewType);

        const viewOffset = viewType ? (VIEW_OFFSETS[viewType] ?? 8) : 8;
        const newBasePadding = Math.round(stableHeight + viewOffset + additionalOffset);

        // Clamp values
        const clampedBasePadding = Math.max(80, Math.min(400, newBasePadding));

        // Only update if changed significantly
        if (Math.abs(clampedBasePadding - basePadding) > 2) {
          setBasePadding(clampedBasePadding);

          // Update context occasionally
          if (Math.random() > 0.7) {
            updateMeasurements({
              headerHeight: stableHeight,
              row1Height,
              row2Height,
            });
          }
        }

        if (!isReady) {
          setIsReady(true);
        }
      } finally {
        isMeasuringRef.current = false;
      }
    });
  }, [headerRef, viewType, additionalOffset, basePadding, isReady, updateMeasurements, getMaxHeightForView, updateMaxHeightForView]);

  // Setup ResizeObserver
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Initial measurement immediately if header is already in DOM
    // Otherwise use a short delay
    const initialDelay = headerRef.current ? 50 : 200;
    const initialTimer = setTimeout(measureAndUpdate, initialDelay);

    // Secondary measurement to catch any late-rendered content
    const secondaryTimer = setTimeout(measureAndUpdate, 500);

    // Setup ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      measureAndUpdate();
    });

    resizeObserver.observe(header);

    // Also observe row 2 if it exists
    const row2El = header.querySelector('[data-header-row="2"]');
    if (row2El) {
      resizeObserver.observe(row2El);
    }

    // Listen for resize
    const handleResize = () => measureAndUpdate();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(secondaryTimer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [headerRef, measureAndUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Use basePadding directly - no dynamic adjustment
  // Header filters slide over content without pushing it

  // Update CSS variable with padding
  useEffect(() => {
    document.documentElement.style.setProperty('--content-padding-top', `${basePadding}px`);
  }, [basePadding]);

  return {
    style: { paddingTop: `${basePadding}px` },
    isReady,
    padding: basePadding,
  };
}

export default useSyncLayout;

