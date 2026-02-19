import { useState, useEffect, useRef, useCallback } from 'react';

interface UseDrawerScrollOptions {
  maxTranslateY?: number;
  mobileOnly?: boolean;
  direction?: 'up' | 'down';
  snapToEnds?: boolean;
}

interface UseDrawerScrollReturn {
  translateY: number;
  isVisible: boolean;
  scrollDirection: 'up' | 'down' | 'none';
  scrollProgress: number;
  isAnimating: boolean; // True during snap - use CSS transition
}

/**
 * Optimized drawer scroll hook
 * - Uses CSS transforms (GPU accelerated)
 * - Snap animation via CSS transitions (compositor thread)
 * - Minimal state updates for performance
 */
export function useDrawerScroll(options: UseDrawerScrollOptions = {}): UseDrawerScrollReturn {
  const {
    maxTranslateY = 100,
    mobileOnly = true,
    direction = 'up',
    snapToEnds = false
  } = options;

  const [translateY, setTranslateY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'none'>('none');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const lastScrollY = useRef(0);
  const currentTranslateY = useRef(0);
  const rafId = useRef<number | null>(null);
  const snapTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback((newTranslateY: number) => {
    let clampedValue: number;
    if (direction === 'up') {
      clampedValue = Math.max(-maxTranslateY, Math.min(0, newTranslateY));
    } else {
      clampedValue = Math.max(0, Math.min(maxTranslateY, newTranslateY));
    }

    // Only update if changed by more than 0.5px (reduces re-renders)
    if (Math.abs(clampedValue - currentTranslateY.current) > 0.5) {
      currentTranslateY.current = clampedValue;
      setTranslateY(clampedValue);

      const progress = Math.abs(clampedValue) / maxTranslateY;
      setScrollProgress(progress);
      setIsVisible(progress < 0.8);
    }
  }, [maxTranslateY, direction]);

  // Snap using CSS transition (GPU accelerated, no JS animation loop)
  const snapToEnd = useCallback(() => {
    if (!snapToEnds) return;

    const progress = Math.abs(currentTranslateY.current) / maxTranslateY;
    const targetValue = progress > 0.5
      ? (direction === 'up' ? -maxTranslateY : maxTranslateY)
      : 0;

    // Skip if already at target
    if (Math.abs(currentTranslateY.current - targetValue) < 1) return;

    // Enable CSS transition flag, update value
    setIsAnimating(true);
    currentTranslateY.current = targetValue;
    setTranslateY(targetValue);
    setScrollProgress(Math.abs(targetValue) / maxTranslateY);
    setIsVisible(targetValue === 0);

    // Disable animation flag after CSS transition completes
    setTimeout(() => setIsAnimating(false), 250);
  }, [snapToEnds, maxTranslateY, direction]);

  useEffect(() => {
    const handleScroll = () => {
      // Don't update during CSS transition
      if (isAnimating) return;

      if (mobileOnly && window.innerWidth >= 1024) {
        if (currentTranslateY.current !== 0) {
          currentTranslateY.current = 0;
          setTranslateY(0);
          setScrollProgress(0);
          setIsVisible(true);
        }
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      // At top, always visible
      if (currentScrollY <= 10) {
        updatePosition(0);
        lastScrollY.current = currentScrollY;
        return;
      }

      // 1:1 scroll tracking
      const newTranslateY = direction === 'up'
        ? currentTranslateY.current - scrollDelta
        : currentTranslateY.current + scrollDelta;
      updatePosition(newTranslateY);

      // Update direction (only if changed)
      const newDirection = scrollDelta > 0 ? 'down' : scrollDelta < 0 ? 'up' : scrollDirection;
      if (newDirection !== scrollDirection) {
        setScrollDirection(newDirection);
      }

      lastScrollY.current = currentScrollY;

      // Schedule snap
      if (snapToEnds) {
        if (snapTimeoutId.current) clearTimeout(snapTimeoutId.current);
        snapTimeoutId.current = setTimeout(snapToEnd, 150);
      }
    };

    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (snapTimeoutId.current) clearTimeout(snapTimeoutId.current);
    };
  }, [maxTranslateY, mobileOnly, updatePosition, direction, snapToEnds, snapToEnd, isAnimating, scrollDirection]);

  return {
    translateY,
    isVisible,
    scrollDirection,
    scrollProgress,
    isAnimating
  };
}

export default useDrawerScroll;
