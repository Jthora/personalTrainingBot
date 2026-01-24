import { describe, expect, it } from 'vitest';
import {
    exampleCacheEvent,
    exampleErrorEvent,
    examplePhaseEvent,
    exampleRetryEvent,
    exampleTimingEvent,
    PerfMarkName,
    PerfMeasureName,
    TelemetryEvent,
} from '../telemetrySchema';

describe('telemetrySchema examples', () => {
    it('exposes valid timing example', () => {
        expect(exampleTimingEvent.type).toBe('timing');
        const event = exampleTimingEvent satisfies TelemetryEvent;
        expect(event.value).toBeGreaterThan(0);
        const markStart: PerfMarkName | undefined = exampleTimingEvent.data?.startMark;
        const markEnd: PerfMarkName | undefined = exampleTimingEvent.data?.endMark;
        expect(markStart).toBeDefined();
        expect(markEnd).toBeDefined();
        const measure: PerfMeasureName = exampleTimingEvent.name;
        expect(measure).toContain('load:');
    });

    it('exposes valid cache example', () => {
        expect(exampleCacheEvent.type).toBe('cache');
        expect(exampleCacheEvent.value).toMatch(/hit|miss|stale|write|clear|invalid/);
        expect(exampleCacheEvent.name.startsWith('cache:')).toBe(true);
    });

    it('exposes valid error example', () => {
        expect(exampleErrorEvent.type).toBe('error');
        expect(exampleErrorEvent.data?.phase).toBeDefined();
    });

    it('exposes valid retry example', () => {
        expect(exampleRetryEvent.type).toBe('retry');
        expect(exampleRetryEvent.value).toBeGreaterThanOrEqual(0);
    });

    it('exposes phase example', () => {
        expect(examplePhaseEvent.type).toBe('phase');
        expect(examplePhaseEvent.name).toContain('stage:');
    });
});
