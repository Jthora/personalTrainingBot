import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Returns `true` when the viewport width is at or below the mobile breakpoint.
 * Listens for resize via `matchMedia` so re-renders only on threshold crossing.
 */
const useIsMobile = (breakpoint = MOBILE_BREAKPOINT): boolean => {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return isMobile;
};

export default useIsMobile;
