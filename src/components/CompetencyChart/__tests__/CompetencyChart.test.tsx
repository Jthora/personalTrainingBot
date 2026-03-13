import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompetencyChart from '../CompetencyChart';
import type { DomainProgressSnapshot } from '../../../utils/readiness/domainProgress';

const snapshot: DomainProgressSnapshot = {
  weightedScore: 72,
  domains: [
    { domainId: 'combat', domainName: 'Combat', score: 80, drillCount: 5, avgAssessment: 4, uniqueDrills: 3, lastActiveDate: null, trend: null, coverageRatio: null },
    { domainId: 'cybersecurity', domainName: 'Cybersecurity', score: 65, drillCount: 3, avgAssessment: 3.5, uniqueDrills: 2, lastActiveDate: null, trend: null, coverageRatio: null },
    { domainId: 'fitness', domainName: 'Fitness', score: 70, drillCount: 4, avgAssessment: 3.8, uniqueDrills: 3, lastActiveDate: null, trend: null, coverageRatio: null },
    { domainId: 'psiops', domainName: 'Psiops', score: 55, drillCount: 1, avgAssessment: 2.5, uniqueDrills: 1, lastActiveDate: null, trend: null, coverageRatio: null },
  ],
};

describe('CompetencyChart', () => {
  it('renders heading', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    expect(screen.getByText('Domain Progress')).toBeTruthy();
  });

  it('shows composite score', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    expect(screen.getByText('72')).toBeTruthy();
  });

  it('renders domain labels', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    expect(screen.getByText('Combat')).toBeTruthy();
    expect(screen.getByText('Cybersecurity')).toBeTruthy();
    expect(screen.getByText('Fitness')).toBeTruthy();
    expect(screen.getByText('Psiops')).toBeTruthy();
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
  });

  it('clamps scores between 0 and 100', () => {
    const extreme: DomainProgressSnapshot = {
      weightedScore: 50,
      domains: [
        { domainId: 'combat', domainName: 'Combat', score: 120, drillCount: 5, avgAssessment: 4, uniqueDrills: 3, lastActiveDate: null, trend: null, coverageRatio: null },
        { domainId: 'fitness', domainName: 'Fitness', score: -5, drillCount: 0, avgAssessment: null, uniqueDrills: 0, lastActiveDate: null, trend: null, coverageRatio: null },
      ],
    };
    render(<CompetencyChart snapshot={extreme} />);
    const bars = screen.getAllByRole('progressbar');
    expect(bars[0].getAttribute('aria-valuenow')).toBe('100');
    expect(bars[1].getAttribute('aria-valuenow')).toBe('0');
  });

  it('has section aria-label', () => {
    render(<CompetencyChart snapshot={snapshot} />);
    expect(screen.getByLabelText('Domain progress')).toBeTruthy();
  });

  it('highlights active domains with star', () => {
    render(<CompetencyChart snapshot={snapshot} activeDomainIds={['combat', 'fitness']} />);
    const stars = screen.getAllByText('★');
    expect(stars.length).toBe(2);
  });

  it('sorts active domains first, then by score descending', () => {
    render(<CompetencyChart snapshot={snapshot} activeDomainIds={['psiops']} />);
    const bars = screen.getAllByRole('progressbar');
    // Psiops (active, score 55) should come first, then Combat 80, Fitness 70, Cybersecurity 65
    expect(bars[0].getAttribute('aria-label')).toContain('Psiops');
    expect(bars[1].getAttribute('aria-label')).toContain('Combat');
  });
});
