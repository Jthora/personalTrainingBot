import { describe, expect, it, vi } from 'vitest';
import { fetchWithRetry } from '../fetchWithRetry';
import * as featureFlags from '../../config/featureFlags';
import * as metrics from '../metrics';

describe('fetchWithRetry', () => {
    const enablePerf = (enabled: boolean) => vi.spyOn(featureFlags, 'isFeatureEnabled').mockReturnValue(enabled);

    it('retries once and succeeds, logging fetch_retry when flag enabled', async () => {
        enablePerf(true);
        const metricSpy = vi.spyOn(metrics, 'recordMetric');

        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce(new Response('ok', { status: 200 }));

        vi.stubGlobal('fetch', fetchMock);

        const response = await fetchWithRetry('https://example.com/data', { retries: 1, retryDelayMs: 1, requestName: 'example' });
        expect(response.ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(metricSpy).toHaveBeenCalledWith('fetch_retry', expect.objectContaining({ requestName: 'example', attempt: 1 }));
        expect(metricSpy).not.toHaveBeenCalledWith('fetch_failure', expect.anything());
    });

    it('records fetch_failure after exhausting retries', async () => {
        enablePerf(true);
        const metricSpy = vi.spyOn(metrics, 'recordMetric');

        const fetchMock = vi.fn().mockRejectedValue(new Error('boom'));
        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchWithRetry('https://example.com/fail', { retries: 1, retryDelayMs: 1, requestName: 'fail' })).rejects.toThrow('boom');
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(metricSpy).toHaveBeenCalledWith('fetch_retry', expect.objectContaining({ requestName: 'fail', attempt: 1 }));
        expect(metricSpy).toHaveBeenCalledWith('fetch_failure', expect.objectContaining({ requestName: 'fail' }));
    });

    it('respects feature flag and does not log metrics when disabled', async () => {
        enablePerf(false);
        const metricSpy = vi.spyOn(metrics, 'recordMetric');

        const fetchMock = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);

        const response = await fetchWithRetry('https://example.com/no-metrics');
        expect(response.ok).toBe(true);
        expect(metricSpy).not.toHaveBeenCalled();
    });
});
