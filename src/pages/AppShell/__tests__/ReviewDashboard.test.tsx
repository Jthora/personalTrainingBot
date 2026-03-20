import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewDashboard from '../ReviewDashboard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../cache/TrainingModuleCache', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getTrainingModule: vi.fn((id: string) => ({ name: `Module ${id}` })),
    })),
  },
}));

let mockDueCards: Array<{ cardId: string; moduleId: string }> = [];
let mockCount = 0;

vi.mock('../../../store/CardProgressStore', () => ({
  default: {
    getCardsDueForReview: vi.fn(() => mockDueCards),
    count: vi.fn(() => mockCount),
    forecastDue: vi.fn(() => [
      { day: 0, date: '2026-03-13', count: mockDueCards.length },
      { day: 1, date: '2026-03-14', count: 0 },
      { day: 2, date: '2026-03-15', count: 0 },
      { day: 3, date: '2026-03-16', count: 0 },
      { day: 4, date: '2026-03-17', count: 0 },
      { day: 5, date: '2026-03-18', count: 0 },
      { day: 6, date: '2026-03-19', count: 0 },
    ]),
    getOverallStats: vi.fn(() => ({
      total: mockCount,
      due: mockDueCards.length,
      learning: 0,
      mature: 0,
      newCards: mockCount,
      avgEase: 2.5,
      totalLapses: 0,
    })),
  },
}));

describe('ReviewDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDueCards = [];
    mockCount = 0;
  });

  it('renders title and subtitle', () => {
    render(<ReviewDashboard />);
    expect(screen.getByText('Review')).toBeTruthy();
    expect(screen.getByText(/Spaced repetition/)).toBeTruthy();
  });

  it('shows empty state when no cards are due', () => {
    render(<ReviewDashboard />);
    expect(screen.getByText(/No cards due/)).toBeTruthy();
  });

  it('shows empty state with tracking hint when no cards tracked', () => {
    mockCount = 0;
    render(<ReviewDashboard />);
    expect(screen.getByText(/Complete some training drills/)).toBeTruthy();
  });

  it('shows "check back later" when cards tracked but none due', () => {
    mockCount = 50;
    render(<ReviewDashboard />);
    expect(screen.getByText(/Check back later/)).toBeTruthy();
  });

  it('shows due count and start button when cards are due', () => {
    mockDueCards = [
      { cardId: 'c1', moduleId: 'mod-1' },
      { cardId: 'c2', moduleId: 'mod-1' },
      { cardId: 'c3', moduleId: 'mod-2' },
    ];
    mockCount = 100;
    render(<ReviewDashboard />);
    // Stats panel exists — due/tracked numbers may appear in multiple places
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('100').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Start Review (3 cards)')).toBeTruthy();
  });

  it('groups due cards by module', () => {
    mockDueCards = [
      { cardId: 'c1', moduleId: 'mod-1' },
      { cardId: 'c2', moduleId: 'mod-1' },
      { cardId: 'c3', moduleId: 'mod-2' },
    ];
    mockCount = 100;
    render(<ReviewDashboard />);
    expect(screen.getByText('Module mod-1')).toBeTruthy();
    expect(screen.getByText('Module mod-2')).toBeTruthy();
  });
});
