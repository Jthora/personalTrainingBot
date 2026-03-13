import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeeklySummary from '../WeeklySummary';

vi.mock('../../../store/ProgressSnapshotStore', () => ({
  default: {
    getWeeklyDeltas: vi.fn(() => [
      { domainId: 'cybersecurity', domainName: 'Cybersecurity', delta: 12 },
      { domainId: 'fitness', domainName: 'Fitness', delta: 8 },
      { domainId: 'combat', domainName: 'Combat', delta: -3 },
    ]),
  },
}));

describe('WeeklySummary', () => {
  it('renders gains and losses', () => {
    render(<WeeklySummary />);
    expect(screen.getByTestId('weekly-summary')).toBeTruthy();
    expect(screen.getByText('+12 Cybersecurity')).toBeTruthy();
    expect(screen.getByText('+8 Fitness')).toBeTruthy();
    expect(screen.getByText('-3 Combat')).toBeTruthy();
  });

  it('renders "This Week" heading', () => {
    render(<WeeklySummary />);
    expect(screen.getByText('This Week')).toBeTruthy();
  });
});
