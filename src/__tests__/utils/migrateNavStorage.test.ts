import { describe, it, expect, beforeEach, vi } from 'vitest';
import { migrateNavStorage, mapMissionPathToAppPath } from '../../utils/migrateNavStorage';

describe('migrateNavStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('migrates guidance-mode if present', () => {
    localStorage.setItem('mission:guidance-mode:v1', 'ops');
    migrateNavStorage();
    expect(localStorage.getItem('ptb:guidance-mode:v1')).toBe('ops');
    expect(localStorage.getItem('ptb:shell-v2-migrated')).toBe('done');
  });

  it('migrates checkpoint with path mapping', () => {
    localStorage.setItem(
      'ptb:mission-flow-checkpoint',
      JSON.stringify({ path: '/mission/stats', updatedAt: 1000 }),
    );
    migrateNavStorage();
    const result = JSON.parse(localStorage.getItem('ptb:app-checkpoint:v1')!);
    expect(result.path).toBe('/progress');
    expect(result.updatedAt).toBe(1000);
  });

  it('maps unknown checkpoint paths to /train', () => {
    localStorage.setItem(
      'ptb:mission-flow-checkpoint',
      JSON.stringify({ path: '/unknown/route' }),
    );
    migrateNavStorage();
    const result = JSON.parse(localStorage.getItem('ptb:app-checkpoint:v1')!);
    expect(result.path).toBe('/train');
  });

  it('is idempotent — does not run twice', () => {
    localStorage.setItem('mission:guidance-mode:v1', 'assist');
    migrateNavStorage();
    // Remove original, change migrated copy
    localStorage.removeItem('mission:guidance-mode:v1');
    localStorage.setItem('ptb:guidance-mode:v1', 'changed');
    migrateNavStorage();
    expect(localStorage.getItem('ptb:guidance-mode:v1')).toBe('changed');
  });

  it('survives missing data gracefully', () => {
    expect(() => migrateNavStorage()).not.toThrow();
    expect(localStorage.getItem('ptb:shell-v2-migrated')).toBe('done');
  });

  it('survives corrupted checkpoint JSON', () => {
    localStorage.setItem('ptb:mission-flow-checkpoint', 'not-json');
    expect(() => migrateNavStorage()).not.toThrow();
    expect(localStorage.getItem('ptb:app-checkpoint:v1')).toBeNull();
    expect(localStorage.getItem('ptb:shell-v2-migrated')).toBe('done');
  });
});

describe('mapMissionPathToAppPath', () => {
  it.each([
    ['/mission/training', '/train'],
    ['/mission/stats', '/progress'],
    ['/mission/signal', '/review'],
    ['/mission/debrief', '/profile'],
    ['/mission/checklist', '/train'],
    ['/mission/brief', '/train'],
    ['/unknown', '/train'],
  ])('maps %s → %s', (input, expected) => {
    expect(mapMissionPathToAppPath(input)).toBe(expected);
  });
});
