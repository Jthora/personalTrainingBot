import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StatsSurface from '../StatsSurface';

/* ── Mocks ── */
vi.mock('../../../hooks/useMissionEntityCollection', () => ({
  useMissionEntityCollection: () => ({ debriefOutcomes: [] }),
}));

vi.mock('../../../store/MissionKitStore', () => ({
  MissionKitStore: {
    getPrimaryKit: () => ({
      id: 'test-kit',
      title: 'Test Kit',
      drills: [],
    }),
  },
}));

vi.mock('../../../store/AARStore', () => ({
  AARStore: { list: () => [] },
}));

vi.mock('../../../utils/readiness/aarBridge', () => ({
  mapAllAARsToDebriefOutcomes: () => [],
}));

vi.mock('../../../utils/readiness/model', () => ({
  computeReadiness: () => ({
    score: 72,
    confidence: 'medium',
    nextActions: [],
    kit: { id: 'test-kit', title: 'Test Kit', drills: [] },
    competency: {
      weightedScore: 68,
      dimensionScores: {
        triage_execution: 75,
        signal_analysis: 62,
        artifact_traceability: 70,
        decision_quality: 55,
      },
    },
    progression: { appliedDelta: 3, appliedOutcomes: 2, trend: 'improving' },
    milestone: {
      tier: { id: 'tier_2', label: 'Tier II · Operator', minScore: 55, prerequisites: [] },
      progressPct: 45,
      unlocked: true,
      nextTier: null,
      nextUnlockHint: 'Keep going',
    },
  }),
}));

vi.mock('../../../store/UserProgressStore', () => {
  const mockProgress = {
    version: 1,
    streakCount: 5,
    lastActiveDate: '2026-03-09',
    xp: 1250,
    level: 3,
    totalDrillsCompleted: 42,
    badges: ['streak_3'],
    badgeUnlocks: [],
    dailyGoal: { target: 5, unit: 'ops', progress: 3, updatedAt: '2026-03-09' },
    weeklyGoal: { target: 20, unit: 'ops', progress: 12, updatedAt: '2026-03-09', weekStart: '2026-03-03', weekEnd: '2026-03-09' },
    challenges: [],
    lastRecap: null,
    quietMode: false,
    flags: {},
  };
  return {
    default: {
      get: vi.fn(() => mockProgress),
      getViewModel: vi.fn(() => ({
        levelProgressPercent: 50,
        xpToNextLevel: 250,
        dailyGoalPercent: 60,
        weeklyGoalPercent: 60,
        streakStatus: 'active' as const,
        badgesPreview: ['streak_3'],
        challengeSummaries: [],
      })),
      isStorageAvailable: vi.fn(() => true),
      isDisabled: vi.fn(() => false),
    },
  };
});

vi.mock('../../../store/OperativeProfileStore', () => ({
  default: { get: () => null, subscribe: () => () => {}, getVersion: () => 0, patch: () => {} },
}));

vi.mock('../../../data/archetypes', () => ({
  findArchetype: () => undefined,
}));

vi.mock('../../../data/handlers', () => ({
  handlers: [],
}));

vi.mock('../../../config/featureFlags', () => ({
  isFeatureEnabled: (flag: string) => flag !== 'profileEditor',
}));

vi.mock('../../../data/badgeCatalog', () => ({
  getBadgeCatalog: () => [
    { id: 'streak_3', name: 'Warm Streak', rarity: 'common', icon: '🔥' },
  ],
}));

const renderSurface = () =>
  render(
    <MemoryRouter initialEntries={['/mission/stats']}>
      <StatsSurface />
    </MemoryRouter>,
  );

describe('StatsSurface', () => {
  it('renders the dashboard heading', () => {
    renderSurface();
    expect(screen.getByText('Operative Dashboard')).toBeTruthy();
  });

  it('shows level chip', () => {
    renderSurface();
    expect(screen.getByText((_, el) => el?.textContent === 'Lv 3' && el.tagName === 'SPAN')).toBeTruthy();
  });

  it('shows XP chip', () => {
    renderSurface();
    expect(screen.getByText((_, el) => el?.textContent === '1250' && el.tagName === 'SPAN')).toBeTruthy();
  });

  it('shows streak chip', () => {
    renderSurface();
    expect(screen.getByText(/🔥 5d/)).toBeTruthy();
  });

  it('shows drills completed chip', () => {
    renderSurface();
    expect(screen.getByText((_, el) => el?.textContent === '42' && el.tagName === 'SPAN')).toBeTruthy();
  });

  it('shows readiness score', () => {
    renderSurface();
    expect(screen.getByText((_, el) => el?.textContent === '72' && el?.className?.includes?.('readinessValue'))).toBeTruthy();
  });

  it('shows milestone tier label', () => {
    renderSurface();
    expect(screen.getByText('Tier II · Operator')).toBeTruthy();
  });

  it('renders competency chart section', () => {
    renderSurface();
    expect(screen.getByText('Competency Breakdown')).toBeTruthy();
  });

  it('renders badge gallery section', () => {
    renderSurface();
    expect(screen.getByText('Badges')).toBeTruthy();
  });

  it('renders challenge board section', () => {
    renderSurface();
    expect(screen.getByText('Active Challenges')).toBeTruthy();
  });

  it('has XP progress bar', () => {
    renderSurface();
    const bars = screen.getAllByRole('progressbar');
    const xpBar = bars.find(b => b.getAttribute('aria-label')?.includes('XP progress'));
    expect(xpBar).toBeTruthy();
    expect(xpBar!.getAttribute('aria-valuenow')).toBe('50');
  });

  it('has aria-label on surface section', () => {
    renderSurface();
    expect(screen.getByLabelText('Operative Dashboard')).toBeTruthy();
  });
});
