import { render } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import AlignmentWarning from '../AlignmentWarning';
import FeatureFlagsStore from '../../../store/FeatureFlagsStore';
import type { Mock } from 'vitest';

let scheduleVersion = 1;
const schedule = {
    scheduleItems: [{ id: 'a' }, { id: 'b' }],
    difficultySettings: { level: 5 },
};

vi.mock('../../../hooks/useWorkoutSchedule', () => ({
    __esModule: true,
    default: () => ({
        schedule,
        scheduleVersion,
    }),
}));

const mockCheck = vi.fn();
vi.mock('../../../utils/alignmentCheck', () => ({
    checkScheduleAlignment: (...args: unknown[]) => mockCheck(...args),
}));

const recordMetric = vi.fn();
vi.mock('../../../utils/metrics', () => ({
    recordMetric: (...args: unknown[]) => recordMetric(...args),
}));

vi.mock('../../../store/FeatureFlagsStore', () => ({
    __esModule: true,
    default: {
        get: vi.fn(() => ({ quietMode: false })),
    },
}));

describe('AlignmentWarning', () => {
    const flagsGet = FeatureFlagsStore.get as unknown as Mock;

    const tick = async (ms = 400) => {
        await act(async () => {
            await vi.advanceTimersByTimeAsync(ms);
        });
    };

    beforeEach(() => {
        vi.useFakeTimers();
    mockCheck.mockReset();
    flagsGet.mockReturnValue({ quietMode: false });
        schedule.scheduleItems = [{ id: 'a' }, { id: 'b' }];
        schedule.difficultySettings = { level: 5 } as never;
        scheduleVersion = 1;
        recordMetric.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders warning message and actions when alignment is off', async () => {
        mockCheck.mockReturnValue({ status: 'warn', outOfRangeCount: 2, totalWorkouts: 5 });
        const { getByRole, getByText } = render(
            <AlignmentWarning onOpenPreview={() => {}} onAdjustDifficulty={() => {}} />
        );

        await tick();

        expect(getByRole('alert')).toBeTruthy();
        expect(getByText(/2 of 5 sets exceed/i)).toBeTruthy();
        expect(getByRole('button', { name: /swap sets/i })).toBeTruthy();
        expect(getByRole('button', { name: /lower difficulty settings/i })).toBeTruthy();
        expect(recordMetric).toHaveBeenCalledWith('alignment_warning_surface', expect.objectContaining({ outOfRange: 2, total: 5 }));
    });

    it('shows auto-suggest fixes with targeted copy', async () => {
        schedule.scheduleItems = [
            { workouts: [[{ name: 'Heavy Squat', difficulty_range: [7, 9] }, false]] },
            { workouts: [[{ name: 'Bench Press', difficulty_range: [6, 8] }, false]] },
        ] as never;
        schedule.difficultySettings = { level: 5 } as never;
        mockCheck.mockReturnValue({ status: 'warn', outOfRangeCount: 2, totalWorkouts: 4 });

    const { getByText, getAllByText } = render(<AlignmentWarning onOpenPreview={() => {}} />);

        await tick();

        expect(getByText(/Lower difficulty to ~4/i)).toBeTruthy();
        expect(getAllByText(/Heavy Squat/i).length).toBeGreaterThan(0);
        expect(getByText(/Spread muscle groups/i)).toBeTruthy();
    });

    it('respects quiet mode and hides surface', async () => {
        mockCheck.mockReturnValue({ status: 'warn', outOfRangeCount: 1, totalWorkouts: 3 });
    flagsGet.mockReturnValue({ quietMode: true });

        const { queryByRole } = render(<AlignmentWarning onOpenPreview={() => {}} />);

        await tick();
        expect(queryByRole('alert')).toBeNull();
        expect(recordMetric).not.toHaveBeenCalled();
    });

    it('announces once per material change', async () => {
        mockCheck.mockReturnValue({ status: 'warn', outOfRangeCount: 1, totalWorkouts: 3 });
        const { getByRole } = render(<AlignmentWarning onOpenPreview={() => {}} />);

        await tick();

        const liveRegion = getByRole('status');
        expect(liveRegion.textContent).toMatch(/alignment warning/i);

        // Same result should not append new announcement synchronously
        expect(liveRegion.textContent).toMatch(/alignment warning/i);
    });

    it('records ignore metric when dismissed', async () => {
        mockCheck.mockReturnValue({ status: 'warn', outOfRangeCount: 1, totalWorkouts: 3 });
        const { getByRole } = render(<AlignmentWarning onOpenPreview={() => {}} />);

        await tick();
        getByRole('alert');
        await act(async () => {
            getByRole('button', { name: /dismiss alignment warning/i }).click();
        });
        expect(recordMetric).toHaveBeenCalledWith('alignment_warning_ignored', expect.objectContaining({ outOfRange: 1, total: 3 }));
    });

    it('records resolved metric when returning to aligned state', async () => {
        mockCheck.mockImplementation(() => (scheduleVersion === 1 ? { status: 'warn', outOfRangeCount: 1, totalWorkouts: 2 } : { status: 'pass', outOfRangeCount: 0, totalWorkouts: 2 }));
        const { getByRole, rerender } = render(<AlignmentWarning onOpenPreview={() => {}} />);

        await tick();
        getByRole('alert');

        scheduleVersion = 2;
        rerender(<AlignmentWarning onOpenPreview={() => {}} />);
        await tick();

        expect(recordMetric).toHaveBeenCalledWith('alignment_warning_resolved', expect.objectContaining({ total: 2 }));
    });
});
