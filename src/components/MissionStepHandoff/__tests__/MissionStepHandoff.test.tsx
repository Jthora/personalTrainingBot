import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MissionStepHandoff from '../MissionStepHandoff';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

vi.mock('../../../store/missionFlow/continuity', () => ({
  readMissionFlowContext: vi.fn(() => ({ operationId: 'op-1', caseId: 'c-2', signalId: 's-3' })),
}));

vi.mock('../../../utils/telemetry', () => ({ trackEvent: vi.fn() }));

import { trackEvent } from '../../../utils/telemetry';

const baseProps = {
  stepLabel: 'Triage',
  why: 'Triage determines priority.',
  inputs: ['Signals list', 'Case file'],
  readyCriteria: ['At least 1 signal', 'Handler assigned'],
  nextStepLabel: 'Case Analysis',
  nextPath: '/mission/case' as const,
  ctaLabel: 'Continue to Case',
};

describe('MissionStepHandoff', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders step label, why, inputs, readyCriteria', () => {
    render(<MissionStepHandoff {...baseProps} />);
    expect(screen.getByRole('region', { name: /Triage operational handoff/ })).toBeTruthy();
    expect(screen.getByText('Triage determines priority.')).toBeTruthy();
    expect(screen.getByText('Signals list')).toBeTruthy();
    expect(screen.getByText('Case file')).toBeTruthy();
    expect(screen.getByText('At least 1 signal')).toBeTruthy();
    expect(screen.getByText('Handler assigned')).toBeTruthy();
  });

  it('displays continuity context from mission flow', () => {
    render(<MissionStepHandoff {...baseProps} />);
    expect(screen.getByText(/Operation: op-1/)).toBeTruthy();
    expect(screen.getByText(/Case: c-2/)).toBeTruthy();
    expect(screen.getByText(/Signal: s-3/)).toBeTruthy();
  });

  it('CTA button navigates to nextPath', () => {
    render(<MissionStepHandoff {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Case' }));
    expect(mockNavigate).toHaveBeenCalledWith('/mission/case');
  });

  it('CTA click emits telemetry event', () => {
    render(<MissionStepHandoff {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Case' }));
    expect(trackEvent).toHaveBeenCalledWith(expect.objectContaining({
      category: 'ia',
      action: 'tab_view',
      route: '/mission/case',
    }));
  });
});
