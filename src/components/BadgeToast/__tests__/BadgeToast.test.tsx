import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import BadgeToast from '../BadgeToast';

vi.mock('../../../data/badgeCatalog', () => ({
  getBadgeCatalog: () => [
    { id: 'streak_3', name: 'Warm Streak', description: 'Test', rarity: 'common', icon: '🔥' },
    { id: 'completion_10', name: 'Field Initiate', description: 'Test', rarity: 'common', icon: '✅' },
  ],
}));

describe('BadgeToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders badge name from catalog', () => {
    render(<BadgeToast badgeId="streak_3" onDismiss={vi.fn()} />);
    expect(screen.getByText('Warm Streak')).toBeTruthy();
    expect(screen.getByText('Badge Unlocked')).toBeTruthy();
  });

  it('renders badge icon from catalog', () => {
    render(<BadgeToast badgeId="streak_3" onDismiss={vi.fn()} />);
    expect(screen.getByText('🔥')).toBeTruthy();
  });

  it('falls back to badgeId when badge not in catalog', () => {
    render(<BadgeToast badgeId="unknown_badge" onDismiss={vi.fn()} />);
    expect(screen.getByText('unknown_badge')).toBeTruthy();
    expect(screen.getByText('🏅')).toBeTruthy();
  });

  it('has status role with correct label', () => {
    render(<BadgeToast badgeId="streak_3" onDismiss={vi.fn()} />);
    expect(screen.getByRole('status', { name: /badge unlocked/i })).toBeTruthy();
  });

  it('auto-dismisses after default 3000ms', () => {
    const onDismiss = vi.fn();
    render(<BadgeToast badgeId="streak_3" onDismiss={onDismiss} />);

    act(() => { vi.advanceTimersByTime(2999); });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('respects custom autoDismissMs', () => {
    const onDismiss = vi.fn();
    render(<BadgeToast badgeId="streak_3" onDismiss={onDismiss} autoDismissMs={500} />);

    act(() => { vi.advanceTimersByTime(500); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
