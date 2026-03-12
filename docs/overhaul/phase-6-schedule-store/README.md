# Phase 6 — MissionScheduleStore Consolidation

> Heal the split-brain: 1,232 lines across 7 files → one coherent module.

## Current State — The Split-Brain

The schedule system is spread across 7 files with **two parallel state channels**, **three schedule-creation code paths**, a **circular dependency**, and a **pure pass-through façade** adding 151 lines of dead indirection.

| File | Lines | Role |
|------|------:|------|
| `store/MissionScheduleStore.ts` | 151 | Façade — re-exports 26 methods with zero logic |
| `store/missionSchedule/keys.ts` | 24 | localStorage key constants |
| `store/missionSchedule/defaults.ts` | 40 | Default selection generators |
| `store/missionSchedule/selectionState.ts` | 266 | Selection CRUD (18 exports) |
| `store/missionSchedule/selectionListeners.ts` | 18 | Pub/sub for selection changes |
| `store/missionSchedule/scheduleState.ts` | 298 | Schedule CRUD + creation (12 exports) |
| `context/MissionScheduleContext.tsx` | 435 | React provider: state, recap, alignment |
| **Total** | **1,232** | |

### Core Problems

1. **Two parallel state channels** — Components access schedule data through either:
   - React Context (via `useMissionSchedule()`) — holds React state
   - Direct store import (via `MissionScheduleStore.getScheduleSync()`) — reads localStorage
   
   These diverge: Context may have unsaved mutations while localStorage is stale, or vice versa.

2. **Three schedule-creation code paths:**
   - `createMissionSchedule()` in `utils/` — the "real" creator
   - `createNewScheduleSync()` inline in `scheduleState.ts` — a duplicate with its own shuffle/pick/block logic
   - `MissionScheduleContext.createNewSchedule()` — calls the util directly, bypassing the store

3. **Circular dependency:** `DrillCategoryCache → MissionScheduleStore → selectionState → defaults → DrillCategoryCache`

4. **Misnamed pub/sub:** `notifySelectionChange()` fires on both selection changes AND schedule mutations — consumers can't distinguish what happened.

5. **Dead code:** `clearAllSelections`, `clearSchedule`, all async getter wrappers, 4 individual clear methods on the façade — all exported but never called externally.

---

## Target Architecture

```
src/store/
  MissionScheduleStore.ts    ← Single module: state + CRUD + creation + pub/sub
  missionSchedule/           ← DELETED (contents absorbed or relocated)

src/context/
  MissionScheduleContext.tsx  ← Slimmed: React state + recap hook extraction

src/utils/
  MissionScheduleCreator.ts  ← Already exists; absorbs inline creation logic
```

### Target metrics

| Metric | Before | After |
|--------|--------|-------|
| Files | 7 | 3 |
| Total lines | 1,232 | ≤ 600 |
| Exports on store | 26 (façade) | ≤ 12 |
| Context state pieces | 10 | ≤ 5 |
| Circular dependencies | 1 | 0 |
| Dead exports | 8+ | 0 |
| Schedule creation paths | 3 | 1 |

## Prerequisites

- Phase 0 (terminology renames) complete — file names are stable
- Phase 1 (store factory) complete — new MissionScheduleStore can use `createStore<T>()`
- Phase 3 (test coverage) — schedule tests expanded per `store-tests.md`

## Files

| Document | Purpose |
|----------|---------|
| [current-state.md](current-state.md) | Detailed analysis with call graph, circular dep, dead code |
| [target-architecture.md](target-architecture.md) | Step-by-step migration plan |

## Done Definition

- [ ] `store/missionSchedule/` directory deleted
- [ ] `MissionScheduleStore.ts` is a single self-contained module using the store factory
- [ ] Zero circular dependencies (verify with `npx madge --circular src/`)
- [ ] `MissionScheduleContext.tsx` ≤ 200 lines (recap extracted)
- [ ] All consumers work through one state channel (Context OR store, not both)
- [ ] 1 schedule creation path (via `MissionScheduleCreator`)
- [ ] All existing tests pass + new tests for previously untested paths
- [ ] Total lines ≤ 600
