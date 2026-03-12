import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DrillFilterStore from '../DrillFilterStore';
import type { DrillFilters } from '../DrillFilterStore';

describe('DrillFilterStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    DrillFilterStore.clearFilters();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns defaults when no persisted state', () => {
    const filters = DrillFilterStore.getFiltersSync();
    expect(filters.search).toBe('');
    expect(filters.duration).toBe('any');
    expect(filters.equipment).toEqual([]);
    expect(filters.themes).toEqual([]);
    expect(filters.difficultyMin).toBe(1);
    expect(filters.difficultyMax).toBe(10);
  });

  it('saveFilters updates search text', () => {
    const filters = DrillFilterStore.getFiltersSync();
    DrillFilterStore.saveFilters({ ...filters, search: 'tactical' });
    expect(DrillFilterStore.getFiltersSync().search).toBe('tactical');
  });

  it('saveFilters updates duration', () => {
    const filters = DrillFilterStore.getFiltersSync();
    DrillFilterStore.saveFilters({ ...filters, duration: '20' });
    expect(DrillFilterStore.getFiltersSync().duration).toBe('20');
  });

  it('saveFilters updates difficulty range', () => {
    const filters = DrillFilterStore.getFiltersSync();
    DrillFilterStore.saveFilters({ ...filters, difficultyMin: 3, difficultyMax: 8 });
    const updated = DrillFilterStore.getFiltersSync();
    expect(updated.difficultyMin).toBe(3);
    expect(updated.difficultyMax).toBe(8);
  });

  it('clearFilters resets to defaults', () => {
    const filters = DrillFilterStore.getFiltersSync();
    DrillFilterStore.saveFilters({ ...filters, search: 'test', difficultyMin: 5 });
    DrillFilterStore.clearFilters();
    const reset = DrillFilterStore.getFiltersSync();
    expect(reset.search).toBe('');
    expect(reset.difficultyMin).toBe(1);
  });

  it('persists and hydrates from localStorage', () => {
    const custom: DrillFilters = {
      search: 'cqb',
      duration: '30',
      equipment: ['rope', 'mat'],
      themes: ['combat'],
      difficultyMin: 2,
      difficultyMax: 9,
    };
    DrillFilterStore.saveFilters(custom);
    // Verify localStorage was written
    const raw = localStorage.getItem('drillFilters:v1');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.search).toBe('cqb');
    expect(parsed.equipment).toEqual(['rope', 'mat']);
  });

  it('addListener fires on changes and returns unsubscribe', () => {
    const spy = vi.fn();
    const unsub = DrillFilterStore.addListener(spy);
    spy.mockClear();

    const filters = DrillFilterStore.getFiltersSync();
    DrillFilterStore.saveFilters({ ...filters, search: 'observe' });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].search).toBe('observe');

    unsub();
  });

  it('getFilters async returns same result as sync', async () => {
    const sync = DrillFilterStore.getFiltersSync();
    const asyncResult = await DrillFilterStore.getFilters();
    expect(asyncResult).toEqual(sync);
  });
});
