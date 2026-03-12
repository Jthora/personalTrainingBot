# Cache System

## Overview

The Archangel Knights Training Console uses three singleton cache classes to hold training content in memory after initial load. These caches sit between the static JSON data files and the UI components, providing indexed lookups, selection state, and filtering.

```
Static JSON  →  Data Loaders  →  Cache Singletons  →  Components / Stores
(public/)        (utils/)          (src/cache/)         (src/components/)
```

## Cache Classes

### TrainingModuleCache
**File:** `src/cache/TrainingModuleCache.ts` (364 lines)

Manages the intelligence content hierarchy: modules → sub-modules → card decks → cards.

#### Singleton Access
```typescript
const cache = TrainingModuleCache.getInstance();
```

#### Data Loading
```typescript
await cache.loadData(trainingModules: TrainingModule[]): Promise<void>
cache.isLoaded(): boolean
```

On load, the cache:
1. Indexes every card with metadata (`CardMeta`: module name/colour, sub-module, deck)
2. Generates URL-safe slugs for deep-linkable card sharing
3. Syncs selection state with `TrainingModuleSelectionStore` via a data signature check

#### Module & Selection Management
```typescript
cache.getTrainingModule(id: string): TrainingModule | undefined

// Toggle selection at each hierarchy level
cache.toggleModuleSelection(id: string): void
cache.toggleSubModuleSelection(id: string): void
cache.toggleCardDeckSelection(id: string): void
cache.toggleCardSelection(id: string): void

// Check selection state
cache.isModuleSelected(id: string): boolean
cache.isSubModuleSelected(id: string): boolean
cache.isCardDeckSelected(id: string): boolean
cache.isCardSelected(id: string): boolean

// Bulk selection
cache.selectModules(selections: SelectionRecord): void
```

#### Card Index
```typescript
cache.getCardMeta(cardId: string): CardMeta | undefined
cache.getCardById(cardId: string): Card | undefined
cache.getSlugForCard(cardId: string): string | undefined
cache.getCardIdBySlug(slug: string): string | undefined
```

The card index enables O(1) lookups by card ID or URL slug, which powers the card sharing feature (`/share/:slug`).

#### Selection Change Subscription
```typescript
const unsubscribe = cache.subscribeToSelectionChanges(listener: () => void);
```

Components subscribe to selection changes for reactive re-renders without a global state library.

#### CardMeta Type
```typescript
interface CardMeta {
    moduleId: string;
    moduleName: string;
    moduleColor: string;
    subModuleId: string;
    subModuleName: string;
    cardDeckId: string;
    cardDeckName: string;
}
```

---

### DrillCategoryCache
**File:** `src/cache/DrillCategoryCache.ts` (380 lines)

Manages the physical drill hierarchy: categories → sub-categories → groups → drills.

#### Singleton Access
```typescript
const cache = DrillCategoryCache.getInstance();
```

#### Data Loading
```typescript
await cache.loadData(categories: DrillCategory[]): Promise<void>
await cache.reloadData(categories: DrillCategory[]): Promise<void>
cache.isLoading(): boolean
```

#### Category & Drill Access
```typescript
cache.getWorkoutCategories(): DrillCategory[]
cache.getDrillCategory(id: string): DrillCategory | undefined
cache.getAllWorkouts(): Drill[]
cache.getAllWorkoutsSelected(): Drill[]
await cache.fetchAllWorkoutsInCategory(categoryId: string): Promise<Drill[]>
```

#### Selection Management
```typescript
// Toggle selection at each hierarchy level
cache.toggleCategorySelection(id: string): void
cache.toggleSubCategorySelection(id: string): void
cache.toggleDrillGroupSelection(id: string): void
cache.toggleWorkoutSelection(id: string): void

// Check selection state
cache.isCategorySelected(id: string): boolean
cache.isSubCategorySelected(id: string): boolean
cache.isDrillGroupSelected(id: string): boolean
cache.isWorkoutSelected(id: string): boolean

// Bulk operations
cache.selectAll(): void
cache.unselectAll(): void
cache.applyPreset(preset: DrillPreset): void
```

#### Difficulty Filtering
```typescript
cache.getWorkoutsByDifficultyRange(minLevel: number, maxLevel: number, count: number): Drill[]
cache.getWorkoutsBySingleDifficultyLevel(level: number, count: number): Drill[]
cache.getAllWorkoutsFilteredBy(/* filters */): Drill[]
```

These methods power the Triage surface, where operatives filter available drills by difficulty range and category before building a mission schedule.

---

### TrainingHandlerCache
**File:** `src/cache/TrainingHandlerCache.ts` (104 lines)

Manages handler personalities, drill ranks, and difficulty level definitions.

#### Singleton Access
```typescript
const cache = TrainingHandlerCache.getInstance();
```

#### Data Loading
```typescript
await cache.loadData(): Promise<void>          // Loads all handler data (with optional IndexedDB caching)
await cache.loadRanks(): Promise<void>
await cache.loadDifficultyLevels(): Promise<void>
await cache.loadHandlerData(): Promise<void>
```

When the `loadingCacheV2` feature flag is enabled, `loadData()` uses IndexedDB-backed caching via `withCache()` for faster subsequent loads.

#### Handler Voice Lines
```typescript
cache.getHandlerData(handler?: string): HandlerData
cache.getRandomMotivationalQuote(handler?: string): string
cache.getRandomBoast(handler?: string): string
cache.getRandomGrowl(handler?: string): string
```

Default handler: `"tiger_fitness_god"`. Handler voice lines are displayed during drill execution, rest intervals, and debrief.

#### Reference Data
```typescript
cache.getRanks(): DrillRank[]
cache.getDifficultyLevels(): DrillDifficultyLevel[]
```

## IndexedDB Caching Layer

**Utility:** `src/utils/cache/indexedDbCache.ts`

The `withCache()` wrapper provides a secondary caching layer backed by IndexedDB:

```typescript
const result = await withCache<T>(
    storeName: string,
    key: string,
    ttlMs: number,
    versionTag: string,
    fetcher: () => Promise<T>,
    options?: { logger }
): Promise<{ data: T; source: 'cache' | 'network' }>
```

TTL constants are defined in `src/utils/cache/constants.ts`. This layer is gated behind the `loadingCacheV2` feature flag.

## Data Flow: Boot to Ready

```
1. App boots → MissionShell mounts
2. InitialDataLoader.initialize() called with progress callback
3. Training module manifest fetched from /training_modules_manifest.json
4. Module shards fetched in parallel from /training_modules_shards/
5. TrainingModuleCache.loadData() populates module/card index
6. DrillCategoryCache.loadData() populates drill hierarchy
7. TrainingHandlerCache.loadData() loads handler personalities + ranks
8. Selection state hydrated from localStorage via stores
9. UI renders with cached data — no further network requests needed
```

## Persistence

Caches are **in-memory only** — they are reconstructed from static files on every page load. Selection state and operative progress are persisted separately via localStorage stores. The IndexedDB cache layer (when enabled) avoids redundant network fetches on subsequent visits.
