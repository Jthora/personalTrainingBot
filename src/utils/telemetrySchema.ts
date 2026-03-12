export type TelemetryType = 'timing' | 'cache' | 'error' | 'retry' | 'phase';

export type PerfMarkName =
    | 'load:boot_start'
    | 'load:shell_painted'
    | 'load:critical_ready'
    | 'load:enrichment_done'
    | 'load:idle_warm_done'
    | `cache:${string}:read_start`
    | `cache:${string}:read_end`
    | `cache:${string}:write_start`
    | `cache:${string}:write_end`
    | `custom:${string}`;

export type PerfMeasureName =
    | 'load:boot_to_shell'
    | 'load:shell_to_critical'
    | 'load:critical_to_enrichment'
    | 'load:enrichment_to_idle'
    | `cache:${string}:read_duration`
    | `cache:${string}:write_duration`
    | `custom:${string}`;

export interface TelemetryEventBase {
    type: TelemetryType;
    name: string;
    value?: number | string;
    unit?: 'ms' | 'count' | 'status' | string;
    data?: Record<string, unknown>;
    ts?: string;
    device?: string;
    net?: string;
    flags?: Record<string, boolean>;
    sampling?: number;
}

export interface TimingEvent extends TelemetryEventBase {
    type: 'timing';
    name: PerfMeasureName;
    value: number;
    unit: 'ms';
    data?: { startMark?: PerfMarkName; endMark?: PerfMarkName; route?: string } & Record<string, unknown>;
}

export interface CacheEvent extends TelemetryEventBase {
    type: 'cache';
    name: `cache:${string}`;
    value: 'hit' | 'miss' | 'stale' | 'write' | 'clear' | 'invalid';
    unit?: 'status';
    data?: {
        ageMs?: number | null;
        ttlMs?: number | null;
        sizeBytes?: number;
        source?: 'localStorage' | 'memory' | 'indexeddb' | string;
    } & Record<string, unknown>;
}

export interface ErrorEvent extends TelemetryEventBase {
    type: 'error';
    name: string;
    value?: string;
    unit?: 'status';
    data?: {
        dataset?: string;
        phase?: string;
        attempt?: number;
        error?: string;
    } & Record<string, unknown>;
}

export interface RetryEvent extends TelemetryEventBase {
    type: 'retry';
    name: string;
    value?: number; // attempt index
    unit?: 'count';
    data?: {
        dataset?: string;
        requestName?: string;
        attempt?: number;
        error?: string;
        backoffMs?: number;
    } & Record<string, unknown>;
}

export interface PhaseEvent extends TelemetryEventBase {
    type: 'phase';
    name: 'stage:instrumentation' | 'stage:pipeline' | 'stage:persistence' | 'stage:payload' | 'stage:rollout' | string;
    value?: 'enter' | 'exit';
    unit?: 'status';
    data?: Record<string, unknown>;
}

export type TelemetryEvent = TimingEvent | CacheEvent | ErrorEvent | RetryEvent | PhaseEvent;

export const exampleTimingEvent: TimingEvent = {
    type: 'timing',
    name: 'load:boot_to_shell',
    value: 1234,
    unit: 'ms',
    data: { startMark: 'load:boot_start', endMark: 'load:shell_painted', route: '/' },
    ts: new Date().toISOString(),
    device: 'mid-android',
    net: '4G',
    flags: { performanceInstrumentation: true },
};

export const exampleCacheEvent: CacheEvent = {
    type: 'cache',
    name: 'cache:mission_schedule',
    value: 'hit',
    unit: 'status',
    data: { ageMs: 120000, ttlMs: 600000, source: 'localStorage', sizeBytes: 2048 },
    ts: new Date().toISOString(),
    net: '4G',
};

export const exampleErrorEvent: ErrorEvent = {
    type: 'error',
    name: 'schedule_load_failure',
    value: 'network_error',
    unit: 'status',
    data: { dataset: 'mission_schedule', phase: 'boot', attempt: 1, error: 'HTTP 500' },
};

export const exampleRetryEvent: RetryEvent = {
    type: 'retry',
    name: 'mission_schedule_fetch',
    value: 1,
    unit: 'count',
    data: { requestName: 'schedule', attempt: 1, backoffMs: 200, error: 'network' },
};

export const examplePhaseEvent: PhaseEvent = {
    type: 'phase',
    name: 'stage:instrumentation',
    value: 'enter',
    unit: 'status',
    data: { buildId: 'abc123' },
};
