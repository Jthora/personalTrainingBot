import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreLineChart from '../ScoreLineChart';
import type { DomainSeries } from '../ScoreLineChart';

const mockSeries: DomainSeries[] = [
  {
    domainId: 'cybersecurity',
    domainName: 'Cybersecurity',
    color: '#5A7FFF',
    data: [
      { date: '2026-02-10', score: 20 },
      { date: '2026-02-17', score: 35 },
      { date: '2026-02-24', score: 50 },
      { date: '2026-03-03', score: 62 },
      { date: '2026-03-10', score: 72 },
    ],
  },
  {
    domainId: 'fitness',
    domainName: 'Fitness',
    color: '#22c55e',
    data: [
      { date: '2026-02-10', score: 10 },
      { date: '2026-03-10', score: 45 },
    ],
  },
];

describe('ScoreLineChart', () => {
  it('renders SVG with polylines for each series', () => {
    const { container } = render(<ScoreLineChart series={mockSeries} />);
    expect(screen.getByTestId('score-line-chart')).toBeTruthy();
    const polylines = container.querySelectorAll('polyline');
    expect(polylines.length).toBe(2);
  });

  it('renders legend when multiple series are provided', () => {
    render(<ScoreLineChart series={mockSeries} />);
    expect(screen.getByText('Cybersecurity')).toBeTruthy();
    expect(screen.getByText('Fitness')).toBeTruthy();
  });

  it('renders empty state when all series have no data', () => {
    const empty: DomainSeries[] = [
      { domainId: 'test', domainName: 'Test', color: '#fff', data: [] },
    ];
    render(<ScoreLineChart series={empty} />);
    expect(screen.getByTestId('score-line-chart-empty')).toBeTruthy();
    expect(screen.getByText(/No score history yet/)).toBeTruthy();
  });

  it('renders empty state when no series are provided', () => {
    render(<ScoreLineChart series={[]} />);
    expect(screen.getByTestId('score-line-chart-empty')).toBeTruthy();
  });

  it('renders Y-axis ticks (0, 25, 50, 75, 100)', () => {
    const { container } = render(<ScoreLineChart series={mockSeries} />);
    const texts = Array.from(container.querySelectorAll('text'));
    const yLabels = texts.map((t) => t.textContent).filter((t) => ['0', '25', '50', '75', '100'].includes(t ?? ''));
    expect(yLabels.length).toBe(5);
  });

  it('shows last score in legend', () => {
    render(<ScoreLineChart series={mockSeries} />);
    expect(screen.getByText('72')).toBeTruthy(); // Cybersecurity last score
    expect(screen.getByText('45')).toBeTruthy(); // Fitness last score
  });

  it('does not show legend for single series', () => {
    render(<ScoreLineChart series={[mockSeries[0]]} />);
    // Should not render legend container
    expect(screen.queryByText('Cybersecurity')).toBeNull();
  });
});
