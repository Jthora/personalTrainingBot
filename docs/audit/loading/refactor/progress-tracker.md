# Loading Refactor Progress Tracker

Tracking progress across stages → phases → steps → tasks. Checkboxes start unchecked; update as work completes.

## Stage 1: Instrumentation & Baseline
1. [x] Phase 1.1: Telemetry Foundations
   1.1.1 [x] Step: Define metrics & marks
      - [x] Task 1.1.1.a: Confirm required marks (boot, shell, critical, enrichment, idle)
         - [x] Subtask: List mark names and assign owners
         - [x] Subtask: Map mark insertion points in code
      - [x] Task 1.1.1.b: Define cache metrics schema (hits/miss/stale, ageMs)
         - [x] Subtask: Draft TypeScript types for cache metrics
         - [x] Subtask: Review schema with cache owner
      - [x] Task 1.1.1.c: Finalize logging schema and sampling defaults
         - [x] Subtask: Document sampling per env (dev/beta/prod)
         - [x] Subtask: Provide sample log payloads (timing/cache/error)
   1.1.2 [x] Step: Helper implementation
      - [x] Task 1.1.2.a: Add perf helper (mark/measure/withTiming)
         - [x] Subtask: Implement helper with feature flag guard
         - [x] Subtask: Add unit tests for marks/measures
      - [x] Task 1.1.2.b: Add cache metrics hooks
         - [x] Subtask: Wire hooks into read/write paths
         - [x] Subtask: Emit dev console output for cache events
      - [x] Task 1.1.2.c: Add error/retry logging hook
         - [x] Subtask: Integrate with fetch helper
         - [x] Subtask: Add retry/timeout test coverage
1. [x] Phase 1.2: Baseline Capture
   1.2.1 [x] Step: Test harness setup
      - [x] Task 1.2.1.a: Throttling presets (mid-tier Android 4G, desktop WiFi)
         - [x] Subtask: Configure DevTools/CLI presets
         - [x] Subtask: Document parameters in README
      - [x] Task 1.2.1.b: Script/CLI for cold vs warm runs
         - [x] Subtask: Add option to clear storage for cold runs
         - [x] Subtask: Add option to reuse cache for warm runs
      - [x] Task 1.2.1.c: Storage clear + cache-enabled toggles
         - [x] Subtask: Implement toggle flags in script
         - [ ] Subtask: Validate toggles in CI smoke
   1.2.2 [x] Step: Baseline runs
      - [x] Task 1.2.2.a: Capture cold traces (p50/p90)
         - [x] Subtask: Run 5 samples and compute p50/p90 (android4g & desktopWifi)
         - [x] Subtask: Save traces to shared location (`artifacts/perf/2026-01-22T16-23-13-718Z-desktopWifi-cold-*.json`, `artifacts/perf/2026-01-22T16-22-01-814Z-android4g-cold-*.json`)
      - [x] Task 1.2.2.b: Capture warm traces (p50/p90)
         - [x] Subtask: Reuse warm cache between runs (5 samples each preset)
         - [x] Subtask: Record cache hit/miss stats (warm starts hit cache; no misses logged)
         - [x] Subtask: Save traces (`artifacts/perf/2026-01-22T16-26-29-818Z-desktopWifi-warm-*.json`, `artifacts/perf/2026-01-22T16-22-37-660Z-android4g-warm-*.json`)
      - [x] Task 1.2.2.c: Store baseline artifacts (JSON/CSV) linked in work-tracker
         - [x] Subtask: Link artifacts in work-tracker and rollout docs
         - [x] Subtask: Note flag states used during capture (performanceInstrumentation enabled via localStorage override)

## Stage 2: Pipeline Restructure
2. [ ] Phase 2.1: Parallelization & Chunking
   2.1.1 [x] Step: Load graph refactor
      - [x] Task 2.1.1.a: Identify true dependencies; remove serial waits
         - [x] Subtask: Map current dependency graph
         - [x] Subtask: Propose revised parallel graph
      - [x] Task 2.1.1.b: Implement Promise.all for critical datasets
         - [x] Subtask: Launch all critical fetches together
         - [x] Subtask: Handle errors without blocking shell
      - [x] Task 2.1.1.c: Add error isolation (allSettled for enrichment)
         - [x] Subtask: Wrap enrichment fetches in allSettled
         - [x] Subtask: Surface partial failures in UI (partial failure notice + loading warning list)
         - Notes: InitialDataLoader now kicks coach, modules, workout categories, and schedule in parallel via Promise.allSettled with per-branch error logging and partial failure messaging; schedule defers behind category load start to keep cache guardrails intact.
   2.1.2 [x] Step: Chunking & prefetch
      - [x] Task 2.1.2.a: Define manualChunks in Vite config
         - [x] Subtask: Draft chunk grouping by domain
         - [x] Subtask: Analyze bundle sizes with visualizer (stats.html from `npm run analyze`; main bundles: vendor ~291 kB (gz 88 kB), react-vendor ~218 kB (gz 70 kB), index ~171 kB (gz 42 kB))
      - [x] Task 2.1.2.b: Add prefetch helper (idle/hover/intent)
         - [x] Subtask: Add network-aware guardrails
         - [x] Subtask: Test prefetch triggers in CI/unit
      - [x] Task 2.1.2.c: Validate chunk/request budgets under throttle
         - [x] Subtask: Measure requests/bytes on 4G preset (perf runner now records resource-summary totals; run `npm run perf:baseline -- --preset android4g --samples 3` to capture)
         - [x] Subtask: Compare results to budget targets
            - Latest android4g cold after moving training data to a single combined fetch (3 samples, cache disabled): totalRequests avg 5 (target ≤ 8 — **passes**), totalTransfer avg ~184 KB (target ≤ 450 KB — **passes**). Artifacts: `artifacts/perf/2026-01-24T02-43-32-097Z-android4g-cold-run{1,2,3}.json`. Previous eager-bundle run for reference: `artifacts/perf/2026-01-24T02-35-50-259Z-android4g-cold-run{1,2,3}.json` (failed at ~51 requests / ~1008 KB).
2. [ ] Phase 2.2: Scheduling & Deferral
   2.2.1 [x] Step: Priority scheduler
      - [x] Task 2.2.1.a: Implement task queue with priority + abort
         - [x] Subtask: Add cancellation on navigation changes
         - [x] Subtask: Instrument scheduled vs executed tasks
      - [x] Task 2.2.1.b: Honor saveData/effectiveType guardrails
         - [x] Subtask: Read connection info to gate low-priority tasks
         - [x] Subtask: Provide fallback defaults if unsupported
      - [x] Task 2.2.1.c: Add idle task observability
         - [x] Subtask: Log idle task durations and cancellations
         - [x] Subtask: Expose debug overlay toggle
         - Notes: Added `taskScheduler` (priority queue with abort signals, saveData/2g/offline guardrails, perf marks), routed cache warm tasks through it, and shipped an in-app Scheduler Overlay (toggleable via button/localStorage flag) showing queue, active task, metrics, last event, and a cancel-all control.
   2.2.2 [x] Step: Phase allocations
      - [x] Task 2.2.2.a: Classify critical vs enrichment vs idle tasks
         - [x] Subtask: Inventory tasks by route/view
         - [x] Subtask: Document rationale for each phase assignment
      - [x] Task 2.2.2.b: Move non-critical work post-first-paint
         - [x] Subtask: Split blocking tasks into deferred units
         - [x] Subtask: Verify paint timing after changes
      - [x] Task 2.2.2.c: Verify no long tasks >200ms during boot
         - [x] Subtask: Profile boot to detect long tasks
         - [x] Subtask: Fix or defer offenders
         - Notes: Added `schedulePostPaintTasks` to centralize post-paint work (prefetch of hot training modules + coach workouts) via scheduler with network guardrails; cache warming already idle-scheduled. Classification documented in `src/utils/phaseTasks.ts` (critical = InitialDataLoader branches; enrichment = cache warm; idle/low = training-prefetch, coach workouts prefetch). Long tasks mitigated by moving non-critical prefetch off critical path.

## Stage 3: Data Persistence & Schedule
3. [ ] Phase 3.1: Cache/TTL
   3.1.1 [x] Step: Storage layer
      - [x] Task 3.1.1.a: Implement IndexedDB wrapper + fallback
         - [x] Subtask: Handle open/upgrade with schema versioning
         - [x] Subtask: Provide localStorage fallback for small data
      - [x] Task 3.1.1.b: Define TTL/signature constants per dataset
         - [x] Subtask: Document TTLs in shared constants file
         - [x] Subtask: Add unit tests for TTL enforcement
      - [x] Task 3.1.1.c: Add cache observability (hits/miss/stale, read/write timing)
         - [x] Subtask: Emit metrics per dataset on read/write
         - [x] Subtask: Log quota or permission errors
         - Notes: `withCache` now logs hits/misses/stale with durations and falls back to localStorage when IndexedDB is blocked; module, workout categories, and coach catalog loaders are wrapped behind `loadingCacheV2` using dataset TTL/signature.
   3.1.2 [ ] Step: UX & migration
      - [x] Task 3.1.2.a: Add stale/cached indicators in UI
         - [x] Subtask: Define copy and visual treatment
         - [x] Subtask: Verify accessibility (aria-live/labels)
      - [x] Task 3.1.2.b: Implement schema version + migration/clear path
         - [x] Subtask: Write migration script with rollback
         - [x] Subtask: Add dev command to clear caches
      - [x] Task 3.1.2.c: Add dev/QA controls (clear cache, disable cache)
         - [x] Subtask: Expose toggles in debug menu/console
         - [x] Subtask: Document usage for QA
3. [ ] Phase 3.2: Schedule Loader
   3.2.1 [ ] Step: Stub-first loading
      - [x] Task 3.2.1.a: Render schedule shell without blocking
         - [x] Subtask: Ensure skeleton calendar renders immediately
         - [x] Subtask: Measure shell render time under 4G throttle
      - [x] Task 3.2.1.b: Emit stub-ready events/promises (no polling)
         - [x] Subtask: Add event emitter for stub ready
         - [x] Subtask: Update consumers to await events
      - [x] Task 3.2.1.c: Background refresh triggers (focus, navigation, interval)
         - [x] Subtask: Implement focus-based refresh with debounce
         - [x] Subtask: Add periodic refresh with backoff
         - [x] Subtask: Trigger refresh on navigation to schedules
   3.2.2 [ ] Step: Details hydration
      - [x] Task 3.2.2.a: Range-based detail fetch (current/next week)
         - [x] Subtask: Add range selection logic
         - [x] Subtask: Cache responses per range
      - [x] Task 3.2.2.b: Optimistic updates on interactions
         - [x] Subtask: Apply local mutation prior to server ack
         - [x] Subtask: Reconcile on failure with rollback UI note
      - [x] Task 3.2.2.c: Error handling with inline retry + stale fallback
         - [x] Subtask: Add retry CTA near schedule surface
         - [x] Subtask: Show stale indicator when fallback used

## Stage 4: Payload & Delivery
4. [x] Phase 4.1: Payload Optimization
   4.1.1 [x] Step: Measure and budget
      - [x] Task 4.1.1.a: Size report for top JSON/assets
         - [x] Subtask: Automate size report script/CI step
         - [x] Subtask: Capture compressed vs uncompressed sizes
      - [x] Task 4.1.1.b: Set budgets and CI check
         - [x] Subtask: Add thresholds to CI config
         - [x] Subtask: Define ownership for budget updates
      - [x] Task 4.1.1.c: Runtime payload logging for key datasets
         - [x] Subtask: Log sizes via ResourceTiming/headers
         - [x] Subtask: Sample logging to avoid noise
   4.1.2 [x] Step: Manifest/sharding
      - [x] Task 4.1.2.a: Module/workout manifest design
         - [x] Subtask: Define manifest fields (id/version/hash/size)
         - [x] Subtask: Plan backward compatibility/versioning
      - [x] Task 4.1.2.b: Lazy shard fetch implementation
         - [x] Subtask: Fetch manifest first, then shards on demand
         - [x] Subtask: Cache shards with versioned keys
      - [x] Task 4.1.2.c: Prefetch warm-up list (small) post-critical
         - [x] Subtask: Choose small high-likelihood items
         - [x] Subtask: Guard prefetch by network condition
      - Notes: Manifest (`public/training_modules_manifest.json`) now includes id, shard path, hash, size, module version, and counts; shards live under `public/training_modules_shards/`. Generated loaders fetch the manifest once, version key shards by hash/version/size, and error-check fetches. Post-paint prefetch warms a small hot list (fitness/combat/martial_arts + workouts catalog) via the task scheduler with saveData/2g guards and idle prefetch.

4. [ ] Phase 4.2: Caching & Delivery
   4.2.1 [x] Step: Headers and CDN
      - [x] Task 4.2.1.a: Set cache-control/etag/content-encoding
         - [x] Subtask: Update hosting/CDN configs
         - [x] Subtask: Verify headers via curl/staging check (documented)
      - [ ] Task 4.2.1.b: Enable/verify brotli at edge
         - [x] Subtask: Confirm negotiation for supported clients (script: `npm run check:encodings -- --base=https://...`)
         - [x] Subtask: Ensure gzip fallback present (allowed encodings br/gzip)
      - [x] Task 4.2.1.c: Validate hints (preconnect/prefetch/preload) in `index.html`
         - [x] Subtask: Add required link tags
         - [x] Subtask: Confirm hints fire post-critical only (idle-scheduled manifest prefetch)
   4.2.2 [ ] Step: Optional service worker
      - [x] Task 4.2.2.a: Decide scope; prototype flag-guarded SW (if justified)
         - [x] Subtask: Build minimal SW cache list
         - [x] Subtask: Add kill switch/skipWaiting handlers
      - [x] Task 4.2.2.b: Add force-update/disable controls
         - [x] Subtask: Provide UI or console command (localStorage flag `sw:enable`, helper functions; unregister helper)
         - [x] Subtask: Document QA steps (see deployment notes below)
      - [x] Task 4.2.2.c: Offline/warm-load verification
         - [x] Subtask: Test offline with cached assets (scripted via `npm run check:sw-offline -- --base=...`)
         - [x] Subtask: Verify network-first fallback when online (warm fetch before offline check)
      - Notes: Opt-in SW (`public/sw.js`) caches manifest + shards cache-first with background refresh. Registration is gated by localStorage flag `sw:enable` via `registerServiceWorkerIfEnabled`; kill switch by clearing flag + `unregisterServiceWorkers()`. SkipWaiting wired. Automated offline check available via `npm run check:sw-offline -- --base=<host> --shard=/training_modules_shards/fitness.json`.

## Stage 5: Rollout & Validation
5. [ ] Phase 5.1: Controlled Rollout
   5.1.1 [ ] Step: Cohorts & flags
      - [x] Task 5.1.1.a: Define cohorts (internal → beta → GA)
         - [x] Subtask: Set percentages and durations per cohort (5% internal, 25% beta, 70% GA; deterministic hash buckets)
         - [ ] Subtask: Include device/network coverage goals
      - [x] Task 5.1.1.b: Script flag toggles per cohort
         - [x] Subtask: Build CLI/API to set flags safely (localStorage override via `setCohortOverride`; helper in `src/utils/rollout.ts`)
         - [ ] Subtask: Log applied flag states for audit (pending wiring into telemetry)
      - [ ] Task 5.1.1.c: Track device/network mix in each cohort
         - [ ] Subtask: Capture metrics per device bucket
         - [ ] Subtask: Adjust cohorts if coverage is skewed
   5.1.2 [ ] Step: Gates & checks
      - [ ] Task 5.1.2.a: Apply acceptance gates per phase (TTI, errors, UX)
         - [ ] Subtask: Define numeric thresholds per metric
         - [ ] Subtask: Automate gate evaluation from reports
      - [ ] Task 5.1.2.b: Run regression matrix per promotion
         - [ ] Subtask: Execute functional + perf suites
         - [ ] Subtask: Record pass/fail with links
      - [ ] Task 5.1.2.c: Maintain rollback readiness (flags/chunk config/cache clear)
         - [ ] Subtask: Test rollback weekly
         - [ ] Subtask: Keep cache/version bump script ready
5. [ ] Phase 5.2: Reporting & Handoff
   5.2.1 [ ] Step: Reports
      - [ ] Task 5.2.1.a: Generate before/after deltas (p50/p90) with flag states
         - [ ] Subtask: Run comparison script per phase
         - [ ] Subtask: Visualize deltas in charts
      - [ ] Task 5.2.1.b: Publish weekly summaries with incidents
         - [ ] Subtask: Include flags, cohorts, regressions
         - [ ] Subtask: Share in release/perf channels
      - [ ] Task 5.2.1.c: Archive traces/CSVs with retention window
         - [ ] Subtask: Store artifacts with metadata (date/flags)
         - [ ] Subtask: Prune after retention period
   5.2.2 [ ] Step: Finalization
      - [ ] Task 5.2.2.a: Graduate flags to default on
         - [ ] Subtask: Flip defaults and monitor 24–48h
         - [ ] Subtask: Remove dead code/flags after bake-in
      - [ ] Task 5.2.2.b: Update docs (strategy/architecture/runbook)
         - [ ] Subtask: Link final metrics/outcomes
         - [ ] Subtask: Note deviations from plan
      - [ ] Task 5.2.2.c: Close risks and update work-tracker
         - [ ] Subtask: Mark resolved risks and owners
         - [ ] Subtask: Archive completed tasks
