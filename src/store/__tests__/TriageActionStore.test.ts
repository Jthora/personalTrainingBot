import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TriageActionStore } from '../TriageActionStore';

describe('TriageActionStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    TriageActionStore.clearAll();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    expect(TriageActionStore.getAll()).toEqual({});
    expect(TriageActionStore.count()).toBe(0);
  });

  it('record persists action to localStorage', () => {
    TriageActionStore.record('entity-1', 'ack', 'medium', 'pending', 'new');
    const record = TriageActionStore.get('entity-1');
    expect(record).not.toBeNull();
    expect(record!.action).toBe('ack');
    expect(record!.severity).toBe('medium');
    expect(record!.domainStatus).toBe('new');
    expect(typeof record!.updatedAt).toBe('number');

    // Persisted
    const raw = localStorage.getItem('ptb:triage-actions');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)['entity-1']).toBeDefined();
  });

  it('get returns null for unknown entity', () => {
    expect(TriageActionStore.get('nonexistent')).toBeNull();
  });

  it('record overwrites previous action for same entity', () => {
    TriageActionStore.record('entity-1', 'ack', 'medium', 'pending', 'new');
    TriageActionStore.record('entity-1', 'escalate', 'high', 'active', 'acknowledged');
    const record = TriageActionStore.get('entity-1');
    expect(record!.action).toBe('escalate');
    expect(record!.severity).toBe('high');
  });

  it('count returns number of triaged entities', () => {
    TriageActionStore.record('a', 'ack', 'low', 's', 'new');
    TriageActionStore.record('b', 'defer', 'medium', 's', 'new');
    TriageActionStore.record('c', 'resolve', 'high', 's', 'acknowledged');
    expect(TriageActionStore.count()).toBe(3);
  });

  it('byAction groups entity IDs by action type', () => {
    TriageActionStore.record('a', 'ack', 'low', 's', 'new');
    TriageActionStore.record('b', 'escalate', 'high', 's', 'new');
    TriageActionStore.record('c', 'ack', 'medium', 's', 'new');
    TriageActionStore.record('d', 'resolve', 'low', 's', 'acknowledged');
    const groups = TriageActionStore.byAction();
    expect(groups.ack).toEqual(expect.arrayContaining(['a', 'c']));
    expect(groups.escalate).toEqual(['b']);
    expect(groups.resolve).toEqual(['d']);
    expect(groups.defer).toEqual([]);
  });

  it('clear removes a specific entity', () => {
    TriageActionStore.record('a', 'ack', 'low', 's', 'new');
    TriageActionStore.record('b', 'defer', 'medium', 's', 'new');
    TriageActionStore.clear('a');
    expect(TriageActionStore.get('a')).toBeNull();
    expect(TriageActionStore.get('b')).not.toBeNull();
    expect(TriageActionStore.count()).toBe(1);
  });

  it('subscribe fires on mutations', () => {
    const spy = vi.fn();
    const unsub = TriageActionStore.subscribe(spy);
    spy.mockClear(); // ignore initial call

    TriageActionStore.record('x', 'ack', 'low', 's', 'new');
    expect(spy).toHaveBeenCalled();
    const state = spy.mock.calls[0][0];
    expect(state['x']).toBeDefined();

    unsub();
  });
});
