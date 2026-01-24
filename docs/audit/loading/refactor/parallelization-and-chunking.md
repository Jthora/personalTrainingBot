# Parallelization and Chunking Plan

1. Goals
- Remove serial fetch/import chains that gate first render.
- Parallelize independent domains (coach, modules, categories, schedule) safely.
- Reduce bundle contention with purposeful chunking.
- Prefetch/preload high-value assets for initial route only.
- Keep request budget within targets; reduce latency.

2. Current Pain (assumptions)
- Serialized loading of settings -> coaches -> modules -> schedule -> workouts.
- Single large main chunk causing long parse/execute.
- Dynamic imports not prefetched; no manual chunk grouping.
- Possible N+1 loops fetching modules or decks per coach.

3. Parallelization Principles
- Identify true dependencies; only gate on minimal set for first render.
- Use Promise.all for independent domains.
- Avoid deep nested awaits; flatten graph.
- Ensure error isolation: one failing branch should not block shell render.
- Limit parallelism if device/network constrained (optional concurrency cap).

4. Target Data Domains
- Coach catalog (metadata)
- Module catalog / decks
- Workout categories
- Schedule stub
- Workout details (enrichment)
- Assets: avatars/images, audio, share assets

5. Proposed Load Graph (text)
- Boot: settings, theme -> in parallel: coachCatalog, moduleCatalog, workoutCategories, scheduleStub.
- Critical gate: settings + coachCatalog + moduleCatalog + scheduleStub.
- Enrichment in parallel: workoutDetails (batched), avatars (spritemap or small set), sounds (lazy), analytics.
- Idle: cache warm (prefetch next routes, chunk preload, derive data).

6. Remove Serial Loops
- Replace per-item fetch loops with batched fetch of module deck lists.
- Combine multiple small JSON fetches into a single manifest + range fetch pattern.
- Where per-coach decks are required, fetch manifest listing deck IDs, then lazy-load on selection.

7. Dynamic Imports Strategy
- Lazy-load heavy feature bundles: CoachDialog, ShareCard, TrainingWindow, Scheduler.
- Keep app shell + header + sidebar + router in main chunk.
- Gate training-specific components behind dynamic imports loaded when entering training flow.
- Use `import(/* webpackChunkName: */)` style hints? For Vite, configure `manualChunks`.

8. Vite Chunking Plan
- Manual chunks by domain: `core` (shell), `coaches`, `workouts`, `scheduler`, `share`, `sounds`.
- Vendor split: `react-vendor` (react, react-dom), `ui-vendor` (ui libs), `utility` (lodash-like if present).
- Keep chunk size targets: <=200KB compressed per chunk for non-core; <=120KB for core if possible.
- Use `build.rollupOptions.output.manualChunks` to enforce grouping.

9. Prefetch/Preload
- Preload: core fonts, theme CSS, main chunk.
- Prefetch (post-critical): next-route chunks (scheduler, training window), coach avatars low-res, first audio sprite.
- Use `<link rel="prefetch">` via `index.html` or runtime `prefetch` helper triggered on idle/hover.

10. Request Budget and Expected Wins
- Critical requests: <=8 (HTML, main chunk, vendor chunk, core data JSON x3-4, fonts).
- Expected latency reduction: parallelizing critical data should remove ~300-600ms of idle per serial hop.
- Chunk splitting should reduce main parse/execute by ~20-40% vs monolith chunk (estimate; to be measured).

11. Sequencing Example (text timeline)
- t0 boot start -> t50 shell render.
- t60 parallel fetches start (coach/module/categories/schedule).
- t400 minimal gate reached -> render dashboard skeleton.
- t450 start enrichment imports (workout details chunk + avatars chunk) in parallel.
- t900 enrichment done; idle prefetch of share/scheduler chunks.

12. Guardrails
- Avoid over-parallelization on low-end devices; optional concurrency limiter (e.g., max 3 simultaneous non-critical requests).
- Ensure `Promise.allSettled` for enrichment to avoid one failure blocking others.
- If manual chunking causes duplication, re-evaluate grouping to reduce shared code inflation.

13. Testing & Validation
- Add perf marks around each parallel branch start/end.
- Use network throttling (4G) to confirm parallelization reduces waterfall steps.
- Validate chunk graph via `vite --analyze` or rollup visualizer.
- Verify prefetch links appear after critical ready; ensure not firing too early.

14. Risks
- Too many chunks -> extra requests -> overhead; mitigate with grouping.
- Prefetch over-fetching on poor networks; mitigate with network-aware prefetch toggle.
- Cache misses if chunk names change frequently; prefer stable chunk naming.

15. Action Items
- Map imports to domains and update `vite.config.ts` manualChunks.
- Refactor loaders to fire concurrently; remove serial awaits.
- Add prefetch helper tied to idle/hover/route intent.
- Instrument critical/all fetches to verify parallelization effect.

16. Example Manual Chunks (pseudo Vite config)
- `core`: src/main.tsx, App.tsx, router, shell components.
- `coaches`: CoachSelector, CoachDialog, coach data utils.
- `workouts`: WorkoutList, WorkoutDetails, training modules.
- `scheduler`: Schedule components + calendar libs.
- `share`: ShareCard, CardTable, export utilities.
- `sounds`: sound loader + assets.

17. Prefetch Trigger Points
- On route hover to scheduler: prefetch scheduler chunk + schedule API for next view.
- On selection of workout card: prefetch training window chunk + associated module JSON.
- On dashboard idle: prefetch share chunk only if user has history of sharing (optional heuristic).

18. Latency Targets per Domain (compressed, 4G mid-tier)
- Coach catalog fetch: <400ms.
- Module catalog fetch: <400ms.
- Schedule stub fetch: <350ms.
- Initial chunk download (core + vendor): <1.2s combined.
- Prefetch chunks during idle: not counted toward TTI; ensure <1s each under throttle.

19. Monitoring
- Log per-branch duration (coach/module/categories/schedule/enrichment).
- Log chunk download sizes and timing (ResourceTiming).
- Alert if critical path exceeds budgets.

20. Rollout Notes
- Gate manual chunking/prefetch behind `loadingPrefetchV2` flag initially.
- Keep legacy bundle layout fallback ready.
- Compare TTI/first render before vs after chunking changes under same throttle.
