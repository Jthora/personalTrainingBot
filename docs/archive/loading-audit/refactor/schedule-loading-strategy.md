# Schedule Loading Strategy

1. Goals
- Decouple schedule creation/loading from initial render.
- Show placeholder/optimistic schedule quickly.
- Refresh schedule in background without blocking navigation.
- Provide clear readiness signaling (no polling) for schedule-dependent features.

2. Current Pain (assumptions)
- Schedule load blocks dashboard render.
- Polling for readiness or chained awaits causes latency.
- Stale schedule not refreshed promptly; no cache status signaling.

3. Principles
- Separate schedule stub from full detail.
- Render placeholder calendar/list immediately.
- Use promises/events for readiness instead of polling loops.
- Refresh opportunistically (on focus, interval) with backoff.

4. Data Model
- Schedule stub: scheduleId, days, block counts, lastUpdated.
- Schedule details: blocks with exercises/sets/reps/coach linkage.
- Derived views: summary stats, next workout indicator.

5. Loading Phases for Schedule
- Phase A (critical): load schedule stub; enough to render calendar skeleton and basic labels.
- Phase B (enrichment): load detailed blocks for visible horizon (e.g., this week + next week).
- Phase C (background): prefetch further weeks, compute summaries, warm caches.

6. Source of Truth
- Network fetch for freshness; cache used for warm start.
- Cache key: user + scheduleId + version + signature.
- TTL: 15m default; stale allowed for stub with indicator.

7. Placeholder Strategy
- Immediately render schedule shell with days/week headers.
- Use skeleton blocks for days; show count badges if cached stub available.
- Display "Loading schedule" inline text and subtle progress bar.

8. Optimistic Rendering
- If cached stub exists and valid: render it and mark as "checking for updates".
- When fresh data returns, reconcile differences and animate updates.
- If no cache: render skeleton only until stub arrives.

9. Background Refresh Triggers
- On app focus (if >5m since last refresh).
- On navigation to schedule routes.
- After workout completion to refresh schedule state.
- Time-based interval (optional) every 10–15m while active.

10. Readiness Signaling (no polling)
- Event emitter: `schedule:stub-ready`, `schedule:details-ready`, `schedule:refresh-failed`.
- Promise helpers: `awaitScheduleStub()`, `awaitScheduleDetails(range)`.
- Context state: `{status: 'idle'|'loading'|'ready'|'stale'|'error', source: 'cache'|'network', lastUpdated}`.

11. Error Handling
- If stub fetch fails: keep shell, show inline error with retry CTA.
- If details fetch fails: keep stub view; mark affected range with warning badge.
- Retry with backoff; fall back to cached stub if present.

12. Cache Interaction
- On boot: try cache for stub; if valid, render and background refresh.
- After network success: write-through with fetchedAt, ttlMs, signature.
- On stale-but-acceptable: render with indicator and trigger refresh.

13. Partial Hydration
- When entering a week view, fetch that week's details only.
- Keep previously loaded weeks cached in memory and IndexedDB.
- Avoid fetching entire schedule upfront.

14. UI Updates
- Progressively replace skeletons with actual blocks as they load.
- Highlight updated blocks if content changed from cached version.
- Show toast or inline note if schedule refreshed while user is viewing.

15. Build Timing
- Build schedule details only when user enters schedule route or opens calendar.
- For dashboard summary, use stub + minimal summary data; no full details needed.

16. Interaction Hooks
- On marking workout complete: update in-memory schedule immediately (optimistic), enqueue background sync.
- On creating/editing blocks: reflect changes locally, write to cache, push to server; handle conflicts by reloading range.

17. Telemetry
- Marks: `schedule:stub_fetch_start/end`, `schedule:details_fetch_start/end`, `schedule:ready`, `schedule:stale_used`.
- Metrics: cache hit/miss for stub/details; refresh durations; error/retry counts.
- Alerts: repeated failures >N times or stub older than threshold.

18. Concurrency
- Debounce overlapping refreshes; maintain in-flight map keyed by range.
- Cancel redundant detail fetches if newer request supersedes.

19. Accessibility/UX
- Ensure skeletons are screen-reader friendly (aria-busy on containers while loading).
- Provide clear text for error/refresh states.

20. Rollout
- Behind flag `scheduleLoaderV2` (or part of `loadingPipelineV2`).
- Baseline measure before/after: stub time to render, details ready time, TTI impact.

21. Testing
- Unit: stub validator (TTL/signature), range fetcher.
- Integration: boot with cache; boot without cache; offline mode with cache.
- E2E: navigate to schedule, ensure shell shows immediately and details hydrate.

22. Risks
- Stale schedule shown too long; mitigate with timers/UX cues.
- Cache corruption; mitigate with version/signature checks and safe fallbacks.
- Overfetching details; mitigate via range-based fetch and in-flight dedupe.

23. Acceptance Criteria
- Shell renders without blocking on details.
- Stub available (cache or network) within target budget (<350ms fetch on 4G mid-tier).
- Details hydrate progressively; no spinner-only states.
- No polling loops; readiness via events/promises.
