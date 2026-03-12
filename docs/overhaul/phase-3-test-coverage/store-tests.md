# Store Test Plans

Test plans for every untested store. Each store section includes:
- What the store manages
- Public API to test
- Edge cases and mocks needed
- Suggested test cases

---

## 1. SignalsStore.ts (167 lines) — HIGH

**Manages:** Signal entries (title, detail, role), offline queue, domain bridge to `MissionEntityStore`, telemetry emission.

**Key API:**
- `getSignals()` → Signal[]
- `addSignal(title, detail, role)` → creates signal, bridges to MissionEntityStore, emits telemetry
- `acknowledgeSignal(id)` → marks signal acknowledged
- `resolveSignal(id)` → marks signal resolved
- `getQueueLength()` → pending sync queue size
- `subscribe(listener)` → pub/sub

**Mocks needed:**
- `localStorage` (vi.stubGlobal or Storage mock)
- `MissionEntityStore` (mock domain bridge calls)
- `telemetry.track()` (verify events emitted)

**Test cases (~8):**
```
✅ addSignal creates entry with correct shape
✅ addSignal persists to localStorage
✅ addSignal bridges to MissionEntityStore.addEntity
✅ addSignal emits telemetry event
✅ acknowledgeSignal updates status
✅ resolveSignal updates status
✅ getQueueLength returns unsynced count
✅ subscribe fires on mutations
✅ handles corrupt localStorage gracefully (JSON parse error)
```

---

## 2. TriageActionStore.ts (96 lines) — HIGH

**Manages:** Triage decisions (Assess/Escalate/Delegate/Resolve) per entity, severity tracking, lifecycle validation.

**Key API:**
- `getActions(entityId)` → TriageAction[]
- `addAction(entityId, action)` → persists action with timestamp
- `getStatus(entityId)` → derived status from action history
- `subscribe(listener)`

**Test cases (~6):**
```
✅ addAction persists to localStorage
✅ getActions returns actions for entity
✅ getStatus derives correct lifecycle state from action sequence
✅ addAction validates action against current lifecycle state
✅ severity tracking reflects highest severity seen
✅ subscribe fires on mutations
```

---

## 3. ArtifactActionStore.ts (112 lines) — HIGH

**Manages:** Reviewed/promoted flags for artifacts in localStorage, subscriber notification.

**Key API:**
- `markReviewed(artifactId)` → flags artifact as reviewed
- `markPromoted(artifactId)` → flags artifact as promoted
- `isReviewed(artifactId)` → boolean
- `isPromoted(artifactId)` → boolean
- `getAll()` → full state
- `subscribe(listener)`

**Test cases (~7):**
```
✅ markReviewed persists flag
✅ markPromoted persists flag
✅ isReviewed returns true after marking
✅ isPromoted returns true after marking
✅ isReviewed returns false for unknown artifact
✅ getAll returns complete state
✅ subscribe fires on mutations
```

---

## 4. MissionKitStore.ts (101 lines) — MEDIUM

**Manages:** Mission kit visibility toggle, drill completion stats (lastCompleted, successRate, completionCount).

**Key API:**
- `isVisible()` → boolean
- `toggleVisibility()` → flips visibility, persists
- `recordCompletion(drillId, success)` → updates stats
- `getStats(drillId)` → DrillStats
- `subscribe(listener)`

**Test cases (~6):**
```
✅ initially not visible (or persisted state)
✅ toggleVisibility flips state and persists
✅ recordCompletion creates stats for new drill
✅ recordCompletion increments existing stats
✅ recordCompletion calculates successRate correctly
✅ getStats returns null for unknown drill
```

---

## 5. DrillFilterStore.ts (107 lines) — MEDIUM

**Manages:** Drill filter preferences (search text, duration range, equipment list, themes, difficulty range) in localStorage.

**Key API:**
- `getFilters()` → DrillFilters
- `setFilter(key, value)` → updates single filter, persists
- `resetFilters()` → clears to defaults
- `subscribe(listener)`

**Test cases (~6):**
```
✅ getFilters returns defaults when no persisted state
✅ setFilter updates search text
✅ setFilter updates duration range with validation
✅ setFilter updates difficulty range with validation
✅ resetFilters clears all to defaults
✅ persists and hydrates from localStorage
```

---

## 6. challenges.ts (107 lines) — MEDIUM

**Manages:** Challenge rotation logic — spawning daily/weekly challenges, calculating expiry, checking completion criteria.

**Note:** This file exports pure functions, making it extremely testable.

**Key exports:**
- `spawnDailyChallenges(progress)` → Challenge[]
- `spawnWeeklyChallenges(progress)` → Challenge[]
- `isChallengeExpired(challenge)` → boolean
- `isChallengeCompleted(challenge, progress)` → boolean
- `getChallengeReward(challenge)` → XP amount

**Test cases (~8):**
```
✅ spawnDailyChallenges returns correct count
✅ spawned challenges have valid expiry (24h for daily)
✅ spawnWeeklyChallenges returns correct count
✅ spawned weekly challenges have 7-day expiry
✅ isChallengeExpired returns false for fresh challenge
✅ isChallengeExpired returns true for expired challenge
✅ isChallengeCompleted checks criteria against progress
✅ getChallengeReward scales with difficulty
```

---

## 7. CustomMissionSchedulesStore.ts (86 lines) — MEDIUM

**Manages:** User-created custom mission schedules — CRUD operations with JSON validation.

**Key API:**
- `getSchedules()` → CustomSchedule[]
- `addSchedule(schedule)` → persists with validation
- `updateSchedule(id, updates)` → partial update
- `deleteSchedule(id)` → removes
- `subscribe(listener)`

**Test cases (~6):**
```
✅ addSchedule persists valid schedule
✅ addSchedule rejects invalid schema
✅ getSchedules returns all persisted schedules
✅ updateSchedule applies partial updates
✅ deleteSchedule removes by id
✅ handles corrupt localStorage gracefully
```

---

## 8. SettingsStore.ts (108 lines) — MEDIUM

**Manages:** User preferences (theme, profile data), Web3Auth integration singleton.

**Key API:**
- `getSettings()` → Settings
- `updateSettings(partial)` → merge and persist
- `getTheme()` → theme name
- `initWeb3Auth()` → async Web3Auth initialization
- `subscribe(listener)`

**Mocks needed:**
- `localStorage`
- `Web3AuthService` (mock the async init)

**Test cases (~6):**
```
✅ getSettings returns defaults when empty
✅ updateSettings merges and persists
✅ getTheme extracts theme from settings
✅ initWeb3Auth calls Web3AuthService
✅ subscribe fires on settings change
✅ handles missing Web3Auth gracefully
```

---

## 9. DifficultySettingsStore.ts (41 lines) — LOW

**Manages:** Difficulty level and range persistence, weighted random difficulty generation.

**Test cases (~4):**
```
✅ getDifficulty returns persisted level
✅ setDifficulty persists and notifies
✅ getWeightedRandom returns value within range
✅ defaults to medium when no persisted state
```

---

## 10. missionSchedule/ sub-modules — MIXED

These files are partially covered by `MissionScheduleStore.test.ts` but have their own logic worth testing directly.

### 10a. scheduleState.ts (298 lines) — HIGH

**Manages:** Core schedule generation, localStorage persistence, regeneration triggers, preset tracking.

**Note:** Large file with complex logic. May already be partially exercised through `MissionScheduleStore.test.ts`, but direct tests improve confidence.

**Test cases (~8):**
```
✅ generateSchedule creates valid schedule structure
✅ schedule persists to localStorage with version key
✅ regenerateSchedule replaces existing schedule
✅ getSchedule returns null when no schedule exists
✅ preset tracking records which preset was used
✅ schedule generation respects filter parameters
✅ handles missing/corrupt localStorage
✅ subscriber notification on schedule changes
```

### 10b. selectionState.ts (266 lines) — MEDIUM

**Partially covered by `MissionScheduleStore.selection.test.ts`**

**Additional test cases (~4):**
```
✅ selectCategory persists selection
✅ selectSubCategory cascades from category
✅ selectGroup cascades from subcategory
✅ clearSelections resets all levels
```

### 10c. defaults.ts, keys.ts, selectionListeners.ts — LOW

These are simple enough that indirect testing is sufficient. Skip unless coverage target not met.

---

## Execution Checklist

- [ ] **Step 1:** SignalsStore.test.ts (8 tests)
- [ ] **Step 2:** TriageActionStore.test.ts (6 tests)
- [ ] **Step 3:** ArtifactActionStore.test.ts (7 tests)
- [ ] **Step 4:** challenges.test.ts (8 tests) — note: may conflict with existing celebrationEvents, namespace carefully
- [ ] **Step 5:** MissionKitStore.test.ts (6 tests)
- [ ] **Step 6:** DrillFilterStore.test.ts (6 tests)
- [ ] **Step 7:** CustomMissionSchedulesStore.test.ts (6 tests)
- [ ] **Step 8:** SettingsStore.test.ts (6 tests)
- [ ] **Step 9:** DifficultySettingsStore.test.ts (4 tests)
- [ ] **Step 10:** scheduleState.test.ts (8 tests)

**Total: ~65 new store tests**

### Test file locations

All store tests go in `src/store/__tests__/` following existing convention:
```
src/store/__tests__/SignalsStore.test.ts
src/store/__tests__/TriageActionStore.test.ts
src/store/__tests__/ArtifactActionStore.test.ts
src/store/__tests__/challenges.test.ts
src/store/__tests__/MissionKitStore.test.ts
src/store/__tests__/DrillFilterStore.test.ts
src/store/__tests__/CustomMissionSchedulesStore.test.ts
src/store/__tests__/SettingsStore.test.ts
src/store/__tests__/DifficultySettingsStore.test.ts
src/store/missionSchedule/__tests__/scheduleState.test.ts
```

### Common test setup pattern

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock localStorage
const mockStorage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  get length() { return mockStorage.size; },
  key: (i: number) => [...mockStorage.keys()][i] ?? null,
});

beforeEach(() => {
  mockStorage.clear();
});
```
