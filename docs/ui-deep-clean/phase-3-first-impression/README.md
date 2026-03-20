# Phase 3 — Loading & First Impression

> Redesign the boot sequence, splash screen, loading state, and onboarding for new users.
>
> **Tasks**: ~40 | **Risk**: Medium | **Dependencies**: None (visual-only, no data model changes)
>
> **Goal**: Eliminate the white flash on cold load, replace generic "App Loading" with branded experience, and give AppShell v2 users an onboarding path.

---

## Current State

1. **Cold load**: Browser renders blank white `<div id="root"></div>` until React mounts → white flash
2. **React loading gate**: `App.tsx` renders `<LoadingMessage progress={N} />` until `isDataLoaded` — generic spinner + "App Loading..." + determinate/indeterminate progress bars
3. **No HTML splash**: The `index.html` body contains only `<div id="root"></div>` + `<script>` + `<noscript>` — no intermediate visual state
4. **Onboarding only in MissionShell**: Archetype picker, handler picker, guidance overlay, and intake panel exist only in `MissionShell.tsx` (L126–490). AppShell v2 has zero onboarding.
5. **`shellV2` is `true` everywhere**: All environments use AppShell v2 as default. New users land on `/train` with no profile setup.

---

## Task Checklist

### Step 3.1 — HTML Splash Screen (5 tasks)

Add a CSS-only splash inside `<div id="root">` that renders instantly before React boots.

- [ ] `P3-001` Design splash markup: logo SVG/text + spinner + background matching `--surface-base`
- [ ] `P3-002` Add inline `<style>` to `index.html` `<head>` for splash (must be inline — no external CSS loaded yet)
- [ ] `P3-003` Add splash HTML inside `<div id="root">`: logo + spinner (React will replace on mount)
- [ ] `P3-004` Set `<body style="background: #040709">` to prevent white flash before CSS loads
- [ ] `P3-005` Add `prefers-reduced-motion` media query that disables splash animation

### Step 3.2 — LoadingMessage Redesign (8 tasks)

Redesign `LoadingMessage` to be branded and contextual.

- [ ] `P3-006` Rename from "App Loading" to "Initializing Systems" or mission-themed language
- [ ] `P3-007` Add Starcom Academy logo/icon to loading screen
- [ ] `P3-008` Replace `--handler-accent` reference with `--accent` (from Phase 2)
- [ ] `P3-009` Convert kebab-case CSS classes to camelCase (`.loading-container` → `.loadingContainer`)
- [ ] `P3-010` Replace hardcoded `#ffffff` in shimmer animation with token
- [ ] `P3-011` Replace hardcoded `#ffe1b3` warning color with token
- [ ] `P3-012` Add loading stage labels: "Restoring data..." → "Loading modules..." → "Ready"
- [ ] `P3-013` Test `prefers-reduced-motion` path — verify static fallback

### Step 3.3 — Suspense Fallback Audit (6 tasks)

- [ ] `P3-014` Replace `<Suspense fallback={null}>` in App.tsx L154 with `<Suspense fallback={<SurfaceLoader />}>`
- [ ] `P3-015` Ensure SurfaceLoader has branded spinner (not just a circle)
- [ ] `P3-016` Add aria-live="polite" to SurfaceLoader for screen reader announcements
- [ ] `P3-017` Verify SovereigntyPanel QRCodeDisplay/QRCodeScanner Suspense fallbacks are styled
- [ ] `P3-018` Add skeleton states for heavy surfaces (TrainingSurface, ReviewDashboard)
- [ ] `P3-019` Test lazy-load waterfall: measure time from route nav to surface paint for all 17 lazy components

### Step 3.4 — Onboarding Port to AppShell v2 (15 tasks)

Port the onboarding flow from MissionShell to a shared system accessible from AppShell v2.

- [ ] `P3-020` Create `src/components/Onboarding/OnboardingFlow.tsx` — extract from MissionShell L126–490
- [ ] `P3-021` Extract guidance overlay into `src/components/Onboarding/GuidanceOverlay.tsx`
- [ ] `P3-022` Extract archetype picker integration into `src/components/Onboarding/ArchetypeStep.tsx`
- [ ] `P3-023` Extract handler picker integration into `src/components/Onboarding/HandlerStep.tsx`
- [ ] `P3-024` Extract intake panel integration into `src/components/Onboarding/IntakeStep.tsx`
- [ ] `P3-025` Create `src/hooks/useOnboardingState.ts` — encapsulate localStorage keys + state machine
- [ ] `P3-026` Wire `OnboardingFlow` into AppShell.tsx — show when `!OperativeProfileStore.get()`
- [ ] `P3-027` Maintain fast-path skip behavior (`jumpToTraining`) in new component
- [ ] `P3-028` Preserve all telemetry events from MissionShell onboarding
- [ ] `P3-029` Update MissionShell to use shared `OnboardingFlow` instead of inline implementation
- [ ] `P3-030` Test: New user in AppShell v2 → sees guidance → archetype → handler → lands on /train
- [ ] `P3-031` Test: New user fast-path → skips to /train immediately
- [ ] `P3-032` Test: Returning user → no onboarding shown
- [ ] `P3-033` Test: User visits /mission/* → onboarding still works via shared component
- [ ] `P3-034` localStorage key compatibility: new component must read same keys as old MissionShell

### Step 3.5 — Boot Perf Budget (5 tasks)

- [ ] `P3-035` Establish FCP target: < 1.0s on 3G
- [ ] `P3-036` Establish LCP target: < 2.5s on 3G (new splash counts as LCP)
- [ ] `P3-037` Measure current FCP/LCP with Lighthouse before changes
- [ ] `P3-038` Measure FCP/LCP after splash screen + loading redesign
- [ ] `P3-039` Add regression check to CI: fail if FCP > 1.5s or LCP > 3.0s

### Step 3.6 — Verification

- [ ] `P3-V01` Cold load test: no white flash visible (record video at 60fps)
- [ ] `P3-V02` New user path: AppShell v2 shows onboarding, completes successfully
- [ ] `P3-V03` Returning user: no onboarding, loads directly to last surface
- [ ] `P3-V04` Reduced motion: splash is static, loading has no animation
- [ ] `P3-V05` `npm test` → all unit tests pass
- [ ] `P3-V06` `npm run test:beta` → all beta E2E tests pass

---

## Reference: Current Boot Timeline

```
Browser parses index.html
  └─ <div id="root"></div>  ← blank white (PROBLEM: no visual for ~200-800ms)
  └─ <script type="module" src="/src/main.tsx">
       └─ mark('load:boot_start')
       └─ registerServiceWorker()
       └─ createRoot(#root).render(<App />)
            └─ App: isDataLoaded = false → <LoadingMessage>
            └─ restoreIfNeeded() (IndexedDB)
            └─ InitialDataLoader.initialize()
                 └─ progress callbacks: 0% → 25% → 50% → 75% → 100%
            └─ isDataLoaded = true → mark('load:critical_ready')
            └─ Render: Router + AppRoutes + chrome
            └─ mark('load:shell_painted')
            └─ warmCaches() → mark('load:enrichment_done')
            └─ schedulePostPaintTasks() → mark('load:idle_warm_done')
```

## Reference: Onboarding Sequence (from MissionShell)

```
isOnboarding = showGuidanceOverlay || showArchetypePicker || showHandlerPicker || showIntake

1. GuidanceOverlay  →  "Start Training Now" (fast-path)
                    →  "Choose Your Focus First" (advance)
2. ArchetypePicker  →  onSelect (save pending, advance)
                    →  onSkip (skip both pickers)
3. HandlerPicker    →  onSelect (save profile, clear onboarding)
                    →  onBack (return to archetype)
4. IntakePanel      →  onDismiss (mark seen, navigate to /mission/brief)
```
