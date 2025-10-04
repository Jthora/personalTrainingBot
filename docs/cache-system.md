# Cache System Documentation

## Overview

The Personal Training Bot uses a sophisticated caching system to optimize performance and provide seamless user experience. The cache system consists of three main components that handle different types of data.

## Architecture

### Cache Classes

#### 1. TrainingModuleCache
**Location**: `src/cache/TrainingModuleCache.ts`
**Purpose**: Manages training modules, sub-modules, card decks, and individual cards

**Key Features**:
- Singleton pattern for global access
- Selection state management
- Hierarchical data structure support
- Asynchronous loading with progress tracking

**API**:
```typescript
class TrainingModuleCache {
  // Instance management
  static getInstance(): TrainingModuleCache
  
  // Data loading
  async loadData(trainingModules: TrainingModule[]): Promise<void>
  
  // Module management
  getModule(id: string): TrainingModule | undefined
  getAllModules(): TrainingModule[]
  
  // Selection management
  selectModule(id: string): void
  deselectModule(id: string): void
  getSelectedModules(): Set<string>
  
  // Sub-module management
  getSubModules(moduleId: string): TrainingSubModule[]
  selectSubModule(id: string): void
  deselectSubModule(id: string): void
  getSelectedSubModules(): Set<string>
  
  // Card deck management
  getCardDecks(subModuleId: string): CardDeck[]
  selectCardDeck(id: string): void
  deselectCardDeck(id: string): void
  getSelectedCardDecks(): Set<string>
  
  // Individual card management
  getCards(cardDeckId: string): Card[]
  selectCard(id: string): void
  deselectCard(id: string): void
  getSelectedCards(): Set<string>
}
```

#### 2. TrainingCoachCache
**Location**: `src/cache/TrainingCoachCache.ts`
**Purpose**: Manages coach data and coach-specific configurations

**Key Features**:
- Coach profile management
- Specialized training approaches
- Voice and personality settings
- Training difficulty recommendations

**API**:
```typescript
class TrainingCoachCache {
  static getInstance(): TrainingCoachCache
  async loadData(coachData: CoachData[]): Promise<void>
  
  getCoach(id: string): CoachData | undefined
  getAllCoaches(): CoachData[]
  setActiveCoach(id: string): void
  getActiveCoach(): CoachData | undefined
  
  getCoachTrainingModules(coachId: string): string[]
  getCoachDifficultySettings(coachId: string): DifficultySettings
}
```

#### 3. WorkoutCategoryCache
**Location**: `src/cache/WorkoutCategoryCache.ts`
**Purpose**: Manages workout categories and sub-categories

**Key Features**:
- Category hierarchy management
- Workout filtering and organization
- Performance metrics tracking
- Difficulty progression

**API**:
```typescript
class WorkoutCategoryCache {
  static getInstance(): WorkoutCategoryCache
  async loadData(categories: WorkoutCategory[]): Promise<void>
  
  getCategory(id: string): WorkoutCategory | undefined
  getAllCategories(): WorkoutCategory[]
  
  getSubCategories(categoryId: string): WorkoutSubCategory[]
  getWorkouts(categoryId: string): Workout[]
  
  filterWorkoutsByDifficulty(difficulty: DifficultyLevel): Workout[]
  filterWorkoutsByDuration(minMinutes: number, maxMinutes: number): Workout[]
}
```

## Data Flow

### Initialization Process

1. **Application Startup**
   - `InitialDataLoader.initialize()` called
   - Progress callback registered for loading updates
   - Cache instances created

2. **Data Loading Sequence**
   ```typescript
   // 1. Load training modules
   await TrainingModuleCache.getInstance().loadData(trainingModules);
   
   // 2. Load coach data  
   await TrainingCoachCache.getInstance().loadData(coachData);
   
   // 3. Load workout categories
   await WorkoutCategoryCache.getInstance().loadData(workoutCategories);
   ```

3. **Cache Population**
   - Data structures built in memory
   - Cross-references established
   - Selection state initialized

### Runtime Operations

#### Selection Management
```typescript
// Select a training module
const moduleCache = TrainingModuleCache.getInstance();
moduleCache.selectModule('combat');

// Get selected modules
const selectedModules = moduleCache.getSelectedModules();

// Select specific cards within a module
moduleCache.selectCardDeck('combat_basics');
moduleCache.selectCard('basic_punch');
```

#### Data Retrieval
```typescript
// Get module with all sub-data
const combatModule = moduleCache.getModule('combat');

// Get filtered workout data
const workoutCache = WorkoutCategoryCache.getInstance();
const beginnerWorkouts = workoutCache.filterWorkoutsByDifficulty('beginner');
```

## Performance Optimizations

### Memory Management
- **Lazy Loading**: Sub-modules and cards loaded on demand
- **Weak References**: Prevent memory leaks in long-running sessions
- **Garbage Collection**: Automatic cleanup of unused data

### Caching Strategies
- **In-Memory Cache**: Primary storage for frequently accessed data
- **Session Storage**: Persistent selections across page refreshes
- **Selective Loading**: Only load data for selected modules

### Access Patterns
- **Singleton Pattern**: Single instance per cache type
- **Map-based Storage**: O(1) lookup time for cached data
- **Set-based Selections**: Efficient selection state management

## Error Handling

### Cache Failures
```typescript
try {
  await TrainingModuleCache.getInstance().loadData(modules);
} catch (error) {
  console.error('Cache loading failed:', error);
  // Fallback to basic mode
  initializeBasicMode();
}
```

### Data Integrity
- **Validation**: Data structure validation on load
- **Fallbacks**: Default values for missing data
- **Recovery**: Automatic recovery from corrupted cache

## Cache Invalidation

### Strategies
- **Time-based**: Cache expires after specified duration
- **Event-based**: Cache invalidated on data changes
- **Manual**: Explicit cache clearing for testing

### Implementation
```typescript
// Clear specific cache
TrainingModuleCache.getInstance().clearCache();

// Clear all caches
CacheManager.clearAllCaches();

// Refresh cache with new data
await TrainingModuleCache.getInstance().refreshCache();
```

## Monitoring and Debugging

### Cache Statistics
```typescript
// Get cache statistics
const stats = TrainingModuleCache.getInstance().getStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);
console.log(`Memory usage: ${stats.memoryUsage} MB`);
```

### Debug Mode
```typescript
// Enable cache debugging
TrainingModuleCache.getInstance().enableDebug();

// Log cache operations
TrainingModuleCache.getInstance().logOperations();
```

## Best Practices

### Usage Guidelines
1. **Single Instance**: Always use `getInstance()` method
2. **Async Loading**: Wait for data loading completion
3. **Error Handling**: Implement proper error handling
4. **Memory Awareness**: Monitor cache size in production

### Performance Tips
1. **Batch Operations**: Group related cache operations
2. **Selective Loading**: Only load needed data
3. **Cleanup**: Clear cache when no longer needed
4. **Monitoring**: Track cache performance metrics

## Testing

### Unit Tests
```typescript
describe('TrainingModuleCache', () => {
  beforeEach(() => {
    TrainingModuleCache.getInstance().clearCache();
  });

  it('should load and cache modules correctly', async () => {
    const modules = createMockModules();
    await TrainingModuleCache.getInstance().loadData(modules);
    
    expect(TrainingModuleCache.getInstance().getAllModules())
      .toHaveLength(modules.length);
  });
});
```

### Integration Tests
```typescript
describe('Cache Integration', () => {
  it('should coordinate between all cache types', async () => {
    await initializeAllCaches();
    
    // Test cross-cache operations
    const moduleCache = TrainingModuleCache.getInstance();
    const workoutCache = WorkoutCategoryCache.getInstance();
    
    moduleCache.selectModule('fitness');
    const fitnessWorkouts = workoutCache.filterWorkoutsByModule('fitness');
    
    expect(fitnessWorkouts.length).toBeGreaterThan(0);
  });
});
```

## Future Enhancements

### Planned Features
- **Distributed Caching**: Multi-tab synchronization
- **Compression**: Reduce memory footprint
- **Persistence**: Save cache to IndexedDB
- **Analytics**: Detailed usage tracking

### Performance Improvements
- **Web Workers**: Background cache operations
- **Streaming**: Progressive data loading
- **Prefetching**: Anticipatory data loading
- **Compression**: Reduce data size
