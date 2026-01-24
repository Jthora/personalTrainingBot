import { clearAll, resetCacheSchema } from './indexedDbCache';

const hasLocalStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const registerCacheDebug = () => {
    if (typeof window === 'undefined') return;

    const api = {
        clear: async () => {
            await clearAll();
            if (hasLocalStorage()) {
                Object.keys(localStorage)
                    .filter((k) => k.startsWith('ptb-cache:'))
                    .forEach((k) => localStorage.removeItem(k));
            }
            // eslint-disable-next-line no-console
            console.info('[cache-debug] caches cleared');
        },
        disable: () => {
            if (!hasLocalStorage()) return;
            localStorage.setItem('DEBUG_CACHE_DISABLE', 'true');
            // eslint-disable-next-line no-console
            console.info('[cache-debug] cache disabled');
        },
        enable: () => {
            if (!hasLocalStorage()) return;
            localStorage.removeItem('DEBUG_CACHE_DISABLE');
            // eslint-disable-next-line no-console
            console.info('[cache-debug] cache enabled');
        },
        status: () => {
            const disabled = hasLocalStorage() && localStorage.getItem('DEBUG_CACHE_DISABLE') === 'true';
            // eslint-disable-next-line no-console
            console.info('[cache-debug] status', { disabled });
            return { disabled };
        },
        resetSchema: async () => {
            await resetCacheSchema();
            // eslint-disable-next-line no-console
            console.info('[cache-debug] schema reset + caches cleared');
        },
    } as const;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ptbCache = api;
    // eslint-disable-next-line no-console
    console.info('[cache-debug] window.ptbCache registered', api.status());
};
