# MissionScheduleStore — Current State Analysis

Full structural analysis of the 7-file split-brain.

---

## Call Graph

```
MissionScheduleContext.tsx (435 lines)
  ├── MissionScheduleStore (151 lines — pure façade)
  │     ├── scheduleState.ts (298 lines)
  │     │     ├── keys.ts (24 lines)
  │     │     ├── selectionState.ts (266 lines — 4 sync getters)
  │     │     │     ├── keys.ts
  │     │     │     ├── defaults.ts (40 lines)
  │     │     │     │     └── DrillCategoryCache ← CIRCULAR
  │     │     │     └── selectionListeners.ts (18 lines)
  │     │     ├── selectionListeners.ts
  │     │     ├── DifficultySettingsStore
  │     │     ├── DrillCategoryCache
  │     │     └── createMissionSchedule (utils)
  │     ├── selectionState.ts (all 18 exports)
  │     └── selectionListeners.ts (2 exports)
  ├── createMissionSchedule (utils) ← DUPLICATE import
  ├── loadScheduleStub (utils)
  ├── checkScheduleAlignment (utils)
  ├── UserProgressStore
  └── FeatureFlagsStore
```

---

## Circular Dependency

```
DrillCategoryCache.ts
  → imports MissionScheduleStore.ts
    → imports selectionState.ts
      → imports defaults.ts
        → imports DrillCategoryCache.ts  ← CYCLE
```

**Why it works at runtime:** JavaScript hoists module evaluation; by the time any function is actually called, all modules are fully loaded. But it's fragile — any change to import order or top-level side effects could break it silently.

**Fix:** Extract default selection computation out of `defaults.ts` so it doesn't import `DrillCategoryCache`. Instead, accept a `categories` parameter — the caller provides the data.

---

## Two Parallel State Channels

### Channel A — React Context (reactive)

Used by: `ChecklistSurface`, `DrillRunner`, `RecapModal`, `RecapToast`, any component calling `useMissionSchedule()`.

Flow: `MissionScheduleContext` holds `schedule` in React state → mutations update state → React re-renders consumers.

### Channel B — Direct Store (imperative)

Used by: `Header`, `PlanSurface`, `DrillCategoryCache`, `ScheduleLoader`, `InitialDataLoader`, `useSelectionSummary`.

Flow: Call `MissionScheduleStore.getScheduleSync()` → reads `localStorage` directly → no React re-render triggered.

### Divergence scenarios

| Scenario | Channel A (Context) | Channel B (Store) | Bug? |
|----------|:-:|:-:|:-:|
| Context mutates schedule (e.g., completeCurrentDrill) and saves to localStorage | Updated | Updated (after save) | No — but timing gap exists |
| PlanSurface calls `createNewScheduleSync` directly | Stale | Updated | **Yes** — Context doesn't know about the new schedule |
| Context creates schedule via `createNewSchedule` | Updated | Updated (after save) | No |
| Header reads `getScheduleSync()` during Context mutation | Current state | **Stale** (pre-mutation) | **Yes** — Header shows stale schedule |

---

## Three Schedule Creation Paths

### Path 1 — `createMissionSchedule()` (utils)
Located in `src/utils/MissionScheduleCreator.ts`. The "canonical" schedule builder.
- Async
- Takes full parameters (drills, difficulty, selections, etc.)
- Returns `MissionSchedule`

### Path 2 — `createNewScheduleSync()` (inline in scheduleState.ts)
Lines 255-297 of `scheduleState.ts`. A synchronous duplicate.
- Reads selections from localStorage (sync getters)
- Has its own shuffle/pick/block-building logic
- Does NOT call `createMissionSchedule()` — completely independent

### Path 3 — Context's `createNewSchedule()`
In `MissionScheduleContext.tsx`. Calls `createMissionSchedule()` from utils directly.
- Bypasses `MissionScheduleStore.createNewSchedule()`
- Has its own pre/post logic (metrics, version bumps, error handling)

**The three paths can produce different schedules** for the same inputs because Path 2 has independent shuffle/pick logic.

---

## Dead Exports

| Export | File | Why dead |
|--------|------|----------|
| `clearAllSelections()` | selectionState.ts | Never imported — `syncTaxonomySignature` calls the 4 individual clear functions instead |
| `clearSchedule()` | scheduleState.ts + façade | Exported but zero external callers |
| `clearSelectedDrillCategories()` | façade | Only called within `selectionState.ts`, not externally |
| `clearSelectedDrillGroups()` | façade | Same |
| `clearSelectedDrillSubCategories()` | façade | Same |
| `clearSelectedDrills()` | façade | Same |
| All 4 async `getSelected*()` | selectionState + façade | Just wrap sync versions; no caller needs the async signature |

**Total dead exports: 11**

---

## Misnamed Notification System

`selectionListeners.ts` exports `notifySelectionChange()` and `subscribeToSelectionChanges()`.

But `notifySelectionChange()` is called from:
- `selectionState.ts` — on selection saves (correct)
- `scheduleState.ts` — on `addDrillToSchedule`, `updateDrillInSchedule`, `removeDrillFromSchedule` (these are **schedule** mutations, not selection changes)

Consumers subscribing to "selection changes" get notified about schedule mutations they didn't subscribe to. This creates confusion about what actually changed.

---

## Alignment Check Duplication

Three independent mechanisms check schedule alignment:

| Location | Trigger | Implementation |
|----------|---------|---------------|
| `selectionState.ts` | Every `save*` call | `alignIfSchedule()` → `logAlignmentForSchedule()` inline |
| `scheduleState.ts` | `add/update/removeDrill` | `logAlignmentForSchedule()` inline |
| `MissionScheduleContext.tsx` | `useEffect` on `[difficultyLevel, scheduleVersion]` | `checkScheduleAlignment()` with debounce |

These fire at different times, potentially logging conflicting alignment states.

---

## localStorage Keys

All under the `workout:v2:` prefix (Phase 0 will rename):

| Key | Module | Purpose |
|-----|--------|---------|
| `workout:v2:schedule` | scheduleState | Full schedule JSON |
| `workout:v2:selectedWorkoutCategories` | selectionState | Selected drill categories map |
| `workout:v2:selectedWorkoutSubCategories` | selectionState | Selected subcategories map |
| `workout:v2:selectedWorkoutGroups` | selectionState | Selected groups map |
| `workout:v2:selectedWorkouts` | selectionState | Selected drills map |
| `workout:v2:taxonomySignature` | selectionState | Hash of data taxonomy for invalidation |
| `workout:v2:lastPreset` | scheduleState | Last used schedule preset name |

**Total: 7 localStorage keys** for the schedule system alone.

---

## Consumers by Access Pattern

### Context consumers (reactive) — 6 files
| File | What it reads |
|------|---------------|
| ChecklistSurface | `schedule`, `completeCurrentDrill` |
| DrillRunner | `completeCurrentDrill` |
| RecapModal | `recap`, `recapOpen`, `dismissRecap` |
| RecapToast | `recap`, `recapToastVisible`, `openRecap`, `dismissRecapToast` |
| useMissionSchedule | Context value (thin wrapper) |
| useSelectionSummary | `subscribeToSelectionChanges`, `getSelectionCounts` (also hits store directly) |

### Direct store consumers (imperative) — 6 files
| File | What it reads |
|------|---------------|
| Header | `getScheduleSync()` |
| PlanSurface | `getScheduleSync()`, `createNewScheduleSync()` |
| DrillCategoryCache | `syncTaxonomySignature()`, `getSelected*Sync()` (×4), `saveSelected*()` (×4), `saveLastPreset()` |
| ScheduleLoader | `saveSchedule()`, `getScheduleSync()` |
| InitialDataLoader | `saveSchedule()` |
| useSelectionSummary | `getSelectionCounts()`, `subscribeToSelectionChanges()` |

**`useSelectionSummary` uses BOTH channels** — subscribes to store directly AND could be a Context consumer.

---

## Test Coverage

### What's tested (19 test cases across 3 files)
- Default selection fallback
- Invalid stored data reset
- Invalid schedule handling
- Taxonomy signature mismatch
- Exception handling
- Selection change notifications
- Selection counts
- Context: load, create, complete, skip (12 tests)

### What's NOT tested
- `addDrillToSchedule` (conflict detection, force flag)
- `updateDrillInSchedule` (swap, not_found path)
- `removeDrillFromSchedule` (set filtering, empty-set removal)
- `createNewScheduleSync` (the inline builder — the entire duplicate code path)
- `clearSchedule`, `clearAllSelections`
- `saveLastPreset` / `getLastPreset`
- `timeoutCurrentDrill` (only indirectly via metric)
- `resetAll` in isolation
- Recap generation and toast lifecycle
- Alignment debounce effect
- `scheduleStatus` transitions
- Error propagation from `notifySelectionChange` listeners
