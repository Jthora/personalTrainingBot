import { trackEvent } from '../utils/telemetry';

type DrillStep = { id: string; label: string; done: boolean };

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

const RUN_KEY = 'ptb:drill-run';
const QUEUE_KEY = 'ptb:drill-telemetry-queue';

const readJSON = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.warn('DrillRunStore: failed to read', key, err);
    return null;
  }
};

const writeJSON = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('DrillRunStore: failed to write', key, err);
  }
};

const setRunState = (state: DrillRunState | null) => {
  if (state) {
    writeJSON(RUN_KEY, state);
  } else if (typeof window !== 'undefined') {
    window.localStorage.removeItem(RUN_KEY);
  }
};

const enqueue = (event: DrillEvent) => {
  const queue = readJSON<DrillEvent[]>(QUEUE_KEY) ?? [];
  queue.push(event);
  writeJSON(QUEUE_KEY, queue);
};

const flushQueue = () => {
  const queue = readJSON<DrillEvent[]>(QUEUE_KEY) ?? [];
  if (queue.length === 0) return;
  const online = typeof navigator !== 'undefined' ? navigator.onLine : false;
  if (!online) return;
  queue.forEach((evt) => console.info('[drill-telemetry]', evt));
  writeJSON(QUEUE_KEY, []);
};

const listeners = new Set<(state: DrillRunState | null) => void>();

const notify = (state: DrillRunState | null) => {
  listeners.forEach((fn) => fn(state));
};

export const DrillRunStore = {
  subscribe(cb: (state: DrillRunState | null) => void) {
    listeners.add(cb);
    cb(this.get());
    return () => listeners.delete(cb);
  },

  get(): DrillRunState | null {
    return readJSON<DrillRunState>(RUN_KEY);
  },

  start(drillId: string, title: string, steps: { id: string; label: string }[]) {
    const state: DrillRunState = {
      drillId,
      title,
      steps: steps.map((s) => ({ ...s, done: false })),
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    };
    setRunState(state);
    notify(state);
    const offline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    enqueue({ type: 'step-toggle', drillId, stepId: steps[0]?.id, done: false, timestamp: Date.now(), offline });
    trackEvent({ category: 'drills', action: 'drill_start', data: { drillId, title, steps: steps.length, offline }, source: 'ui' });
  },

  toggleStep(stepId: string) {
    const current = this.get();
    if (!current) return;
    const steps = current.steps.map((step) => (step.id === stepId ? { ...step, done: !step.done } : step));
    const completed = steps.every((s) => s.done);
    const next: DrillRunState = {
      ...current,
      steps,
      completed,
      updatedAt: Date.now(),
    };
    setRunState(next);
    notify(next);
    const offline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    enqueue({ type: completed ? 'complete' : 'step-toggle', drillId: current.drillId, stepId, done: steps.find((s) => s.id === stepId)?.done, timestamp: Date.now(), offline });
    trackEvent({ category: 'drills', action: completed ? 'drill_complete' : 'step_complete', data: { drillId: current.drillId, stepId, done: steps.find((s) => s.id === stepId)?.done, offline }, source: 'ui' });
  },

  clear() {
    const current = this.get();
    setRunState(null);
    notify(null);
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