import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export interface LayoutMeasurements {
  headerHeight: number;
  row1Height: number;
  row2Height: number;
  safeAreaTop: number;
  isAnimating: boolean;
  isVisible: boolean;
  breakpoint: 'mobile' | 'desktop';
}

export interface LayoutContextType extends LayoutMeasurements {
  headerRef: React.RefObject<HTMLElement | null>;
  updateMeasurements: (updates: Partial<LayoutMeasurements>) => void;
  startAnimation: () => void;
  endAnimation: () => void;
}

const defaultMeasurements: LayoutMeasurements = {
  headerHeight: 160,
  row1Height: 58,
  row2Height: 0,
  safeAreaTop: 0,
  isAnimating: false,
  isVisible: true,
  breakpoint: 'desktop',
};

const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

interface LayoutProviderProps {
  children: React.ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [measurements, setMeasurements] = useState<LayoutMeasurements>(defaultMeasurements);
  const headerRef = useRef<HTMLElement>(null);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced update to prevent rapid state changes
  const updateMeasurements = useCallback((updates: Partial<LayoutMeasurements>) => {
    // Clear pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Batch updates with a small delay
    updateTimeoutRef.current = setTimeout(() => {
      setMeasurements(prev => {
        // Only update if values actually changed
        const hasChanges = Object.keys(updates).some(
          key => prev[key as keyof LayoutMeasurements] !== updates[key as keyof LayoutMeasurements]
        );
        
        if (!hasChanges) return prev;
        
        return { ...prev, ...updates };
      });
    }, 16); // One frame delay
  }, []);

  const startAnimation = useCallback(() => {
    setMeasurements(prev => ({ ...prev, isAnimating: true }));
  }, []);

  const endAnimation = useCallback(() => {
    setMeasurements(prev => ({ ...prev, isAnimating: false }));
  }, []);

  // Detect breakpoint changes
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setMeasurements(prev => {
        if (prev.breakpoint === (isDesktop ? 'desktop' : 'mobile')) {
          return prev;
        }
        return { ...prev, breakpoint: isDesktop ? 'desktop' : 'mobile' };
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get safe area insets once
  useEffect(() => {
    const safeAreaTop = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0',
      10
    );
    if (safeAreaTop > 0) {
      setMeasurements(prev => ({ ...prev, safeAreaTop }));
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const value: LayoutContextType = {
    ...measurements,
    updateMeasurements,
    startAnimation,
    endAnimation,
    headerRef,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export default LayoutContext;
