import { render } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecapToast from '../RecapToast';
import { RecapSummary } from '../../../types/RecapSummary';
import * as metrics from '../../../utils/metrics';

const recap: RecapSummary = {
    xp: 85,
    xpDelta: 85,
    minutes: 15,
    streakCount: 4,
    streakDelta: 1,
    streakStatus: 'active',
    level: 3,
    levelProgressPercent: 40,
    xpToNextLevel: 300,
    dailyGoalPercent: 75,
    weeklyGoalPercent: 55,
    badges: ['Consistency'],
};

const useMissionSchedule = vi.fn();
vi.mock('../../../hooks/useMissionSchedule', () => ({
    __esModule: true,
    default: () => useMissionSchedule(),
}));

vi.mock('../../../utils/metrics', () => ({
    recordMetric: vi.fn(),
}));

describe('RecapToast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useMissionSchedule.mockReset();
        vi.mocked(metrics.recordMetric).mockReset();
        useMissionSchedule.mockReturnValue({ recap, recapToastVisible: true, openRecap: vi.fn(), dismissRecapToast: vi.fn() });
    });

    it('shows XP and streak chips', () => {
        const { getByText } = render(<RecapToast />);
        expect(getByText('+85 XP')).toBeTruthy();
        expect(getByText(/Streak \+1/)).toBeTruthy();
    });

    it('fires CTA metric and opens recap', () => {
        const openRecap = vi.fn();
        useMissionSchedule.mockReturnValue({ recap, recapToastVisible: true, openRecap, dismissRecapToast: vi.fn() });
        const { getByText } = render(<RecapToast />);
        act(() => {
            getByText('View recap').click();
        });
        expect(openRecap).toHaveBeenCalled();
        expect(metrics.recordMetric).toHaveBeenCalledWith('recap_toast_cta', expect.any(Object));
    });

    it('auto dismisses after timeout', () => {
        const dismissRecapToast = vi.fn();
        useMissionSchedule.mockReturnValue({ recap, recapToastVisible: true, openRecap: vi.fn(), dismissRecapToast });
        render(<RecapToast />);
        act(() => {
            vi.runAllTimers();
        });
        expect(dismissRecapToast).toHaveBeenCalledWith('timeout');
    });

    it('dismisses when close is clicked', () => {
        const dismissRecapToast = vi.fn();
        useMissionSchedule.mockReturnValue({ recap, recapToastVisible: true, openRecap: vi.fn(), dismissRecapToast });
        const { getByLabelText } = render(<RecapToast />);
        act(() => {
            getByLabelText('Dismiss recap toast').click();
        });
        expect(dismissRecapToast).toHaveBeenCalledWith('dismiss');
    });
});
