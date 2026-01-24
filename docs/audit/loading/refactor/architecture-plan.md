# Loading Architecture Plan

1. Current State (summary)
- Client-only Vite/React app; no SSR.
- Initial load pulls coach/theme data, module mappings, training modules JSON, and schedule context before rendering fully.
- Asset bundling likely single main chunk plus dynamic module imports; cache behavior unverified.
- Loading UX: pending states exist but may block on data; skeleton usage inconsistent.

1.1 Current Init Sequence (text diagram)
- main.tsx -> create root -> render App -> contexts initialize -> data loaders fire serially: settings -> coaches -> modules -> schedule -> workouts -> render full dashboard.
- Observed issues (from audit assumptions): serial dependency chain; schedule blocks render; enrichment data blocks shell.

1.2 Proposed Init Sequence (text diagram)
- main.tsx -> mark boot -> render shell (header/sidebar/skeleton) immediately.
- In parallel: load settings + theme, coach catalog, module mapping, workout categories, schedule stub.
- Gate minimal: once settings + coach + module + schedule stub ready -> mark critical ready -> render main dashboard shell with skeleton rows.
- Enrichment: fetch workout details, avatars/images, sounds; hydrate lists progressively.
- Idle: warm caches, prefetch likely routes/chunks.

2. Goals
- Render interactive shell ASAP with minimal blocking data.
- Parallelize independent fetches; defer non-critical data.
- Stage loading with clear phases and UX states.
- Persistent caches with TTL/signature checks to reuse safe data.
- Keep observability to track per-stage timing and errors.

3. Proposed Loading Phases
- Phase 0: Boot
  - Load minimal shell (App frame, header/sidebar scaffolding, router, theme).
  - Kick off parallel fetches: coach catalog, module catalog, workout categories, user schedule, preferences.
  - Show global skeletons/placeholders.
- Phase 1: Critical Data Ready
  - Once coach + module metadata + essential schedule stub available, render main dashboard scaffold.
  - Defer heavy assets (audio, large images) via lazy import/prefetch.
- Phase 2: Enrichment
  - Load detailed workout cards, training modules content, sounds, optional analytics.
  - Preload likely-next assets based on user path (card selector, coach dialog).
- Phase 3: Background/Idle
  - Warm caches with low-priority data; precompute derived views; clean stale cache entries.

3.1 Sequence Chart (proposed, text)
- Boot start -> mark load:boot_start.
- Shell render -> mark load:shell_painted.
- Parallel loaders: coachCatalog(), moduleCatalog(), workoutCategories(), scheduleStub(), settings().
- Wait for minimal set (coach + module + schedule stub + settings) -> mark load:critical_ready -> render dashboard skeletons.
- Kick enrichment loaders: workoutDetails(), avatars(), sounds(), analyticsOpt().
- Once enrichment done -> mark load:enrichment_done -> start idle warm tasks (prefetch chunks, warm caches) -> mark load:idle_warm_done.

4. Data Loading Graph
- Identify critical path: app shell -> settings -> card context -> coach/theme -> module mapping -> schedule stub.
- Independent branches: sound assets, images, analytics, share card assets.
- Use Promise.all for independent fetches; gate only on minimal subset for first render.

5. Caching Strategy (client-side)
- Storage: IndexedDB (preferred) or localStorage fallback.
- Policy: key-versioning + TTL per dataset (coach catalog, module catalog, schedules, workout categories).
- Validation: signature/version hash from static files; purge on mismatch.
- Write-through on successful fetch; read-through on boot with freshness check.
- Cache warming: background fetch after initial render.

6. Chunking and Bundling
- Split vendor from app; separate heavy feature chunks (coach dialog, scheduler, card share page).
- Use dynamic import for rarely used flows; prefetch hints when predicting navigation.
- Audit Vite config for manual chunking; keep chunks <~200KB compressed where possible.

7. Prefetch/Preload Strategy
- Preload core fonts/icons used at boot.
- Preload minimal theme CSS.
- Prefetch next-route chunks on idle/hover.
- Prefetch images for coach avatars and a small subset of workout thumbnails once critical render done.

8. Network Resilience
- Retry policy with exponential backoff for critical data.
- Offline-first for static catalogs where acceptable; surface "using cached data" UI tag.
- Detect stale critical data and prompt refresh with non-blocking fallback.

8.1 Route-Level Staging (initial map)
- Home/Dashboard: needs coach+module metadata, schedule stub, workout categories; defer workout detail bodies and sounds.
- Card Share page: load share chunk + minimal card metadata; fetch full assets on entry; prefetch when user navigates toward share flow.
- Training window: needs coach/module metadata and selected workout detail; prefetch next step assets during idle between steps.
- Settings: minimal; load preferences; lazy load analytics/tips.
- Schedule management: load schedule stub + category list; fetch detailed blocks after shell shows; background refresh for conflicts.

9. Error Handling & Fallbacks
- Guard rails: if critical dataset missing and fetch fails, show error pane with retry.
- If cache read fails, fall back to network; if both fail, show minimal shell with guidance.
- Instrument failure reasons for observability.

10. UX States per Phase
- Shell skeleton: header, sidebar, content slots.
- Component-level skeletons: coach selector cards, workout list rows, schedule calendar slots.
- Subtle loading indicators for background tasks (e.g., warming cache) to avoid user confusion.

11. Feature Flags
- `loadingPipelineV2` (new staged pipeline enable).
- `loadingCacheV2` (cache/TTL changes).
- `loadingPrefetchV2` (prefetch/chunking tweaks).
- Kill switches to revert to legacy path quickly.

11.1 Readiness Signaling
- Replace polling with event/promises: `loadingEvents.emit('critical-ready')` once minimal set resolved; `loadingEvents.emit('enrichment-ready')` after enrichment.
- Provide `awaitLoadingPhase('critical')`/`awaitLoadingPhase('enrichment')` helpers returning promises.
- Contexts expose `status: 'idle' | 'loading' | 'ready' | 'error' | 'stale'` to drive UI.

12. Telemetry Hooks
- Perf marks: boot start, shell paint, critical data ready, enrichment complete, idle warm complete.
- Counters: cache hit/miss per dataset; retries; errors by type.
- Payload: device/network classification, flag states.

13. Rollout Plan
- Stage 1: ship instrumentation only, collect baseline.
- Stage 2: enable staged pipeline behind flag for internal users.
- Stage 3: enable cache/TTL; monitor.
- Stage 4: enable prefetch/chunking tweaks; monitor.
- Stage 5: graduate flags after stability/perf gains confirmed.

14. Dependencies & Ownership
- Loading pipeline lead: TBD.
- Cache persistence owner: TBD.
- Frontend infra for bundling/prefetch: TBD.
- QA for staged flows: TBD.

15. Open Items
- Confirm critical dataset list per route.
- Decide IndexedDB wrapper vs bespoke implementation.
- Define exact chunking rules in Vite config.
- Align UX for "using cached data" state.

16. State Management Considerations
- Ensure contexts (CardContext, CoachSelectionContext, WorkoutScheduleContext) can initialize with partial data and hydrate incrementally.
- Avoid blocking renders on context initialization; support "loading" or "partial" states.
- Memoize derived selectors to avoid re-computation on incremental hydration.
- For persistence, provide rehydration helpers that validate signatures/TTL before applying cached state.

17. Data Contracts (examples)
- Coach catalog: {version, coaches:[{id, name, avatar, specialties, updatedAt}]}
- Module catalog: {version, modules:[{id, name, difficulty, tags, updatedAt}]}
- Workout categories: {version, categories:[{id, name, icon, updatedAt}]}
- Schedule stub: {version, scheduleId, blocks:[{id, day, status}]}
- Each contract should include version/signature for cache validation.

18. Component Touchpoints (initial list)
- CoachSelector: must render skeleton cards and accept partial catalog.
- TrainingSequence/TrainingWindow: should render shell with placeholder steps, hydrate on enrichment.
- WorkoutList/WorkoutDetails: show list skeleton and allow progressive hydration of card details.
- Header/Sidebar: non-blocking; load nav links and theme ASAP.
- ShareCard/CardTable: lazy load; preload when user navigates to share flows.

19. Testing Strategy (architecture-level)
- Unit tests for cache adapters (read/write/TTL/signature handling).
- Integration tests simulating boot with cached data available/missing/stale.
- E2E smoke for staged pipeline: ensure shell renders, skeletons visible, data hydrates.
- Bundle size budgets and chunk assertions via CI (e.g., vite-bundle-inspector or rollup plugin).
- Prefetch verification: ensure hints exist and not firing too early.

20. Observability Hooks (implementation notes)
- Add debug overlay toggle to visualize loading phases and cache hits for local/dev.
- Provide logging adapters to route perf metrics to console now, analytics later.
- Include flag states and device/network labels in emitted telemetry payloads.

21. Rollback Considerations
- Keep legacy pipeline path intact until new pipeline validated; guarded by `loadingPipelineV2` flag.
- Maintain compatibility with existing caches or provide migration/clearance path.
- Allow quick chunk config revert via Vite config toggles (manualChunks fallback).

22. Migration Notes
- If changing storage keys, include migration that clears or revalidates to prevent stale usage.
- Document cache key/version scheme to avoid collisions across environments.
- Communicate breaking changes to QA to refresh datasets before testing.
