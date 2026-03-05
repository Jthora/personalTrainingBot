import { useEffect, useState } from 'react';
import { trackEvent } from '../utils/telemetry';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
    trackEvent({ category: 'offline', action: initialOnline ? 'offline_exit' : 'offline_enter', source: 'system' });

    const handleOnline = () => {
      setIsOnline(true);
      trackEvent({ category: 'offline', action: 'offline_exit', source: 'system' });
    };
    const handleOffline = () => {
      setIsOnline(false);
      trackEvent({ category: 'offline', action: 'offline_enter', source: 'system' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
