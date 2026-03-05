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
          // Ask the new worker to activate ASAP
          installing.postMessage({ type: 'SKIP_WAITING' });
        }
      });
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
