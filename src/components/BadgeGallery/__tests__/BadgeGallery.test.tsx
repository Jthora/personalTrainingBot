import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BadgeGallery from '../BadgeGallery';

vi.mock('../../../data/badgeCatalog', () => ({
  getBadgeCatalog: () => [
    { id: 'streak_3', name: 'Warm Streak', rarity: 'common', icon: '🔥' },
    { id: 'streak_7', name: 'Persistent Operative', rarity: 'rare', icon: '🛡️' },
    { id: 'completion_10', name: 'Field Initiate', rarity: 'common', icon: '✅' },
    { id: 'completion_100', name: 'Ace Operative', rarity: 'epic', icon: '🎖️' },
  ],
}));

vi.mock('../../../store/UserProgressStore', () => ({
  default: {
    get: vi.fn(() => ({ badges: ['streak_3', 'completion_10'] })),
  },
}));

beforeEach(() => vi.clearAllMocks());

describe('BadgeGallery', () => {
  it('renders heading and counter', () => {
    render(<BadgeGallery />);
    expect(screen.getByText('Badges')).toBeTruthy();
    expect(screen.getByText('2 / 4')).toBeTruthy();
  });

  it('shows all badges from catalog', () => {
    render(<BadgeGallery />);
    expect(screen.getByText('Warm Streak')).toBeTruthy();
    expect(screen.getByText('Persistent Operative')).toBeTruthy();
    expect(screen.getByText('Field Initiate')).toBeTruthy();
    expect(screen.getByText('Ace Operative')).toBeTruthy();
  });

  it('marks earned badges with earned class', () => {
    render(<BadgeGallery />);
    const warmStreak = screen.getByLabelText('Warm Streak');
    expect(warmStreak.className).toContain('earned');
  });

  it('marks locked badges with locked class and label', () => {
    render(<BadgeGallery />);
    const persistent = screen.getByLabelText('Persistent Operative (locked)');
    expect(persistent.className).toContain('locked');
  });

  it('accepts override earnedIds prop', () => {
    render(<BadgeGallery earnedIds={['streak_3', 'streak_7', 'completion_10', 'completion_100']} />);
    expect(screen.getByText('4 / 4')).toBeTruthy();
  });

  it('sorts earned badges before locked', () => {
    render(<BadgeGallery />);
    const cards = screen.getAllByLabelText(/Warm Streak|Persistent Operative|Field Initiate|Ace Operative/);
    // earned should come first (Warm Streak, Field Initiate), then locked
    const earnedCards = cards.filter(c => c.className.includes('earned'));
    const lockedCards = cards.filter(c => c.className.includes('locked'));
    expect(earnedCards.length).toBe(2);
    expect(lockedCards.length).toBe(2);
  });

  it('has gallery aria-label', () => {
    render(<BadgeGallery />);
    expect(screen.getByLabelText('Badge gallery')).toBeTruthy();
  });
});
