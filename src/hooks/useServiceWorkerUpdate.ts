import { useState, useEffect, useCallback } from 'react';

/**
 * Listens for service worker updates and exposes a flag + reload trigger.
 * An "update available" state means a new SW was installed while an older
 * controller is still active. Calling `applyUpdate` reloads to pick it up.
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      // A new SW activated — reload to use updated assets.
      // Only auto-reload if we haven't already prompted the user.
      if (!updateAvailable) {
        setUpdateAvailable(true);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check if an update is already waiting on page load
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) {
        setUpdateAvailable(true);
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  return { updateAvailable, applyUpdate };
}
