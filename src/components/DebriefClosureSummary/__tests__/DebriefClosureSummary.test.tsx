import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DebriefClosureSummary from '../DebriefClosureSummary';

vi.mock('../../../hooks/useMissionEntityCollection', () => ({
  useMissionEntityCollection: vi.fn(() => ({
    debriefOutcomes: [{ id: 'o1', summary: 'good' }],
    operations: [
      { id: 'op-current', codename: 'ALPHA', objective: 'obj A', status: 'active', readinessScore: 50 },
      { id: 'op-next', codename: 'BRAVO', objective: 'obj B', status: 'pending', readinessScore: 30 },
    ],
  })),
}));

vi.mock('../../../store/missionFlow/continuity', () => ({
  readMissionFlowContext: vi.fn(() => ({ operationId: 'op-current', caseId: 'c1', signalId: 's1' })),
}));

vi.mock('../../../utils/readiness/model', () => ({
  computeReadiness: vi.fn((_: unknown, opts: { debriefOutcomes: unknown[] }) => ({
    score: opts.debriefOutcomes.length > 0 ? 72 : 60,
    competency: {
      dimensionScores: {
        triage_execution: 80,
        signal_analysis: 65,
        artifact_traceability: 90,
        decision_quality: 55,
      },
    },
  })),
}));

describe('DebriefClosureSummary', () => {
  it('renders readiness score and delta', () => {
    render(<DebriefClosureSummary />);
    expect(screen.getByText('72')).toBeTruthy();
    expect(screen.getByText('+12')).toBeTruthy();
  });

  it('shows strongest and weakest competency', () => {
    render(<DebriefClosureSummary />);
    expect(screen.getByText(/Artifact Traceability/)).toBeTruthy();
    expect(screen.getByText(/Decision Quality/)).toBeTruthy();
    expect(screen.getByText(/Focus next/)).toBeTruthy();
  });

  it('recommends next operation excluding current', () => {
    render(<DebriefClosureSummary />);
    expect(screen.getByText('BRAVO')).toBeTruthy();
    expect(screen.getByText(/obj B/)).toBeTruthy();
  });

  it('renders section with correct aria label', () => {
    render(<DebriefClosureSummary />);
    expect(screen.getByRole('region', { name: 'Debrief closure summary' })).toBeTruthy();
  });

  it('shows fallback when no operations exist', async () => {
    const { useMissionEntityCollection } = await import('../../../hooks/useMissionEntityCollection');
    (useMissionEntityCollection as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      debriefOutcomes: [],
      operations: [],
    });
    render(<DebriefClosureSummary />);
    expect(screen.getByText(/No alternate operation available/)).toBeTruthy();
  });
});
