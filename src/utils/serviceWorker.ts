const FLAG_KEY = 'sw:enable';

const isEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(FLAG_KEY) === 'true';
};

const setFlag = (value: boolean) => {
  try {
    window.localStorage.setItem(FLAG_KEY, value ? 'true' : 'false');
  } catch {
    /* ignore */
  }
};

export const enableServiceWorker = () => setFlag(true);
export const disableServiceWorker = () => setFlag(false);

export async function registerServiceWorkerIfEnabled() {
  if (import.meta.env.DEV) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  if (!isEnabled()) return;

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
