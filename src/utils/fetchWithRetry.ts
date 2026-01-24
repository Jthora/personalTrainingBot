import { isFeatureEnabled, type FeatureFlagKey } from '../config/featureFlags';
import { recordMetric } from './metrics';

const PERF_FLAG: FeatureFlagKey = 'performanceInstrumentation';

export interface FetchRetryOptions {
    fetchOptions?: RequestInit;
    retries?: number; // number of retry attempts (not counting the initial try)
    retryDelayMs?: number;
    backoffFactor?: number;
    requestName?: string;
    timeoutMs?: number;
    shouldRetry?: (error: unknown, attempt: number, maxRetries: number) => boolean;
    onRetry?: (info: { attempt: number; error: unknown }) => void;
    onError?: (info: { attempt: number; error: unknown }) => void;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldLog = () => isFeatureEnabled(PERF_FLAG);

const defaultShouldRetry = (_error: unknown, attempt: number, maxRetries: number): boolean => {
    if (attempt >= maxRetries) return false;
    return true;
};

const withTimeout = async (url: string, options: RequestInit = {}, timeoutMs?: number): Promise<Response> => {
    if (!timeoutMs || timeoutMs <= 0) {
        return fetch(url, options);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
};

export const fetchWithRetry = async (url: string, options: FetchRetryOptions = {}): Promise<Response> => {
    const {
        fetchOptions,
        retries = 1,
        retryDelayMs = 200,
        backoffFactor = 2,
        requestName = url,
        timeoutMs,
        shouldRetry = defaultShouldRetry,
        onRetry,
        onError,
    } = options;

    const maxRetries = Math.max(0, retries);
    let attempt = 0;

    // attempt 0 is the initial try; retries applies to subsequent attempts
    while (true) {
        try {
            const response = await withTimeout(url, fetchOptions, timeoutMs);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response;
        } catch (error) {
            onError?.({ attempt, error });
            const canRetry = shouldRetry(error, attempt, maxRetries);
            if (canRetry) {
                if (shouldLog()) {
                    recordMetric('fetch_retry', { requestName, attempt: attempt + 1, error: error instanceof Error ? error.message : String(error) });
                }
                onRetry?.({ attempt: attempt + 1, error });
                const delay = retryDelayMs * Math.pow(backoffFactor, attempt);
                if (delay > 0) {
                    await sleep(delay);
                }
                attempt += 1;
                continue;
            }

            if (shouldLog()) {
                recordMetric('fetch_failure', { requestName, attempt, error: error instanceof Error ? error.message : String(error) });
            }
            throw error;
        }
    }
};
