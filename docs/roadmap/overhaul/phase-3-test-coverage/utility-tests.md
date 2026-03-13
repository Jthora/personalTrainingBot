# Utility Test Plans

Test plans for critical untested utility files.

---

## 1. telemetry.ts (165 lines) — HIGH

**Path:** `src/utils/__tests__/telemetry.test.ts`

**What it does:** Core telemetry infrastructure — event tracking, batching, flush-on-unload, error capture, performance marks.

**Mocks needed:**
- `navigator.sendBeacon` — for flush-on-unload
- `performance.mark` / `performance.measure` — for perf tracking
- `window.addEventListener('beforeunload')` — for flush trigger

**Test cases (~10):**
```
✅ track() queues event with timestamp and type
✅ track() validates event shape (type required)
✅ batch flushes when queue reaches threshold
✅ flush sends queued events via sendBeacon
✅ flush clears queue after successful send
✅ flush is called on beforeunload
✅ captureError includes error metadata
✅ markStart/markEnd create performance marks
✅ disable() prevents further tracking
✅ handles sendBeacon failure gracefully (no throw)
```

---

## 2. taskScheduler.ts (233 lines) — HIGH

**Path:** `src/utils/__tests__/taskScheduler.test.ts`

**What it does:** Background task scheduler — registers tasks with priorities, schedules during idle time, respects deadlines, handles task cancellation.

**Mocks needed:**
- `requestIdleCallback` / `cancelIdleCallback` (polyfill or mock)
- `vi.useFakeTimers()` for deadline testing
- `performance.now()` for timing assertions

**Test cases (~10):**
```
✅ registerTask adds task to queue
✅ tasks execute in priority order
✅ high-priority tasks preempt low-priority
✅ task respects deadline (yields if time remaining < threshold)
✅ cancelTask removes task from queue
✅ cancelTask prevents execution of pending task
✅ completed tasks are removed from queue
✅ error in one task doesn't block others
✅ flushAll executes all pending tasks immediately
✅ idle callback is requested when tasks are queued
```

---

## 3. indexedDbCache.ts (248 lines) — MEDIUM

**Path:** `src/utils/cache/__tests__/indexedDbCache.test.ts`

**What it does:** IndexedDB-based caching layer — get/set/delete with TTL, quota management, version migrations.

**Mocks needed:**
- `indexedDB` — use `fake-indexeddb` or `idb` mock
- Vitest `vi.useFakeTimers()` for TTL testing

**Test cases (~8):**
```
✅ set() stores value in IndexedDB
✅ get() retrieves stored value
✅ get() returns null for expired TTL
✅ delete() removes entry
✅ clear() removes all entries
✅ respects maxEntries quota (LRU eviction)
✅ handles IndexedDB errors gracefully (fallback to null)
✅ version migration upgrades database schema
```

---

## 4. DrillDataLoader.ts (225 lines) — MEDIUM

**Path:** `src/utils/__tests__/DrillDataLoader.test.ts`

**What it does:** Loads drill data from static JSON files — categories, subcategories, groups, individual drills. Includes caching, fallback on error.

**Mocks needed:**
- `fetch` — mock JSON responses
- `DrillCategoryCache` — mock cache integration

**Test cases (~6):**
```
✅ loadCategories fetches from correct path
✅ loadDrill fetches individual drill by slug
✅ uses cache for repeated requests
✅ handles fetch error with graceful fallback
✅ handles malformed JSON response
✅ loadAll fetches full taxonomy tree
```

---

## 5. ScheduleLoader.ts (197 lines) — MEDIUM

**Path:** `src/utils/__tests__/ScheduleLoader.test.ts`

**What it does:** Async schedule loading — fetches schedule data, validates structure, merges with user customisations.

**Mocks needed:**
- `fetch` — mock schedule JSON
- `CustomMissionSchedulesStore` — mock user schedules

**Test cases (~5):**
```
✅ loads default schedule from JSON
✅ merges user customisations over defaults
✅ validates schedule structure (rejects invalid)
✅ handles fetch failure gracefully
✅ caches loaded schedule
```

---

## 6. HandlerDataLoader.ts (133 lines) — MEDIUM

**Path:** `src/utils/__tests__/HandlerDataLoader.test.ts`

**What it does:** Loads handler (formerly coach) module data — catalog, module preferences, selection state.

**Mocks needed:**
- `fetch` — mock handler catalog JSON
- `TrainingHandlerCache` — mock cache

**Test cases (~4):**
```
✅ loadCatalog fetches handler catalog
✅ loadModule fetches specific handler module
✅ uses cache on repeated loads
✅ handles fetch error gracefully
```

---

## 7. lifecycle.ts (76 lines) — MEDIUM

**Path:** `src/domain/mission/__tests__/lifecycle.test.ts`

**What it does:** Mission lifecycle finite state machine — valid transitions between states (brief → triage → case → signal → checklist → debrief).

**Test cases (~6):**
```
✅ initial state is 'brief'
✅ valid transition: brief → triage
✅ valid transition through full lifecycle
✅ invalid transition throws/returns error
✅ canTransition returns true for valid transitions
✅ canTransition returns false for invalid transitions
```

---

## Execution Checklist

- [ ] **Step 1:** telemetry.test.ts (10 tests) — enables safe telemetry refactoring
- [ ] **Step 2:** taskScheduler.test.ts (10 tests) — enables safe scheduler changes
- [ ] **Step 3:** indexedDbCache.test.ts (8 tests) — needed before Phase 2 loadingCacheV2 graduation
- [ ] **Step 4:** DrillDataLoader.test.ts (6 tests)
- [ ] **Step 5:** ScheduleLoader.test.ts (5 tests)
- [ ] **Step 6:** HandlerDataLoader.test.ts (4 tests)
- [ ] **Step 7:** lifecycle.test.ts (6 tests)

**Total: ~49 new utility tests**

---

## Combined Phase 3 Total

| Category | New tests |
|----------|----------|
| Store tests | ~65 |
| Component/page tests | ~115 |
| Utility tests | ~49 |
| **Total** | **~229 new tests** |

Expected coverage lift: 25.53% → **~55%** statements (based on tested lines of code relative to total).
