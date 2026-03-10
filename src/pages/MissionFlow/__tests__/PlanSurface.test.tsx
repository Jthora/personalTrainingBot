import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MissionSet } from '../../../types/MissionSchedule';
import { Drill } from '../../../types/DrillCategory';

const todayKey = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

const drill1 = new Drill('Push Ups', 'Upper body push', '10 min', 'moderate', [1, 3]);
const drill2 = new Drill('Squats', 'Lower body', '8 min', 'high', [2, 4]);
const drill3 = new Drill('Plank Hold', 'Core stability', '5 min', 'low', [1, 2]);

const { mockGetScheduleSync, mockCreateNewScheduleSync } = vi.hoisted(() => ({
  mockGetScheduleSync: vi.fn(),
  mockCreateNewScheduleSync: vi.fn(),
}));

/* ── Mocks ── */
vi.mock('../../../store/MissionScheduleStore', () => ({
  default: {
    getScheduleSync: mockGetScheduleSync,
    createNewScheduleSync: mockCreateNewScheduleSync,
  },
}));

vi.mock('../../../store/CustomMissionSchedulesStore', () => ({
  default: {
    getCustomSchedules: vi.fn(() => [
      { id: 'plan-1', name: 'Strength Focus' },
      { id: 'plan-2', name: 'Cardio Mix' },
    ]),
  },
}));

vi.mock('../../../store/UserProgressStore', () => ({
  default: {
    get: vi.fn(() => ({
      version: 1, streakCount: 5, lastActiveDate: '2026-03-09',
      xp: 1250, level: 3, totalDrillsCompleted: 42,
      badges: [], badgeUnlocks: [],
      dailyGoal: { target: 5, unit: 'ops', progress: 3, updatedAt: '2026-03-09' },
      weeklyGoal: { target: 20, unit: 'ops', progress: 12, updatedAt: '2026-03-09', weekStart: '2026-03-03', weekEnd: '2026-03-09' },
      challenges: [], lastRecap: null, quietMode: false, flags: {},
    })),
    getViewModel: vi.fn(() => ({
      levelProgressPercent: 50, xpToNextLevel: 250,
      dailyGoalPercent: 60, weeklyGoalPercent: 60,
      streakStatus: 'active', badgesPreview: [], challengeSummaries: [],
    })),
  },
}));

// Import after mocks are set up
import PlanSurface from '../PlanSurface';

const renderSurface = () =>
  render(
    <MemoryRouter initialEntries={['/mission/plan']}>
      <PlanSurface />
    </MemoryRouter>,
  );

describe('PlanSurface', () => {
  beforeEach(() => {
    const set1 = new MissionSet([
      [drill1, true],
      [drill2, false],
      [drill3, false],
    ]);
    mockGetScheduleSync.mockReturnValue({
      date: todayKey,
      scheduleItems: [set1],
      difficultySettings: {},
    });
    mockCreateNewScheduleSync.mockClear();
  });
  it('renders the heading', () => {
    renderSurface();
    expect(screen.getByText('Training Plan')).toBeTruthy();
  });

  it('has aria-label on surface section', () => {
    renderSurface();
    expect(screen.getByLabelText('Training Plan')).toBeTruthy();
  });

  it('renders 7 day cells in the week grid', () => {
    renderSurface();
    const grid = screen.getByRole('grid', { name: 'Weekly plan' });
    const cells = grid.querySelectorAll('[role="gridcell"]');
    expect(cells.length).toBe(7);
  });

  it('shows day-of-week labels', () => {
    renderSurface();
    expect(screen.getByText('Mon')).toBeTruthy();
    expect(screen.getByText('Sun')).toBeTruthy();
  });

  it('marks today with aria-current="date"', () => {
    renderSurface();
    const todayCell = screen.getByRole('gridcell', { current: 'date' });
    expect(todayCell).toBeTruthy();
  });

  it('shows drill count for days with drills', () => {
    renderSurface();
    // Today has 3 drills in the mock — appears in both summary and day card
    expect(screen.getAllByText('3 drills').length).toBeGreaterThanOrEqual(1);
  });

  it('renders weekly summary chips', () => {
    renderSurface();
    expect(screen.getByTestId('weekly-summary')).toBeTruthy();
    expect(screen.getByText('60%')).toBeTruthy();         // weekly goal percent
    // "3 drills" in summary — use within container
    const summary = screen.getByTestId('weekly-summary');
    expect(summary.textContent).toContain('3 drills');
  });

  it('shows saved plans count', () => {
    renderSurface();
    expect(screen.getByText('2')).toBeTruthy(); // 2 custom schedules
  });

  it('shows day detail panel with drills for today', () => {
    renderSurface();
    const detail = screen.getByTestId('day-detail');
    expect(detail).toBeTruthy();
    expect(screen.getByText('Push Ups')).toBeTruthy();
    expect(screen.getByText('Squats')).toBeTruthy();
    expect(screen.getByText('Plank Hold')).toBeTruthy();
  });

  it('shows drill metadata', () => {
    renderSurface();
    expect(screen.getByText('10 min · moderate')).toBeTruthy();
  });

  it('switches day detail when a different day is clicked', () => {
    renderSurface();
    // Click a non-today cell (the first cell if today isn't Monday)
    const grid = screen.getByRole('grid', { name: 'Weekly plan' });
    const cells = grid.querySelectorAll('[role="gridcell"]');
    // Find a cell that isn't today
    const otherCell = Array.from(cells).find(
      (c) => c.getAttribute('aria-current') !== 'date',
    );
    if (otherCell) {
      fireEvent.click(otherCell);
      // That day has no drills in our mock
      expect(screen.getByText('No drills scheduled for this day.')).toBeTruthy();
    }
  });

  it('has a regenerate button', () => {
    renderSurface();
    expect(screen.getByTestId('plan-regenerate')).toBeTruthy();
    expect(screen.getByText('Regenerate Schedule')).toBeTruthy();
  });

  it('calls createNewScheduleSync on regenerate', () => {
    renderSurface();
    fireEvent.click(screen.getByTestId('plan-regenerate'));
    expect(mockCreateNewScheduleSync).toHaveBeenCalled();
  });

  it('shows empty message for days with no drills', () => {
    renderSurface();
    const grid = screen.getByRole('grid', { name: 'Weekly plan' });
    const cells = grid.querySelectorAll('[role="gridcell"]');
    const otherCell = Array.from(cells).find(
      (c) => c.getAttribute('aria-current') !== 'date',
    );
    if (otherCell) {
      fireEvent.click(otherCell);
      expect(screen.getByText('No drills scheduled for this day.')).toBeTruthy();
    }
  });
});
