import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';
import { recordMetric } from '../../utils/metrics';
import { useSelectionSummary } from '../useSelectionSummary';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';

vi.mock('../../store/WorkoutScheduleStore', () => {
    const getSelectionCounts = vi.fn(() => ({ categories: 1, workouts: 2 }));
    let listener: (() => void) | null = null;
    const subscribeToSelectionChanges = vi.fn((cb: () => void) => {
        listener = cb;
        return () => { listener = null; };
    });
    const trigger = () => listener?.();
    return {
        __esModule: true,
        default: {
            getSelectionCounts,
            subscribeToSelectionChanges,
            __trigger: trigger,
        },
    };
});

vi.mock('../../utils/metrics', () => ({
    recordMetric: vi.fn(),
}));

// Access trigger helper from mock
const getTrigger = () => (WorkoutScheduleStore as any).__trigger as () => void;

describe('useSelectionSummary', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    const Harness: React.FC = () => {
        const summary = useSelectionSummary();
        return <div>{summary}</div>;
    };

    it('records debounce miss on first change and updates summary', () => {
        render(<Harness />);
        const trigger = getTrigger();

        act(() => {
            trigger();
        });
        act(() => {
            vi.runAllTimers();
        });

        expect(recordMetric).toHaveBeenCalledWith('selection_summary_debounce_miss');
        expect(document.body.textContent).toContain('1 cat · 2 wkts');
    });

    it('records debounce hit when successive changes occur quickly', () => {
        render(<Harness />);
        const trigger = getTrigger();

        act(() => {
            trigger();
            trigger();
        });
        act(() => {
            vi.runAllTimers();
        });

        expect(recordMetric).toHaveBeenCalledWith('selection_summary_debounce_miss');
        expect(recordMetric).toHaveBeenCalledWith('selection_summary_debounce_hit');
    });
});
