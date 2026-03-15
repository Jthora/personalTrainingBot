# Internal API Reference

## Overview

Starcom Academy has no backend server. All state management is handled client-side through **localStorage-backed stores** with a pub/sub notification pattern, and **singleton cache classes** that hold training content in memory.

This document covers the store and cache APIs that components consume.

## Architecture Pattern

Every store follows the same hand-rolled pattern:

```typescript
// 1. localStorage key
const STORE_KEY = 'ptb:some-key';

// 2. Listener set for pub/sub
const listeners = new Set<() => void>();

// 3. Read/write helpers
const readState = () => JSON.parse(localStorage.getItem(STORE_KEY));
const writeState = (state) => localStorage.setItem(STORE_KEY, JSON.stringify(state));

// 4. Notify subscribers
const notify = () => listeners.forEach(fn => fn());

// 5. Exported store object
export const SomeStore = {
  get(): State { ... },
  set(state: State) { writeState(state); notify(); },
  subscribe(fn: () => void): () => void { listeners.add(fn); return () => listeners.delete(fn); },
};
```

No external state library (Zustand, Redux, etc.) is used.

---

## Operative & Progress Stores

### UserProgressStore
**File:** `src/store/UserProgressStore.ts` | **Key:** `userProgress:v1`

Core operative progression tracking — XP, level, streaks, badges, challenges, goals.

```typescript
interface UserProgress {
    xp: number;
    level: number;
    streak: number;
    lastActiveDate: string;
    weekStart: string;
    weekEnd: string;
    weeklyMinutes: number;
    totalMissions: number;
    totalMinutes: number;
    badges: string[];
    badgeUnlocks: BadgeUnlock[];
    challenges: ChallengeInstance[];
    flags: Partial<FeatureFlags>;
    goals: GoalProgress;
    version: number;
}

UserProgressStore.get(): UserProgress
UserProgressStore.set(progress: UserProgress): void
UserProgressStore.subscribe(fn: () => void): () => void
UserProgressStore.addXP(amount: number): void
UserProgressStore.recordMission(minutes: number): void
UserProgressStore.awardBadge(badge: string): void
UserProgressStore.getViewModel(): ProgressViewModel
```

Level calculation: `level = floor(xp / 500) + 1`

### OperativeProfileStore
**File:** `src/store/OperativeProfileStore.ts` | **Key:** `operative:profile:v1`

Operative identity — callsign, archetype, handler preference.

```typescript
interface OperativeProfile {
    callsign: string;
    archetype: string;
    handler: string;
    createdAt: string;
}

OperativeProfileStore.get(): OperativeProfile | null
OperativeProfileStore.set(profile: OperativeProfile): void
OperativeProfileStore.update(partial: Partial<OperativeProfile>): void
OperativeProfileStore.subscribe(fn: () => void): () => void
```

### DifficultySettingsStore
**File:** `src/store/DifficultySettingsStore.ts` | **Key:** `difficultySettings`

```typescript
DifficultySettingsStore.getSettings(): DifficultySetting
DifficultySettingsStore.setSettings(setting: DifficultySetting): void
DifficultySettingsStore.getLevel(): number
DifficultySettingsStore.generateWeightedRandom(): number
```

---

## Mission Execution Stores

### MissionScheduleStore
**File:** `src/store/MissionScheduleStore.ts`

Manages the active mission schedule — loading, completion tracking, navigation between schedule items.

```typescript
MissionScheduleStore.get(): MissionSchedule | null
MissionScheduleStore.set(schedule: MissionSchedule): void
MissionScheduleStore.completeNextItem(): void
MissionScheduleStore.skipNextItem(): void
MissionScheduleStore.clear(): void
MissionScheduleStore.subscribe(fn: () => void): () => void
```

### CustomMissionSchedulesStore
**File:** `src/store/CustomMissionSchedulesStore.ts` | **Key:** `customMissionSchedules`

CRUD for operative-created custom schedules.

```typescript
CustomMissionSchedulesStore.getCustomSchedules(): CustomMissionScheduleJSON[]
CustomMissionSchedulesStore.addCustomSchedule(schedule: CustomMissionScheduleJSON): void
CustomMissionSchedulesStore.updateCustomSchedule(schedule: CustomMissionScheduleJSON): void
CustomMissionSchedulesStore.deleteCustomSchedule(id: string): void
```

### DrillRunStore
**File:** `src/store/DrillRunStore.ts` | **Key:** `ptb:drill-run`

Tracks the currently active drill execution — steps, completion, elapsed time.

```typescript
type DrillRunState = {
    drillId: string;
    drillName: string;
    startedAt: string;
    steps: { id: string; label: string; done: boolean }[];
    completed: boolean;
    elapsedSec: number;
}

DrillRunStore.get(): DrillRunState | null
DrillRunStore.start(drill: Drill): void
DrillRunStore.toggleStep(stepId: string): void
DrillRunStore.complete(): void
DrillRunStore.clear(): void
DrillRunStore.subscribe(fn: (state: DrillRunState | null) => void): () => void
```

Also maintains a telemetry event queue (`ptb:drill-telemetry-queue`) for offline-resilient event recording.

### DrillHistoryStore
**File:** `src/store/DrillHistoryStore.ts` | **Key:** `ptb:drill-history:v1`

Persists the last 100 completed drill records.

```typescript
interface DrillHistoryEntry {
    id: string;
    drillId: string;
    drillName: string;
    elapsedSec: number;
    completedAt: string;
    handler: string;
}

DrillHistoryStore.getAll(): DrillHistoryEntry[]
DrillHistoryStore.record(entry: Omit<DrillHistoryEntry, 'id'>): void
DrillHistoryStore.statsFor(drillId: string): { count, totalSec, bestSec }
DrillHistoryStore.subscribe(fn: () => void): () => void
```

---

## Selection & Filtering Stores

### TrainingModuleSelectionStore
**File:** `src/store/TrainingModuleSelectionStore.ts`

Persists module/sub-module/card-deck/card selection state to localStorage with versioned keys (`trainingSelection:v2:*`).

```typescript
TrainingModuleSelectionStore.getSelectedModules(): SelectionRecord
TrainingModuleSelectionStore.getSelectedSubModules(): SelectionRecord
TrainingModuleSelectionStore.getSelectedCardDecks(): SelectionRecord
TrainingModuleSelectionStore.getSelectedCards(): SelectionRecord
TrainingModuleSelectionStore.setSelectedModules(record: SelectionRecord): void
TrainingModuleSelectionStore.syncDataSignature(signature: string): boolean
TrainingModuleSelectionStore.clear(): void
```

Used by `TrainingModuleCache` to restore selections on data reload.

### DrillFilterStore
**File:** `src/store/DrillFilterStore.ts` | **Key:** `drillFilters:v1`

Persists drill filtering preferences.

```typescript
type DrillFilters = {
    duration: DurationBucket;     // 'any' | '10' | '20' | '30' | '30_plus'
    difficultyMin: number;
    difficultyMax: number;
    keywords: string[];
    categories: string[];
}

DrillFilterStore.get(): DrillFilters
DrillFilterStore.set(filters: Partial<DrillFilters>): void
DrillFilterStore.reset(): void
DrillFilterStore.subscribe(fn: (filters: DrillFilters) => void): () => void
```

---

## Mission Intelligence Stores

### SignalsStore
**File:** `src/store/SignalsStore.ts` | **Key:** `ptb:signals`

Intelligence signals displayed between drill sets.

```typescript
SignalsStore.getAll(): MissionSignal[]
SignalsStore.updateStatus(id: string, status: SignalStatus): void
SignalsStore.subscribe(fn: () => void): () => void
```

Includes an offline queue (`ptb:signals-queue`) for resilient status updates.

### AARStore (After-Action Review)
**File:** `src/store/AARStore.ts` | **Key:** `ptb:aar-entries`

Structured after-action review entries.

```typescript
type AAREntry = {
    id: string;
    createdAt: number;
    sustain: string;
    improve: string;
    actionItems: string;
}

AARStore.getAll(): AAREntry[]
AARStore.add(entry: Omit<AAREntry, 'id' | 'createdAt'>): void
AARStore.update(entry: AAREntry): void
AARStore.exportEntry(id: string): string | null
AARStore.subscribe(fn: () => void): () => void
```

---

## Gamification & UI Stores

### FeatureFlagsStore
**File:** `src/store/FeatureFlagsStore.ts` | **Key:** `featureFlags:v1`

22 feature flags controlling gated features. Merges defaults → config → user progress → overrides.

```typescript
FeatureFlagsStore.get(): FeatureFlags
FeatureFlagsStore.set(flags: Partial<FeatureFlags>): void
FeatureFlagsStore.reset(): void
```

### MissionKitStore
**File:** `src/store/MissionKitStore.ts` | **Key:** `missionKit:visible`

Mission kit visibility and per-drill statistics (`ptb:drill-stats`).

```typescript
MissionKitStore.getKits(): MissionKit[]
MissionKitStore.isVisible(): boolean
MissionKitStore.toggle(): void
MissionKitStore.recordDrillResult(drillId: string, success: boolean): void
```

### ArtifactActionStore
**File:** `src/store/ArtifactActionStore.ts` | **Key:** `ptb:artifact-actions`

Tracks artifact interactions (shared, downloaded, viewed).

### TriageActionStore
**File:** `src/store/TriageActionStore.ts` | **Key:** `ptb:triage-actions`

Records triage decisions (selected, skipped, deferred).

### SettingsStore
**File:** `src/store/SettingsStore.ts` | **Key:** `ptb:user-preferences`

User preferences (sound, theme, Web3 auth integration).

---

## Event Systems

### ProgressEventRecorder
**File:** `src/store/UserProgressEvents.ts`

Records mission completion events and calculates XP/minute rewards.

```typescript
ProgressEventRecorder.onItemCompleted(item, scheduleAfter): void
ProgressEventRecorder.onMissionAborted(): void
```

### Celebration Events
**File:** `src/store/celebrationEvents.ts`

```typescript
emitCelebration(event: CelebrationEvent): void
subscribeCelebrations(fn: CelebrationListener): () => void
detectCelebrations(before: UserProgress, after: UserProgress): CelebrationEvent[]
```

Event types: `LevelUpEvent`, `BadgeUnlockEvent`, `XPGainEvent`.

### Challenge Rotation
**File:** `src/store/challenges.ts`

```typescript
rotateChallengesIfNeeded(existing, catalog, todayIso): ChallengeRotationResult
applyChallengeProgress(challenges, minutesDelta, missionsDelta, asOfDate): ChallengeInstance[]
```

---

## Cache APIs

See [cache-system.md](cache-system.md) for the full cache class reference:

| Cache | File | Purpose |
|---|---|---|
| `TrainingModuleCache` | `src/cache/TrainingModuleCache.ts` | Intelligence content hierarchy |
| `DrillCategoryCache` | `src/cache/DrillCategoryCache.ts` | Physical drill hierarchy |
| `TrainingHandlerCache` | `src/cache/TrainingHandlerCache.ts` | Handler personalities, ranks, difficulty levels |

---

## Domain Model

**Directory:** `src/domain/mission/`

Higher-level business logic layered above stores and caches:

| Module | Purpose |
|---|---|
| `MissionEntityStore.ts` | Entity collection and lifecycle management |
| `lifecycle.ts` | Mission state machine transitions |
| `selectors.ts` | Derived state queries |
| `validation.ts` | Schedule validation rules |
| `triageLifecycleBridge.ts` | Triage → mission scheduling bridge |
| `adapters/` | Data transformation between layers |

---

## Services

**Directory:** `src/services/`

| Service | Purpose |
|---|---|
| `gunIdentity.ts` | Gun.js SEA keypair generation and management |
| `gunProfileBridge.ts` | Syncs operative profile to Gun.js graph |
| `gunStoreSyncs.ts` | Bidirectional Gun.js ↔ localStorage sync |
| `gunSyncAdapter.ts` | Gun.js adapter layer |
| `gunDb.ts` | Gun.js database initialisation |
| `syncStatusStore.ts` | Gun.js sync status tracking |
| `ipfsFetcher.ts` | IPFS content fetching |
| `Web3AuthService.ts` | Web3 wallet authentication |
