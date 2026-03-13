# Loading Experience Audit — Findings & Open Questions

## Current pipeline (observed)
- App blocks on `InitialDataLoader.initialize` before rendering routes/providers.
- Sequential steps: coach data → training modules (card decks) → workout categories → workout schedule creation → then idle cache warm.
- Progress bar reflects `totalCardDecks + totalWorkoutSubCategories` steps; each deck/subcategory import bumps progress.
- Artificial waits: `CoachDataLoader` uses 3×500ms simulated delays (parallel); `WorkoutCategoryCache.loadData` wraps population in a 1000ms `setTimeout` before resolving.
- Dynamic imports are largely **serial** across the entire catalog of modules/decks/categories.
- Schedule creation waits for `WorkoutCategoryCache.isLoading()` (polling every 100ms) and depends on cache completion.

## Gaps / unanswered questions to complete a full audit
1) **Actual timing & flame chart**
   - Measure real startup wall-clock (cold vs warm cache) on representative devices/browsers.
   - Capture `performance.mark/measure` or DevTools performance profile around initialization to see where time is spent (network vs JS eval vs timers).

2) **Network behavior**
   - Are JSON assets served compressed? What are sizes of the largest decks/subcategories? Any 404s/redirects?
   - How many parallel requests does bundler emit for dynamic imports? Are they chunked or per-file?

3) **Bundle characteristics**
   - Size and count of chunks produced for `cardDeckPaths` / `workoutSubCategoryPaths` dynamic imports.
   - Are these modules tree-shaken or always included? Any unnecessary eager imports elsewhere?

4) **Data volume & cardinality**
   - Total counts of modules, submodules, decks, categories, subcategories, workouts; max/min per group.
   - Largest payloads (top 10 deck files by KB) to target for compression or splitting.

5) **Storage & hydration**
   - Is there persisted data (modules/workouts) we can trust to skip reload? Current logic always reloads and re-selects; need clarity on allowed staleness and invalidation rules.
   - Are selection states or taxonomy signatures used to gate reload enough to skip heavy work on warm starts?

6) **Scheduling & blockers**
   - Can parts of the pipeline be deferred to post-first-paint? Which data is truly required for initial route?
   - Is the initial route always Workouts page, or can we load per-route?

7) **Feature flags & environment**
   - What flags are on in production (`generatorSwap`, `migrationBridge`, others) that affect schedule creation path?
   - Any SSR/prerender in the deployment? (Assumed client-only.)

8) **Error/timeout behavior**
   - What happens on slow/failed asset fetches? Do we retry or fail the whole boot? Any fallbacks beyond console warnings?

9) **Device/network matrix**
   - Target devices (desktop/mobile) and connection assumptions (3G/4G/WiFi). Need to test under throttling to find worst-case.

10) **Caching strategy**
   - Are HTTP cache headers set for static JSON? Is there a service worker? (None observed in code.)
   - Do we preconnect/prefetch anything? (None observed.)

## Additional code-derived findings (per gap)

- **Feature flags / env:** Production defaults in `featureFlags.ts` set `generatorSwap: true`, `migrationBridge: false`, `calendarSurface: false`, kill switch off; overrides allowed via `VITE_FEATURE_FLAGS` or localStorage. No SSR hooks present; Vite client-only entry.
- **Scheduling/blockers:** App always blocks on `InitialDataLoader.initialize` before any routes/providers render; pipeline is global, not route-scoped. No conditional path for non-Workouts routes.
- **Storage & hydration:** Caches always reload provided datasets; selections persist, but data itself is not cached/reused. `WorkoutCategoryCache` uses taxonomy signature only to decide whether to hydrate selection state, not to skip data loading.
- **Error/timeout behavior:** Loaders log and substitute fallback objects on errors; no retries or timeouts. Schedule creation polls cache readiness (100ms sleep) until `loading=false`.
- **Dynamic imports / bundle shape:** All training modules, submodules, card decks, categories, subcategories are loaded via dynamic imports. Loops are serial at the top level (modules/categories), so many chunks load one after another; default Vite chunking (no manual config) means many small chunks likely generated. No prefetch/preload hints present.
- **Caching strategy:** No service worker files in repo; no prefetch/preconnect in `index.html`; default Vite config only. Cache warming happens post-load via `requestIdleCallback`, but only touches already-loaded caches.
- **Artificial delays:** 3×500ms simulated waits in `CoachDataLoader`; 1000ms `setTimeout` inside `WorkoutCategoryCache.loadData` before resolving; both block the main init pipeline.
- **Data volume (qualitative):** Large enumerations in `cardDeckPaths.ts` and `workoutSubCategoryPaths.ts` imply high request count; largest payloads and totals still need measurement.

## Targeted next steps (evidence-based)
- Instrument perf marks around each init step (coach, modules, workouts, cache populate, schedule creation) and log durations; capture cold/warm runs.
- Run a prod-like build and inspect `dist` for chunk counts/sizes of dynamic imports; map largest JSON assets.
- Capture Network + Performance traces (cold and warm, throttled) to validate serial vs parallel behavior and confirm compression/headers.
- Remove or gate artificial delays behind dev-only flags; measure impact.
- Decide policy for trusting persisted data with signatures to skip reload on warm starts; add TTL/versioning if allowed.
- Evaluate deferring non-critical datasets to post-first-paint or per-route lazy loads; confirm initial route requirements.

## Likely optimization opportunities (to validate after gaps are closed)
- Remove artificial delays (500ms coach loaders, 1000ms cache timer) if not required.
- Parallelize dynamic imports across modules/decks/categories instead of serial awaits.
- Stage loading: render shell/routes early, lazy-load heavy datasets per feature, with placeholder states.
- Persist and trust cached data with signature/versioning to skip reload on warm starts.
- Preload critical chunks or group them to reduce request overhead; gzip/brotli check on assets.
- Optimize schedule creation by using existing cache without polling waits; avoid full select-all copies when not needed.

## Next steps to complete the audit
1) Instrumentation: add perf marks around each stage; collect cold/warm timings across desktop & mobile with throttling.
2) Asset audit: list sizes/count of all dynamic-imported JSON chunks; confirm compression and caching headers.
3) Profiling: DevTools Performance + Network traces during cold start to locate dominant costs (CPU vs network vs timers).
4) Behavioral checks: verify route-at-start requirements; confirm if partial data is acceptable for first render.
5) Flag/env matrix: document production flag states and any build-time differences (prod vs dev).
6) Storage policy: define staleness/TTL and conditions to reuse persisted data instead of always reloading.
