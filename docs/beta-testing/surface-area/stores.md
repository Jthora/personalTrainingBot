# Stores Catalog

> Complete inventory of every state store in Starcom Academy.

## User Identity & Profile

| Store | File | State | Key Actions |
|---|---|---|---|
| `OperativeProfileStore` | `src/store/OperativeProfileStore.ts` | archetypeId, handlerId, callsign, enrolledAt | `get`, `set`, `patch`, `reset` |
| `SettingsStore` | `src/store/SettingsStore.ts` | Theme (light/dark), nickname, avatar, Web3 wallet | `updateTheme`, `connectWeb3`, `disconnectWeb3` |
| `FeatureFlagsStore` | `src/store/FeatureFlagsStore.ts` | quietMode, soundsEnabled, promptFrequency, challengeOptIn, animationsEnabled, recap toggles, challengeReminders, progressEnabled | `get`, `update`, `reset` |

## Training & Drill Execution

| Store | File | State | Key Actions |
|---|---|---|---|
| `DrillRunStore` | `src/store/DrillRunStore.ts` | Active drill: drillId, title, steps[], startedAt, completed | `start`, `toggleStep`, `clear` |
| `DrillHistoryStore` | `src/store/DrillHistoryStore.ts` | Rolling 100 completed drill records (id, title, elapsedSec, selfAssessment, domainId, notes) | `record`, `list`, `statsForDrill` |
| `DrillFilterStore` | `src/store/DrillFilterStore.ts` | Search, duration bucket, equipment, themes, difficulty range | `saveFilters`, `clearFilters` |
| `DifficultySettingsStore` | `src/store/DifficultySettingsStore.ts` | Difficulty level (1-10), range | `saveSettings`, `getWeightedRandomDifficulty` |

## Training Content & Selection

| Store | File | State | Key Actions |
|---|---|---|---|
| `TrainingModuleSelectionStore` | `src/store/TrainingModuleSelectionStore.ts` | Module/submodule/cardDeck/card selection records, data signature | Selection CRUD, `syncDataSignature` |
| `MissionScheduleStore` | `src/store/MissionScheduleStore.ts` | Schedule, categories/subcategories/groups/drills, taxonomy signature, preset | Full selection CRUD, `regenerateSchedule`, `resetSelections` |
| `CustomMissionSchedulesStore` | `src/store/CustomMissionSchedulesStore.ts` | User-created custom schedules | `saveCustomSchedule`, `updateCustomSchedule`, `deleteCustomSchedule` |
| `MissionKitStore` | `src/store/MissionKitStore.ts` | Today's generated training kit (drills + stats), visibility toggle | `getPrimaryKit`, `regenerateKit`, `recordDrillCompletion`, `toggleVisible` |

## Progression & Gamification

| Store | File | State | Key Actions |
|---|---|---|---|
| `UserProgressStore` | `src/store/UserProgressStore.ts` | XP, level, streakCount, lastActiveDate, streakFrozen, totalDrillsCompleted, badges, dailyGoal, weeklyGoal, challenges, lastRecap, flags | `recordActivity`, `getViewModel`, badge eval, challenge rotation |
| `CardProgressStore` | `src/store/CardProgressStore.ts` | Per-card SR state (10K LRU): interval, lapses, nextReviewAt | `recordReview`, `getCardsDueForReview`, `getModuleReviewStats`, `forecastDue(7)` |
| `QuizSessionStore` | `src/store/QuizSessionStore.ts` | Rolling 50 quiz sessions with questions/answers/scores | `record`, `list`, `listBySource`, `getStats` |
| `ProgressSnapshotStore` | `src/store/ProgressSnapshotStore.ts` | Daily domain score snapshots (≤7000 entries) for trend charts | `captureSnapshotIfNeeded`, `getScoreHistory` |

## Mission Flow

| Store | File | State | Key Actions |
|---|---|---|---|
| `SignalsStore` | `src/store/SignalsStore.ts` | Signal entries (open/ack/resolved), offline queue | `addSignal`, `acknowledge`, `resolve`, `flushQueue` |
| `AARStore` | `src/store/AARStore.ts` | After Action Reports (title, context, actions, outcomes, lessons, followups, role) | `create`, `save`, `remove` |
| `ArtifactActionStore` | `src/store/ArtifactActionStore.ts` | Per-artifact reviewed/promoted flags | `markReviewed`, `markPromoted`, `toggleReviewed`, `togglePromoted` |
| `TriageActionStore` | `src/store/TriageActionStore.ts` | Per-entity triage decisions: ack/escalate/defer/resolve, severity, status | `record`, `clear`, `byAction` |

## Mission Flow Control

| Store | File | State | Key Actions |
|---|---|---|---|
| `missionFlow/continuity` | `src/store/missionFlow/continuity.ts` | operationId, caseId, signalId; checkpoint paths | `readMissionFlowContext`, `writeMissionFlowContext`, `readCheckpoint`, `writeCheckpoint` |
| `missionFlow/routeState` | `src/store/missionFlow/routeState.ts` | Surface states: ready/loading/empty/error | `getMissionSurfaceState(surface)` |
| `missionFlow/triagePreferences` | `src/store/missionFlow/triagePreferences.ts` | Triage density (cozy/compact), view mode (columns/feed) | `readTriagePreferences`, `writeTriagePreferences` |

## Events & Orchestration

| Store | File | State | Key Actions |
|---|---|---|---|
| `celebrationEvents` | `src/store/celebrationEvents.ts` | Celebration event emitter (badges, level-ups) | `detectCelebrations`, `emitCelebration` |
| `UserProgressEvents` | `src/store/UserProgressEvents.ts` | XP rewards orchestrator (drill: 35, block: 20, schedule: 50) | Wires schedule completion → UserProgressStore |

## Store Count Summary

| Category | Count |
|---|---|
| Identity & Profile | 3 |
| Training & Drill | 4 |
| Content & Selection | 4 |
| Progression & Gamification | 4 |
| Mission Flow | 4 |
| Mission Flow Control | 3 |
| Events & Orchestration | 2 |
| **Total** | **24** |

## Storage Architecture

All stores persist to `localStorage` with namespaced keys (prefix `ptb:`). No external database or server-side state. The entire application state can be completely reconstructed from localStorage contents — this is why the data export feature works by dumping all localStorage keys.

### Key Limits
- `CardProgressStore`: LRU capped at 10,000 entries
- `DrillHistoryStore`: Rolling window of 100 entries
- `QuizSessionStore`: Rolling window of 50 entries
- `ProgressSnapshotStore`: Capped at ~7,000 entries (~365 days × 19 domains)
