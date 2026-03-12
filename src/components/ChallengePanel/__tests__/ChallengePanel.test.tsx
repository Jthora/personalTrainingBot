import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChallengePanel from '../ChallengePanel';
import type { ChallengeInstance } from '../../../types/Challenge';

const makeCh = (overrides: Partial<ChallengeInstance> = {}): ChallengeInstance => ({
  id: 'ch-1',
  title: 'Test Challenge',
  description: 'Do stuff',
  rewardXp: 50,
  timeframe: 'daily',
  startsAt: new Date().toISOString(),
  endsAt: new Date().toISOString(),
  progress: 3,
  target: 10,
  unit: 'missions',
  completed: false,
  claimed: false,
  ...overrides,
});

vi.mock('../../../store/UserProgressStore', () => ({
  default: {
    get: vi.fn(() => ({ challenges: [] as ChallengeInstance[] })),
    claimChallenge: vi.fn(() => ({ claimed: true, xpAwarded: 50 })),
  },
}));

import UserProgressStore from '../../../store/UserProgressStore';

describe('ChallengePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no challenges', () => {
    (UserProgressStore.get as ReturnType<typeof vi.fn>).mockReturnValue({ challenges: [] });
    render(<ChallengePanel />);
    expect(screen.getByText(/No active challenges/)).toBeTruthy();
  });

  it('renders challenge cards with progress bar at correct width', () => {
    (UserProgressStore.get as ReturnType<typeof vi.fn>).mockReturnValue({
      challenges: [makeCh({ progress: 3, target: 10 })],
    });
    const { container } = render(<ChallengePanel />);
    expect(screen.getByText('Test Challenge')).toBeTruthy();
    expect(screen.getByText('3/10 missions')).toBeTruthy();
    // progress bar width = round(3/10*100) = 30%
    const bar = container.querySelector('[style*="width"]') as HTMLElement;
    expect(bar?.style.width).toBe('30%');
  });

  it('shows claim button for completed unclaimed challenge', () => {
    (UserProgressStore.get as ReturnType<typeof vi.fn>).mockReturnValue({
      challenges: [makeCh({ completed: true, claimed: false, rewardXp: 75 })],
    });
    render(<ChallengePanel />);
    expect(screen.getByRole('button', { name: /Claim \+75 XP/ })).toBeTruthy();
  });

  it('claim button calls UserProgressStore.claimChallenge', () => {
    (UserProgressStore.get as ReturnType<typeof vi.fn>).mockReturnValue({
      challenges: [makeCh({ id: 'ch-42', completed: true, claimed: false })],
    });
    render(<ChallengePanel />);
    fireEvent.click(screen.getByRole('button', { name: /Claim/ }));
    expect(UserProgressStore.claimChallenge).toHaveBeenCalledWith('ch-42');
  });

  it('shows "Claimed ✓" for claimed challenge', () => {
    (UserProgressStore.get as ReturnType<typeof vi.fn>).mockReturnValue({
      challenges: [makeCh({ completed: true, claimed: true })],
    });
    render(<ChallengePanel />);
    expect(screen.getByText('Claimed ✓')).toBeTruthy();
  });
});
