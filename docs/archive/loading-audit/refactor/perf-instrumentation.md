# Performance Instrumentation Plan

1. Purpose
- Establish reliable metrics to track loading improvements and prevent regressions.
- Capture per-stage timings, cache effectiveness, and error rates.

2. Key Metrics
- TTI (Time to Interactive) cold/warm.
- FP/FCP/LCP/CLS; optionally INP.
- App-specific marks: shell paint, critical data ready, enrichment done, idle warm complete.
- Request metrics: counts, bytes, durations for critical datasets.
- Cache hit/miss rate per dataset; TTL expirations.
- Error/retry counts by type.

2.1 Target Budgets Reference (align with strategy)
- Cold TTI mid-tier Android 4G: <=4.5s; Warm: <=2.5s.
- First render mid-tier Android 4G: <=1.5s cold.
- Desktop WiFi TTI: <=1.5s cold / <=1.0s warm.
- Critical requests <=8; critical bytes <=450KB compressed.

3. Instrumentation Targets
- App entry (src/main.tsx): boot start mark.
- Layout/shell mount (App.tsx): shell paint mark.
- Context readiness (CardContext, CoachSelectionContext, WorkoutScheduleContext): critical data ready mark once minimum set resolved.
- Enrichment completion: after heavy modules and assets loaded.
- Idle warm: after background prefetch/cache warm completes.

4. Implementation Approach
- Use Performance API (performance.mark/measure) with structured names.
- Wrap async loaders with timers; record success/failure.
- Collect metrics into a telemetry sink (console/log now, pluggable later).
- Use `requestIdleCallback` for low-priority telemetry flush if available.

5. Suggested Mark Names
- `load:boot_start`
- `load:shell_painted`
- `load:critical_ready`
- `load:enrichment_done`
- `load:idle_warm_done`
- Measures: `load:boot_to_shell`, `load:shell_to_critical`, `load:critical_to_enrichment`, `load:enrichment_to_idle`.

6. Cache Metrics
- For each dataset (coachCatalog, moduleCatalog, workoutCategories, schedules):
  - hits, misses, stale hits, write failures.
  - read/write duration (optional lightweight timing).

7. Error/Retry Logging
- Capture error type, dataset, phase, attempt, duration.
- Include network status (online/offline), flag states.

8. Sampling Strategy
- Default 100% in pre-release; consider sampling in production to limit volume.
- Support per-flag sampling override for new pipeline.

8.1 Logging Schema
- Base: `{ type, name, value, unit?, data?, ts, device?, net?, flags? }`.
- Types: `timing`, `cache`, `error`, `retry`, `phase` (phase transitions).
- Sampling: apply per-type sampling rate; ensure cache/error always 100% for now.

8.2 Reporting Format & Comparison
- Store baseline runs (before change) as CSV/JSON with key metrics.
- New runs logged similarly; comparison script can compute deltas (p50/p90) per metric and device/net bucket.
- Include flag state in report; highlight regressions with thresholds (e.g., >5% increase TTI triggers warning).

9. Device/Network Context
- Capture user agent + coarse device bucket.
- Capture effective connection type (if available) or use throttling labels during test runs.

10. Visualization (future)
- Simple console table or in-app debug overlay for local.
- Export to analytics provider later; keep API clean.

10.1 Trace Capture (DevTools/CLI)
- Chrome DevTools Performance panel: record with CPU 4x + network Fast 3G/Slow 4G presets; ensure perf marks appear in timeline.
- Lighthouse CI/manual: run with mobile throttling; export JSON for trend tracking.
- CLI trace capture option: `chrome-launcher`/`puppeteer` script to collect performance trace with markers.

10.2 Cold vs Warm Runs
- Cold: clear storage + disable cache (DevTools) before run; restart tab.
- Warm: allow cache; reload without clear to measure reuse; ensure flags unchanged.
- Run 3-5 samples each; report median and p90.

10.2.1 Comparison Script (local)
- Use `node scripts/perf/compare.js <baseline.json> <candidate.json>` to diff timing metrics.
- Input: arrays of telemetry events (type `timing`, name, value in ms).
- Output: console table with p50/p90 and deltas per metric name; keep files per device/net preset.

10.2.2 Capture Harness (local)
- Command: `npm run perf:baseline -- --preset android4g --samples 3` (env `PERF_URL` to target host).
- Presets: `android4g` (1.5Mbps/300ms, CPU x4) and `desktopWifi` (40Mbps/20ms, CPU x1.5).
- Modes: cold (default) clears storage via CDP; add `--warm` to reuse cache.
- Output: JSON files under `artifacts/perf/` containing Performance marks/measures.
- Post-process: use `compare.js` to summarize p50/p90 deltas between runs.

10.3 Throttling Presets
- Desktop WiFi: no throttle or 40Mbps/20ms for consistency.
- Mid-tier Android 4G proxy: 1.5Mbps/300ms RTT (aligns with strategy doc).
- Optional low-end 3G: 750kbps/400ms RTT.

11. Testing
- Unit tests for mark/measure helpers.
- Integration test to assert marks fired in order during mocked load.

12. Action Items
- Add perf helper module for marks/measures.
- Wire marks at entry points listed above.
- Add cache metrics hooks into cache layer.
- Add console logger for local dev with clear formatting.

12.1 Cache Populate/Load Marks
- `cache:coach:read_start|read_end|write_start|write_end` etc per dataset.
- `cache:coach:hit|miss|stale` counters with timing.
- Schedule build: `schedule:build_start|build_end`; `schedule:hydrate_start|hydrate_end`.

12.2 Reporting/Export
- Add dev-only endpoint or console command to dump last-run metrics JSON for comparison.
- Provide script template to diff two metric JSON files and output p50/p90 deltas.

13. Helper API Proposal
- `mark(label: string)`: thin wrapper around `performance.mark` guarded for availability.
- `measure(label: string, start: string, end?: string)`: creates measure if both marks exist.
- `withTiming<T>(label: string, fn: () => Promise<T>)`: runs async function, records start/end, returns result, logs errors.
- `logMetric(event: MetricEvent)`: structured console logger for now.
- Types: `MetricEvent { type: 'timing' | 'cache' | 'error' | 'retry'; name: string; value?: number; data?: Record<string, unknown> }`.

14. Logging Format (dev)
- Use `console.table` where applicable for readability.
- Include timestamp, flag states, device/network label.
- Example: `{ type: 'timing', name: 'load:boot_to_shell', value: 1234, data: { flag: 'loadingPipelineV2', device: 'mid-android', net: '4G' } }`.
- Include cache results: `{ type: 'cache', name: 'coachCatalog', value: 'hit', data: { ageMs: 2000, ttlMs: 600000 } }`.

15. Dataset Instrumentation Map
- Coach catalog: measure fetch duration, cache read/write, stale hit count.
- Module catalog: same metrics; include size estimate if available.
- Workout categories: track retries and failure count; likely smaller payload.
- Schedules: track boot read duration, write duration, retry counts.
- Assets: log prefetch timings and whether requested during idle.

16. Sequence Expectations (happy path)
- `load:boot_start` fired immediately at entry.
- Shell mount triggers `load:shell_painted`.
- Data loaders begin in parallel; upon minimal set ready, fire `load:critical_ready`.
- After enrichment loaders finish, fire `load:enrichment_done`.
- After idle warm tasks complete, fire `load:idle_warm_done`.
- Measures emitted after each stage to compute intervals.

17. Failure/Edge Cases to Cover
- Network failure on critical dataset -> log error + retry attempt counts.
- Cache unavailable (IndexedDB blocked) -> log and switch to network-only.
- Stale cache used due to offline mode -> log `staleHit` with age.
- Long task blocking main thread -> optionally integrate PerformanceObserver for long tasks.
- mark/measure API absent -> guard and noop while warning once.

18. CI/Automation Hooks
- Add unit tests for helper API (marks/measures/withTiming).
- Mock performance API where absent in test env.
- Add CI check that required marks are present in E2E smoke (could assert order in logs).

19. Developer Workflow
- Provide `DEBUG_LOADING_METRICS=true` env toggle to enable verbose logging locally.
- Add dev overlay/console grouping to view metrics grouped by phase.
- Document how to read metrics during manual tests (e.g., Chrome Performance panel markers).

20. Sampling/Privacy Notes
- Avoid logging PII; keep payload to timings and coarse device/net labels.
- Allow sampling ratio per metric type; default 100% for perf development, lower for production.
- Ensure disabling telemetry via flag/env is possible for local dev.

21. Output Destinations (phased)
- Phase 1: console only.
- Phase 2: optional in-app debug overlay.
- Phase 3: pluggable transport (e.g., send to analytics endpoint) with sampling.

22. Acceptance Criteria for Instrumentation
- Marks exist and are ordered consistently across runs.
- Measures computed without errors when marks present; no noisy errors when absent.
- Cache metrics emitted for each dataset on boot and on write.
- Error/retry metrics include dataset, attempt, error type.
- Logging can be toggled and is easy to read for QA/eng.
