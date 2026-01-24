import { JsonLoader } from './jsonLoader';

type ConnectionInfo = {
    effectiveType?: string;
    saveData?: boolean;
};

type PrefetchOptions = {
    label?: string;
    maxConcurrency?: number;
    timeoutMs?: number;
    logger?: (message: string) => void;
    onProgress?: (completed: number, total: number) => void;
};

const getConnectionInfo = (): ConnectionInfo => {
    // navigator.connection is non-standard but widely available in Chromium/WebKit
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined;
    const connection = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
    return {
        effectiveType: connection?.effectiveType as string | undefined,
        saveData: Boolean(connection?.saveData),
    };
};

const connectionAllowsPrefetch = (info: ConnectionInfo) => {
    if (info.saveData) return false;
    if (!info.effectiveType) return true;
    return !['slow-2g', '2g'].includes(info.effectiveType);
};

const scheduleIdle = (fn: () => void, timeoutMs = 150) => {
    if (typeof (window as any).requestIdleCallback === 'function') {
        (window as any).requestIdleCallback(fn, { timeout: timeoutMs });
    } else {
        setTimeout(fn, timeoutMs);
    }
};

const runWithConcurrency = async (
    loaders: Array<() => Promise<unknown>>,
    maxConcurrency: number,
    onProgress?: (completed: number, total: number) => void,
    logger?: (message: string) => void
) => {
    const total = loaders.length;
    let index = 0;
    let completed = 0;
    const active: Promise<void>[] = [];

    const next = async () => {
        const currentIndex = index++;
        if (currentIndex >= total) return;
        try {
            await loaders[currentIndex]();
        } catch (error) {
            logger?.(`prefetch: loader ${currentIndex} failed: ${String(error)}`);
        } finally {
            completed += 1;
            onProgress?.(completed, total);
            await next();
        }
    };

    const slots = Math.max(1, Math.min(maxConcurrency, total));
    for (let i = 0; i < slots; i += 1) {
        active.push(next());
    }
    await Promise.allSettled(active);
};

export const prefetchOnIdle = (
    loaders: Array<() => Promise<unknown> | JsonLoader<unknown>>,
    options: PrefetchOptions = {}
) => {
    const { label = 'prefetch', maxConcurrency = 2, timeoutMs = 150, logger, onProgress } = options;
    const connectionInfo = getConnectionInfo();
    if (!connectionAllowsPrefetch(connectionInfo)) {
        logger?.(`${label}: skipped due to connection guard (saveData=${connectionInfo.saveData}, effectiveType=${connectionInfo.effectiveType})`);
        return () => {};
    }

    let cancelled = false;
    const wrappedLoaders = loaders.map((loader) => () => (loader as () => Promise<unknown>)());

    scheduleIdle(() => {
        if (cancelled) return;
        runWithConcurrency(wrappedLoaders, maxConcurrency, onProgress, logger).catch((error) => {
            logger?.(`${label}: prefetch run failed: ${String(error)}`);
        });
    }, timeoutMs);

    return () => {
        cancelled = true;
    };
};
