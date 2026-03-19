# UI Deep Clean — Progress Tracker

> Master checklist across all 6 phases. Update checkboxes as tasks complete.
>
> **Total tasks: ~280** | **Verification tasks: ~30**

---

## Phase 1 — Domain & URL Migration (35 tasks + 4 verification)

<details><summary>Tasks P1-001 through P1-035</summary>

### index.html (10 tasks)
- [ ] `P1-001` OG URL
- [ ] `P1-002` OG image URL
- [ ] `P1-003` Twitter image URL
- [ ] `P1-004` Canonical URL
- [ ] `P1-005` humans.txt link
- [ ] `P1-006` JSON-LD Organization URL
- [ ] `P1-007` JSON-LD Organization sameAs
- [ ] `P1-008` JSON-LD WebApplication URL
- [ ] `P1-009` WebApplication operatingSystem offers URL
- [ ] `P1-010` JSON-LD Course provider URL

### manifest.webmanifest (3 tasks)
- [ ] `P1-011` start_url
- [ ] `P1-012` id
- [ ] `P1-013` scope

### Service Worker (2 tasks)
- [ ] `P1-014` Cache names referencing old domain
- [ ] `P1-015` Offline fallback URLs

### Source Code (8 tasks)
- [ ] `P1-016` telemetryContracts.ts appUrl
- [ ] `P1-017` CardDataLoader.ts share URLs
- [ ] `P1-018` ShareCard.tsx share URLs
- [ ] `P1-019` p2pService.ts relay URLs
- [ ] `P1-020` p2pService.ts topic prefixes
- [ ] `P1-021` SovereigntyPanel.tsx export URLs
- [ ] `P1-022` All GitHub repo URL references
- [ ] `P1-023` package.json homepage field

### Config Files (6 tasks)
- [ ] `P1-024` vercel.json headers/rewrites
- [ ] `P1-025` _redirects file
- [ ] `P1-026` _headers file
- [ ] `P1-027` robots.txt (if exists)
- [ ] `P1-028` sitemap.xml (if exists)
- [ ] `P1-029` CNAME / DNS config docs

### Documentation (4 tasks)
- [ ] `P1-030` README.md URLs
- [ ] `P1-031` docs/ folder references
- [ ] `P1-032` LICENSE file
- [ ] `P1-033` CONTRIBUTING.md URLs

### localStorage (2 tasks)
- [ ] `P1-034` Audit `ptb:` prefixed keys — document migration path
- [ ] `P1-035` Audit `mission:` prefixed keys — document as-is

### Verification
- [ ] `P1-V01` grep for old domain → 0 results
- [ ] `P1-V02` Build succeeds
- [ ] `P1-V03` All tests pass
- [ ] `P1-V04` Lighthouse SEO 100

</details>

---

## Phase 2 — CSS Token Cleanup (~93 tasks + 4 verification)

<details><summary>Tasks P2-001 through P2-093</summary>

### Dead alias deletion (7)
- [x] `P2-001` `--primary-bg-color`
- [x] `P2-002` `--secondary-bg-color`
- [x] `P2-003` `--primary-text-color`
- [x] `P2-004` `--secondary-text-color`
- [x] `P2-005` `--border-color`
- [x] `P2-006` `--padding`
- [x] `P2-007` `--border-radius`

### `--handler-accent` → `--accent` (26 files)
- [x] `P2-008` Header.module.css (14)
- [x] `P2-009` SovereigntyPanel.module.css (9)
- [x] `P2-010` ArchetypePicker.module.css (6)
- [x] `P2-011` HandlerPicker.module.css (6)
- [x] `P2-012` AppShell.module.css (5)
- [x] `P2-013` TriageBoard.module.css (5)
- [x] `P2-014` LevelUpModal.module.css (4)
- [x] `P2-015` MissionFlow.module.css (4)
- [x] `P2-016` ArtifactList.module.css (3)
- [x] `P2-017` ErrorBoundary.module.css (3)
- [x] `P2-018` ProfileSurface.module.css (3)
- [x] `P2-019` ReviewDashboard.module.css (3)
- [x] `P2-020` CallsignInput.module.css (2)
- [x] `P2-021` ChallengeBoard.module.css (2)
- [x] `P2-022` ChallengePanel.module.css (2)
- [x] `P2-023` CompetencyChart.module.css (2)
- [x] `P2-024` MissionIntakePanel.module.css (2)
- [x] `P2-025` OperativeIdentityCard.module.css (2)
- [x] `P2-026` ProfileEditor.module.css (2)
- [x] `P2-027` SurfaceLoader.module.css (2)
- [x] `P2-028` MissionStepHandoff.module.css (1)
- [x] `P2-029` MissionActionPalette.module.css (1)
- [x] `P2-030` MissionRouteState.module.css (1)
- [x] `P2-031` RestInterval.module.css (1)
- [x] `P2-032` StatsSurface.module.css (1)
- [x] `P2-033` LoadingMessage.module.css (1)

### Remaining handler aliases (6)
- [x] `P2-034` `--handler-accent-soft` → `--accent-soft` (9 refs)
- [x] `P2-035` `--handler-accent-strong` → `--accent-strong` (1 ref)
- [x] `P2-036` `--handler-glow` → `--accent-glow` (4 refs)
- [x] `P2-037` `--handler-border` → `--accent-border` (3 refs)
- [x] `P2-038` `--panel-bg` → `--surface-card` (1 ref)
- [x] `P2-039` Delete handler/panel alias definitions from theme.css

### `--mission-type-*` → `--type-*` (18 files)
- [x] `P2-040` MissionFlow.module.css (9)
- [x] `P2-041` ArtifactList.module.css (9)
- [x] `P2-042` TriageBoard.module.css (8)
- [x] `P2-043` DebriefClosureSummary.module.css (5)
- [x] `P2-044` MissionCycleSummary.module.css (5)
- [x] `P2-045` TimelineBand.module.css (5)
- [x] `P2-046` MissionHeader.module.css (5)
- [x] `P2-047` AlertStream.module.css (5)
- [x] `P2-048` MissionActionPalette.module.css (4)
- [x] `P2-049` MissionIntakePanel.module.css (4)
- [x] `P2-050` MissionStepHandoff.module.css (3)
- [x] `P2-051` HandlerPicker.module.css (3)
- [x] `P2-052` ArchetypePicker.module.css (3)
- [x] `P2-053` ReviewDashboard.module.css (3)
- [x] `P2-054` AppShell.module.css (2)
- [x] `P2-055` ProfileSurface.module.css (2)
- [x] `P2-056` MissionRouteState.module.css (2)
- [x] `P2-057` Delete `--mission-type-*` definitions from theme.css

### Mismatched fallback hex values (7)
- [x] `P2-058` QuizRunner: `#6c63ff` → `#5A7FFF`
- [x] `P2-059` DataSafetyPanel: `#6c63ff` → `#5A7FFF`
- [x] `P2-060` TodayLauncher: `#6c63ff` → `#5A7FFF`
- [x] `P2-061` ExerciseRenderer: `#4a6cf7` → `#5A7FFF`
- [x] `P2-062` ModuleBrowser: `#6c63ff` → `#5A7FFF`
- [ ] `P2-063` DrillRunner: audit fallbacks
- [x] `P2-064` All remaining `var(--accent, #...)` mismatches

### Hardcoded hex → tokens (13)
- [ ] `P2-065` SovereigntyPanel (7 colors)
- [ ] `P2-066` ChallengeBoard (5 colors)
- [ ] `P2-067` ChallengePanel (4 colors)
- [ ] `P2-068` BadgeStrip (4 colors)
- [ ] `P2-069` CardSharePage (3 colors)
- [ ] `P2-070` LoadingMessage (3 colors)
- [ ] `P2-071` AppShell (3 colors)
- [ ] `P2-072` WeeklySummary (2 colors)
- [ ] `P2-073` StatsPanel (2 colors)
- [ ] `P2-074` BadgeGallery (2 colors)
- [ ] `P2-075` CompetencyChart (2 colors)
- [ ] `P2-076` XPTicker (1 color)
- [ ] `P2-077` ReviewDashboard.tsx inline colors

### Z-index tokenization (13)
- [ ] `P2-078` Add z-index tokens to theme.css
- [ ] `P2-079` Header.module.css
- [ ] `P2-080` MissionActionPalette.module.css
- [ ] `P2-081` RecapToast.module.css
- [ ] `P2-082` LevelUpModal.module.css
- [ ] `P2-083` ProfileEditor.module.css
- [ ] `P2-084` RecapModal.module.css
- [ ] `P2-085` UpdateNotification.module.css
- [ ] `P2-086` InstallBanner.module.css
- [ ] `P2-087` BadgeToast.module.css
- [ ] `P2-088` AppShell.module.css
- [ ] `P2-089` XPTicker.module.css
- [ ] `P2-090` SovereigntyPanel.module.css

### Font & misc (3)
- [ ] `P2-091` SovereigntyPanel: `'Courier New'` → `var(--font-mono)`
- [ ] `P2-092` ShareCard: remove `'Roboto Mono'`
- [ ] `P2-093` Breakpoint documentation in theme.css

### Verification
- [x] `P2-V01` Legacy alias grep → 0 results
- [x] `P2-V02` Unit tests pass
- [ ] `P2-V03` Beta tests pass
- [ ] `P2-V04` Visual comparison — no rendering changes

</details>

---

## Phase 3 — Loading & First Impression (~39 tasks + 6 verification)

<details><summary>Tasks P3-001 through P3-039</summary>

### HTML Splash (5)
- [ ] `P3-001` Design splash markup
- [ ] `P3-002` Inline `<style>` in index.html
- [ ] `P3-003` Add splash HTML inside `<div id="root">`
- [ ] `P3-004` Set body background color
- [ ] `P3-005` Reduced motion media query

### LoadingMessage Redesign (8)
- [ ] `P3-006` Replace "App Loading" text
- [ ] `P3-007` Add branded logo/icon
- [x] `P3-008` Fix `--handler-accent` → `--accent`
- [ ] `P3-009` Convert kebab → camelCase CSS classes
- [ ] `P3-010` Fix hardcoded `#ffffff`
- [ ] `P3-011` Fix hardcoded `#ffe1b3`
- [ ] `P3-012` Add loading stage labels
- [ ] `P3-013` Test reduced motion path

### Suspense Fallback Audit (6)
- [ ] `P3-014` Fix `fallback={null}` in App.tsx
- [ ] `P3-015` Brand SurfaceLoader spinner
- [ ] `P3-016` Add aria-live to SurfaceLoader
- [ ] `P3-017` Verify SovereigntyPanel Suspense styles
- [ ] `P3-018` Add skeleton states for heavy surfaces
- [ ] `P3-019` Measure lazy-load waterfall

### Onboarding Port (15)
- [ ] `P3-020` Create OnboardingFlow.tsx
- [ ] `P3-021` Extract GuidanceOverlay
- [ ] `P3-022` Extract ArchetypeStep
- [ ] `P3-023` Extract HandlerStep
- [ ] `P3-024` Extract IntakeStep
- [ ] `P3-025` Create useOnboardingState hook
- [ ] `P3-026` Wire into AppShell
- [ ] `P3-027` Maintain fast-path skip
- [ ] `P3-028` Preserve telemetry events
- [ ] `P3-029` Update MissionShell to use shared component
- [ ] `P3-030` Test: new user AppShell path
- [ ] `P3-031` Test: fast-path skip
- [ ] `P3-032` Test: returning user
- [ ] `P3-033` Test: MissionShell path
- [ ] `P3-034` localStorage key compatibility

### Boot Perf Budget (5)
- [ ] `P3-035` Establish FCP target
- [ ] `P3-036` Establish LCP target
- [ ] `P3-037` Measure current FCP/LCP
- [ ] `P3-038` Measure post-change FCP/LCP
- [ ] `P3-039` Add CI regression check

### Verification
- [ ] `P3-V01` No white flash (video capture)
- [ ] `P3-V02` New user onboarding in AppShell
- [ ] `P3-V03` Returning user loads directly
- [ ] `P3-V04` Reduced motion works
- [ ] `P3-V05` Unit tests pass
- [ ] `P3-V06` Beta tests pass

</details>

---

## Phase 4 — Shell Unification (~46 tasks + 9 verification)

<details><summary>Tasks P4-001 through P4-046</summary>

### Shared Shell Provider (10)
- [ ] `P4-001` Create ShellProvider
- [ ] `P4-002` Extract keyboard shortcuts hook
- [ ] `P4-003` Extract palette trigger hook
- [ ] `P4-004` Create ShellContext
- [ ] `P4-005` Move navigateWithContext
- [ ] `P4-006` Move readMissionFlowContext
- [ ] `P4-007` Move completedSteps tracking
- [ ] `P4-008` Move tab telemetry
- [ ] `P4-009` Wire into App.tsx
- [ ] `P4-010` Verify both shells consume context

### MissionShell Decomposition (15)
- [ ] `P4-011` Extract SOP hints map
- [ ] `P4-012` Extract getArchetypeHints
- [ ] `P4-013` Extract OperatorAssistant component
- [ ] `P4-014` Extract StepToolsBar component
- [ ] `P4-015` Extract useStepCompletion hook
- [ ] `P4-016` Extract useGuidanceMode hook
- [ ] `P4-017` Extract useMissionTelemetry hook
- [ ] `P4-018` Extract tab composition data
- [ ] `P4-019` Extract route continuity hook
- [ ] `P4-020` Remove jumpToTraining
- [ ] `P4-021` Remove inline onboarding
- [ ] `P4-022` Slim MissionShell to < 200 lines
- [ ] `P4-023` Test mission routes
- [ ] `P4-024` Test OperatorAssistant
- [ ] `P4-025` Test StepToolsBar

### Active Duty Mode (8)
- [ ] `P4-026` Merge mission tabs into AppShell
- [ ] `P4-027` AppShell: mission route → mission chrome
- [ ] `P4-028` AppShell: standard route → standard chrome
- [ ] `P4-029` isMissionModeEnabled integration
- [ ] `P4-030` Add OperatorAssistant
- [ ] `P4-031` Add StepToolsBar
- [ ] `P4-032` Mission Outlet renders
- [ ] `P4-033` Test: no shell unmount/remount

### Route Consolidation (8)
- [ ] `P4-034` Move mission routes under AppShell
- [ ] `P4-035` Remove standalone MissionShell route
- [ ] `P4-036` Update Surface wrapper
- [ ] `P4-037` Preserve all existing URLs
- [ ] `P4-038` Remove legacy redirects
- [ ] `P4-039` Update resolveShellRoute
- [ ] `P4-040` Test all 17 lazy surfaces
- [ ] `P4-041` Test deep links

### Feature Flag Removal (5)
- [ ] `P4-042` Remove shellV2 from type
- [ ] `P4-043` Remove from env overrides
- [ ] `P4-044` Remove from Routes.tsx
- [ ] `P4-045` Remove from other files
- [ ] `P4-046` Delete missionCutover.ts

### Verification
- [ ] `P4-V01` All routes render
- [ ] `P4-V02` ⌘K works everywhere
- [ ] `P4-V03` Keyboard shortcuts work
- [ ] `P4-V04` Route context preserved
- [ ] `P4-V05` Step completion persists
- [ ] `P4-V06` SOP hints correct
- [ ] `P4-V07` No shell remount
- [ ] `P4-V08` Unit tests pass
- [ ] `P4-V09` Beta tests pass

</details>

---

## Phase 5 — Dead Code Purge (~23 tasks + 4 verification)

<details><summary>Tasks P5-001 through P5-023</summary>

### Dead Components (3)
- [x] `P5-001` Delete AssistantCard/
- [x] `P5-002` Delete StepTools/
- [x] `P5-003` Delete react.svg

### Dead Exports (5)
- [ ] `P5-004` Remove isMissionRouteEnabled
- [ ] `P5-005` Remove toHomeFallbackPath
- [ ] `P5-006` Remove missionHomeFallbacks
- [ ] `P5-007` Remove getDefaultRootPath
- [ ] `P5-008` Update/delete test files

### Dead CSS (7)
- [x] `P5-009` Delete --primary-bg-color
- [x] `P5-010` Delete --secondary-bg-color
- [x] `P5-011` Delete --primary-text-color
- [x] `P5-012` Delete --secondary-text-color
- [x] `P5-013` Delete --border-color
- [x] `P5-014` Delete --padding
- [x] `P5-015` Delete --border-radius

### Dead Redirects (5)
- [ ] `P5-016` Remove /profile-old redirect
- [ ] `P5-017` Audit remaining redirects
- [ ] `P5-018` Add removal date comments
- [ ] `P5-019` Evaluate 404.html SPA fallback
- [ ] `P5-020` Check _redirects/vercel.json

### Dead CSS Classes (3)
- [ ] `P5-021` Rename MissionFlow.module.css
- [ ] `P5-022` Audit .assistantCard class
- [ ] `P5-023` Audit .stepTools class

### Verification
- [ ] `P5-V01` Unit tests pass
- [ ] `P5-V02` Beta tests pass
- [ ] `P5-V03` Build succeeds
- [ ] `P5-V04` Dead code grep → 0

</details>

---

## Phase 6 — Component Polish (~30 tasks + 6 verification)

<details><summary>Tasks P6-001 through P6-030</summary>

### Inline Style Consolidation (12)
- [ ] `P6-001` ReviewDashboard inline colors
- [ ] `P6-002` NetworkStatusIndicator → CSS module
- [ ] `P6-003` CacheIndicator → CSS module
- [ ] `P6-004` QuizRunner disciplineStyle
- [ ] `P6-005` ActivityHeatmap inline styles
- [ ] `P6-006` ScoreLineChart inline styles
- [ ] `P6-007` RecapModal inline styles
- [ ] `P6-008` ModuleBrowser inline styles
- [ ] `P6-009` DeckBrowser inline styles
- [ ] `P6-010` QuizSurface inline styles
- [ ] `P6-011` ExerciseRenderer inline style
- [ ] `P6-012` Batch fix remaining files

### Missing UX States (10)
- [ ] `P6-013` Create 404 page
- [ ] `P6-014` Add 404 catch-all route
- [ ] `P6-015` Design 404 with branding
- [ ] `P6-016` TrainingSurface skeleton
- [ ] `P6-017` ReviewDashboard skeleton
- [ ] `P6-018` ProfileSurface skeleton
- [ ] `P6-019` Shared Skeleton CSS module
- [ ] `P6-020` Audit all surface empty states
- [ ] `P6-021` ProgressSurface empty state
- [ ] `P6-022` Standardize empty state styling

### Bug Fixes (4)
- [x] `P6-023` Header settings link → /profile
- [x] `P6-024` Header <a> → <Link>
- [ ] `P6-025` SovereigntyPanel font fix
- [ ] `P6-026` ShareCard font fix

### CSS Naming (4)
- [ ] `P6-027` LoadingMessage kebab → camel
- [ ] `P6-028` Rename MissionFlow.module.css
- [ ] `P6-029` Audit kebab-case classes
- [ ] `P6-030` Update contributing.md

### Verification
- [ ] `P6-V01` Visual regression screenshots
- [ ] `P6-V02` 404 route works
- [ ] `P6-V03` Skeletons visible on slow network
- [ ] `P6-V04` Settings link works
- [ ] `P6-V05` Unit tests pass
- [ ] `P6-V06` Beta tests pass

</details>

---

## Summary

| Phase | Tasks | Verification | Risk | Dependencies |
|-------|-------|-------------|------|-------------|
| 1. Domain Migration | 35 | 4 | Zero | None |
| 2. CSS Tokens | 93 | 4 | Low | None |
| 3. First Impression | 39 | 6 | Medium | None |
| 4. Shell Unification | 46 | 9 | Medium | Phase 3 |
| 5. Dead Code | 23 | 4 | Low | Phase 4 |
| 6. Component Polish | 30 | 6 | Low | None |
| **Total** | **266** | **33** | — | — |

### Recommended Execution Order

```
Phase 1 ──────────────────────────────→ (independent)
Phase 2 ──────────────────────────────→ (independent)
Phase 3 ─────────→ Phase 4 ──→ Phase 5 (sequential chain)
Phase 6 ──────────────────────────────→ (independent)
```

Phases 1, 2, and 6 can run in parallel with the 3→4→5 chain.
