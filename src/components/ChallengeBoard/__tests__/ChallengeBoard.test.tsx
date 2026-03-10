import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChallengeBoard from '../ChallengeBoard';
import type { ChallengeInstance } from '../../../types/Challenge';

vi.mock('../../../store/UserProgressStore', () => ({
  default: {
    get: vi.fn(() => ({ challenges: [] })),
    claimChallenge: vi.fn(() => ({ claimed: true, xpAwarded: 50 })),
  },
}));

const makeChallenges = (overrides: Partial<ChallengeInstance>[] = []): ChallengeInstance[] => [
  {
    id: 'daily_minutes_20',
    title: 'Daily Recon',
    description: 'Train 20 minutes today',
    rewardXp: 50,
    timeframe: 'daily',
    startsAt: '2026-03-09',
    endsAt: '2026-03-09',
    progress: 10,
    target: 20,
    unit: 'minutes',
    completed: false,
    claimed: false,
    ...overrides[0],
  },
  {
    id: 'weekly_five_missions',
    title: 'Five-Op Sprint',
    description: 'Complete 5 missions this week',
    rewardXp: 140,
    timeframe: 'weekly',
    startsAt: '2026-03-03',
    endsAt: '2026-03-09',
    progress: 5,
    target: 5,
    unit: 'missions',
    completed: true,
    claimed: false,
    ...overrides[1],
  },
];

beforeEach(() => vi.clearAllMocks());

describe('ChallengeBoard', () => {
  it('renders empty state when no challenges', () => {
    render(<ChallengeBoard challenges={[]} />);
    expect(screen.getByText(/No active challenges/)).toBeTruthy();
  });

  it('renders challenge cards', () => {
    render(<ChallengeBoard challenges={makeChallenges()} />);
    expect(screen.getByText('Daily Recon')).toBeTruthy();
    expect(screen.getByText('Five-Op Sprint')).toBeTruthy();
  });

  it('shows progress fractions', () => {
    render(<ChallengeBoard challenges={makeChallenges()} />);
    expect(screen.getByText('10 / 20 minutes')).toBeTruthy();
    expect(screen.getByText('5 / 5 missions')).toBeTruthy();
  });

  it('shows XP reward', () => {
    render(<ChallengeBoard challenges={makeChallenges()} />);
    expect(screen.getByText('+50 XP')).toBeTruthy();
    expect(screen.getByText('+140 XP')).toBeTruthy();
  });

  it('shows Claim Reward button for completed, unclaimed challenges', () => {
    render(<ChallengeBoard challenges={makeChallenges()} />);
    const btns = screen.getAllByText('Claim Reward');
    expect(btns).toHaveLength(1);
  });

  it('clicking Claim Reward calls store.claimChallenge', async () => {
    const UserProgressStore = (await import('../../../store/UserProgressStore')).default;
    render(<ChallengeBoard challenges={makeChallenges()} />);
    fireEvent.click(screen.getByText('Claim Reward'));
    expect(UserProgressStore.claimChallenge).toHaveBeenCalledWith('weekly_five_missions');
  });

  it('shows Claimed indicator for already claimed challenges', () => {
    const c = makeChallenges([{}, { claimed: true }]);
    render(<ChallengeBoard challenges={c} />);
    expect(screen.getByText('Claimed ✓')).toBeTruthy();
    expect(screen.queryByText('Claim Reward')).toBeNull();
  });

  it('hides challenges marked as hidden', () => {
    const c = makeChallenges([{ hidden: true }, {}]);
    render(<ChallengeBoard challenges={c} />);
    expect(screen.queryByText('Daily Recon')).toBeNull();
    expect(screen.getByText('Five-Op Sprint')).toBeTruthy();
  });

  it('shows timeframe badges', () => {
    render(<ChallengeBoard challenges={makeChallenges()} />);
    expect(screen.getByText('daily')).toBeTruthy();
    expect(screen.getByText('weekly')).toBeTruthy();
  });

  it('has section aria-label', () => {
    render(<ChallengeBoard challenges={makeChallenges()} />);
    expect(screen.getByLabelText('Challenges')).toBeTruthy();
  });
});
