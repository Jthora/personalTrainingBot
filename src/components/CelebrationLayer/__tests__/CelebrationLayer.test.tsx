import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CelebrationLayer from '../CelebrationLayer';

// We need to mock the useCelebrations hook
const mockUseCelebrations = vi.fn();

vi.mock('../../../hooks/useCelebrations', () => ({
  useCelebrations: () => mockUseCelebrations(),
}));

// Mock badge catalog for BadgeToast
vi.mock('../../../data/badgeCatalog', () => ({
  getBadgeCatalog: () => [
    { id: 'streak_3', name: 'Warm Streak', description: 'Test', rarity: 'common', icon: '🔥' },
  ],
}));

describe('CelebrationLayer', () => {
  const mockDismiss = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockDismiss.mockClear();
    mockUseCelebrations.mockReturnValue({ current: null, dismiss: mockDismiss, pending: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when queue is empty', () => {
    const { container } = render(<CelebrationLayer />);
    expect(container.innerHTML).toBe('');
  });

  it('renders LevelUpModal for level-up event', () => {
    mockUseCelebrations.mockReturnValue({
      current: { kind: 'level-up', previousLevel: 1, newLevel: 2 },
      dismiss: mockDismiss,
      pending: 1,
    });
    render(<CelebrationLayer />);
    expect(screen.getByTestId('level-up-modal')).toBeTruthy();
    expect(screen.getByText(/Level 1 → Level 2/)).toBeTruthy();
  });

  it('renders BadgeToast for badge-unlock event', () => {
    mockUseCelebrations.mockReturnValue({
      current: { kind: 'badge-unlock', badgeId: 'streak_3' },
      dismiss: mockDismiss,
      pending: 1,
    });
    render(<CelebrationLayer />);
    expect(screen.getByTestId('badge-toast')).toBeTruthy();
    expect(screen.getByText('Warm Streak')).toBeTruthy();
  });

  it('renders XPTicker for xp-gain event', () => {
    mockUseCelebrations.mockReturnValue({
      current: { kind: 'xp-gain', amount: 100, newTotal: 500 },
      dismiss: mockDismiss,
      pending: 1,
    });
    render(<CelebrationLayer />);
    expect(screen.getByTestId('xp-ticker')).toBeTruthy();
    expect(screen.getByText('+100 XP')).toBeTruthy();
  });

  it('calls dismiss when LevelUpModal Continue is clicked', () => {
    mockUseCelebrations.mockReturnValue({
      current: { kind: 'level-up', previousLevel: 3, newLevel: 4 },
      dismiss: mockDismiss,
      pending: 1,
    });
    render(<CelebrationLayer />);
    fireEvent.click(screen.getByTestId('level-up-dismiss'));
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });
});
