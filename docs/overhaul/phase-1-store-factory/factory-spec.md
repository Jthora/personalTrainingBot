# createStore<T>() — Factory Specification

## API

```typescript
// src/store/createStore.ts

interface StoreOptions<T> {
  /** localStorage key */
  key: string;

  /** Default value when storage is empty or corrupt */
  defaultValue: T;

  /** Optional version string appended to key for migrations */
  version?: string;

  /** Optional validator — return false to reject corrupt data and fall back to default */
  validate?: (data: unknown) => data is T;

  /** Maximum entries (for array stores only) */
  maxEntries?: number;
}

interface Store<T> {
  /** Read current value (from memory cache, hydrated from localStorage on first call) */
  get(): T;

  /** Replace entire state */
  set(value: T): void;

  /** Functional update — read current, apply transform, write result */
  update(fn: (current: T) => T): void;

  /** Subscribe to changes. Returns unsubscribe function. */
  subscribe(fn: () => void): () => void;

  /** Clear state back to default */
  reset(): void;

  /** Force re-read from localStorage (useful after external write) */
  hydrate(): void;
}

function createStore<T>(options: StoreOptions<T>): Store<T>;
```

## Internal Implementation

```typescript
function createStore<T>(options: StoreOptions<T>): Store<T> {
  const { key, defaultValue, validate, maxEntries } = options;
  const versionedKey = options.version ? `${key}:${options.version}` : key;
  const listeners = new Set<() => void>();
  let cached: T | undefined;

  const notify = () => {
    listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error(`Store ${versionedKey}: listener error`, e); }
    });
  };

  const read = (): T => {
    try {
      const raw = window.localStorage.getItem(versionedKey);
      if (raw === null) return defaultValue;
      const parsed = JSON.parse(raw) as unknown;
      if (validate && !validate(parsed)) {
        console.warn(`Store ${versionedKey}: validation failed, using default`);
        return defaultValue;
      }
      return parsed as T;
    } catch {
      console.warn(`Store ${versionedKey}: parse error, using default`);
      return defaultValue;
    }
  };

  const write = (value: T) => {
    try {
      const toWrite = maxEntries && Array.isArray(value)
        ? (value.slice(0, maxEntries) as unknown as T)
        : value;
      window.localStorage.setItem(versionedKey, JSON.stringify(toWrite));
      cached = toWrite;
    } catch (e) {
      console.error(`Store ${versionedKey}: write error`, e);
    }
  };

  return {
    get(): T {
      if (cached === undefined) cached = read();
      return cached;
    },

    set(value: T) {
      write(value);
      notify();
    },

    update(fn: (current: T) => T) {
      const current = this.get();
      const next = fn(current);
      write(next);
      notify();
    },

    subscribe(fn: () => void): () => void {
      listeners.add(fn);
      return () => { listeners.delete(fn); };
    },

    reset() {
      write(defaultValue);
      notify();
    },

    hydrate() {
      cached = read();
    },
  };
}
```

## Design Decisions

### Memory Cache
The factory caches the last-read value in memory. This avoids repeated JSON.parse on every `get()` call, which the current stores don't do consistently (some parse every time, some cache).

### Validation
The optional `validate` function catches corrupt localStorage data gracefully. Currently, some stores have this (e.g. `DrillFilterStore.isFiltersShape`), most don't.

### maxEntries
For collection stores like `DrillHistoryStore` that cap at 100 entries, the factory handles truncation at write time.

### Error Isolation
Listener errors are caught individually — one broken subscriber doesn't prevent others from being notified. Current stores don't do this.

### No Generics for Listen Payload
The `subscribe` callback is `() => void`, not `(value: T) => void`. This matches the existing store pattern — subscribers call `store.get()` when notified. Only `DrillRunStore` passes the value directly; it can use a thin wrapper on top of the factory.

## Test Specification

```typescript
// src/store/__tests__/createStore.test.ts

describe('createStore', () => {
  it('returns defaultValue when localStorage is empty');
  it('reads and parses from localStorage');
  it('writes and notifies on set()');
  it('applies functional transform on update()');
  it('returns unsubscribe function from subscribe()');
  it('resets to defaultValue on reset()');
  it('re-reads from localStorage on hydrate()');
  it('falls back to default on corrupt JSON');
  it('falls back to default on validation failure');
  it('caps array length when maxEntries is set');
  it('catches listener errors without breaking other subscribers');
  it('applies version suffix to key when specified');
});
```

## Usage Example (After Migration)

### Before: ArtifactActionStore (112 lines)
```typescript
const STORE_KEY = 'ptb:artifact-actions';
type Listener = () => void;
const listeners = new Set<Listener>();
const readState = (): Record<string, ArtifactActionRecord> => { ... };
const writeState = (state: Record<string, ArtifactActionRecord>) => { ... };
const notify = (state: Record<string, ArtifactActionRecord>) => { ... };
// ... 80+ lines of plumbing + domain logic
```

### After: ArtifactActionStore (~30 lines)
```typescript
import { createStore } from './createStore';

export type ArtifactActionRecord = { ... };

const store = createStore<Record<string, ArtifactActionRecord>>({
  key: 'ptb:artifact-actions',
  defaultValue: {},
});

export const ArtifactActionStore = {
  getAll: store.get,
  subscribe: store.subscribe,

  markShared(artifactId: string) {
    store.update(state => {
      const record = state[artifactId] ?? { shared: false, downloaded: false, viewCount: 0 };
      return { ...state, [artifactId]: { ...record, shared: true } };
    });
  },

  markDownloaded(artifactId: string) { ... },
  incrementView(artifactId: string) { ... },
};
```
