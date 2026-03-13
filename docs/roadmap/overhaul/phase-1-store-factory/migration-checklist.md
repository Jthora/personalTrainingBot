# Store Migration Checklist

For each store, follow these steps:

1. Read the current store implementation
2. Identify which parts are boilerplate (read/write/notify/subscribe) vs domain logic
3. Replace boilerplate with `createStore()` call
4. Preserve the exact same exported API (method names, signatures, return types)
5. Run `npx tsc --noEmit`
6. Run existing tests for that store (must pass unchanged)
7. Commit: `refactor(phase-1): migrate <StoreName> to createStore factory`

---

## 1. ArtifactActionStore

**File:** `src/store/ArtifactActionStore.ts` (112 lines)
**Key:** `ptb:artifact-actions`
**Shape:** `Record<string, ArtifactActionRecord>`

**Boilerplate to remove:**
- `readState()` (lines 17–27)
- `writeState()` (lines 28–35)
- `notify()` (lines 37–39)
- `listeners` set (line 15)
- `Listener` type (line 14)

**Domain logic to preserve:**
- `markShared(artifactId)` — updates record, sets `shared: true`
- `markDownloaded(artifactId)` — updates record, sets `downloaded: true`
- `incrementView(artifactId)` — increments `viewCount`
- `getRecord(artifactId)` — returns single record

**Tests:** None currently. Consider adding after migration.

---

## 2. TriageActionStore

**File:** `src/store/TriageActionStore.ts` (96 lines)
**Key:** `ptb:triage-actions`
**Shape:** `Record<string, TriageActionRecord>`

**Boilerplate to remove:** Same pattern as ArtifactActionStore.

**Domain logic to preserve:**
- `record(drillId, action)` — upserts action record
- `getAll()` — returns full state
- `getByAction(action)` — groups IDs by action type

**Tests:** None currently.

---

## 3. DrillHistoryStore

**File:** `src/store/DrillHistoryStore.ts` (104 lines)
**Key:** `ptb:drill-history:v1`
**Shape:** `DrillHistoryEntry[]`
**Max entries:** 100

**Boilerplate to remove:**
- `readAll()` (lines 28–38)
- `writeAll()` (lines 40–47)
- `notify()` (lines 23–26)
- `listeners` set (line 20)

**Domain logic to preserve:**
- `record(entry)` — prepends entry, caps at 100
- `getAll()` — returns all entries
- `statsFor(drillId)` — computes count, totalSec, bestSec

**Tests:** `src/store/__tests__/DrillHistoryStore.test.ts` — must pass unchanged.

**Factory config:**
```typescript
createStore<DrillHistoryEntry[]>({
  key: 'ptb:drill-history',
  version: 'v1',
  defaultValue: [],
  maxEntries: 100,
});
```

---

## 4. AARStore

**File:** `src/store/AARStore.ts` (124 lines)
**Key:** `ptb:aar-entries`
**Shape:** `AAREntry[]`

**Boilerplate to remove:**
- `readJSON()` (lines 25–34)
- `writeJSON()` (lines 36–42)
- `listeners` set (line 23)

**Domain logic to preserve:**
- `ensureEntries()` — seeds a default entry if empty (timestamp-based)
- `add(entry)` — prepends new entry
- `update(entry)` — replaces by ID
- `exportEntry(id)` — serialises single entry to string
- `getAll()` — returns all (with seed guarantee)

**Complexity note:** `ensureEntries()` has seeding logic that creates a starter entry on first access. This is domain logic, not boilerplate — keep it as a wrapper around `store.get()`.

**Tests:** `src/store/__tests__/AARStore.test.ts` — must pass unchanged.

---

## 5. SignalsStore

**File:** `src/store/SignalsStore.ts` (167 lines)
**Keys:** `ptb:signals` (main) + `ptb:signals-queue` (offline queue)
**Shape:** `SignalEntry[]` + `SignalUpdateEvent[]`

**Boilerplate to remove:**
- `readJSON()`, `writeJSON()` (shared helpers)
- `listeners` set

**Domain logic to preserve:**
- `ensureSeeds()` — seeds sample signals if empty
- `enqueue(event)` — adds to offline queue
- `flushQueue()` — processes offline queue when online
- `getAll()` — returns mapped `MissionSignal[]`
- `updateStatus(id, status)` — updates signal status

**Complexity note:** This store manages TWO localStorage keys. The factory handles the primary key; the queue can be a second `createStore` instance or remain manual.

**Tests:** None currently.

---

## 6. DrillRunStore

**File:** `src/store/DrillRunStore.ts` (~130 lines)
**Keys:** `ptb:drill-run` (state) + `ptb:drill-telemetry-queue` (queue)
**Shape:** `DrillRunState | null`

**Domain logic to preserve:**
- `start(drill)` — initialises run state
- `toggleStep(stepId)` — toggles step completion
- `complete()` — marks run complete, enqueues telemetry
- `clear()` — removes run state

**Complexity note:** Subscribe callback takes `(state: DrillRunState | null)` instead of `() => void`. Factory pattern uses `() => void`. Options:
1. Wrap: subscriber calls `store.get()` after notify
2. Extend factory with typed listener variant
3. Keep manual for this one store

Recommendation: Option 1 (wrap). Check if consumers actually use the passed value or just re-read.

**Tests:** `src/store/__tests__/DrillRunStore.test.ts` — must pass unchanged.

---

## 7. OperativeProfileStore

**File:** `src/store/OperativeProfileStore.ts` (~90 lines)
**Key:** `operative:profile:v1`
**Shape:** `OperativeProfile | null`

**Straightforward migration.** Domain logic is just `update(partial)` which merges partial into current.

**Tests:** `src/store/__tests__/OperativeProfileStore.test.ts`

---

## 8. DifficultySettingsStore

**File:** `src/store/DifficultySettingsStore.ts` (~41 lines)
**Key:** `difficultySettings`
**Shape:** `DifficultySettingJSON`

**Simplest store.** Only has `getSettings()`, `setSettings()`, `getLevel()`, and `generateWeightedRandom()`.

**Tests:** None — add basic tests during migration.

---

## 9. DrillFilterStore

**File:** `src/store/DrillFilterStore.ts` (~107 lines)
**Key:** `drillFilters:v1`
**Shape:** `DrillFilters`

**Domain logic:** Merge-with-defaults pattern, shape validation, versioned storage.

**Tests:** None — no existing test file, but `src/utils/__tests__/drillFilters.test.ts` may exercise it indirectly.

---

## 10. FeatureFlagsStore

**File:** `src/store/FeatureFlagsStore.ts` (~130 lines)
**Key:** `featureFlags:v1`
**Shape:** `FeatureFlags`

**Complex.** Merges from 4 sources: defaults → config → user progress → localStorage overrides. Plus global kill switch logic.

**Recommendation:** May not benefit much from factory — the merge logic IS the store. Evaluate after simpler stores are migrated.

---

## Stores NOT to Migrate (Evaluate Later)

| Store | Reason |
|-------|--------|
| `UserProgressStore` | Heavy domain logic (XP calc, streaks, badges, goals, challenges). The plumbing is a small fraction of the file. |
| `MissionScheduleStore` + `missionSchedule/*` | Phase 6 consolidation target. Don't touch until then. |
| `SettingsStore` | Class-based singleton with Web3 auth dependency. Different pattern. |
| `MissionKitStore` | Multiple keys, drill stats tracking. Evaluate after Phase 6. |
| `TrainingModuleSelectionStore` | Versioned multi-key selection persistence. Complex enough to stay manual. |

---

## Verification After Each Migration

```bash
# After migrating each store:
npx tsc --noEmit
npm test -- --run --reporter=verbose
```

## Final Verification

```bash
# Count total lines in store files
wc -l src/store/*.ts src/store/missionSchedule/*.ts

# Compare to pre-migration count
# Target: ≥400 fewer lines (excluding createStore.ts itself)
```
