import { describe, it, expect, beforeEach } from 'vitest';
import DrillHistoryStore from '../DrillHistoryStore';

beforeEach(() => {
  window.localStorage.clear();
});

describe('DrillHistoryStore', () => {
  it('starts empty', () => {
    expect(DrillHistoryStore.list()).toEqual([]);
    expect(DrillHistoryStore.count()).toBe(0);
  });

  it('records an entry and returns it', () => {
    const entry = DrillHistoryStore.record({
      drillId: 'drill-1',
      title: 'Alpha drill',
      elapsedSec: 120,
      stepCount: 3,
      completedAt: '2026-03-09T10:00:00Z',
    });
    expect(entry.id).toContain('drill-1');
    expect(entry.drillId).toBe('drill-1');
    expect(DrillHistoryStore.count()).toBe(1);
  });

  it('stores entries most-recent-first', () => {
    DrillHistoryStore.record({
      drillId: 'drill-1', title: 'First', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-09T10:00:00Z',
    });
    DrillHistoryStore.record({
      drillId: 'drill-2', title: 'Second', elapsedSec: 90, stepCount: 3,
      completedAt: '2026-03-09T10:01:00Z',
    });
    const list = DrillHistoryStore.list();
    expect(list.length).toBe(2);
    expect(list[0].drillId).toBe('drill-2');
    expect(list[1].drillId).toBe('drill-1');
  });

  it('lastForDrill returns most recent matching entry', () => {
    DrillHistoryStore.record({
      drillId: 'drill-a', title: 'A', elapsedSec: 100, stepCount: 2,
      completedAt: '2026-03-09T10:00:00Z',
    });
    DrillHistoryStore.record({
      drillId: 'drill-b', title: 'B', elapsedSec: 80, stepCount: 3,
      completedAt: '2026-03-09T10:01:00Z',
    });
    DrillHistoryStore.record({
      drillId: 'drill-a', title: 'A again', elapsedSec: 90, stepCount: 2,
      completedAt: '2026-03-09T10:02:00Z',
    });
    const last = DrillHistoryStore.lastForDrill('drill-a');
    expect(last?.title).toBe('A again');
  });

  it('lastForDrill returns null for unknown drillId', () => {
    expect(DrillHistoryStore.lastForDrill('nonexistent')).toBeNull();
  });

  it('statsForDrill computes runs, avg, and best', () => {
    DrillHistoryStore.record({
      drillId: 'x', title: 'X', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-09T10:00:00Z',
    });
    DrillHistoryStore.record({
      drillId: 'x', title: 'X', elapsedSec: 80, stepCount: 2,
      completedAt: '2026-03-09T10:01:00Z',
    });
    DrillHistoryStore.record({
      drillId: 'x', title: 'X', elapsedSec: 100, stepCount: 2,
      completedAt: '2026-03-09T10:02:00Z',
    });
    const stats = DrillHistoryStore.statsForDrill('x');
    expect(stats.runs).toBe(3);
    expect(stats.avgElapsedSec).toBe(80);
    expect(stats.bestElapsedSec).toBe(60);
  });

  it('statsForDrill returns zeros for unknown drillId', () => {
    const stats = DrillHistoryStore.statsForDrill('none');
    expect(stats).toEqual({ runs: 0, avgElapsedSec: 0, bestElapsedSec: 0, avgAssessment: null });
  });

  it('caps at 100 entries', () => {
    for (let i = 0; i < 110; i++) {
      DrillHistoryStore.record({
        drillId: `d-${i}`, title: `Drill ${i}`, elapsedSec: 10, stepCount: 1,
        completedAt: new Date().toISOString(),
      });
    }
    expect(DrillHistoryStore.count()).toBe(100);
  });

  it('clear removes all history', () => {
    DrillHistoryStore.record({
      drillId: 'drill-1', title: 'X', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-09T10:00:00Z',
    });
    expect(DrillHistoryStore.count()).toBe(1);
    DrillHistoryStore.clear();
    expect(DrillHistoryStore.count()).toBe(0);
  });

  // ── Extended fields (notes, selfAssessment, domainId) ──

  it('record persists and retrieves optional notes and selfAssessment', () => {
    const entry = DrillHistoryStore.record({
      drillId: 'drill-notes', title: 'Notes Drill', elapsedSec: 45, stepCount: 3,
      completedAt: '2026-03-10T10:00:00Z',
      notes: 'Learned about cipher rotation',
      selfAssessment: 4,
      domainId: 'cryptography',
    });
    expect(entry.notes).toBe('Learned about cipher rotation');
    expect(entry.selfAssessment).toBe(4);
    expect(entry.domainId).toBe('cryptography');

    const retrieved = DrillHistoryStore.lastForDrill('drill-notes');
    expect(retrieved?.notes).toBe('Learned about cipher rotation');
    expect(retrieved?.selfAssessment).toBe(4);
    expect(retrieved?.domainId).toBe('cryptography');
  });

  it('record works without optional fields (backward-compatible)', () => {
    const entry = DrillHistoryStore.record({
      drillId: 'drill-legacy', title: 'Legacy Drill', elapsedSec: 30, stepCount: 2,
      completedAt: '2026-03-10T10:01:00Z',
    });
    expect(entry.notes).toBeUndefined();
    expect(entry.selfAssessment).toBeUndefined();
    expect(entry.domainId).toBeUndefined();
  });

  it('statsForDrill includes avgAssessment when ratings exist', () => {
    DrillHistoryStore.record({
      drillId: 'rated', title: 'R', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-10T10:00:00Z', selfAssessment: 3,
    });
    DrillHistoryStore.record({
      drillId: 'rated', title: 'R', elapsedSec: 80, stepCount: 2,
      completedAt: '2026-03-10T10:01:00Z', selfAssessment: 5,
    });
    const stats = DrillHistoryStore.statsForDrill('rated');
    expect(stats.avgAssessment).toBe(4);
  });

  it('statsForDrill returns null avgAssessment when no ratings', () => {
    DrillHistoryStore.record({
      drillId: 'unrated', title: 'U', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-10T10:00:00Z',
    });
    const stats = DrillHistoryStore.statsForDrill('unrated');
    expect(stats.avgAssessment).toBeNull();
  });

  it('statsForDomain aggregates across drills in a domain', () => {
    DrillHistoryStore.record({
      drillId: 'd1', title: 'D1', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-10T10:00:00Z', domainId: 'osint', selfAssessment: 3,
    });
    DrillHistoryStore.record({
      drillId: 'd2', title: 'D2', elapsedSec: 80, stepCount: 3,
      completedAt: '2026-03-10T10:01:00Z', domainId: 'osint', selfAssessment: 5,
    });
    DrillHistoryStore.record({
      drillId: 'd3', title: 'D3', elapsedSec: 40, stepCount: 1,
      completedAt: '2026-03-10T10:02:00Z', domainId: 'crypto',
    });
    const osintStats = DrillHistoryStore.statsForDomain('osint');
    expect(osintStats.runs).toBe(2);
    expect(osintStats.uniqueDrills).toBe(2);
    expect(osintStats.avgAssessment).toBe(4);
    expect(osintStats.lastActiveDate).toBe('2026-03-10T10:01:00Z');

    const cryptoStats = DrillHistoryStore.statsForDomain('crypto');
    expect(cryptoStats.runs).toBe(1);
    expect(cryptoStats.uniqueDrills).toBe(1);
    expect(cryptoStats.avgAssessment).toBeNull();
  });

  it('statsForDomain returns zeros for unknown domain', () => {
    const stats = DrillHistoryStore.statsForDomain('nonexistent');
    expect(stats).toEqual({ runs: 0, avgAssessment: null, uniqueDrills: 0, lastActiveDate: null });
  });

  // -- Assessment trend tests -----------------------------------------------

  it('assessmentTrendForDomain returns null with fewer than 4 rated entries', () => {
    DrillHistoryStore.record({
      drillId: 'd1', title: 'D1', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-01T10:00:00Z', domainId: 'trend-test', selfAssessment: 3,
    });
    DrillHistoryStore.record({
      drillId: 'd2', title: 'D2', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-02T10:00:00Z', domainId: 'trend-test', selfAssessment: 4,
    });
    expect(DrillHistoryStore.assessmentTrendForDomain('trend-test')).toBeNull();
  });

  it('assessmentTrendForDomain returns improving when recent ratings are higher', () => {
    // Older entries (lower ratings) — stored most-recent-first, so these are recorded first
    DrillHistoryStore.record({
      drillId: 'd1', title: 'D1', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-01T10:00:00Z', domainId: 'trend-up', selfAssessment: 2,
    });
    DrillHistoryStore.record({
      drillId: 'd2', title: 'D2', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-02T10:00:00Z', domainId: 'trend-up', selfAssessment: 2,
    });
    // Recent entries (higher ratings) — recorded later so they appear first in the list
    DrillHistoryStore.record({
      drillId: 'd3', title: 'D3', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-03T10:00:00Z', domainId: 'trend-up', selfAssessment: 4,
    });
    DrillHistoryStore.record({
      drillId: 'd4', title: 'D4', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-04T10:00:00Z', domainId: 'trend-up', selfAssessment: 5,
    });
    expect(DrillHistoryStore.assessmentTrendForDomain('trend-up')).toBe('improving');
  });

  it('assessmentTrendForDomain returns declining when recent ratings are lower', () => {
    DrillHistoryStore.record({
      drillId: 'd1', title: 'D1', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-01T10:00:00Z', domainId: 'trend-down', selfAssessment: 5,
    });
    DrillHistoryStore.record({
      drillId: 'd2', title: 'D2', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-02T10:00:00Z', domainId: 'trend-down', selfAssessment: 5,
    });
    DrillHistoryStore.record({
      drillId: 'd3', title: 'D3', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-03T10:00:00Z', domainId: 'trend-down', selfAssessment: 2,
    });
    DrillHistoryStore.record({
      drillId: 'd4', title: 'D4', elapsedSec: 60, stepCount: 2,
      completedAt: '2026-03-04T10:00:00Z', domainId: 'trend-down', selfAssessment: 1,
    });
    expect(DrillHistoryStore.assessmentTrendForDomain('trend-down')).toBe('declining');
  });

  it('assessmentTrendForDomain returns stable when ratings are consistent', () => {
    for (let i = 0; i < 6; i++) {
      DrillHistoryStore.record({
        drillId: `d${i}`, title: `D${i}`, elapsedSec: 60, stepCount: 2,
        completedAt: `2026-03-0${i + 1}T10:00:00Z`, domainId: 'trend-stable', selfAssessment: 3,
      });
    }
    expect(DrillHistoryStore.assessmentTrendForDomain('trend-stable')).toBe('stable');
  });

  it('assessmentTrendForDomain returns null for unknown domain', () => {
    expect(DrillHistoryStore.assessmentTrendForDomain('nonexistent')).toBeNull();
  });
});
