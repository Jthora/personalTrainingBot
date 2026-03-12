import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/mission/brief' }),
}));

vi.mock('../../../hooks/useMissionSchedule', () => ({
  default: () => ({
    schedule: {
      scheduleItems: [{ drills: [] }, { drills: [] }],
      difficultySettings: { level: 5 },
    },
  }),
}));

vi.mock('../../../hooks/useSelectionSummary', () => ({
  default: () => '3 categories, 12 drills',
}));

vi.mock('../../../utils/alignmentCheck', () => ({
  checkScheduleAlignment: () => ({ status: 'pass' }),
}));

vi.mock('../../../store/UserProgressStore', () => ({
  default: {
    getViewModel: () => ({ streakStatus: 'active' }),
    get: () => ({ level: 7 }),
  },
}));

vi.mock('../navConfig', () => ({
  resolveHeaderNavItems: () => [
    { label: 'Brief', path: '/mission/brief', navigatePath: '/mission/brief', activePaths: ['/mission/brief'] },
    { label: 'Plan', path: '/mission/plan', navigatePath: '/mission/plan', activePaths: ['/mission/plan'] },
  ],
}));

// Stub HeaderDrawer — it requires complex portal/overlay mocking
vi.mock('../HeaderDrawer', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="drawer" role="dialog"><button onClick={onClose}>Close</button></div> : null,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo and title', () => {
    render(<Header />);
    expect(screen.getByText('Archangel Knights Training Console')).toBeTruthy();
    expect(screen.getByAltText('Wing Commander Logo')).toBeTruthy();
  });

  it('renders skip link', () => {
    render(<Header />);
    expect(screen.getByText('Skip to main content')).toBeTruthy();
  });

  it('displays chips with schedule stats', () => {
    render(<Header />);
    expect(screen.getByText(/2 left/)).toBeTruthy();
    expect(screen.getByText(/L5/)).toBeTruthy();
    expect(screen.getByText(/Aligned/)).toBeTruthy();
  });

  it('hamburger button opens drawer', () => {
    render(<Header />);
    expect(screen.queryByTestId('drawer')).toBeNull();

    const hamburger = screen.getByRole('button', { name: /Open menu/i });
    fireEvent.click(hamburger);
    expect(screen.getByTestId('drawer')).toBeTruthy();
  });

  it('drawer close button closes drawer', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /Open menu/i }));
    expect(screen.getByTestId('drawer')).toBeTruthy();

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('drawer')).toBeNull();
  });

  it('renders nav items', () => {
    render(<Header />);
    expect(screen.getByText('Brief')).toBeTruthy();
    expect(screen.getByText('Plan')).toBeTruthy();
  });

  it('renders header element with correct ARIA', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeTruthy();
  });
});
