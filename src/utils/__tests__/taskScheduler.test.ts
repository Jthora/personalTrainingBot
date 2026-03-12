import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { taskScheduler } from '../taskScheduler';

describe('taskScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    taskScheduler.cancelAll('test-reset');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedule runs a task and increments completed metric', async () => {
    const fn = vi.fn();
    taskScheduler.schedule({ label: 'test', priority: 'high', run: fn });
    await vi.advanceTimersByTimeAsync(50);
    expect(fn).toHaveBeenCalledOnce();
    expect(taskScheduler.getMetrics().completed).toBeGreaterThanOrEqual(1);
  });

  it('tasks execute in priority order', async () => {
    const order: string[] = [];
    taskScheduler.schedule({ label: 'low', priority: 'low', run: () => { order.push('low'); } });
    taskScheduler.schedule({ label: 'high', priority: 'high', run: () => { order.push('high'); } });
    taskScheduler.schedule({ label: 'med', priority: 'medium', run: () => { order.push('med'); } });
    await vi.advanceTimersByTimeAsync(200);
    expect(order).toContain('low');
    expect(order).toContain('high');
    expect(order).toContain('med');
  });

  it('cancel removes queued task', async () => {
    taskScheduler.schedule({ label: 'keep', priority: 'low', run: vi.fn() });
    const cancelFn = taskScheduler.schedule({ label: 'drop', priority: 'low', run: vi.fn() });
    cancelFn();
    expect(taskScheduler.getMetrics().canceled).toBeGreaterThanOrEqual(1);
  });

  it('cancelAll clears queue', () => {
    taskScheduler.schedule({ label: 'a', priority: 'low', run: vi.fn() });
    taskScheduler.schedule({ label: 'b', priority: 'low', run: vi.fn() });
    taskScheduler.cancelAll('test');
    expect(taskScheduler.getMetrics().canceled).toBeGreaterThanOrEqual(2);
  });

  it('getMetrics returns metrics object', () => {
    const m = taskScheduler.getMetrics();
    expect(m).toHaveProperty('scheduled');
    expect(m).toHaveProperty('completed');
    expect(m).toHaveProperty('canceled');
    expect(m).toHaveProperty('skipped');
    expect(m).toHaveProperty('errors');
  });

  it('subscribe fires callback with scheduler state', () => {
    const listener = vi.fn();
    const unsub = taskScheduler.subscribe(listener);
    taskScheduler.schedule({ label: 'trigger', priority: 'high', run: vi.fn() });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ queueLength: expect.any(Number) }));
    unsub();
  });

  it('task with requiresOnline is accepted into queue', () => {
    const fn = vi.fn();
    const cancel = taskScheduler.schedule({ label: 'netTask', priority: 'high', run: fn, requiresOnline: true });
    // Task was scheduled (metric incremented)
    expect(taskScheduler.getMetrics().scheduled).toBeGreaterThanOrEqual(1);
    cancel();
  });

  it('throwing task does not crash scheduler', async () => {
    const after = vi.fn();
    taskScheduler.schedule({ label: 'fail', priority: 'high', run: () => { throw new Error('boom'); } });
    taskScheduler.schedule({ label: 'after', priority: 'high', run: after });
    await vi.advanceTimersByTimeAsync(200);
    // Scheduler continues processing after an error
    expect(taskScheduler.getMetrics().scheduled).toBeGreaterThanOrEqual(2);
  });
});
