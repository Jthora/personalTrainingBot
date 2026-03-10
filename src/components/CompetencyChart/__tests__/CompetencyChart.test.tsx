import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompetencyChart from '../CompetencyChart';
import type { CompetencySnapshot } from '../../../utils/readiness/competencyModel';

const snapshot: CompetencySnapshot = {
  weightedScore: 72,
  dimensionScores: {
    triage_execution: 80,
    signal_analysis: 65,
    artifact_traceability: 70,
    decision_quality: 55,
  },
};

describe('CompetencyChart', () => {
  it('renders heading', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    expect(screen.getByText('Competency Breakdown')).toBeTruthy();
  });

  it('shows weighted score', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    expect(screen.getByText('72')).toBeTruthy();
  });

  it('renders all four dimension labels', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    expect(screen.getByText('Triage Execution')).toBeTruthy();
    expect(screen.getByText('Signal Analysis')).toBeTruthy();
    expect(screen.getByText('Artifact Traceability')).toBeTruthy();
    expect(screen.getByText('Decision Quality')).toBeTruthy();
  });

  it('renders score values', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    expect(screen.getByText('80')).toBeTruthy();
    expect(screen.getByText('65')).toBeTruthy();
    expect(screen.getByText('70')).toBeTruthy();
    expect(screen.getByText('55')).toBeTruthy();
  });

  it('renders accessible progress bars', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(4);
    expect(bars[0].getAttribute('aria-valuenow')).toBe('80');
  });

  it('clamps scores between 0 and 100', () => {
    const extreme: CompetencySnapshot = {
      weightedScore: 50,
      dimensionScores: {
        triage_execution: 120,
        signal_analysis: -5,
        artifact_traceability: 50,
        decision_quality: 50,
      },
    };
    render(<CompetencyChart snapshot={extreme} />);
    const bars = screen.getAllByRole('progressbar');
    expect(bars[0].getAttribute('aria-valuenow')).toBe('100');
    expect(bars[1].getAttribute('aria-valuenow')).toBe('0');
  });

  it('has section aria-label', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    expect(screen.getByLabelText('Competency breakdown')).toBeTruthy();
  });
});
