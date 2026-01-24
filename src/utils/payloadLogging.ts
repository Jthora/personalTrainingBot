import { recordMetric } from './metrics';

interface PayloadSampleOptions {
    sampleRate?: number; // 0–1
    maxEntries?: number;
}

type ResourceEntry = PerformanceResourceTiming & { transferSize?: number; encodedBodySize?: number; decodedBodySize?: number };

const pickSize = (entry: ResourceEntry): number => {
    if (entry.transferSize && entry.transferSize > 0) return entry.transferSize;
    if (entry.encodedBodySize && entry.encodedBodySize > 0) return entry.encodedBodySize;
    if (entry.decodedBodySize && entry.decodedBodySize > 0) return entry.decodedBodySize;
    return 0;
};

export const logRuntimePayloadSample = (options?: PayloadSampleOptions) => {
    const sampleRate = options?.sampleRate ?? 0.2;
    const maxEntries = options?.maxEntries ?? 10;

    if (Math.random() > sampleRate) return;
    if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') return;

    const origin = typeof location !== 'undefined' ? location.origin : undefined;
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    if (!entries?.length) return;

    const sameOrigin = origin
        ? entries.filter((e) => e.name.startsWith(origin))
        : entries;

    const mapped = sameOrigin
        .map((entry) => ({
            name: entry.name.replace(origin ?? '', ''),
            initiatorType: entry.initiatorType,
            transfer: pickSize(entry as ResourceEntry),
            duration: Math.round(entry.duration),
        }))
        .filter((e) => e.transfer > 0)
        .sort((a, b) => b.transfer - a.transfer);

    if (!mapped.length) return;

    const top = mapped.slice(0, maxEntries);
    const totalTransfer = mapped.reduce((sum, e) => sum + e.transfer, 0);

    recordMetric('payload_sample', {
        totalTransfer,
        entryCount: mapped.length,
        top,
    });
};
