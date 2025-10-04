# API Documentation

## Overview

The Personal Training Bot uses a local data-driven architecture with cached data structures. This document describes the internal APIs and data management system.

## Cache System

### TrainingModuleCache

The `TrainingModuleCache` class manages the loading and caching of training modules.

```typescript
class TrainingModuleCache {
  static getInstance(): TrainingModuleCache
  async loadData(trainingModules: TrainingModule[]): Promise<void>
  getModule(id: string): TrainingModule | undefined
  getAllModules(): TrainingModule[]
  selectModule(id: string): void
  deselectModule(id: string): void
  getSelectedModules(): Set<string>
}
```

### TrainingCoachCache

Manages coach data and selections for training sessions.

```typescript
class TrainingCoachCache {
  static getInstance(): TrainingCoachCache
  async loadData(coachData: CoachData[]): Promise<void>
  getCoach(id: string): CoachData | undefined
  getAllCoaches(): CoachData[]
}
```

### WorkoutCategoryCache

Handles workout category data and filtering.

```typescript
class WorkoutCategoryCache {
  static getInstance(): WorkoutCategoryCache
  async loadData(categories: WorkoutCategory[]): Promise<void>
  getCategory(id: string): WorkoutCategory | undefined
  getAllCategories(): WorkoutCategory[]
}
```

## Data Loaders

### InitialDataLoader

Orchestrates the loading of all application data with progress tracking.

```typescript
class InitialDataLoader {
  static async initialize(progressCallback?: (progress: number) => void): Promise<void>
}
```

### CardDataLoader

Loads card deck data from the training modules.

```typescript
class CardDataLoader {
  static async loadCardData(): Promise<CardDeck[]>
  static async loadCardDecksByModule(moduleId: string): Promise<CardDeck[]>
}
```

### WorkoutDataLoader

Manages workout data loading and processing.

```typescript
class WorkoutDataLoader {
  static async loadWorkoutData(): Promise<WorkoutsData>
  static async loadWorkoutsByCategory(categoryId: string): Promise<WorkoutCategory[]>
}
```

## Store APIs

### WorkoutScheduleStore

Zustand store for managing workout schedules.

```typescript
interface WorkoutScheduleStore {
  schedules: WorkoutSchedule[]
  currentSchedule: WorkoutSchedule | null
  addSchedule: (schedule: WorkoutSchedule) => void
  updateSchedule: (id: string, updates: Partial<WorkoutSchedule>) => void
  deleteSchedule: (id: string) => void
  setCurrentSchedule: (schedule: WorkoutSchedule | null) => void
}
```

### DifficultySettingsStore

Manages difficulty settings across the application.

```typescript
interface DifficultySettingsStore {
  settings: DifficultySettings
  updateSettings: (updates: Partial<DifficultySettings>) => void
  resetSettings: () => void
}
```

## Utility Functions

### Audio Player

Handles sound effects and audio feedback.

```typescript
class AudioPlayer {
  static play(soundFile: string): void
  static setVolume(volume: number): void
  static mute(): void
  static unmute(): void
}
```

### Card Dealer

Manages card shuffling and dealing logic.

```typescript
class CardDealer {
  static shuffleDeck(deck: Card[]): Card[]
  static dealCards(deck: Card[], count: number): Card[]
  static getRandomCard(deck: Card[]): Card
}
```

## Path Generation

The application uses dynamic path generation for training modules:

- `generateModulePaths.tsx` - Generates module path mappings
- `generateSubModulePaths.tsx` - Generates sub-module path mappings  
- `generateCardDeckPaths.tsx` - Generates card deck path mappings
- `generateWorkoutCategoryPaths.tsx` - Generates workout category paths
- `generateWorkoutSubCategoryPaths.tsx` - Generates workout sub-category paths

These utilities create TypeScript files with path mappings that are used during build time.

## Error Handling

The application uses a standardized error handling approach:

```typescript
interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
}
```

Common error codes:
- `LOAD_ERROR` - Data loading failures
- `CACHE_ERROR` - Cache operation failures
- `VALIDATION_ERROR` - Data validation failures
- `AUDIO_ERROR` - Audio playback failures

## Performance Considerations

- Data is cached in memory for fast access
- Lazy loading is used for large data sets
- Audio files are preloaded for smooth playback
- Build-time path generation reduces runtime overhead
