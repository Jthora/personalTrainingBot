import { trackEvent } from '../utils/telemetry';
import { createStore } from './createStore';

type DrillStep = { id: string; label: string; done: boolean; cardId?: string; routePath?: string };

export type DrillRunState = {
  drillId: string;
  title: string;
  steps: DrillStep[];
  startedAt: number;
  updatedAt: number;
  completed: boolean;
};

type DrillEvent = {
  type: 'step-toggle' | 'complete';
  drillId: string;
  stepId?: string;
  done?: boolean;
  timestamp: number;
  offline: boolean;
};

const runStore = createStore<DrillRunState | null>({
  key: 'ptb:drill-run',
  defaultValue: null,
});

const queueStore = createStore<DrillEvent[]>({
  key: 'ptb:drill-telemetry-queue',
  defaultValue: [],
});

const enqueue = (event: DrillEvent) => {
  queueStore.update((prev) => [...prev, event]);
};

const flushQueue = () => {
  const queue = queueStore.get();
  if (queue.length === 0) return;
  const online = typeof navigator !== 'undefined' ? navigator.onLine : false;
  if (!online) return;
  queue.forEach((evt) => console.info('[drill-telemetry]', evt));
  queueStore.reset();
};

export const DrillRunStore = {
  subscribe(cb: (state: DrillRunState | null) => void) {
    return runStore.subscribe(cb);
  },

  get(): DrillRunState | null {
    return runStore.get();
  },

  start(drillId: string, title: string, steps: { id: string; label: string; cardId?: string; routePath?: string }[]) {
    const state: DrillRunState = {
      drillId,
      title,
      steps: steps.map((s) => ({ id: s.id, label: s.label, done: false, cardId: s.cardId, routePath: s.routePath })),
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    };
    runStore.set(state);
    const offline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    enqueue({ type: 'step-toggle', drillId, stepId: steps[0]?.id, done: false, timestamp: Date.now(), offline });
    trackEvent({ category: 'drills', action: 'drill_start', data: { drillId, title, steps: steps.length, offline }, source: 'ui' });
  },

  toggleStep(stepId: string) {
    const current = runStore.get();
    if (!current) return;
    const steps = current.steps.map((step) => (step.id === stepId ? { ...step, done: !step.done } : step));
    const completed = steps.every((s) => s.done);
    const next: DrillRunState = {
      ...current,
      steps,
      completed,
      updatedAt: Date.now(),
    };
    runStore.set(next);
    const offline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    enqueue({ type: completed ? 'complete' : 'step-toggle', drillId: current.drillId, stepId, done: steps.find((s) => s.id === stepId)?.done, timestamp: Date.now(), offline });
    trackEvent({ category: 'drills', action: completed ? 'drill_complete' : 'step_complete', data: { drillId: current.drillId, stepId, done: steps.find((s) => s.id === stepId)?.done, offline }, source: 'ui' });
  },

  clear() {
    const current = runStore.get();
    runStore.reset();
    if (current) {
      trackEvent({ category: 'drills', action: 'drill_abort', data: { drillId: current.drillId, reason: 'reset' }, source: 'ui' });
    }
  },

  flushTelemetry() {
    flushQueue();
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => flushQueue());
}