# Development Guide

## Prerequisites

- Node.js 18+
- npm package manager

## Development Setup

### Environment Variables
Create a `.env` file in the project root:
```env
VITE_APP_ENV=development
```

Feature flags can be overridden via environment:
```env
VITE_FEATURE_FLAGS='{"archetypeSystem":true,"drillRunnerUpgrade":true}'
```

### Install and Run
```bash
npm install
npm run dev
```

The development server runs on Vite with hot module replacement. The `dev` script automatically generates module paths, submodule paths, card deck paths, and workout category paths before starting the server.

## Project Conventions

### Component Organization
Each component has its own directory under `src/components/`:
```
components/
  DrillRunner/
    DrillRunner.tsx
    DrillRunner.module.css
  BadgeGallery/
    BadgeGallery.tsx
    BadgeGallery.module.css
```

### File Naming
- Components: `PascalCase.tsx` in PascalCase directories
- Hooks: `use[Name].ts` (e.g., `useTimer.ts`, `useReadiness.ts`)
- Stores: `[Name]Store.ts` (e.g., `UserProgressStore.ts`, `DrillRunStore.ts`)
- Utilities: `camelCase.ts`
- Types: `PascalCase.ts`
- Styles: `ComponentName.module.css`

### Import Organization
```typescript
// External libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Internal components
import DrillRunner from '../DrillRunner/DrillRunner';

// Types
import { MissionSchedule } from '../../types/MissionSchedule';

// Stores and services
import { DrillHistoryStore } from '../../store/DrillHistoryStore';

// Utilities
import { mark, measure } from '../../utils/perf';

// Styles
import styles from './ComponentName.module.css';
```

## State Management

### Store Pattern
All stores follow the same hand-rolled pattern — no external state libraries:

```typescript
// Typical store structure
const STORAGE_KEY = 'ptb:store-name';
type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach(fn => fn());
}

function persist(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* in-memory fallback */ }
}
```

### Key localStorage Keys
| Key | Store | Purpose |
|---|---|---|
| `userProgress:v1` | UserProgressStore | XP, level, streaks, badges, challenges |
| `operative:profile:v1` | OperativeProfileStore | Archetype, handler, callsign |
| `ptb:drill-run` | DrillRunStore | Active drill state |
| `ptb:drill-history:v1` | DrillHistoryStore | Completed drill log (max 100) |
| `ptb:aar-entries` | AARStore | After-Action Review entries |
| `ptb:signals` | SignalsStore | Operational signals |
| `ptb:gun-identity` | GunIdentityService | SEA keypair |
| `difficultySettings` | DifficultySettingsStore | Difficulty level (1-10) |

### React Context
Context providers wrap components that need shared non-persisted state:
- `MissionScheduleContext` — Schedule state and drill scheduling
- `HandlerSelectionContext` — Handler selection and theme application
- `SettingsContext` — App settings including low-data mode

## Styling

### CSS Custom Properties
The theme is defined in `src/styles/theme.css` with a comprehensive token system:
- Surface colors (`--surface-base`, `--surface-card`, `--surface-elevated`)
- Text colors (`--text-primary`, `--text-muted`, `--text-accent`)
- Mission severity levels, trust levels, state indicators
- Typography scale using `clamp()` for responsive sizing

### CSS Modules
Components use CSS Modules for scoped styling:
```css
/* DrillRunner.module.css */
.container {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
}

.title {
  font-family: var(--font-heading);
  color: var(--text-primary);
}
```

### Handler Theming
Handler selection dynamically updates CSS custom properties (`--coach-accent`, `--surface-card`, etc.) so the entire UI adapts to the selected handler's color palette.

## Routing

### Mission Flow
The primary route structure is a nested mission shell:
```
/mission           → MissionShell (tabs + onboarding gate)
  /mission/brief   → BriefSurface
  /mission/triage  → TriageSurface
  /mission/case    → CaseSurface
  /mission/signal  → SignalSurface
  /mission/checklist → ChecklistSurface
  /mission/debrief → DebriefSurface
  /mission/stats   → StatsSurface (feature-flagged)
  /mission/plan    → PlanSurface (feature-flagged)
```

Legacy routes (`/home/*`, `/schedules`, `/drills`, `/training`, `/settings`) redirect to their mission surface equivalents.

### Lazy Loading
All mission surfaces are lazy-loaded with `React.lazy()` and wrapped in `<Suspense>` with a `SurfaceLoader` fallback.

## Feature Flags

22 feature flags in `src/config/featureFlags.ts` control progressive rollout:

```typescript
import { isFeatureEnabled } from './config/featureFlags';

if (isFeatureEnabled('drillRunnerUpgrade')) {
  // Enhanced drill runner with timer, history, rest intervals
}
```

Flags can be overridden via:
- Environment variables (`VITE_FEATURE_FLAGS`)
- localStorage (`ptb:feature-flag-overrides`)
- Per-environment defaults (dev/staging/production)

## Testing

### Running Tests
```bash
# All unit tests
npm run test

# Watch mode
npx vitest --watch

# Coverage report
npx vitest --coverage

# Headless smoke test
npm run smoke:headless

# Operative scenario simulation
BASE_URL=http://localhost:4173 npm run test:psi-scenario
```

### Test Structure
Tests live alongside their source in `__tests__/` directories:
```
store/
  __tests__/
    UserProgressStore.test.ts
    DrillHistoryStore.test.ts
components/
  __tests__/
    DrillRunner.test.tsx
    ChallengeBoard.test.tsx
```

### Writing Tests
- Use Vitest with React Testing Library for component tests
- Use `jsdom` environment (configured in `vitest.config.ts`)
- Mock localStorage for store tests
- Mock Gun.js for identity/sync tests

## Build Process

### Production Build
```bash
npm run build
```

The build process:
1. Generates combined training data
2. Generates module, submodule, card deck, and workout category path mappings
3. TypeScript compilation
4. Vite bundling with SWC

### Analysis
```bash
# Bundle visualization
npm run analyze

# Payload size report
npm run report:sizes

# Mission route payload report
npm run report:mission-route-payloads
```

## Quality Gates

```bash
# Lint
npm run lint

# Type checking
npx tsc --noEmit

# Payload budget verification
npm run check:payload-budgets

# Service worker offline validation
npm run check:sw-offline

# Deep link validation
npm run check:deeplinks
```

## Debugging

### Browser Developer Tools
- **React DevTools** — Component tree, state inspection
- **Application tab** — localStorage contents, service worker status, cache storage
- **Network tab** — Asset loading, training data requests

### Cache Debug Mode
In development, `registerCacheDebug()` exposes cache inspection utilities on the global scope for debugging data loading issues.

### Performance Marks
The app records Performance API marks at key lifecycle points:
- `load:boot_start` — Application entry
- `load:shell_painted` — First meaningful paint
- `load:critical_ready` — Data loaded, interactive
- `load:enrichment_done` — Background caches warmed
- `load:idle_warm_done` — All warming complete
