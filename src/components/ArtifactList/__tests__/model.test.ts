import { describe, expect, it } from 'vitest';
import { buildArtifactActionLabels, buildArtifactDetailFields, filterAndSortArtifacts } from '../model';
import type { MissionArtifact } from '../../../domain/mission/types';

const artifacts: MissionArtifact[] = [
  {
    kind: 'artifact',
    id: 'art-2',
    version: 'v1',
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-03-05T00:00:00.000Z',
    caseId: 'case-1',
    title: 'Packet Capture',
    description: 'Captured suspicious network packets',
    artifactType: 'capture',
    source: 'sensor-2',
    collectedAt: '2026-03-04T10:00:00.000Z',
  },
  {
    kind: 'artifact',
    id: 'art-1',
    version: 'v1',
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-03-05T00:00:00.000Z',
    caseId: 'case-1',
    title: 'Operator Note',
    description: 'Manual analyst notes',
    artifactType: 'note',
    source: 'human',
    collectedAt: '2026-03-05T10:00:00.000Z',
  },
];

describe('artifact list model', () => {
  it('sorts recent by default semantics', () => {
    const result = filterAndSortArtifacts(artifacts, { query: '', type: 'all', sort: 'recent' });
    expect(result.map((item) => item.id)).toEqual(['art-1', 'art-2']);
  });

  it('filters by artifact type', () => {
    const result = filterAndSortArtifacts(artifacts, { query: '', type: 'capture', sort: 'recent' });
    expect(result.map((item) => item.id)).toEqual(['art-2']);
  });

  it('filters by query text', () => {
    const result = filterAndSortArtifacts(artifacts, { query: 'analyst', type: 'all', sort: 'recent' });
    expect(result.map((item) => item.id)).toEqual(['art-1']);
  });

  it('builds detail metadata rows for selected artifact', () => {
    const rows = buildArtifactDetailFields(artifacts[0]);
    expect(rows.find((row) => row.label === 'Type')?.value).toBe('CAPTURE');
    expect(rows.find((row) => row.label === 'Hash')?.value).toBe('Unavailable');
  });

  it('builds action labels for reviewed/promoted states', () => {
    expect(buildArtifactActionLabels(false, false)).toEqual({
      review: 'Mark reviewed',
      promote: 'Promote to Intel',
      copy: 'Copy source',
    });

    expect(buildArtifactActionLabels(true, true)).toEqual({
      review: 'Reviewed',
      promote: 'Promoted to Intel',
      copy: 'Copy source',
    });
  });
});