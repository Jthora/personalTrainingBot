import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsPanel from '../StatsPanel';

vi.mock('../../../store/UserProgressStore', () => ({
  default: {
    get: vi.fn(() => ({ level: 5, xp: 200 })),
    isStorageAvailable: vi.fn(() => true),
    isDisabled: vi.fn(() => false),
    getViewModel: vi.fn(() => ({
      xpToNextLevel: 300,
      dailyGoalPercent: 66.7,
      weeklyGoalPercent: 42.3,
      streakStatus: 'active',
    })),
  },
}));

import UserProgressStore from '../../../store/UserProgressStore';

describe('StatsPanel', () => {
  it('renders level, XP, goals, streak from store', () => {
    render(<StatsPanel />);
    expect(screen.getByText('Lv 5')).toBeTruthy();
    expect(screen.getByText('300 XP')).toBeTruthy();
    expect(screen.getByText('67%')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
    expect(screen.getByText('On')).toBeTruthy();
  });

  it('returns null when disabled', () => {
    (UserProgressStore.isDisabled as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);
    const { container } = render(<StatsPanel />);
    expect(container.innerHTML).toBe('');
  });
});
