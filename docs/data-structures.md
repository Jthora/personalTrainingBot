# Data Structures

## Overview

The Archangel Knights Training Console organises training content in two parallel hierarchies — **intelligence content** (training modules → card decks → cards) and **physical drills** (drill categories → subcategories → groups → drills). These hierarchies converge in the **mission schedule**, which interleaves card signals between drill sets.

## Content Hierarchy

```
Training Modules (19)
└── Training Sub-Modules
    └── Card Decks (663)
        └── Cards (3,231)

Drill Categories             
└── Drill Sub-Categories     
    └── Drill Groups          
        └── Drills            

Mission Schedule
├── Mission Set (drill + completion tracking)
└── Mission Block (timed interval)
```

## Intelligence Content Types

### TrainingModule
**File:** `src/types/TrainingModule.ts`

```typescript
type TrainingModule = {
    id: string;
    name: string;
    description: string;
    color: string;
    submodules: TrainingSubModule[];
};
```

The 19 training modules span intelligence agencies, military branches, law enforcement, emergency services, cybersecurity, fitness, and more. Each module has a colour used for UI theming.

### TrainingSubModule
**File:** `src/types/TrainingSubModule.ts`

```typescript
type TrainingSubModule = {
    id: string;
    name: string;
    description: string;
    difficulty: "Beginner" | "Light" | "Standard" | "Intermediate"
             | "Advanced" | "Heavy" | "Challenge" | "Unknown";
    estimated_time: string;     // e.g. "12-24 months"
    focus: string[];            // e.g. ["Close Combat", "Efficiency"]
    cardDecks: CardDeck[];
};
```

### CardDeck
**File:** `src/types/CardDeck.ts`

```typescript
type CardDeck = {
    id: string;
    name: string;
    description: string;
    focus: string[];            // e.g. ["Power", "Speed"]
    badge?: string;             // Gamification badge name
    difficultyTags?: string[];  // e.g. ["Advanced", "Delta III"]
    cards: Card[];
};
```

### Card
**File:** `src/types/Card.ts`

```typescript
type Card = {
    id: string;
    title: string;
    description: string;
    bulletpoints: string[];
    duration: number;           // in minutes
    difficulty: "Beginner" | "Light" | "Standard" | "Intermediate"
             | "Advanced" | "Heavy" | "Challenge" | "Unknown";
    summaryText?: string;       // 140-280 char shareable summary
    classification?: string;    // e.g. "FOUO", "UNCLASS"
};
```

Cards are the atomic unit of intelligence content. They appear during Signal phases between drill sets, giving operatives study material to absorb during rest periods.

## Physical Drill Types

### DrillCategory → DrillSubCategory → DrillGroup → Drill
**File:** `src/types/DrillCategory.ts`

```typescript
class DrillCategory {
    id: string;
    name: string;
    description: string;
    subCategories: DrillSubCategory[];
}

class DrillSubCategory {
    id: string;
    name: string;
    description: string;
    drillGroups: DrillGroup[];
}

class DrillGroup {
    id: string;          // auto-generated from name
    name: string;
    description: string;
    drills: Drill[];
}

class Drill {
    id: string;          // auto-generated from name
    name: string;
    description: string;
    duration: string;
    intensity: string;
    difficulty_range: [number, number];
    equipment?: string[];
    themes?: string[];
    keywords?: string[];
    durationMinutes?: number;
}
```

Drill categories, subcategories, and groups form a four-level hierarchy. The `difficulty_range` tuple enables matching drills to the operative's current difficulty setting.

### Selection Maps

```typescript
type SelectedDrillCategories    = { [key: string]: boolean };
type SelectedDrillSubCategories = { [key: string]: boolean };
type SelectedDrillGroups        = { [key: string]: boolean };
type SelectedDrills             = { [key: string]: boolean };
```

These maps track which categories/groups/drills the operative has selected during Triage.

## Mission Scheduling Types

### MissionSchedule
**File:** `src/types/MissionSchedule.ts`

```typescript
class MissionSchedule {
    date: string;
    scheduleItems: (MissionSet | MissionBlock)[];
    difficultySettings: DifficultySetting;
}
```

A mission schedule represents one day's training session — a sequence of drill sets and rest/interval blocks.

### MissionSet
A set of drills with individual completion tracking:

```typescript
class MissionSet {
    drills: [Drill, boolean][];  // [drill, completed]
    get allWorkoutsCompleted(): boolean;
}
```

### MissionBlock
A timed interval between sets:

```typescript
class MissionBlock {
    name: string;
    description: string;
    duration: number;     // seconds
    intervalDetails: string;
}
```

### CustomMissionSchedule
User-created custom schedules:

```typescript
interface CustomMissionScheduleJSON {
    id?: string;
    name: string;
    description: string;
    missionSchedule: MissionScheduleJSON;
}
```

### Serialisation

Mission schedules serialise to/from JSON for localStorage persistence:

```typescript
interface MissionScheduleJSON {
    date: string;
    scheduleItems: MissionScheduleItemJSON[];
    difficultySettings: DifficultySettingJSON;
}

type MissionScheduleItemJSON = MissionSetJSON | MissionBlockJSON;
type DrillCompletionTupleJSON = [DrillSerialized, boolean];
```

## Difficulty System

**File:** `src/types/DifficultySetting.ts`

```typescript
type DifficultyLevel = number;
type DifficultyRange = [number, number];

class DifficultySetting {
    level: DifficultyLevel;
    range: DifficultyRange;

    static fromLevel(level: DifficultyLevel): DifficultySetting;
    static fromJSON(json: DifficultySettingJSON): DifficultySetting;
    toJSON(): DifficultySettingJSON;
}
```

Difficulty levels are numeric (1–10) with named tiers mapped via `DifficultyLevelData`:

```typescript
interface DifficultyLevelData {
    name: string;
    description: string;
    military_soldier: string[];
    athlete_archetype: string[];
    level: number;
    pft: { pushups, situps, run, pullups, plank, squats };
    requirements: {
        soldier_requirement: string;
        athlete_requirement: string;
        description_requirement: string;
    };
}
```

## Handler Data

**File:** `src/types/HandlerData.ts`

```typescript
interface HandlerData {
    name: string;
    description: string;
    color: string;
    motivational_quotes: string[];
    growls: string[];
    boasts: string[];
}
```

Handlers are the training personalities that guide operatives. Each handler carries a colour theme, motivational voice lines, and personality traits.

## Challenge System

**File:** `src/types/Challenge.ts`

```typescript
interface ChallengeInstance {
    id: string;
    title: string;
    description: string;
    rewardXp: number;
    timeframe: ChallengeTimeframe;   // 'daily' | 'weekly' | 'special'
    startsAt: string;
    endsAt: string;
    progress: number;
    target: number;
    unit: 'minutes' | 'missions';
    completed: boolean;
    claimed: boolean;
    hidden?: boolean;
}
```

Challenges are time-bounded objectives that reward XP. They track progress against specific targets (minutes trained, missions completed).

## Recap & Sharing

**File:** `src/types/RecapSummary.ts`

```typescript
type RecapCopyVariant = 'streaking' | 'low_activity' | 'default';
```

Used to select recap copy tone based on the operative's recent activity pattern.

## Domain Model (Mission Entities)

**Directory:** `src/domain/mission/`

The mission domain model provides higher-level business logic:
- `MissionEntityStore.ts` — entity collection and lifecycle
- `lifecycle.ts` — mission state machine transitions
- `selectors.ts` — derived state queries
- `validation.ts` — mission schedule validation rules
- `triageLifecycleBridge.ts` — bridge between triage selection and mission scheduling
- `adapters/` — data transformation between cache and domain layers
- `types.ts` — domain-specific type definitions

## Static Data

Training content is stored as static JSON files in `public/training_modules_shards/` and loaded via a manifest (`public/training_modules_manifest.json`). The data architecture:

- **988 JSON files** across training modules
- **Sharded by module** for lazy loading
- **Manifest-driven** — the app fetches the manifest first, then loads only the modules the operative has selected
- **Build-generated** — `npm run generate-training-data-combined` processes raw content into the shard structure

## Drill Rank

**File:** `src/types/DrillRank.ts`

```typescript
type DrillRank = {
    name: string;
    description: string;
};
```

Ranks are progression milestones within drill performance tracking.
