import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReadinessPanel from '../ReadinessPanel';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../utils/telemetry', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../../../hooks/useMissionEntityCollection', () => ({
  useMissionEntityCollection: () => ({ debriefOutcomes: [] }),
}));

vi.mock('../../../utils/readiness/aarBridge', () => ({
  mapAllAARsToDebriefOutcomes: () => [],
}));

vi.mock('../../../store/AARStore', () => ({
  AARStore: { list: () => [] },
}));

const mockReadiness = {
  score: 72,
  confidence: 'high',
  kit: { id: 'kit-1', title: 'Alpha Kit' },
  milestone: {
    tier: { id: 'tier-2', label: 'Field Agent' },
    progressPct: 65,
    nextUnlockHint: 'Complete 2 more drills to unlock Specialist',
  },
  progression: { appliedDelta: 3, trend: 'up' },
  nextActions: [
    { id: 'act-1', title: 'CQB Drill', route: '/mission/drill/cqb' },
    { id: 'act-2', title: 'Intel Review', route: '/mission/debrief' },
  ],
};

vi.mock('../../../store/MissionKitStore', () => ({
  MissionKitStore: { getPrimaryKit: () => ({ id: 'kit-1', title: 'Alpha Kit', drills: [] }) },
}));

vi.mock('../../../utils/readiness/model', () => ({
  computeReadiness: () => mockReadiness,
}));

import { trackEvent } from '../../../utils/telemetry';

describe('ReadinessPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders readiness score and confidence', () => {
    render(<ReadinessPanel />);
    expect(screen.getByText('72')).toBeTruthy();
    expect(screen.getByText(/Confidence: high/)).toBeTruthy();
  });

  it('renders kit title', () => {
    render(<ReadinessPanel />);
    expect(screen.getByText('Alpha Kit')).toBeTruthy();
  });

  it('renders milestone tier and progress', () => {
    render(<ReadinessPanel />);
    expect(screen.getByText(/Field Agent · Progress 65%/)).toBeTruthy();
  });

  it('renders next unlock hint', () => {
    render(<ReadinessPanel />);
    expect(screen.getByText(/Complete 2 more drills/)).toBeTruthy();
  });

  it('renders recommended next actions', () => {
    render(<ReadinessPanel />);
    expect(screen.getByText('CQB Drill')).toBeTruthy();
    expect(screen.getByText('Intel Review')).toBeTruthy();
  });

  it('tracks telemetry on render', () => {
    render(<ReadinessPanel />);
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'readiness', action: 'score_render' }),
    );
  });

  it('clicking action navigates and tracks event', () => {
    render(<ReadinessPanel />);
    fireEvent.click(screen.getByRole('button', { name: /Run CQB Drill/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/mission/drill/cqb');
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'next_action_click' }),
    );
  });
});
