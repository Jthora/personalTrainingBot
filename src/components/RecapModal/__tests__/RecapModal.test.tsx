import { render, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecapModal from '../RecapModal';
import { RecapSummary } from '../../../types/RecapSummary';

const recap: RecapSummary = {
    xp: 85,
    minutes: 15,
    streakCount: 4,
    streakStatus: 'active',
    level: 3,
    levelProgressPercent: 40,
    xpToNextLevel: 300,
    dailyGoalPercent: 75,
    weeklyGoalPercent: 55,
    badges: ['Consistency', 'Mobility'],
};

const useWorkoutSchedule = vi.fn();
vi.mock('../../../hooks/useWorkoutSchedule', () => ({
    __esModule: true,
    default: () => useWorkoutSchedule(),
}));

vi.mock('../../../utils/metrics', () => ({
    recordMetric: vi.fn(),
}));

describe('RecapModal', () => {
    beforeEach(() => {
        useWorkoutSchedule.mockReset();
        useWorkoutSchedule.mockReturnValue({ recap, recapOpen: true, dismissRecap: vi.fn() });
    });

    it('renders recap summary and CTA', () => {
        const { getByText, getByLabelText } = render(<RecapModal />);
        expect(getByText(/Great work/i)).toBeTruthy();
        expect(getByText('+85 XP')).toBeTruthy();
        expect(getByText('Back to planner')).toBeTruthy();
        expect(getByLabelText('Close recap')).toBeTruthy();
    });

    it('invokes dismiss on CTA', () => {
        const dismissRecap = vi.fn();
        useWorkoutSchedule.mockReturnValue({ recap, recapOpen: true, dismissRecap });
        const { getByText } = render(<RecapModal />);
        fireEvent.click(getByText('Back to planner'));
        expect(dismissRecap).toHaveBeenCalled();
    });

    it('copies share text when available', async () => {
        const dismissRecap = vi.fn();
        const recapWithShare: RecapSummary = { ...recap, shareAvailable: true, shareText: 'Wrapped today: +85 XP' };
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });
    useWorkoutSchedule.mockReturnValue({ recap: recapWithShare, recapOpen: true, dismissRecap });
        const { getByText, getByLabelText } = render(<RecapModal />);
        expect(getByLabelText('Shareable recap text').textContent).toContain('Wrapped today: +85 XP');
        await act(async () => {
            fireEvent.click(getByText('Copy recap'));
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        expect(writeText).toHaveBeenCalledWith('Wrapped today: +85 XP');
    });

    it('suppresses share when offline', () => {
        const recapOffline: RecapSummary = { ...recap, shareAvailable: false, isOffline: true };
        useWorkoutSchedule.mockReturnValue({ recap: recapOffline, recapOpen: true, dismissRecap: vi.fn() });
        const { queryByText, getByText } = render(<RecapModal />);
        expect(queryByText('Copy recap')).toBeNull();
        expect(getByText(/Offline mode — sharing is disabled/)).toBeTruthy();
    });
});
