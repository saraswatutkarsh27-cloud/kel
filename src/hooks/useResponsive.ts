import { useEffect, useState } from 'react';
import { useLayoutStore } from '../stores/layoutStore';

const MOBILE_BREAKPOINT = 1024;

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const setIsMobileStore = useLayoutStore((s) => s.setIsMobile);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setIsMobileStore(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobileStore]);

  return isMobile;
};

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};