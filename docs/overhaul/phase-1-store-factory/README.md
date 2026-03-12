# Phase 1 — Store Factory Extraction

## Objective

Extract the repeated localStorage + pub/sub boilerplate from 16 stores into a `createStore<T>()` factory function. Reduce ~500 lines of mechanical duplication to a single tested implementation.

## Why This Matters

Every store in `src/store/` re-implements:
1. A localStorage key constant
2. A `readJSON()` / `readState()` / `readAll()` function that parses from localStorage
3. A `writeJSON()` / `writeState()` / `writeAll()` function that serialises to localStorage
4. A `Set<() => void>` for listeners
5. A `notify()` function that iterates listeners
6. A `subscribe()` function that returns an unsubscribe handle

This is 20–30 lines of identical plumbing per store, repeated 16 times. Logic bugs in one store's plumbing (missing try/catch, missing notify, storage quota handling) don't get fixed in the others.

## Prerequisites

- Phase 0 complete (terminology is clean)

## Deliverables

1. `src/store/createStore.ts` — the factory function
2. `src/store/__tests__/createStore.test.ts` — factory tests
3. Migrated stores (5 collection stores first, then object stores)

## Design

See [factory-spec.md](factory-spec.md) for the full API specification.

See [migration-checklist.md](migration-checklist.md) for per-store migration steps.

## Migration Order

Start with the simplest stores (least domain logic on top of boilerplate):

| Order | Store | Lines | Shape | Complexity |
|-------|-------|-------|-------|------------|
| 1 | `ArtifactActionStore` | 112 | Record<string, T> | Low — CRUD on map |
| 2 | `TriageActionStore` | 96 | Record<string, T> | Low — CRUD on map |
| 3 | `DrillHistoryStore` | 104 | T[] (capped) | Low — append + cap |
| 4 | `AARStore` | 124 | T[] | Medium — seeding logic |
| 5 | `SignalsStore` | 167 | T[] + queue | Medium — dual key + queue |
| 6 | `DrillRunStore` | ~130 | T \| null | Medium — null state + queue |
| 7 | `OperativeProfileStore` | ~90 | T \| null | Low |
| 8 | `DifficultySettingsStore` | ~41 | T | Low |
| 9 | `DrillFilterStore` | ~107 | T | Medium — merge with defaults |
| 10 | `FeatureFlagsStore` | ~130 | T | High — multi-source merge |

The `UserProgressStore`, `MissionScheduleStore`, `SettingsStore`, and `MissionKitStore` have more complex patterns and may benefit less from the factory. Evaluate after migrating the first 10.

## Done Definition

- `createStore.ts` exists with tests
- At least 5 stores migrated to use the factory
- All existing store tests pass unchanged
- Total store LOC reduced by ≥400 lines
- `npx tsc --noEmit` and `npm test` green
