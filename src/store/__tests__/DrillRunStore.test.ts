import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrillRunStore } from '../DrillRunStore';

vi.mock('../../utils/telemetry', () => ({ trackEvent: vi.fn() }));

beforeEach(() => {
  window.localStorage.clear();
});

const steps = [
  { id: 's1', label: 'Step 1' },
  { id: 's2', label: 'Step 2' },
];

describe('DrillRunStore', () => {
  it('returns null when no run is in progress', () => {
    expect(DrillRunStore.get()).toBeNull();
  });

  it('start persists a run and notifies subscribers', () => {
    const cb = vi.fn();
    const unsub = DrillRunStore.subscribe(cb);
    cb.mockClear();

    DrillRunStore.start('d1', 'Drill One', steps);
    const state = DrillRunStore.get();
    expect(state).not.toBeNull();
    expect(state!.drillId).toBe('d1');
    expect(state!.title).toBe('Drill One');
    expect(state!.steps).toHaveLength(2);
    expect(state!.completed).toBe(false);
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ drillId: 'd1' }));
    unsub();
  });

  it('toggleStep flips a step and notifies', () => {
    DrillRunStore.start('d2', 'Drill Two', steps);

    DrillRunStore.toggleStep('s1');
    const after = DrillRunStore.get()!;
    expect(after.steps.find((s) => s.id === 's1')!.done).toBe(true);
    expect(after.completed).toBe(false);
  });

  it('toggleStep marks completed when all steps are done', () => {
    DrillRunStore.start('d3', 'Drill Three', steps);
    DrillRunStore.toggleStep('s1');
    DrillRunStore.toggleStep('s2');
    expect(DrillRunStore.get()!.completed).toBe(true);
  });

  it('clear removes the run and notifies', () => {
    DrillRunStore.start('d4', 'Drill Four', steps);
    const cb = vi.fn();
    const unsub = DrillRunStore.subscribe(cb);
    cb.mockClear();

    DrillRunStore.clear();
    expect(DrillRunStore.get()).toBeNull();
    expect(cb).toHaveBeenCalledWith(null);
    unsub();
  });

  it('subscribe calls back immediately with current state', () => {
    DrillRunStore.start('d5', 'Drill Five', steps);
    const cb = vi.fn();
    const unsub = DrillRunStore.subscribe(cb);
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ drillId: 'd5' }));
    unsub();
  });

  it('flushTelemetry does not throw when queue is empty', () => {
    expect(() => DrillRunStore.flushTelemetry()).not.toThrow();
  });

  // ── Extended fields (cardId, routePath) ──

  it('start persists optional cardId and routePath on steps', () => {
    const extendedSteps = [
      { id: 's1', label: 'Step 1', cardId: 'card-abc', routePath: '/mission/brief' },
      { id: 's2', label: 'Step 2' }, // no cardId — should be undefined
    ];
    DrillRunStore.start('d6', 'Drill Six', extendedSteps);
    const state = DrillRunStore.get()!;
    expect(state.steps[0].cardId).toBe('card-abc');
    expect(state.steps[0].routePath).toBe('/mission/brief');
    expect(state.steps[1].cardId).toBeUndefined();
    expect(state.steps[1].routePath).toBeUndefined();
  });

  it('toggleStep preserves cardId and routePath', () => {
    const extendedSteps = [
      { id: 's1', label: 'Step 1', cardId: 'card-xyz' },
    ];
    DrillRunStore.start('d7', 'Drill Seven', extendedSteps);
    DrillRunStore.toggleStep('s1');
    const state = DrillRunStore.get()!;
    expect(state.steps[0].done).toBe(true);
    expect(state.steps[0].cardId).toBe('card-xyz');
  });
});
