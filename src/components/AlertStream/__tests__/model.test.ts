import { describe, expect, it } from 'vitest';
import { buildAlertGroups } from '../model';
import type { MissionSignal } from '../../../domain/mission/types';

const base = '2026-03-05T12:00:00.000Z';

const signals: MissionSignal[] = [
  {
    kind: 'signal',
    id: 'sig-critical-now',
    version: 'v1',
    createdAt: base,
    updatedAt: base,
    operationId: 'op-1',
    caseId: 'case-1',
    title: 'Critical live alert',
    detail: 'Immediate escalation required',
    status: 'investigating',
    severity: 'critical',
    source: 'system',
    observedAt: '2026-03-05T11:45:00.000Z',
  },
  {
    kind: 'signal',
    id: 'sig-high-24h',
    version: 'v1',
    createdAt: base,
    updatedAt: base,
    operationId: 'op-1',
    caseId: 'case-1',
    title: 'High alert recent',
    detail: 'Recent suspicious behavior',
    status: 'acknowledged',
    severity: 'high',
    source: 'sensor',
    observedAt: '2026-03-05T02:00:00.000Z',
  },
  {
    kind: 'signal',
    id: 'sig-critical-older',
    version: 'v1',
    createdAt: base,
    updatedAt: base,
    operationId: 'op-1',
    caseId: 'case-1',
    title: 'Critical historical',
    detail: 'Prior severe event',
    status: 'resolved',
    severity: 'critical',
    source: 'intel',
    observedAt: '2026-03-01T10:00:00.000Z',
  },
];

describe('alert stream model', () => {
  it('groups signals by severity and time bucket', () => {
    const groups = buildAlertGroups(signals, Date.parse(base));
    expect(groups.map((group) => group.id)).toEqual([
      'critical:last_hour',
      'critical:older',
      'high:last_24h',
    ]);
  });

  it('orders items by newest observed time within each group', () => {
    const sameBucket: MissionSignal[] = [
      { ...signals[1], id: 's1', observedAt: '2026-03-05T08:00:00.000Z' },
      { ...signals[1], id: 's2', observedAt: '2026-03-05T09:00:00.000Z' },
    ];
    const groups = buildAlertGroups(sameBucket, Date.parse(base));
    expect(groups[0].items.map((item) => item.id)).toEqual(['s2', 's1']);
  });
});