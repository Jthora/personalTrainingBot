# Target Architecture — MissionScheduleStore Consolidation

Step-by-step migration from 7-file split-brain to a clean 3-file architecture.

---

## Target File Structure

```
src/store/
  MissionScheduleStore.ts     ← Unified: state + CRUD + pub/sub (≤ 250 lines)
  missionSchedule/            ← DELETED

src/context/
  MissionScheduleContext.tsx   ← Slimmed (≤ 200 lines)

src/hooks/
  useRecap.ts                 ← Extracted from Context (≤ 80 lines)

src/utils/
  MissionScheduleCreator.ts   ← Sole schedule creation path (absorbs inline logic)
```

---

## Step 1 — Delete dead exports and async wrappers

**Branch:** `phase-6/step-1-dead-code`

### 1a. Remove dead exports from selectionState.ts
- Delete `clearAllSelections` (never imported)
- Delete all 4 async `getSelected*` functions (they're identical to sync versions)

### 1b. Remove dead exports from scheduleState.ts
- Delete `clearSchedule` (zero external callers)

### 1c. Remove dead façade methods from MissionScheduleStore.ts
- Remove the 4 individual `clearSelected*` methods (no external caller)
- Remove `clearSchedule`
- Remove the 4 async `getSelected*` methods

### Verify
```bash
npx tsc --noEmit   # Compile clean
npx vitest run      # Tests pass
```

**Expected reduction:** ~80 lines removed across the 3 files.

---

## Step 2 — Consolidate schedule creation to one path

**Branch:** `phase-6/step-2-one-creation-path`

### 2a. Move `createNewScheduleSync` logic into `MissionScheduleCreator.ts`

The inline builder in `scheduleState.ts` (lines 255-297) duplicates the util. Unify:

```typescript
// src/utils/MissionScheduleCreator.ts
export function createMissionScheduleSync(options: {
  categories: SelectedDrillCategories;
  subcategories: SelectedDrillSubCategories;
  groups: SelectedDrillGroups;
  drills: SelectedDrills;
  difficulty: DifficultySettings;
  presetName?: string;
}): MissionSchedule {
  // ... single, canonical implementation
}

// Keep async version as thin wrapper:
export async function createMissionSchedule(
  options: Parameters<typeof createMissionScheduleSync>[0]
): Promise<MissionSchedule> {
  return createMissionScheduleSync(options);
}
```

### 2b. Update `scheduleState.ts` to call `createMissionScheduleSync`

Replace the inline logic with:
```typescript
import { createMissionScheduleSync } from '../../utils/MissionScheduleCreator';
```

### 2c. Update `MissionScheduleContext.tsx` to go through the store

Replace direct `createMissionSchedule()` call with `MissionScheduleStore.createNewSchedule()`.

### Verify
```bash
npx tsc --noEmit
npx vitest run
# Manual: create a schedule → verify structure matches before
```

**Expected reduction:** ~40 lines removed from scheduleState.ts.

---

## Step 3 — Break the circular dependency

**Branch:** `phase-6/step-3-break-cycle`

### The cycle
```
DrillCategoryCache → MissionScheduleStore → selectionState → defaults → DrillCategoryCache
```

### Fix: Make `defaults.ts` accept parameters instead of importing

**Before:**
```typescript
// defaults.ts
import { DrillCategoryCache } from '../../cache/DrillCategoryCache';

export function getDefaultSelectedDrillCategories(): SelectedDrillCategories {
  const cats = DrillCategoryCache.get();  // Direct import
  return Object.fromEntries(cats.map(c => [c.slug, true]));
}
```

**After:**
```typescript
// defaults.ts
export function getDefaultSelectedDrillCategories(
  categorySlugs: string[]
): SelectedDrillCategories {
  return Object.fromEntries(categorySlugs.map(s => [s, true]));
}
```

Then update `selectionState.ts` to pass the data:
```typescript
const categories = DrillCategoryCache.get();
const defaults = getDefaultSelectedDrillCategories(categories.map(c => c.slug));
```

This moves the `DrillCategoryCache` import from `defaults.ts` to `selectionState.ts`, breaking the cycle because `selectionState.ts` is NOT imported by `DrillCategoryCache`.

### Verify
```bash
npx madge --circular src/   # Zero circular deps
npx tsc --noEmit
npx vitest run
```

---

## Step 4 — Unify notification system

**Branch:** `phase-6/step-4-notifications`

### 4a. Rename to reflect actual semantics

- Rename `notifySelectionChange` → `notifyScheduleStoreChange`
- Rename `subscribeToSelectionChanges` → `subscribeToScheduleStoreChanges`

### 4b. Add change type to notification

```typescript
type ChangeType = 'selection' | 'schedule' | 'reset';

function notifyScheduleStoreChange(type: ChangeType) {
  listeners.forEach(fn => fn(type));
}
```

Consumers can filter by type if needed:
```typescript
subscribeToScheduleStoreChanges((type) => {
  if (type === 'selection') updateSelectionUI();
});
```

### Verify
```bash
npx tsc --noEmit
npx vitest run
```

---

## Step 5 — Collapse files into unified store

**Branch:** `phase-6/step-5-consolidate`

This is the biggest step. Absorb the sub-modules into `MissionScheduleStore.ts`.

### 5a. Create new `MissionScheduleStore.ts`

Using the store factory from Phase 1:

```typescript
// src/store/MissionScheduleStore.ts
import { createStore } from './createStore';

interface MissionScheduleState {
  schedule: MissionSchedule | null;
  selections: {
    categories: SelectedDrillCategories;
    subcategories: SelectedDrillSubCategories;
    groups: SelectedDrillGroups;
    drills: SelectedDrills;
  };
  lastPreset: string | null;
  taxonomySignature: string | null;
}

const store = createStore<MissionScheduleState>({
  key: 'drill:v3:schedule',  // New versioned key
  defaultValue: {
    schedule: null,
    selections: { categories: {}, subcategories: {}, groups: {}, drills: {} },
    lastPreset: null,
    taxonomySignature: null,
  },
  validate: isMissionScheduleState,
});

// Public API (≤ 12 functions)
export const MissionScheduleStore = {
  // Schedule
  getSchedule: () => store.get().schedule,
  saveSchedule: (schedule: MissionSchedule) => store.update(s => ({ ...s, schedule })),
  createNewSchedule: (options) => { /* delegates to MissionScheduleCreator */ },
  addDrill: (drill, force?) => { /* ... */ },
  updateDrill: (id, drill) => { /* ... */ },
  removeDrill: (id) => { /* ... */ },
  
  // Selections
  getSelections: () => store.get().selections,
  saveSelections: (selections) => store.update(s => ({ ...s, selections })),
  getSelectionCounts: () => { /* ... */ },
  
  // Lifecycle
  resetAll: () => store.reset(),
  syncTaxonomy: (signature) => { /* ... */ },
  
  // Pub/sub
  subscribe: store.subscribe,
};
```

### 5b. Migrate localStorage

Old keys (`workout:v2:*`) need a one-time migration to the new unified key:

```typescript
function migrateFromV2(): MissionScheduleState | null {
  const schedule = localStorage.getItem('workout:v2:schedule');
  const cats = localStorage.getItem('workout:v2:selectedWorkoutCategories');
  // ... read all 7 keys, assemble state, clean up old keys
}
```

This migration runs once in `createStore.hydrate()` if the new key is empty but old keys exist.

### 5c. Delete `store/missionSchedule/` directory

After all logic is absorbed:
```bash
rm -rf src/store/missionSchedule/
```

### 5d. Update all imports

All consumers change from:
```typescript
import MissionScheduleStore from '../store/MissionScheduleStore';
```
to:
```typescript
import { MissionScheduleStore } from '../store/MissionScheduleStore';
```

Specific methods that change:
| Old API | New API |
|---------|---------|
| `.getScheduleSync()` | `.getSchedule()` |
| `.getSelectedDrillCategoriesSync()` | `.getSelections().categories` |
| `.saveSelectedDrillCategories(v)` | `.saveSelections({ ...current, categories: v })` |
| `.createNewScheduleSync(opts)` | `.createNewSchedule(opts)` |
| `.subscribeToSelectionChanges(fn)` | `.subscribe(fn)` |
| `.getSelectionCounts()` | `.getSelectionCounts()` (unchanged) |

### Verify
```bash
npx tsc --noEmit
npx vitest run
# Manual: full smoke test of schedule flows
```

**Expected result:** `MissionScheduleStore.ts` is ~250 lines. `missionSchedule/` directory is gone.

---

## Step 6 — Slim down MissionScheduleContext

**Branch:** `phase-6/step-6-slim-context`

### 6a. Extract recap logic into `useRecap` hook

The recap logic (recap generation, toast visibility, share text, badge computation) is ~150 lines of the Context that belongs in its own hook:

```typescript
// src/hooks/useRecap.ts
export function useRecap(schedule: MissionSchedule | null) {
  const [recap, setRecap] = useState<RecapSummary | null>(null);
  const [recapOpen, setRecapOpen] = useState(false);
  const [recapToastVisible, setRecapToastVisible] = useState(false);
  
  const generateRecap = useCallback((completedDrill) => { /* ... */ }, [schedule]);
  const openRecap = useCallback(() => setRecapOpen(true), []);
  const dismissRecap = useCallback(() => setRecapOpen(false), []);
  const dismissRecapToast = useCallback(() => setRecapToastVisible(false), []);
  
  return { recap, recapOpen, recapToastVisible, generateRecap, openRecap, dismissRecap, dismissRecapToast };
}
```

### 6b. Remove alignment duplication

Remove the `useEffect` for `checkScheduleAlignment` in Context. This is already handled in the store (Step 4 unified it). The Context doesn't need its own alignment check.

### 6c. Simplify Context state

**Before:** 10 state pieces + 3 refs
**After:** 4 state pieces

```typescript
const [schedule, setSchedule] = useState<MissionSchedule | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [scheduleVersion, setScheduleVersion] = useState(0);
```

The recap state moves to `useRecap`. The `promptShown` and `scheduleStatus` can be derived.

### 6d. Context API surface

**Before:** 16 properties
**After:** 10 properties (6 core + 4 recap from hook)

```typescript
interface MissionScheduleContextValue {
  schedule: MissionSchedule | null;
  isLoading: boolean;
  error: string | null;
  scheduleVersion: number;
  loadSchedule: () => Promise<void>;
  completeCurrentDrill: (drillResult: DrillResult) => void;
  skipCurrentDrill: () => void;
  timeoutCurrentDrill: () => void;
  createNewSchedule: (options: CreateScheduleOptions) => Promise<void>;
  setCurrentSchedule: (schedule: MissionSchedule) => void;
}
// Recap is consumed via useRecap() directly, not through Context
```

### Verify
```bash
npx tsc --noEmit
npx vitest run
```

**Expected result:** MissionScheduleContext.tsx drops from 435 lines to ≤ 200 lines.

---

## Step 7 — Eliminate direct-store channel

**Branch:** `phase-6/step-7-single-channel`

The hardest step. All "Channel B" consumers (direct store access) should go through a consistent path.

### Strategy: Use store subscription for non-React consumers

The store factory's `.subscribe()` provides reactive access without React Context:

| Consumer | Current (Direct Store) | Target |
|----------|----------------------|--------|
| Header | `getScheduleSync()` in `useMemo` | `store.subscribe()` in `useEffect` → local state |
| PlanSurface | `getScheduleSync()` + `createNewScheduleSync()` | Use Context via `useMissionSchedule()` |
| DrillCategoryCache | 10+ direct calls | Keep direct access (cache layer is non-React) |
| ScheduleLoader | `saveSchedule()`, `getScheduleSync()` | Keep direct access (data loader is non-React) |
| InitialDataLoader | `saveSchedule()` | Keep direct access (init is non-React) |
| useSelectionSummary | `getSelectionCounts()`, `subscribe()` | Use store `.subscribe()` (already correct pattern) |

**React components** should use Context (`useMissionSchedule()`). **Non-React code** (caches, loaders) should use the store API directly — this is fine and expected.

Convert `Header` and `PlanSurface` from direct store to Context:

### PlanSurface
```typescript
// Before:
const schedule = MissionScheduleStore.getScheduleSync();

// After:
const { schedule, createNewSchedule } = useMissionSchedule();
```

### Header
```typescript
// Before:
const schedule = useMemo(() => MissionScheduleStore.getScheduleSync(), []);

// After:
const { schedule } = useMissionSchedule();
```

### Verify
```bash
npx tsc --noEmit
npx vitest run
# Manual: Header shows correct drill count
# Manual: PlanSurface creates schedule, context updates
```

---

## Migration Sequence (dependency order)

```
Step 1 (Dead code)        ← Safe, no behavior change
  ↓
Step 2 (One creation)     ← Reduces duplication, minor behavior risk
  ↓
Step 3 (Break cycle)      ← Structural fix, no behavior change
  ↓
Step 4 (Notifications)    ← Rename + type, minor behavior change
  ↓
Step 5 (Consolidate)      ← Big merge, high behavior risk → run full test suite
  ↓
Step 6 (Slim context)     ← Extract recap hook, moderate risk
  ↓
Step 7 (Single channel)   ← Consumer migration, moderate risk
```

Each step is a separate branch and PR. Steps 1-4 can merge independently. Steps 5-7 should be reviewed together but can merge sequentially.

---

## Verification Gate (Phase 6 Complete)

- [ ] `src/store/missionSchedule/` directory does not exist
- [ ] `MissionScheduleStore.ts` is ≤ 250 lines
- [ ] `MissionScheduleContext.tsx` is ≤ 200 lines
- [ ] `useRecap.ts` exists with extracted recap logic
- [ ] `npx madge --circular src/` reports zero cycles
- [ ] Schedule creation has exactly 1 code path (in `MissionScheduleCreator.ts`)
- [ ] Only non-React code (caches, loaders) accesses store directly
- [ ] All React components use `useMissionSchedule()` context
- [ ] All 19+ existing schedule tests pass
- [ ] New tests cover `addDrill`, `updateDrill`, `removeDrill`, `createNewScheduleSync`
- [ ] localStorage migration works (v2 keys → v3 key)
- [ ] Total lines across all schedule files ≤ 600
- [ ] Update [docs/overhaul/README.md](../README.md) Phase 6 status to ✅
