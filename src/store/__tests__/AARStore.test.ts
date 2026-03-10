import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AARStore } from '../AARStore';

vi.mock('../../utils/telemetry', () => ({ trackEvent: vi.fn() }));

beforeEach(() => {
  window.localStorage.clear();
});

describe('AARStore', () => {
  it('list returns a starter entry when storage is empty', () => {
    const entries = AARStore.list();
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[0].id).toBe('aar-starter');
  });

  it('subscribe calls listener immediately with entries', () => {
    const cb = vi.fn();
    const unsub = AARStore.subscribe(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0].length).toBeGreaterThanOrEqual(1);
    unsub();
  });

  it('create adds a new entry and returns it', () => {
    const entry = AARStore.create();
    expect(entry.title).toBe('New AAR');
    expect(entry.role).toBe('ops');
    const all = AARStore.list();
    expect(all.find((e) => e.id === entry.id)).toBeTruthy();
  });

  it('save updates an existing entry', () => {
    const entry = AARStore.create();
    const updated = { ...entry, title: 'Updated AAR', updatedAt: Date.now() };
    AARStore.save(updated);
    const found = AARStore.list().find((e) => e.id === entry.id);
    expect(found?.title).toBe('Updated AAR');
  });

  it('exportEntry returns JSON string for existing entry', () => {
    const entry = AARStore.create();
    const json = AARStore.exportEntry(entry.id);
    expect(json).not.toBeNull();
    const parsed = JSON.parse(json!);
    expect(parsed.id).toBe(entry.id);
  });

  it('exportEntry returns null for unknown id', () => {
    expect(AARStore.exportEntry('nonexistent')).toBeNull();
  });

  it('subscribe notifies on create', () => {
    const cb = vi.fn();
    const unsub = AARStore.subscribe(cb);
    cb.mockClear();
    AARStore.create();
    expect(cb).toHaveBeenCalled();
    unsub();
  });
});
