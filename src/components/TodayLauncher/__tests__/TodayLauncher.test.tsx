import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TodayLauncher from '../TodayLauncher';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../utils/telemetry', () => ({ trackEvent: vi.fn() }));
vi.mock('../../../utils/resolveShellRoute', () => ({
  resolveShellRoute: (p: string) => p,
}));

const { mockProfileGet } = vi.hoisted(() => ({
  mockProfileGet: vi.fn(() => null) as any,
}));
vi.mock('../../../store/OperativeProfileStore', () => ({
  default: {
    get: mockProfileGet,
    set: vi.fn(),
    patch: vi.fn(),
    reset: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

const mockDrills = [
  { id: 'drill-1', title: 'Cyber Drill', moduleId: 'cybersecurity', steps: [{ id: 's1', label: 'Step 1' }] },
  { id: 'drill-2', title: 'Fitness Drill', moduleId: 'fitness', steps: [{ id: 's2', label: 'Step 2' }] },
];

const mockStartFn = vi.fn();
vi.mock('../../../store/DrillRunStore', () => ({
  DrillRunStore: {
    start: (...args: unknown[]) => mockStartFn(...args),
  },
}));

let mockKit: { drills: typeof mockDrills } | undefined = { drills: mockDrills };
const mockRegenerateKit = vi.fn();
vi.mock('../../../store/MissionKitStore', () => ({
  MissionKitStore: {
    getPrimaryKit: () => mockKit,
    regenerateKit: () => mockRegenerateKit(),
  },
}));

describe('TodayLauncher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockKit = { drills: mockDrills };
    mockProfileGet.mockReturnValue(null);
    localStorage.clear();
  });

  it('renders "Start Today\'s Training" button when drills are available', () => {
    render(<TodayLauncher />);
    expect(screen.getByTestId('today-launch-btn')).toBeTruthy();
    expect(screen.getByText("Start Today's Training")).toBeTruthy();
  });

  it('shows drill count summary', () => {
    render(<TodayLauncher />);
    expect(screen.getByText(/2 of 2 drills remaining/)).toBeTruthy();
  });

  it('shows module names in summary', () => {
    render(<TodayLauncher />);
    expect(screen.getByText(/Cybersecurity/)).toBeTruthy();
    expect(screen.getByText(/Fitness/)).toBeTruthy();
  });

  it('launches first drill on click and navigates to checklist', () => {
    render(<TodayLauncher />);
    fireEvent.click(screen.getByTestId('today-launch-btn'));
    expect(mockStartFn).toHaveBeenCalledWith('drill-1', 'Cyber Drill', [{ id: 's1', label: 'Step 1' }]);
    expect(mockNavigate).toHaveBeenCalledWith('/mission/checklist');
  });

  it('shows completion message when all drills are done', () => {
    // Mark both drills as completed via drill-stats
    localStorage.setItem('ptb:drill-stats', JSON.stringify({
      'drill-1': { completionCount: 1, lastCompleted: '2026-01-01', successRate: 1 },
      'drill-2': { completionCount: 2, lastCompleted: '2026-01-02', successRate: 0.8 },
    }));
    render(<TodayLauncher />);
    expect(screen.getByText(/Session complete!/)).toBeTruthy();
    expect(screen.getByTestId('regenerate-btn')).toBeTruthy();
  });

  it('returns null when no kit is available', () => {
    mockKit = undefined;
    const { container } = render(<TodayLauncher />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when kit has no drills', () => {
    mockKit = { drills: [] };
    const { container } = render(<TodayLauncher />);
    expect(container.innerHTML).toBe('');
  });

  // ── 5.4.3.2: Archetype CTA ──

  it('shows archetype name and icon in CTA when profile is set', () => {
    mockProfileGet.mockReturnValue({
      archetypeId: 'rescue_ranger',
      handlerId: 'handler-atlas',
      callsign: '',
      enrolledAt: '2025-01-01',
    });

    render(<TodayLauncher />);
    const btn = screen.getByTestId('today-launch-btn');
    expect(btn.textContent).toContain('Rescue Ranger Training');
  });

  it('shows archetype kit label in summary when profile is set', () => {
    mockProfileGet.mockReturnValue({
      archetypeId: 'rescue_ranger',
      handlerId: 'handler-atlas',
      callsign: '',
      enrolledAt: '2025-01-01',
    });

    render(<TodayLauncher />);
    expect(screen.getByTestId('archetype-kit-label')).toBeTruthy();
    expect(screen.getByTestId('archetype-kit-label').textContent).toContain('Rescue Ranger kit');
  });

  it('shows generic CTA when no archetype is set', () => {
    mockProfileGet.mockReturnValue(null);
    render(<TodayLauncher />);
    expect(screen.getByText("Start Today's Training")).toBeTruthy();
    expect(screen.queryByTestId('archetype-kit-label')).toBeNull();
  });
});
