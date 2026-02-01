import { useEffect, useRef, useState, useCallback } from 'react';
import { useLayout } from '../context/LayoutContext';

export interface UseSyncLayoutOptions {
  viewType?: string;
  additionalOffset?: number;
}

export interface UseSyncLayoutReturn {
  style: { paddingTop: string };
  isReady: boolean;
  padding: number;
}

const VIEW_OFFSETS: Record<string, number> = {
  shots: 8,
  inventory: 12,
  notes: 16,
  postprod: 12,
  overview: 12,
  settings: 16,
};

/**
 * Hook for synchronizing content padding with header layout.
 * Simplified version without infinite loop issues.
 */
export function useSyncLayout(options: UseSyncLayoutOptions = {}): UseSyncLayoutReturn {
  const { viewType, additionalOffset = 0 } = options;
  const { headerRef, updateMeasurements } = useLayout();
  
  const [padding, setPadding] = useState(160);
  const [isReady, setIsReady] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const isMeasuringRef = useRef(false);
  const maxHeightRef = useRef(160); // Track maximum height ever measured
  const lastViewTypeRef = useRef(viewType); // Track view type changes

  // Reset and remeasure when view type changes (each view has different header height)
  useEffect(() => {
    if (viewType !== lastViewTypeRef.current) {
      // Reset max height for this new view
      maxHeightRef.current = 160;
      lastViewTypeRef.current = viewType;
      setIsReady(false);
      
      // Force immediate remeasure after a short delay to let header render
      const timer = setTimeout(() => {
        // Clear any pending RAF
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
        
        const header = headerRef.current;
        if (!header) return;
        
        // Force immediate measurement
        const rect = header.getBoundingClientRect();
        const row1El = header.querySelector('[data-header-row="1"]');
        const row2El = header.querySelector('[data-header-row="2"]');
        
        const row1Height = row1El?.getBoundingClientRect().height || 58;
        const row2Height = row2El?.getBoundingClientRect().height || 0;
        const totalHeight = rect.bottom;
        
        // Set initial max for this view
        maxHeightRef.current = totalHeight;
        
        const viewOffset = viewType ? (VIEW_OFFSETS[viewType] ?? 8) : 8;
        const newPadding = Math.round(totalHeight + viewOffset + additionalOffset);
        const clampedPadding = Math.max(80, Math.min(400, newPadding));
        
        setPadding(clampedPadding);
        setIsReady(true);
        
        updateMeasurements({
          headerHeight: totalHeight,
          row1Height,
          row2Height,
        });
      }, 50); // 50ms to let new view render
      
      return () => clearTimeout(timer);
    }
  }, [viewType, headerRef, additionalOffset, updateMeasurements]);

  // Calculate padding from header measurements
  const measureAndUpdate = useCallback(() => {
    if (isMeasuringRef.current) return;
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
        const row2El = header.querySelector('[data-header-row="2"]');
        
        const row1Height = row1El?.getBoundingClientRect().height || 58;
        const row2Height = row2El?.getBoundingClientRect().height || 0;
        const totalHeight = rect.bottom;
        
        // Update max height if current is larger
        if (totalHeight > maxHeightRef.current) {
          maxHeightRef.current = totalHeight;
        }
        
        // Use max height for consistent padding (Sticky Content pattern)
        // This ensures content doesn't jump when header collapses on scroll
        const stableHeight = maxHeightRef.current;
        
        const viewOffset = viewType ? (VIEW_OFFSETS[viewType] ?? 8) : 8;
        const newPadding = Math.round(stableHeight + viewOffset + additionalOffset);
        
        // Clamp values
        const clampedPadding = Math.max(80, Math.min(400, newPadding));
        
        // Only update if changed significantly (avoid micro-changes)
        if (Math.abs(clampedPadding - padding) > 2) {
          setPadding(clampedPadding);
          
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
  }, [headerRef, viewType, additionalOffset, padding, isReady, updateMeasurements]);

  // Setup ResizeObserver
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Initial measurement after a short delay
    const initialTimer = setTimeout(measureAndUpdate, 100);

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

  // Update CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--content-padding-top', `${padding}px`);
  }, [padding]);

  return {
    style: { paddingTop: `${padding}px` },
    isReady,
    padding,
  };
}

export default useSyncLayout;
