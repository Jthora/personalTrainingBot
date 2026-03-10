export async function registerServiceWorker() {
  if (import.meta.env.DEV) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');

    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          // A new SW is waiting. Let useServiceWorkerUpdate detect it
          // via the 'controllerchange' event or reg.waiting check.
          // Don't auto-skip — let the user choose when to reload.
          console.info('[SW] New service worker installed and waiting.');
        }
      });
    });

    // Listen for controller change to reload cleanly
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      // The UpdateNotification component will prompt the user to reload.
      // If this fires after user clicks "Reload", the page will already
      // be reloading. This handler is a safety net.
    });
  } catch (err) {
    console.warn('Service worker registration failed', err);
  }
}

export async function unregisterServiceWorkers() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
}
