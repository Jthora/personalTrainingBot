import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityHeatmap from '../ActivityHeatmap';

const today = new Date().toISOString().slice(0, 10);
const yesterday = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
})();

vi.mock('../../../store/DrillHistoryStore', () => ({
  default: {
    list: vi.fn(() => [
      { id: '1', drillId: 'drill-1', title: 'Drill 1', completedAt: `${today}T10:00:00Z`, elapsedSec: 120, stepCount: 5 },
      { id: '2', drillId: 'drill-2', title: 'Drill 2', completedAt: `${today}T14:00:00Z`, elapsedSec: 90, stepCount: 3 },
      { id: '3', drillId: 'drill-3', title: 'Drill 3', completedAt: `${yesterday}T09:00:00Z`, elapsedSec: 60, stepCount: 4 },
    ]),
  },
}));

vi.mock('../../../store/CardProgressStore', () => ({
  default: {
    list: vi.fn(() => [
      { cardId: 'c1', moduleId: 'm1', lastReviewedAt: `${today}T10:00:00Z` },
      { cardId: 'c2', moduleId: 'm1', lastReviewedAt: `${today}T11:00:00Z` },
      { cardId: 'c3', moduleId: 'm2', lastReviewedAt: `${today}T12:00:00Z` },
    ]),
  },
}));

describe('ActivityHeatmap', () => {
  it('renders the heatmap grid with 91 cells', () => {
    const { container } = render(<ActivityHeatmap />);
    expect(screen.getByTestId('activity-heatmap')).toBeTruthy();
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(91); // 13 weeks × 7 days
  });

  it('renders "Activity" heading', () => {
    render(<ActivityHeatmap />);
    expect(screen.getByText('Activity')).toBeTruthy();
  });

  it('renders intensity legend with Less/More labels', () => {
    render(<ActivityHeatmap />);
    expect(screen.getByText('Less')).toBeTruthy();
    expect(screen.getByText('More')).toBeTruthy();
  });

  it('shows tooltip on cell hover', () => {
    render(<ActivityHeatmap />);
    const todayCell = screen.getByTestId(`cell-${today}`);
    fireEvent.mouseEnter(todayCell);
    expect(screen.getByTestId('heatmap-tooltip')).toBeTruthy();
    expect(screen.getByText('2 drills')).toBeTruthy();
    expect(screen.getByText('3 cards reviewed')).toBeTruthy();
  });

  it('hides tooltip on cell leave', () => {
    render(<ActivityHeatmap />);
    const todayCell = screen.getByTestId(`cell-${today}`);
    fireEvent.mouseEnter(todayCell);
    expect(screen.getByTestId('heatmap-tooltip')).toBeTruthy();
    fireEvent.mouseLeave(todayCell);
    expect(screen.queryByTestId('heatmap-tooltip')).toBeNull();
  });

  it('shows correct data for yesterday (1 drill)', () => {
    render(<ActivityHeatmap />);
    const cell = screen.getByTestId(`cell-${yesterday}`);
    fireEvent.mouseEnter(cell);
    expect(screen.getByText('1 drill')).toBeTruthy(); // singular
  });
});
