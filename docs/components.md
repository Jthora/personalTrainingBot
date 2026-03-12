# Component Architecture

## Overview

The Archangel Knights Training Console uses a component architecture organised around the **Mission Flow** — the central operative experience. Components fall into four categories: mission surfaces, drill execution, operative identity, and infrastructure.

## Mission Flow Surfaces

The mission flow is rendered by `MissionShell` (`src/pages/MissionFlow/MissionShell.tsx`), which orchestrates a sequence of surfaces:

| Surface | File | Purpose |
|---|---|---|
| **Brief** | `BriefSurface.tsx` | Mission overview, handler selection, schedule preview |
| **Triage** | `TriageSurface.tsx` | Module and drill selection with filtering |
| **Case** | `CaseSurface.tsx` | Active drill execution — delegates to `DrillRunner` |
| **Signal** | `SignalSurface.tsx` | Mid-mission intelligence cards between drill sets |
| **Checklist** | `ChecklistSurface.tsx` | Mission completion tracking, set/block review |
| **Debrief** | `DebriefSurface.tsx` | After-action review — XP, badges, streak, recap |
| **Plan** | `PlanSurface.tsx` | Schedule builder for upcoming missions |
| **Stats** | `StatsSurface.tsx` | Operative performance metrics and history |

Entry point: `MissionEntryRedirect.tsx` resolves the correct surface based on operative state and routes to the appropriate step.

### Routes

```
/mission/brief      → BriefSurface
/mission/triage     → TriageSurface
/mission/case       → CaseSurface
/mission/signal     → SignalSurface
/mission/checklist  → ChecklistSurface
/mission/debrief    → DebriefSurface
/mission/plan       → PlanSurface
/mission/stats      → StatsSurface
```

## Drill Execution Components

### DrillRunner
**Location:** `src/components/DrillRunner/`

The core training execution component. Renders the active drill, manages timer state, tracks set completion, handles rest intervals, and reports results back to stores.

### TimerDisplay
**Location:** `src/components/TimerDisplay/`

Countdown and stopwatch display driven by `useTimer` hook. Used within drill execution and rest intervals.

### RestInterval
**Location:** `src/components/RestInterval/`

Between-set rest period with countdown timer and motivational handler quotes.

## Operative Identity Components

### OperativeIdentityCard
**Location:** `src/components/OperativeIdentityCard/`

Displays the operative's sovereign identity — callsign, rank, archetype, XP, badges. Used in Brief and Debrief surfaces.

### CallsignInput
**Location:** `src/components/CallsignInput/`

Callsign creation and editing interface for new operatives.

### ProfileEditor
**Location:** `src/components/ProfileEditor/`

Full operative profile editing — callsign, archetype selection, difficulty settings.

### QRCodeDisplay / QRCodeScanner
**Location:** `src/components/QRCodeDisplay/`, `src/components/QRCodeScanner/`

Export and import operative identity via QR code for cross-device portability.

### SovereigntyPanel
**Location:** `src/components/SovereigntyPanel/`

Displays and manages the operative's Gun.js SEA keypair. Export, backup, and sovereignty status.

### ArchetypePicker
**Location:** `src/components/ArchetypePicker/`

Selection interface for operative archetypes (Warrior, Tactician, Diplomat, etc.).

## Handler Components

### HandlerPicker
**Location:** `src/components/HandlerPicker/`

Training handler selection interface. Each handler has a distinct personality, colour theme, and motivational style. Selection changes the visual theme of the training experience.

## Gamification Components

### BadgeGallery / BadgeStrip / BadgeToast
**Location:** `src/components/BadgeGallery/`, `src/components/BadgeStrip/`, `src/components/BadgeToast/`

Badge display (gallery grid, horizontal strip, achievement notification toast). Badges are earned through mission completion, streaks, and challenges.

### XPTicker
**Location:** `src/components/XPTicker/`

Animated XP accumulation display used in debrief.

### CelebrationLayer
**Location:** `src/components/CelebrationLayer/`

Full-screen celebration overlay for level-ups, badge unlocks, and milestone achievements.

### LevelUpModal
**Location:** `src/components/LevelUpModal/`

Modal announcing operative level advancement with rank progression.

### ChallengeBoard / ChallengePanel
**Location:** `src/components/ChallengeBoard/`, `src/components/ChallengePanel/`

Active challenge tracking — daily, weekly, and special challenges with progress bars and reward previews.

## Intelligence & Recap Components

### Signals
**Location:** `src/components/Signals/`

Intelligence card presentation between drill sets. Displays training content cards with key information for the operative to review.

### AAR (After-Action Review)
**Location:** `src/components/AAR/`

Structured after-action review component for mission debrief analysis.

### RecapModal / RecapToast
**Location:** `src/components/RecapModal/`, `src/components/RecapToast/`

Mission recap display — summary of completed drills, XP earned, and performance metrics.

### MissionCycleSummary
**Location:** `src/components/MissionCycleSummary/`

Aggregated view of the operative's mission cycle history and trends.

### DebriefClosureSummary
**Location:** `src/components/DebriefClosureSummary/`

Final closure summary at the end of a debrief — total stats and next-mission recommendations.

## Mission Management Components

### MissionKit
**Location:** `src/components/MissionKit/`

Equipment and module selection kit for mission preparation.

### MissionActionPalette
**Location:** `src/components/MissionActionPalette/`

Quick-action palette for mission state transitions and common operations.

### MissionHeader
**Location:** `src/components/MissionHeader/`

Persistent header during mission flow showing current surface, handler, and progress.

### MissionStepHandoff
**Location:** `src/components/MissionStepHandoff/`

Transition animation and state handoff between mission flow surfaces.

### MissionRouteState
**Location:** `src/components/MissionRouteState/`

Route-level state management for mission flow navigation and deep linking.

### TriageBoard
**Location:** `src/components/TriageBoard/`

Module and drill selection board used within the Triage surface. Filters by category, difficulty, and handler affiliation.

## Schedule & History Components

### Readiness
**Location:** `src/components/Readiness/`

Operative readiness assessment — fatigue, recovery status, and recommended intensity.

### TimelineBand
**Location:** `src/components/TimelineBand/`

Visual timeline of scheduled and completed missions.

### StatsPanel
**Location:** `src/components/StatsPanel/`

Detailed statistics panel — drill history, XP progression, streak tracking, category breakdowns.

### CompetencyChart
**Location:** `src/components/CompetencyChart/`

Radar/spider chart showing operative competency across training domains.

## Sharing Components

### ShareCard
**Location:** `src/components/ShareCard/`

Generates shareable mission summary cards for social sharing.

### ArtifactList
**Location:** `src/components/ArtifactList/`

Lists exportable artifacts (summaries, certificates, share cards).

## Infrastructure Components

### Header
**Location:** `src/components/Header/`

Top-level application header with navigation and operative status.

### LoadingMessage
**Location:** `src/components/LoadingMessage/`

Boot-sequence loading indicator shown during initial data load and cache hydration.

### SurfaceLoader
**Location:** `src/components/SurfaceLoader/`

Lazy-loading wrapper for mission flow surfaces with loading state.

### ErrorBoundary
**Location:** `src/components/ErrorBoundary/`

React error boundary wrapping mission flow and critical paths. Catches render errors and presents recovery options.

### AlertStream
**Location:** `src/components/AlertStream/`

Real-time notification stream for system alerts, sync status, and handler messages.

### CacheIndicator
**Location:** `src/components/CacheIndicator/`

Visual indicator showing cache and data loading status.

### NetworkStatusIndicator
**Location:** `src/components/NetworkStatusIndicator/`

Online/offline status indicator driven by `useNetworkStatus` hook.

### InstallBanner
**Location:** `src/components/InstallBanner/`

PWA install prompt banner using `useInstallPrompt` hook.

### UpdateNotification
**Location:** `src/components/UpdateNotification/`

Service worker update notification using `useServiceWorkerUpdate` hook.

### ScheduleNavigationRefresh
**Location:** `src/components/ScheduleNavigationRefresh/`

Handles schedule data refresh on navigation events.

## Hooks

| Hook | Purpose |
|---|---|
| `useCelebrations` | Triggers celebration effects on achievements |
| `useGunIdentity` | Manages Gun.js SEA keypair lifecycle |
| `useInstallPrompt` | PWA install prompt detection |
| `useIsMobile` | Responsive breakpoint detection |
| `useMissionEntityCollection` | Domain entity collection management |
| `useMissionFlowContinuity` | Preserves mission state across navigation |
| `useMissionSchedule` | Mission schedule loading and management |
| `useNetworkStatus` | Online/offline detection |
| `useSelectionSummary` | Module/deck selection summary |
| `useServiceWorkerUpdate` | SW update detection and prompt |
| `useSyncStatus` | Gun.js sync status tracking |
| `useTimer` | Countdown/stopwatch timer logic |

## Component Conventions

- **CSS Modules**: Each component directory contains a `.module.css` file for scoped styles
- **Handler theming**: Components respect the active handler's colour via CSS custom properties (`--handler-primary`, `--handler-accent`)
- **Offline-first**: All components degrade gracefully when offline
- **Feature flags**: Components check `FeatureFlagsStore` before rendering gated features
- **Test colocation**: Tests live in `__tests__/` directories alongside components
