import { useState, useEffect, useCallback } from 'react';

export function useNavHeight() {
  const [navHeight, setNavHeight] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);

  const measureNav = useCallback(() => {
    const navElement = document.querySelector<HTMLElement>('.mobile-nav-measure');
    if (navElement) {
      const rect = navElement.getBoundingClientRect();
      const parent = navElement.parentElement as HTMLElement;
      const scale = parent ? parseFloat(getComputedStyle(parent).transform.split(',')[5] || '1') : 1;
      const scaledHeight = rect.height * scale;
      setNavHeight(scaledHeight);
      setIsNavVisible(scaledHeight > 20);
    }
  }, []);

  useEffect(() => {
    measureNav();
    setTimeout(measureNav, 100);
    setTimeout(measureNav, 300);
  }, [measureNav]);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        measureNav();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measureNav);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measureNav);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [measureNav]);

  return { navHeight, isNavVisible };
}
