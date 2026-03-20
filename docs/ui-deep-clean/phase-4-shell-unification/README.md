# Phase 4 — Shell Unification

> Merge shared shell functionality, fold MissionShell chrome into AppShell v2, remove feature flags.
>
> **Tasks**: ~50 | **Risk**: Medium | **Dependencies**: Phase 3 (onboarding extraction)
>
> **Goal**: Single shell architecture. MissionShell becomes a route group inside AppShell, not a separate shell. `shellV2` flag removed.

---

## Current Architecture

```
Routes.tsx
├── /train, /review, /progress, /profile  →  AppShell (v2)
│   └── Header, BottomNav, CelebrationLayer, MissionActionPalette
│
├── /mission/*  →  MissionShell (v1)  [ALWAYS mounted, regardless of shellV2]
│   └── MissionHeader, StepTools, OperatorAssistant, MissionActionPalette, Onboarding
│
└── /card/:id  →  CardSharePage (standalone, no shell)
```

**Problems**:
- Two completely separate shell implementations with duplicated features
- `MissionShell` is a 654-line monolith mixing navigation, onboarding, SOP hints, telemetry, keyboard shortcuts
- Both shells have their own `MissionActionPalette` (⌘K) implementation
- Both shells have keyboard shortcuts but they aren't shared
- Switching from `/train` to `/mission/*` unmounts one shell and mounts another — context is lost
- `shellV2` flag is `true` everywhere but never removed — dead conditional code

---

## Task Checklist

### Step 4.1 — Shared Shell Provider (10 tasks)

Extract shared concerns into a provider wrapping both shells.

- [ ] `P4-001` Create `src/providers/ShellProvider.tsx` — wraps router, provides shell context
- [ ] `P4-002` Extract keyboard shortcut registration into `src/hooks/useShellKeyboardShortcuts.ts`
- [ ] `P4-003` Extract `MissionActionPalette` trigger into shared hook
- [ ] `P4-004` Create `ShellContext` with: `activePath`, `navigateWithContext()`, `palette state`, `guidanceMode`
- [ ] `P4-005` Move `navigateWithContext()` from MissionShell into shared hook
- [ ] `P4-006` Move `readMissionFlowContext()` into shared utility
- [ ] `P4-007` Move `completedSteps` tracking into shared hook (used across shells)
- [ ] `P4-008` Move tab navigation telemetry into shared hook
- [ ] `P4-009` Wire ShellProvider into App.tsx (above Router)
- [ ] `P4-010` Verify AppShell and MissionShell both consume ShellContext

### Step 4.2 — MissionShell Decomposition (15 tasks)

Break the 654-line monolith into focused modules.

- [ ] `P4-011` Extract SOP assistant hints map (`assistantHints`, L63-105) into `src/data/sopHints.ts`
- [ ] `P4-012` Extract `getArchetypeHints()` logic into `src/utils/archetypeHints.ts`
- [ ] `P4-013` Extract operator assistant rendering (L560-614) into `src/components/OperatorAssistant/OperatorAssistant.tsx`
- [ ] `P4-014` Extract step tools rendering into `src/components/StepToolsBar/StepToolsBar.tsx`
- [ ] `P4-015` Extract step completion tracking into `src/hooks/useStepCompletion.ts`
- [ ] `P4-016` Extract guidance mode toggle into `src/hooks/useGuidanceMode.ts`
- [ ] `P4-017` Extract telemetry instrumentation into `src/hooks/useMissionTelemetry.ts`
- [ ] `P4-018` Extract tab composition logic (coreTabs + feature tabs) into `src/data/missionTabs.ts`
- [ ] `P4-019` Extract route search continuity hook (already exists: `useMissionFlowContinuity`)
- [ ] `P4-020` Remove `jumpToTraining()` from MissionShell (moved to shared OnboardingFlow in Phase 3)
- [ ] `P4-021` Remove onboarding rendering from MissionShell (moved to shared OnboardingFlow in Phase 3)
- [ ] `P4-022` Slim MissionShell to < 200 lines: import hooks + components, compose layout
- [ ] `P4-023` Test MissionShell after decomposition — all mission routes still work
- [ ] `P4-024` Test OperatorAssistant independently — verify SOP hints per route
- [ ] `P4-025` Test StepToolsBar independently — verify complete/continue/palette actions

### Step 4.3 — "Active Duty" Mode in AppShell (8 tasks)

Instead of a separate MissionShell, mission routes render inside AppShell with mission-specific chrome.

- [ ] `P4-026` Merge mission tab composition into AppShell's tab system
- [ ] `P4-027` AppShell: when route matches `/mission/*`, show mission tabs + step tools
- [ ] `P4-028` AppShell: when route matches `/train|/review|/progress|/profile`, show standard tabs
- [ ] `P4-029` `isMissionModeEnabled()` → controls which tab set is active (already partially exists in AppShell L34)
- [ ] `P4-030` Add OperatorAssistant to AppShell when in mission mode
- [ ] `P4-031` Add StepToolsBar to AppShell when in mission mode
- [ ] `P4-032` Ensure mission Outlet renders correctly inside AppShell layout
- [ ] `P4-033` Test: Navigate /train → /mission/brief → /train — no shell unmount/remount

### Step 4.4 — Route Consolidation (8 tasks)

Move mission routes under the AppShell route tree.

- [ ] `P4-034` Move `/mission/*` child routes under `<AppShell>` in Routes.tsx
- [ ] `P4-035` Remove standalone `<MissionShell>` route entry from Routes.tsx
- [ ] `P4-036` Update `Surface` wrapper to handle both shell contexts
- [ ] `P4-037` Preserve all existing URLs — no redirects needed (paths stay same)
- [ ] `P4-038` Remove 11 legacy redirect routes from Routes.tsx (they redirect to now-consolidated paths)
- [ ] `P4-039` Update `resolveShellRoute.ts` to remove v1/v2 branching
- [ ] `P4-040` Test: All 17 lazy-loaded surfaces still render correctly
- [ ] `P4-041` Test: Deep links to `/mission/brief`, `/mission/triage`, etc. still work

### Step 4.5 — Feature Flag Removal (5 tasks)

- [ ] `P4-042` Remove `shellV2` from `FeatureFlagKey` type in `featureFlags.ts`
- [ ] `P4-043` Remove `shellV2` from all environment overrides
- [ ] `P4-044` Remove `isFeatureEnabled('shellV2')` check in Routes.tsx
- [ ] `P4-045` Remove `isFeatureEnabled('shellV2')` checks in `resolveShellRoute.ts`, `TrainingSurface.tsx`
- [ ] `P4-046` Delete `src/routes/missionCutover.ts` — all exports are dead code:
  - `isMissionRouteEnabled()` — always returns `true`
  - `toHomeFallbackPath()` — zero callers
  - `missionHomeFallbacks` — unused map

### Step 4.6 — Verification

- [ ] `P4-V01` All routes render: `/train`, `/review`, `/progress`, `/profile`, `/mission/brief`, `/mission/triage`, `/mission/case`, `/mission/signal`, `/mission/checklist`, `/mission/debrief`, `/mission/stats`, `/mission/plan`, `/mission/training`
- [ ] `P4-V02` ⌘K palette works on all routes
- [ ] `P4-V03` Keyboard shortcuts (⌘1-9) work on all routes
- [ ] `P4-V04` Mission tab transitions preserve route search context
- [ ] `P4-V05` Step completion tracking persists across route changes
- [ ] `P4-V06` Operator assistant shows correct SOP hints per route
- [ ] `P4-V07` No shell unmount/remount when switching between standard and mission tabs
- [ ] `P4-V08` `npm test` → all unit tests pass
- [ ] `P4-V09` `npm run test:beta` → all beta E2E tests pass

---

## Architecture After Phase 4

```
Routes.tsx
├── <ShellProvider>
│   └── <AppShell>  (unified shell)
│       ├── Header (always)
│       ├── Standard tabs: /train, /review, /progress, /profile
│       ├── Mission tabs: /mission/brief, /mission/triage, ...  (Active Duty mode)
│       ├── OperatorAssistant (mission mode only)
│       ├── StepToolsBar (mission mode only)
│       ├── MissionActionPalette (⌘K, always)
│       ├── CelebrationLayer (always)
│       └── BottomNav (mobile, tab set based on mode)
│
└── /card/:id  →  CardSharePage (standalone, no shell)
```

MissionShell.tsx is deleted or reduced to a thin wrapper that's no longer needed.
