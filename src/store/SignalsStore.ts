import { sampleSignals, type SignalEntry, type SignalRole, type SignalStatus } from '../data/signals/sampleSignals';
import { trackEvent } from '../utils/telemetry';

const SIGNALS_KEY = 'ptb:signals';
const SIGNAL_QUEUE_KEY = 'ptb:signals-queue';

type SignalUpdateEvent = {
  id: string;
  action: 'add' | 'ack' | 'resolve';
  payload?: Partial<SignalEntry>;
  timestamp: number;
  offline: boolean;
};

type Listener = (signals: SignalEntry[], queueLength: number) => void;

const listeners = new Set<Listener>();

const readJSON = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.warn('[SignalsStore] read failed', key, err);
    return null;
  }
};

const writeJSON = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[SignalsStore] write failed', key, err);
  }
};

const ensureSeeds = (): SignalEntry[] => {
  const existing = readJSON<SignalEntry[]>(SIGNALS_KEY);
  if (existing && existing.length > 0) return existing;
  writeJSON(SIGNALS_KEY, sampleSignals);
  return sampleSignals;
};

const enqueue = (event: SignalUpdateEvent) => {
  const queue = readJSON<SignalUpdateEvent[]>(SIGNAL_QUEUE_KEY) ?? [];
  queue.push(event);
  writeJSON(SIGNAL_QUEUE_KEY, queue);
};

const flushQueue = () => {
  const queue = readJSON<SignalUpdateEvent[]>(SIGNAL_QUEUE_KEY) ?? [];
  if (queue.length === 0) return;
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!online) return;
  queue.forEach((evt) => console.info('[signals-queue]', evt));
  writeJSON(SIGNAL_QUEUE_KEY, []);
};

const setSignals = (signals: SignalEntry[]) => {
  writeJSON(SIGNALS_KEY, signals);
  const queue = readJSON<SignalUpdateEvent[]>(SIGNAL_QUEUE_KEY) ?? [];
  listeners.forEach((cb) => cb(signals, queue.length));
};

const getSignals = (): SignalEntry[] => {
  const data = ensureSeeds();
  return [...data].sort((a, b) => b.updatedAt - a.updatedAt);
};

const updateStatus = (id: string, status: SignalStatus) => {
  const signals = getSignals();
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const next = signals.map((sig) => (sig.id === id ? { ...sig, status, updatedAt: Date.now() } : sig));
  setSignals(next);
  enqueue({ id, action: status === 'ack' ? 'ack' : 'resolve', timestamp: Date.now(), offline: !online });
  trackEvent({ category: 'signals', action: status === 'ack' ? 'signal_ack' : 'signal_resolve', data: { id, status, offline: !online }, source: 'ui' });
  flushQueue();
};

export const SignalsStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(getSignals(), (readJSON<SignalUpdateEvent[]>(SIGNAL_QUEUE_KEY) ?? []).length);
    return () => {
      listeners.delete(listener);
    };
  },

  list(): SignalEntry[] {
    return getSignals();
  },

  add(title: string, detail: string, role: SignalRole) {
    const signals = getSignals();
    const id = `sig-${Date.now()}`;
    const now = Date.now();
    const entry: SignalEntry = {
      id,
      title,
      detail,
      role,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    const next = [entry, ...signals];
    setSignals(next);
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    enqueue({ id, action: 'add', payload: entry, timestamp: now, offline: !online });
    trackEvent({ category: 'signals', action: 'signal_create', data: { id, role, offline: !online }, source: 'ui' });
    flushQueue();
  },

  acknowledge(id: string) {
    updateStatus(id, 'ack');
  },

  resolve(id: string) {
    updateStatus(id, 'resolved');
  },

  resetToSample() {
    writeJSON(SIGNAL_QUEUE_KEY, []);
    setSignals(sampleSignals);
  },

  queueLength(): number {
    return (readJSON<SignalUpdateEvent[]>(SIGNAL_QUEUE_KEY) ?? []).length;
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', flushQueue);
}
