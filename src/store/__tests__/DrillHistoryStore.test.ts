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
    expect(stats).toEqual({ runs: 0, avgElapsedSec: 0, bestElapsedSec: 0 });
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
});
