import { render } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PreviewDrawer from '../PreviewDrawer';
import { Workout } from '../../../types/WorkoutCategory';
import { WorkoutSet, WorkoutBlock, WorkoutSchedule } from '../../../types/WorkoutSchedule';
import { DifficultySetting } from '../../../types/DifficultySetting';

const recordMetric = vi.fn();
vi.mock('../../../utils/metrics', () => ({
    recordMetric: (...args: unknown[]) => recordMetric(...args),
}));

const setCurrentSchedule = vi.fn();
const useWorkoutScheduleMock = vi.fn();

const workoutA = new Workout('Heavy A', 'desc', '10', 'med', [6, 8]);
const workoutB = new Workout('Mobility B', 'desc', '12', 'low', [2, 4]);
const set = new WorkoutSet([[workoutA, false], [workoutB, false]]);
const block = new WorkoutBlock('Block X', 'desc', 10, 'intervals');
const schedule = new WorkoutSchedule('today', [set, block], DifficultySetting.fromLevel(5));

vi.mock('../../../hooks/useWorkoutSchedule', () => ({
    __esModule: true,
    default: (...args: unknown[]) => useWorkoutScheduleMock(...args),
}));

const workoutsPool = [workoutA, workoutB];
vi.mock('../../../cache/WorkoutCategoryCache', () => ({
    __esModule: true,
    default: {
        getInstance: () => ({
            getAllWorkouts: () => workoutsPool,
        }),
    },
}));

describe('PreviewDrawer', () => {
    beforeEach(() => {
        recordMetric.mockReset();
        setCurrentSchedule.mockReset();
        useWorkoutScheduleMock.mockReset();
        useWorkoutScheduleMock.mockReturnValue({
            schedule,
            setCurrentSchedule,
            scheduleVersion: 1,
            isLoading: false,
        });
    });

    it('focus-traps and loops Tab back to start', () => {
        const onClose = vi.fn();
    const { getByLabelText, getAllByLabelText } = render(<PreviewDrawer isOpen onClose={onClose} />);

        const closeBtn = getByLabelText('Close preview drawer');
        expect(document.activeElement).toBe(closeBtn);

        const removeButtons = getAllByLabelText('Remove item');
        const lastFocusable = removeButtons[removeButtons.length - 1];
        act(() => {
            lastFocusable.focus();
        });
        expect(document.activeElement).toBe(lastFocusable);

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        });
        expect(document.activeElement).toBe(closeBtn);
    });

    it('records telemetry for reorder, replace, and close', () => {
        const onClose = vi.fn();
        const { getAllByLabelText, getByText } = render(<PreviewDrawer isOpen onClose={onClose} />);

        expect(recordMetric).toHaveBeenCalledWith('preview_drawer_open', expect.any(Object));

        const moveDown = getAllByLabelText(/Move item down/i)[0];
        act(() => {
            moveDown.click();
        });

        const replaceBtn = getByText(/Replace with similar/i);
        act(() => {
            replaceBtn.click();
        });

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        });

        const eventNames = recordMetric.mock.calls.map(call => call[0]);
        expect(eventNames).toEqual(expect.arrayContaining([
            'preview_drawer_reorder',
            'preview_drawer_replace',
            'preview_drawer_close',
        ]));
        expect(onClose).toHaveBeenCalled();
    });

    it('virtualizes long lists to reduce DOM nodes', () => {
        const onClose = vi.fn();
        const manyBlocks = Array.from({ length: 40 }).map((_, idx) => new WorkoutBlock(`Block ${idx}`, 'desc', 10 + idx, 'intervals'));
        const longSchedule = new WorkoutSchedule('bulk', manyBlocks, DifficultySetting.fromLevel(5));
        useWorkoutScheduleMock.mockReturnValue({
            schedule: longSchedule,
            setCurrentSchedule,
            scheduleVersion: 1,
            isLoading: false,
        });

        const { getAllByRole, queryByText, getByText } = render(<PreviewDrawer isOpen onClose={onClose} />);

        const renderedItems = getAllByRole('listitem');
        expect(renderedItems.length).toBeGreaterThan(0);
        expect(renderedItems.length).toBeLessThan(longSchedule.scheduleItems.length);
        expect(queryByText(/Block 30/)).toBeNull();
        expect(getByText(/Block 0/)).toBeTruthy();
    });
});
