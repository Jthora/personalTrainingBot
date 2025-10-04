# Data Structures Documentation

## Overview

The Personal Training Bot uses a hierarchical data structure to organize training content across multiple domains. This document describes the core data structures and their relationships.

## Core Data Types

### Training Module
```typescript
interface TrainingModule {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  subModules: TrainingSubModule[];
}
```

### Training Sub-Module
```typescript
interface TrainingSubModule {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  cardDecks: CardDeck[];
}
```

### Card Deck
```typescript
interface CardDeck {
  id: string;
  name: string;
  description?: string;
  subModuleId: string;
  cards: Card[];
  difficulty?: DifficultyLevel;
  estimatedTime?: number;
}
```

### Card
```typescript
interface Card {
  id: string;
  title: string;
  content: string;
  type: CardType;
  difficulty?: DifficultyLevel;
  points?: number;
  mediaUrl?: string;
  references?: string[];
}
```

### Workout Data
```typescript
interface WorkoutData {
  id: string;
  name: string;
  category: WorkoutCategory;
  subcategory: WorkoutSubcategory;
  difficulty: DifficultyLevel;
  duration: number;
  exercises: Exercise[];
  equipment?: string[];
}
```

## Data Hierarchy

```
Training Modules (19 total)
├── Agencies
│   ├── CIA Training
│   ├── FBI Training
│   └── Homeland Security
├── Combat
│   ├── Close Quarters Combat
│   ├── Firearms Training
│   └── Tactical Movement
├── Counter PsyOps
│   ├── Manipulation Detection
│   ├── Propaganda Countermeasures
│   └── Psychological Warfare Defense
├── Cybersecurity
│   ├── Digital Forensics
│   ├── Network Security
│   └── Penetration Testing
├── Dance
│   ├── Breakdance
│   ├── Dubstep Glitch
│   └── Industrial Dance
├── Fitness
│   ├── Cardiovascular Endurance
│   ├── Strength Training
│   └── Flexibility and Mobility
├── Intelligence
│   ├── Behavioral Profiling
│   ├── Cyber Intelligence
│   └── Strategic Forecasting
├── Investigation
│   ├── Criminal Profiling
│   ├── Digital Forensics
│   └── Homicide Investigation
├── Martial Arts
│   ├── Wing Chun
│   ├── Shaolin Kung Fu
│   └── Jeet Kune Do
├── PsiOps
│   ├── Energy Manipulation
│   ├── Remote Viewing
│   └── Psychic Shielding
└── ... (9 more modules)
```

## Data Storage

### File Organization
```
src/data/
├── training_modules/
│   ├── training_modules.json        # Module index
│   └── training_sub_modules/        # Sub-module data
│       ├── agencies/
│       │   ├── sub_module.json
│       │   └── card_decks/
│       │       ├── cia_training/
│       │       └── fbi_training/
│       └── ... (other modules)
├── training_coach_data/
│   └── workouts/
│       ├── categories/
│       └── subcategories/
└── cache/                           # Generated path files
    ├── modulePaths.json
    ├── subModulePaths.json
    └── cardDeckPaths.json
```

### Data Generation Scripts
The application uses automated scripts to generate path mappings:
- `generateModulePaths.tsx` - Creates module index
- `generateSubModulePaths.tsx` - Creates sub-module index
- `generateCardDeckPaths.tsx` - Creates card deck index
- `generateWorkoutCategoryPaths.tsx` - Creates workout category index
- `generateWorkoutSubCategoryPaths.tsx` - Creates workout subcategory index

## Configuration Types

### Difficulty Settings
```typescript
interface DifficultySettings {
  beginner: DifficultyLevelData;
  intermediate: DifficultyLevelData;
  advanced: DifficultyLevelData;
  expert: DifficultyLevelData;
}

interface DifficultyLevelData {
  multiplier: number;
  timeLimit?: number;
  hintsAllowed: number;
  pointsMultiplier: number;
}
```

### Workout Schedule
```typescript
interface WorkoutSchedule {
  id: string;
  name: string;
  description?: string;
  workoutBlocks: WorkoutBlock[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkoutBlock {
  id: string;
  name: string;
  duration: number;
  exercises: Exercise[];
  restPeriod?: number;
}
```

## Data Validation

### Schema Validation
All data structures are validated using TypeScript interfaces and runtime validation:
- JSON Schema validation for data files
- TypeScript compile-time checking
- Runtime type guards for API responses

### Data Integrity
- Referential integrity between modules and sub-modules
- Unique ID enforcement across all entities
- Required field validation
- Data format consistency

## Performance Considerations

### Lazy Loading
- Card decks are loaded on-demand
- Images and media are lazy-loaded
- Route-based code splitting

### Caching Strategy
- Generated path files are cached
- Workout data is cached in memory
- User preferences are cached locally

### Data Optimization
- Compressed JSON files for large datasets
- Efficient data structures for quick lookups
- Minimal data transfer for API calls
