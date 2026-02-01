import { useState, useEffect, useRef, useCallback, useMemo, RefObject } from 'react';
import {
  calculateHeaderPadding,
  CalculatedPadding,
  getBreakpoint,
  getViewOffset,
  interpolatePadding,
  debounce,
} from '../utils/layout';

export interface UseHeaderPaddingOptions {
  /** Ref to the header element - measures from the bottom edge of the header */
  headerRef: RefObject<HTMLElement | null>;
  /** Whether the header is currently visible (controlled by scroll) */
  isHeaderVisible: boolean;
  /** Current view type for view-specific offsets */
  viewType?: string;
  /** Additional offset in pixels (e.g., for extra spacing) */
  additionalOffset?: number;
  /** Whether to animate padding changes */
  animate?: boolean;
  /** Duration of padding animation in ms */
  animationDuration?: number;
}

export interface UseHeaderPaddingReturn {
  /** Current calculated padding in pixels */
  padding: number;
  /** CSS value string (e.g., "120px") */
  paddingValue: string;
  /** CSS-in-JS style object for inline styles */
  style: { paddingTop: string };
  /** CSS class with the padding value for Tailwind */
  className: string;
  /** Whether using fallback values (header not measured yet) */
  isReady: boolean;
  /** Current breakpoint */
  breakpoint: 'mobile' | 'desktop';
  /** Function to manually recalculate */
  recalculate: () => void;
}

/**
 * React hook for calculating responsive padding between header and main content.
 * Measures from the bottom edge of the header to ensure content starts exactly where the header ends.
 * 
 * Features:
 * - Real-time measurement of header bottom edge position via ResizeObserver
 * - Responsive to scroll state (header visibility changes)
 * - Mobile/desktop breakpoint detection
 * - Safe area inset support (notch devices)
 * - View-specific padding overrides
 * - Smooth animation support
 * - Debounced resize handling
 * 
 * @example
 * ```tsx
 * const headerRef = useRef<HTMLElement>(null);
 * const [showHeader, setShowHeader] = useState(true);
 * 
 * const { style, className } = useHeaderPadding({
 *   headerRef,
 *   isHeaderVisible: showHeader,
 *   viewType: 'shots',
 * });
 * 
 * return (
 *   <>
 *     <Header ref={headerRef} showHeader={showHeader} />
 *     <main style={style} className={className}>
 *       Content here
 *     </main>
 *   </>
 * );
 * ```
 */
export function useHeaderPadding(
  options: UseHeaderPaddingOptions
): UseHeaderPaddingReturn {
  const {
    headerRef,
    isHeaderVisible,
    viewType,
    additionalOffset = 0,
    animate = true,
    animationDuration = 300,
  } = options;

  // State
  const [headerBottomPosition, setHeaderBottomPosition] = useState(0);
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'desktop'>('desktop');
  const [displayPadding, setDisplayPadding] = useState(160); // Start with conservative fallback
  const [isReady, setIsReady] = useState(false);
  
  // Refs for animation
  const targetPaddingRef = useRef(160);
  const animationRef = useRef<number | null>(null);
  const lastVisibilityRef = useRef(isHeaderVisible);
  const previousBottomPositionRef = useRef(0); // Track previous measurement

  // Calculate target padding based on current state
  const calculateTargetPadding = useCallback((): number => {
    const viewOffset = getViewOffset(viewType);

    const result = calculateHeaderPadding({
      headerBottomPosition,
      isHeaderVisible,
      breakpoint,
      viewOffset,
      additionalOffset,
    });

    return result.value;
  }, [headerBottomPosition, isHeaderVisible, breakpoint, viewType, additionalOffset]);

  // Setup ResizeObserver for header bottom position measurement
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Initial measurement - measure bottom edge position
    const measure = () => {
      const rect = header.getBoundingClientRect();
      // Use the bottom position of the header as the padding value
      // This accounts for the actual visible bottom edge where content should start
      setHeaderBottomPosition(rect.bottom);
    };
    measure();

    // ResizeObserver for real-time updates when header content changes
    const resizeObserver = new ResizeObserver(() => {
      measure();
    });

    resizeObserver.observe(header);

    // Listen to window resize and scroll for when header slides in/out
    const handleResize = debounce(() => {
      measure();
      setBreakpoint(getBreakpoint());
    }, 100);

    // Scroll listener is crucial - header position changes on scroll (show/hide)
    const handleScroll = () => {
      measure();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerRef]);

  // Track breakpoint changes
  useEffect(() => {
    const handleResize = debounce(() => {
      setBreakpoint(getBreakpoint());
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial breakpoint detection
  useEffect(() => {
    setBreakpoint(getBreakpoint());
  }, []);

  // Update padding when measurements or visibility changes
  useEffect(() => {
    const targetPadding = calculateTargetPadding();
    targetPaddingRef.current = targetPadding;

    // Check if this is the first real measurement (transitioning from 0 to actual value)
    const isFirstMeasurement = previousBottomPositionRef.current === 0 && headerBottomPosition > 0;
    previousBottomPositionRef.current = headerBottomPosition;
    
    // If not animating or first measurement, update immediately
    if (!animate || isFirstMeasurement) {
      setDisplayPadding(targetPadding);
      setIsReady(true);
      return;
    }

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startPadding = displayPadding;
    const startTime = performance.now();
    const isVisibilityChange = lastVisibilityRef.current !== isHeaderVisible;
    lastVisibilityRef.current = isHeaderVisible;

    // Animation duration: faster for small changes, slower for visibility changes
    const duration = isVisibilityChange ? animationDuration : animationDuration / 2;

    const animatePadding = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newPadding = interpolatePadding(startPadding, targetPadding, progress);
      setDisplayPadding(newPadding);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animatePadding);
      } else {
        setIsReady(true);
      }
    };

    animationRef.current = requestAnimationFrame(animatePadding);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [calculateTargetPadding, animate, animationDuration, isHeaderVisible, headerBottomPosition]);

  // Manual recalculate function
  const recalculate = useCallback(() => {
    const header = headerRef.current;
    if (header) {
      const rect = header.getBoundingClientRect();
      setHeaderBottomPosition(rect.bottom);
    }
    setBreakpoint(getBreakpoint());
  }, [headerRef]);

  // Generate output values
  const result = useMemo((): CalculatedPadding => {
    return calculateHeaderPadding({
      headerBottomPosition: displayPadding,
      isHeaderVisible,
      breakpoint,
    });
  }, [displayPadding, isHeaderVisible, breakpoint]);

  // Generate Tailwind class
  const className = useMemo(() => {
    // Map padding to nearest Tailwind spacing scale
    const spacingScale: Record<number, string> = {
      80: 'pt-20',    // 5rem
      84: 'pt-[84px]',
      88: 'pt-22',    // 5.5rem
      92: 'pt-[92px]',
      96: 'pt-24',    // 6rem
      100: 'pt-[100px]',
      104: 'pt-26',   // 6.5rem
      108: 'pt-[108px]',
      112: 'pt-28',   // 7rem
      116: 'pt-[116px]',
      120: 'pt-[120px]',
      124: 'pt-31',   // 7.75rem
      128: 'pt-32',   // 8rem
      132: 'pt-[132px]',
      136: 'pt-34',   // 8.5rem
      140: 'pt-[140px]',
      144: 'pt-36',   // 9rem
      148: 'pt-[148px]',
      152: 'pt-[152px]',
      156: 'pt-39',   // 9.75rem
      160: 'pt-40',   // 10rem
      164: 'pt-[164px]',
      168: 'pt-[168px]',
      172: 'pt-43',   // 10.75rem
      176: 'pt-44',   // 11rem
      180: 'pt-[180px]',
      184: 'pt-46',   // 11.5rem
      188: 'pt-[188px]',
      192: 'pt-48',   // 12rem
      196: 'pt-[196px]',
      200: 'pt-50',   // 12.5rem
      204: 'pt-[204px]',
      208: 'pt-52',   // 13rem
      212: 'pt-[212px]',
      216: 'pt-54',   // 13.5rem
      220: 'pt-[220px]',
      224: 'pt-56',   // 14rem
      228: 'pt-[228px]',
      232: 'pt-58',   // 14.5rem
      236: 'pt-[236px]',
      240: 'pt-60',   // 15rem
      244: 'pt-[244px]',
      248: 'pt-62',   // 15.5rem
      252: 'pt-[252px]',
      256: 'pt-64',   // 16rem
      260: 'pt-[260px]',
      264: 'pt-66',   // 16.5rem
      268: 'pt-[268px]',
      272: 'pt-68',   // 17rem
      276: 'pt-[276px]',
      280: 'pt-70',   // 17.5rem
      284: 'pt-[284px]',
      288: 'pt-72',   // 18rem
      292: 'pt-[292px]',
      296: 'pt-74',   // 18.5rem
      300: 'pt-[300px]',
    };

    // Find closest match or use arbitrary value
    const roundedPadding = Math.round(displayPadding / 4) * 4;
    return spacingScale[roundedPadding] || `pt-[${displayPadding}px]`;
  }, [displayPadding]);

  return {
    padding: displayPadding,
    paddingValue: result.cssValue,
    style: { paddingTop: `${displayPadding}px` },
    className,
    isReady,
    breakpoint,
    recalculate,
  };
}

/**
 * Hook variant for simple use cases without animation
 * Returns just the calculated padding value
 */
export function useSimpleHeaderPadding(
  headerRef: RefObject<HTMLElement | null>,
  isHeaderVisible: boolean,
  viewType?: string
): number {
  const [padding, setPadding] = useState(160);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const calculate = () => {
      const rect = header.getBoundingClientRect();
      const breakpoint = getBreakpoint();
      const viewOffset = getViewOffset(viewType);

      const result = calculateHeaderPadding({
        headerBottomPosition: rect.bottom,
        isHeaderVisible,
        breakpoint,
        viewOffset,
      });

      setPadding(result.value);
    };

    calculate();

    const resizeObserver = new ResizeObserver(() => calculate());
    resizeObserver.observe(header);

    return () => resizeObserver.disconnect();
  }, [headerRef, isHeaderVisible, viewType]);

  return padding;
}

export default useHeaderPadding;
