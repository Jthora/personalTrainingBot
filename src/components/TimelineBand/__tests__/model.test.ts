import { describe, expect, it } from 'vitest';
import { buildTimelineEvents } from '../model';
import type { MissionEntityCollection } from '../../../domain/mission/types';

const collection: MissionEntityCollection = {
  operations: [
    {
      kind: 'operation',
      id: 'op-1',
      version: 'v1',
      createdAt: '2026-03-05T08:00:00.000Z',
      updatedAt: '2026-03-05T08:00:00.000Z',
      codename: 'Op One',
      objective: 'Objective',
      status: 'briefing',
      readinessScore: 40,
      caseIds: ['case-1'],
      signalIds: ['sig-1'],
      checklistIds: ['chk-1'],
      debriefOutcomeId: 'debrief-1',
    },
  ],
  cases: [
    {
      kind: 'case',
      id: 'case-1',
      version: 'v1',
      createdAt: '2026-03-05T07:00:00.000Z',
      updatedAt: '2026-03-05T10:00:00.000Z',
      operationId: 'op-1',
      title: 'Case One',
      summary: 'Summary',
      status: 'assessing',
      severity: 'high',
      leadIds: [],
      signalIds: ['sig-1'],
      artifactIds: ['art-1'],
    },
  ],
  leads: [],
  signals: [
    {
      kind: 'signal',
      id: 'sig-1',
      version: 'v1',
      createdAt: '2026-03-05T06:00:00.000Z',
      updatedAt: '2026-03-05T06:00:00.000Z',
      operationId: 'op-1',
      caseId: 'case-1',
      title: 'Signal One',
      detail: 'Detail',
      status: 'new',
      severity: 'critical',
      source: 'system',
      observedAt: '2026-03-05T11:00:00.000Z',
    },
  ],
  artifacts: [
    {
      kind: 'artifact',
      id: 'art-1',
      version: 'v1',
      createdAt: '2026-03-05T06:00:00.000Z',
      updatedAt: '2026-03-05T06:00:00.000Z',
      caseId: 'case-1',
      title: 'Artifact One',
      description: 'Description',
      artifactType: 'report',
      source: 'sensor',
      collectedAt: '2026-03-05T09:30:00.000Z',
    },
  ],
  intelPackets: [],
  debriefOutcomes: [
    {
      kind: 'debrief_outcome',
      id: 'debrief-1',
      version: 'v1',
      createdAt: '2026-03-05T05:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z',
      operationId: 'op-1',
      summary: 'Summary',
      lessonsLearned: [],
      followUpActions: [],
      rating: 'strong',
      readinessDelta: 1,
    },
  ],
};

describe('timeline band model', () => {
  it('builds timeline events with jump paths', () => {
    const events = buildTimelineEvents(collection, { operationId: 'op-1', caseId: 'case-1', signalId: 'sig-1', updatedAt: Date.now() });
    expect(events.length).toBeGreaterThanOrEqual(4);
    expect(events.some((event) => event.path === '/mission/signal')).toBe(true);
    expect(events.some((event) => event.path === '/mission/case')).toBe(true);
  });

  it('orders timeline events by descending timestamp', () => {
    const events = buildTimelineEvents(collection, { operationId: 'op-1', caseId: 'case-1', signalId: 'sig-1', updatedAt: Date.now() });
    const times = events.map((event) => new Date(event.timestamp).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });
});