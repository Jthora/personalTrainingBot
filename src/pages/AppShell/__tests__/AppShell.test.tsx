import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppShell from '../AppShell';

// Stub child components
vi.mock('../../../components/Header/Header', () => ({ default: () => <header data-testid="header" /> }));
vi.mock('../../../components/CelebrationLayer/CelebrationLayer', () => ({ default: () => <div data-testid="celebration" /> }));
vi.mock('../../../components/MissionActionPalette/MissionActionPalette', () => ({
  default: ({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (a: { path: string; search?: string; id: string }) => void }) =>
    isOpen ? (
      <div data-testid="palette">
        <button onClick={onClose}>close-palette</button>
        <button onClick={() => onSelect({ path: '/review', id: 'tab:/review' })}>pick-review</button>
      </div>
    ) : null,
}));

const mockNavigate = vi.fn();
let mockPathname = '/train';
vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../utils/telemetry', () => ({ trackEvent: vi.fn() }));
vi.mock('../../../hooks/useIsMobile', () => ({ default: () => false }));
vi.mock('../../../store/OperativeProfileStore', () => ({
  default: { get: vi.fn(() => ({ archetypeId: 'test', handlerId: 'h1' })), set: vi.fn() },
}));
vi.mock('../../../cache/TrainingModuleCache', () => ({
  default: {
    getInstance: vi.fn(() => ({
      selectModules: vi.fn(),
      isLoaded: vi.fn(() => false),
    })),
  },
}));
vi.mock('../../../store/CardProgressStore', () => ({
  default: {
    getCardsDueForReview: vi.fn(() => [{ cardId: 'c1' }, { cardId: 'c2' }]),
    count: vi.fn(() => 10),
  },
}));
vi.mock('../appShellTabs', async () => {
  const actual = await vi.importActual<typeof import('../appShellTabs')>('../appShellTabs');
  return {
    ...actual,
    isMissionModeEnabled: vi.fn(() => false),
  };
});

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/train';
    window.localStorage.clear();
    // Bypass onboarding gates for shell tests
    window.localStorage.setItem('mission:guidance-overlay:v1', 'seen');
    window.localStorage.setItem('mission:intake:v1', 'seen');
  });

  it('renders Header, CelebrationLayer, and Outlet', () => {
    render(<AppShell />);
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByTestId('celebration')).toBeTruthy();
    expect(screen.getByTestId('outlet')).toBeTruthy();
  });

  it('renders 4 primary tab buttons on desktop', () => {
    render(<AppShell />);
    expect(screen.getByRole('tab', { name: /Train/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Review/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Progress/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Profile/i })).toBeTruthy();
  });

  it('marks active tab with aria-selected', () => {
    render(<AppShell />);
    const trainTab = screen.getByRole('tab', { name: /Train/i });
    expect(trainTab.getAttribute('aria-selected')).toBe('true');
    const reviewTab = screen.getByRole('tab', { name: /Review/i });
    expect(reviewTab.getAttribute('aria-selected')).toBe('false');
  });

  it('shows due badge on Review tab when cards are due', () => {
    render(<AppShell />);
    expect(screen.getByText('2')).toBeTruthy(); // 2 due cards from mock
  });

  it('navigates on tab click', () => {
    render(<AppShell />);
    const reviewTab = screen.getByRole('tab', { name: /Review/i });
    fireEvent.click(reviewTab);
    expect(mockNavigate).toHaveBeenCalledWith('/review');
  });

  it('renders main content with Outlet', () => {
    render(<AppShell />);
    const main = screen.getByRole('main');
    expect(main).toBeTruthy();
    expect(main.id).toBe('main-content');
  });

  it('opens palette with ⌘K button', () => {
    render(<AppShell />);
    const paletteBtn = screen.getByLabelText('Open action palette');
    fireEvent.click(paletteBtn);
    expect(screen.getByTestId('palette')).toBeTruthy();
  });

  it('navigates via palette selection', () => {
    render(<AppShell />);
    fireEvent.click(screen.getByLabelText('Open action palette'));
    fireEvent.click(screen.getByText('pick-review'));
    expect(mockNavigate).toHaveBeenCalledWith({ pathname: '/review', search: '' });
  });

  it('does not render mission tabs when active duty is off', () => {
    render(<AppShell />);
    expect(screen.queryByText('Active Duty')).toBeNull();
  });

  it('responds to ⌘K keyboard shortcut', () => {
    render(<AppShell />);
    // Palette should not be visible initially
    expect(screen.queryByTestId('palette')).toBeNull();
    // Simulate ⌘K
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('palette')).toBeTruthy();
    // Escape closes it
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('palette')).toBeNull();
  });

  it('responds to ⌘1-4 tab shortcuts', () => {
    render(<AppShell />);
    fireEvent.keyDown(window, { key: '2', metaKey: true });
    expect(mockNavigate).toHaveBeenCalledWith('/review');
    fireEvent.keyDown(window, { key: '3', metaKey: true });
    expect(mockNavigate).toHaveBeenCalledWith('/progress');
    fireEvent.keyDown(window, { key: '4', metaKey: true });
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
