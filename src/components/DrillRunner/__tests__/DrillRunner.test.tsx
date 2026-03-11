import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DrillRunner from '../DrillRunner';

/* ── Mocks ── */
const { mockDrillRunStore } = vi.hoisted(() => ({
  mockDrillRunStore: {
    get: vi.fn(() => null) as any,
    subscribe: vi.fn((cb: (s: null) => void) => {
      cb(null as any);
      return vi.fn();
    }),
    start: vi.fn(),
    toggleStep: vi.fn(),
    clear: vi.fn(),
  },
}));
vi.mock('../../../store/DrillRunStore', () => ({
  DrillRunStore: mockDrillRunStore,
}));

vi.mock('../../../store/MissionKitStore', () => ({
  MissionKitStore: {
    getPrimaryKit: vi.fn(() => ({
      id: 'kit-1',
      title: 'Test Kit',
      drills: [
        {
          id: 'drill-1',
          title: 'Drill Alpha',
          type: 'rapid-response',
          difficulty: 3,
          durationMinutes: 18,
          steps: [
            { id: 'step-1', label: 'Step one' },
            { id: 'step-2', label: 'Step two' },
          ],
        },
      ],
    })),
    recordDrillCompletion: vi.fn(),
  },
}));

vi.mock('../../../hooks/useMissionSchedule', () => ({
  default: () => ({
    schedule: null,
    completeCurrentDrill: vi.fn(),
  }),
}));

vi.mock('../../../store/DrillHistoryStore', () => ({
  default: {
    record: vi.fn(),
    statsForDrill: vi.fn(() => ({ runs: 0, avgElapsedSec: 0, bestElapsedSec: 0 })),
  },
}));

vi.mock('../../../config/featureFlags', () => ({
  isFeatureEnabled: vi.fn((flag: string) => flag === 'drillRunnerUpgrade'),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  mockDrillRunStore.get.mockReturnValue(null);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('DrillRunner', () => {
  it('renders empty state when no active run', () => {
    render(<DrillRunner />);
    expect(screen.getByText('No active drill')).toBeTruthy();
    expect(screen.getByText('Start drill')).toBeTruthy();
  });

  it('renders drill steps when run is active', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [
        { id: 'step-1', label: 'Step one', done: false },
        { id: 'step-2', label: 'Step two', done: false },
      ],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    expect(screen.getByText('Drill Alpha')).toBeTruthy();
    expect(screen.getByText('Step one')).toBeTruthy();
    expect(screen.getByText('Step two')).toBeTruthy();
  });

  it('shows timer display when enhanced and drill active', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: false }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    expect(screen.getByTestId('timer-display')).toBeTruthy();
    expect(screen.getByText('Elapsed')).toBeTruthy();
  });

  it('shows rest interval (not completion text) when drill finished and enhanced', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Enhanced mode jumps to rest interval on completion
    expect(screen.getByTestId('rest-interval')).toBeTruthy();
  });

  it('renders rest interval after completion when enhanced', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);

    // After completion with enhanced, rest interval should appear
    const rest = screen.queryByTestId('rest-interval');
    expect(rest).toBeTruthy();
  });
});
