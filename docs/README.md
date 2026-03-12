# Archangel Knights Training Console — Architecture

## Overview

The Archangel Knights Training Console is the academy and commissioning authority for the Earth Alliance. It is a React 19 + TypeScript progressive web application built with Vite, designed to train Earth Alliance operatives and Archangel Knights across 19 domains spanning physical combat, intelligence tradecraft, cyber operations, psionic disciplines, and sovereign self-determination.

This document covers the system architecture, data flow, and key design decisions.

## System Architecture

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| UI Framework | React 19 | Component-based UI with hooks |
| Language | TypeScript 5.7 | Type-safe application logic |
| Build | Vite + SWC | Fast development and optimized production builds |
| State | Hand-rolled localStorage stores | Pub/sub state containers — no external state library |
| Identity | Gun.js SEA | Sovereign cryptographic keypair generation and P2P sync |
| Routing | React Router DOM 7 | Mission surface navigation |
| Offline | Custom service worker | Versioned precache, cache-first, stale-while-revalidate |
| Styling | CSS Modules + custom properties | Dark-mode military aesthetic with theme tokens |
| Testing | Vitest + React Testing Library | Unit and component testing |

### Application Layers

```
┌─────────────────────────────────────────────────┐
│                     Routes                       │
│  Mission surfaces: Brief, Triage, Case, Signal,  │
│  Checklist, Debrief, Stats, Plan                 │
├─────────────────────────────────────────────────┤
│                   Components                     │
│  DrillRunner, TriageBoard, SignalsPanel, AAR,    │
│  ArchetypePicker, HandlerPicker, BadgeGallery... │
├─────────────────────────────────────────────────┤
│              Context Providers                   │
│  MissionSchedule, HandlerSelection, Settings     │
├──────────────────┬──────────────────────────────┤
│      Stores      │          Caches              │
│  UserProgress    │  TrainingModuleCache          │
│  DrillHistory    │  DrillCategoryCache           │
│  DrillRun        │  TrainingHandlerCache         │
│  MissionSchedule │                               │
│  OperativeProfile│                               │
│  Signals, AAR    │                               │
├──────────────────┴──────────────────────────────┤
│                   Services                       │
│  GunIdentity, GunProfileBridge, GunStoreSyncs    │
├─────────────────────────────────────────────────┤
│              Static Data Layer                   │
│  988 JSON files: training modules, submodules,   │
│  card decks, drills, handlers, signals, kits     │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **Boot:** `main.tsx` registers the service worker, reads low-data preference, and renders `<App />` inside `SettingsProvider` and `ErrorBoundary`.

2. **Initialization:** `InitialDataLoader` loads training modules, drill categories, and handler data into singleton caches with progress reporting. Heavy console marks track boot-to-shell, shell-to-critical, and enrichment phases.

3. **Mission Shell:** `MissionShell` orchestrates the onboarding gate (guidance → archetype → handler → intake) and renders the tab-navigated mission surfaces (Brief → Triage → Case → Signal → Checklist → Debrief) plus Stats and Plan.

4. **Training execution:** The `DrillRunner` component drives the core training loop — starting drills from `MissionKitStore`, tracking time via `useTimer`, recording completions to `DrillHistoryStore`, and firing XP/progression events through `UserProgressStore`.

5. **Persistence:** All state persists to localStorage via individual store modules. Each store has its own pub/sub notification system (`subscribe()`, `notify()`). Gun.js optionally syncs operative profile data P2P.

## Project Structure

```
src/
  components/       # 49 React component directories organized by feature
  config/           # Feature flags (22 flags) and environment configuration
  context/          # React context providers
    MissionScheduleContext.tsx    # Schedule state and drill scheduling
    HandlerSelectionContext.tsx   # Handler selection and theme application
    SettingsContext.tsx           # App settings including low-data mode
  cache/            # Singleton data caches
    TrainingModuleCache.ts       # Training modules, submodules, card decks, cards
    DrillCategoryCache.ts        # Drill categories, subcategories, groups, exercises
    TrainingHandlerCache.ts      # Handler profiles and speech data
  data/             # 988 static content files
    training_modules/            # 19 module JSONs + 213 submodule JSONs + 663 card deck dirs
    training_handler_data/       # Drill definitions, difficulty levels, ranks, handler speech
    archetypes.ts                # 8 operative archetype definitions
    handlers.ts                  # 5 handler character profiles
    badgeCatalog.ts              # Badge definitions with unlock rules
    challengeCatalog.ts          # Daily/weekly challenge templates
    signals/                     # Signal templates and sample data
    missionKits/                 # Structured multi-drill operation sequences
  domain/           # Domain models
    mission/                     # Mission entity store and operational logic
  hooks/            # 12 custom React hooks
    useTimer.ts                  # Stopwatch and countdown timer
    useReadiness.ts              # Operative readiness assessment
    useBadge.ts                  # Badge unlock detection
    useTelemetry.ts              # Structured event tracking
  pages/            # Mission flow surfaces
    MissionFlow/                 # MissionShell + 8 surfaces (Brief through Plan)
    CardSharePage/               # Card sharing via URL slugs
  routes/           # React Router configuration and legacy redirects
  services/         # External integrations
    gunIdentity.ts               # SEA keypair generation, export, import
    gunProfileBridge.ts          # P2P operative profile sync
    gunStoreSyncs.ts             # Store synchronization over Gun.js
  store/            # localStorage-backed state containers
    UserProgressStore.ts         # XP, levels, streaks, badges, challenges, goals
    OperativeProfileStore.ts     # Callsign, archetype, handler, public key
    DrillRunStore.ts             # Active drill state and telemetry queue
    DrillHistoryStore.ts         # Rolling log of completed drills (max 100)
    MissionScheduleStore.ts      # Schedule generation and management
    SignalsStore.ts              # Operational signals with status workflow
    AARStore.ts                  # After-Action Review entries
    ...and 8 more specialized stores
  styles/           # CSS custom properties theme system
  types/            # TypeScript type definitions
  utils/            # Loaders, telemetry, performance, scheduling utilities
```

## Key Design Decisions

### No External State Library

State management uses hand-rolled singleton stores rather than Redux, Zustand, or MobX. Each store:

- Reads/writes localStorage via `JSON.parse`/`JSON.stringify`
- Maintains a `Set<Listener>` subscriber list
- Exposes `subscribe()` and `notify()` for reactive updates
- Falls back to in-memory storage if localStorage is unavailable

This was chosen for sovereignty and simplicity — no external dependency controls state persistence, and the pattern is consistent across all ~20 stores.

### Sovereignty-First Identity

Operative identity is a locally-generated SEA keypair, not a server-managed account. This aligns with the Earth Alliance's principle that operatives own their identity, not an institution. See [operative-identity.md](operative-identity.md) for full details.

### Offline-First PWA

The service worker (`public/sw.js`) provides:

- Versioned precache with cleanup on activate
- Cache-first for static and training assets
- Stale-while-revalidate for media
- Navigation fallback to `index.html` (SPA-correct)
- Media cache eviction (40 entry cap)
- Diagnostic message port for cache inspection
- `SKIP_WAITING` for seamless updates

This ensures operatives can train regardless of network conditions.

### Feature Flag System

22 feature flags in `src/config/featureFlags.ts` gate progressive capability rollout:

- Environment-specific defaults (dev, staging, production)
- localStorage overrides for testing
- Global kill switch capability
- Runtime feature checking via `isFeatureEnabled()`

### Content Architecture

Training content follows a strict hierarchy: **Module → Submodule → Card Deck → Card**. Content is stored as static JSON and loaded at boot into singleton caches. This enables:

- Offline availability of all training content
- No backend dependency for content delivery
- Sharded loading for performance (training module manifest + shards in `public/`)

## Documentation Index

| Document | Description |
|---|---|
| [Ecosystem](ecosystem.md) | Earth Alliance ecosystem architecture and cross-app integration |
| [Operative Identity](operative-identity.md) | Sovereign identity system and credential specification |
| [Components](components.md) | React component architecture and mission surface reference |
| [Data Structures](data-structures.md) | Training content hierarchy and type definitions |
| [Cache System](cache-system.md) | Data loading, caching strategies, and performance |
| [API Reference](api.md) | Internal store and cache APIs |
| [Development Guide](development.md) | Local setup, coding standards, and testing |
| [Deployment](deployment.md) | Build, deploy, and verify production releases |
| [Contributing](contributing.md) | How to contribute to the Earth Alliance codebase |
| [Troubleshooting](troubleshooting.md) | Common issues and debugging |

## License

This project is licensed under the MIT License — see the [LICENSE](../LICENSE) file for details.
