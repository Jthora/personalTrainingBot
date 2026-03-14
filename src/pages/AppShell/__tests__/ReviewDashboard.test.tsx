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
      getModule: vi.fn((id: string) => ({ name: `Module ${id}` })),
    })),
  },
}));

let mockDueCards: Array<{ cardId: string; moduleId: string }> = [];
let mockCount = 0;

vi.mock('../../../store/CardProgressStore', () => ({
  default: {
    getCardsDueForReview: vi.fn(() => mockDueCards),
    count: vi.fn(() => mockCount),
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
    expect(screen.getByText('3')).toBeTruthy(); // Due Now stat
    expect(screen.getByText('100')).toBeTruthy(); // Tracked stat
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
