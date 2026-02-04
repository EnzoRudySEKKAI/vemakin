import { useState, useEffect, useRef, useCallback } from 'react';

interface UseDrawerScrollOptions {
  threshold?: number;
  maxTranslateY?: number;
  mobileOnly?: boolean;
  keepVisiblePixels?: number;
  direction?: 'up' | 'down'; // 'up' for header (slides up), 'down' for bottom menu (slides down)
}

interface UseDrawerScrollReturn {
  translateY: number;
  isVisible: boolean;
  scrollDirection: 'up' | 'down' | 'none';
  scrollProgress: number;
}

/**
 * Hook pour créer un effet "tiroir" (drawer) sur le scroll
 * Le header/menu suit le contenu et se cache progressivement
 * 
 * Exemple style Airbnb/Twitter mobile :
 * - Scroll vers le bas = élément glisse vers le haut (ou bas pour le menu)
 * - Scroll vers le haut = élément revient
 * - Translation fluide qui suit la vitesse du scroll
 */
export function useDrawerScroll(options: UseDrawerScrollOptions = {}): UseDrawerScrollReturn {
  const {
    threshold = 8,
    maxTranslateY = 100,
    mobileOnly = true,
    keepVisiblePixels = 0,
    direction = 'up' // Default: header slides up
  } = options;

  const [translateY, setTranslateY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'none'>('none');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const lastScrollY = useRef(0);
  const currentTranslateY = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastUpdateTime = useRef(Date.now());

  const updatePosition = useCallback((newTranslateY: number) => {
    // Clamp based on direction:
    // 'up' = header slides up = values between -maxTranslateY and 0
    // 'down' = bottom menu slides down = values between 0 and +maxTranslateY
    let clampedValue: number;
    if (direction === 'up') {
      clampedValue = Math.max(-maxTranslateY, Math.min(0, newTranslateY));
    } else {
      clampedValue = Math.max(0, Math.min(maxTranslateY, newTranslateY));
    }

    currentTranslateY.current = clampedValue;
    setTranslateY(clampedValue);

    // Calculer la progression (0 = visible, 1 = complètement caché)
    const progress = Math.abs(clampedValue) / maxTranslateY;
    setScrollProgress(progress);
    setIsVisible(progress < 0.8); // Considéré visible si moins de 80% caché
  }, [maxTranslateY, direction]);

  useEffect(() => {
    const handleScroll = () => {
      // Ignorer sur desktop si mobileOnly est true
      if (mobileOnly && window.innerWidth >= 1024) {
        updatePosition(0);
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      // En haut de page, toujours visible
      if (currentScrollY <= 10) {
        updatePosition(0);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Suivi direct du scroll (1:1) pour une fluidité maximale
      // direction 'up' (header): scroll down = negative translateY (element slides up)
      // direction 'down' (bottom menu): scroll down = positive translateY (element slides down)
      const newTranslateY = direction === 'up'
        ? currentTranslateY.current - scrollDelta
        : currentTranslateY.current + scrollDelta;
      updatePosition(newTranslateY);

      // Mise à jour de la direction
      if (scrollDelta > 0) {
        setScrollDirection('down');
      } else if (scrollDelta < 0) {
        setScrollDirection('up');
      }

      lastScrollY.current = currentScrollY;
    };

    const onScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      rafId.current = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [maxTranslateY, mobileOnly, updatePosition, direction]);

  return {
    translateY,
    isVisible,
    scrollDirection,
    scrollProgress
  };
}

export default useDrawerScroll;
