import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArtifactActionStore } from '../ArtifactActionStore';

describe('ArtifactActionStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    ArtifactActionStore.clearAll();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    expect(ArtifactActionStore.getAll()).toEqual({});
    expect(ArtifactActionStore.reviewedCount()).toBe(0);
    expect(ArtifactActionStore.promotedCount()).toBe(0);
  });

  it('markReviewed persists reviewed flag', () => {
    ArtifactActionStore.markReviewed('art-1');
    const record = ArtifactActionStore.get('art-1');
    expect(record).not.toBeNull();
    expect(record!.reviewed).toBe(true);
    expect(record!.promoted).toBe(false);
  });

  it('markPromoted persists promoted flag', () => {
    ArtifactActionStore.markPromoted('art-1');
    const record = ArtifactActionStore.get('art-1');
    expect(record!.promoted).toBe(true);
    expect(record!.reviewed).toBe(false);
  });

  it('toggleReviewed flips the reviewed flag', () => {
    ArtifactActionStore.markReviewed('art-1');
    expect(ArtifactActionStore.get('art-1')!.reviewed).toBe(true);

    ArtifactActionStore.toggleReviewed('art-1');
    expect(ArtifactActionStore.get('art-1')!.reviewed).toBe(false);

    ArtifactActionStore.toggleReviewed('art-1');
    expect(ArtifactActionStore.get('art-1')!.reviewed).toBe(true);
  });

  it('togglePromoted flips the promoted flag', () => {
    ArtifactActionStore.markPromoted('art-1');
    ArtifactActionStore.togglePromoted('art-1');
    expect(ArtifactActionStore.get('art-1')!.promoted).toBe(false);
  });

  it('get returns null for unknown artifact', () => {
    expect(ArtifactActionStore.get('nonexistent')).toBeNull();
  });

  it('reviewedCount and promotedCount are correct', () => {
    ArtifactActionStore.markReviewed('a');
    ArtifactActionStore.markReviewed('b');
    ArtifactActionStore.markPromoted('b');
    ArtifactActionStore.markPromoted('c');
    expect(ArtifactActionStore.reviewedCount()).toBe(2);
    expect(ArtifactActionStore.promotedCount()).toBe(2);
  });

  it('clear removes a specific artifact', () => {
    ArtifactActionStore.markReviewed('a');
    ArtifactActionStore.markReviewed('b');
    ArtifactActionStore.clear('a');
    expect(ArtifactActionStore.get('a')).toBeNull();
    expect(ArtifactActionStore.get('b')).not.toBeNull();
  });

  it('subscribe fires on mutations', () => {
    const spy = vi.fn();
    const unsub = ArtifactActionStore.subscribe(spy);
    spy.mockClear();

    ArtifactActionStore.markReviewed('x');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]['x'].reviewed).toBe(true);

    unsub();
  });
});
