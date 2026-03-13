# Error and Retry Policy

1. Goals
- Provide predictable timeouts and retries for JSON/data loads.
- Handle partial failures gracefully with degraded modes and UX messaging.
- Log/telemetry failures and latency outliers with thresholds.

2. Timeouts (defaults)
- Critical datasets (coach catalog, module catalog, workout categories, schedule stub): 6s timeout on 4G mid-tier.
- Enrichment datasets (workout details, avatars, sounds): 8s timeout but cancellable.
- Prefetch/idle tasks: 10s timeout; cancel on navigation.

3. Retry Policy
- Exponential backoff: base 500ms, factor 2, jitter 0–200ms, max 3 attempts for critical.
- For enrichment: max 2 attempts.
- Do not retry on 4xx (except 408/429); retry on 5xx/network errors.
- Respect `Retry-After` if provided.

4. Partial Failure Handling
- If one dataset fails, continue rendering shell and available data.
- Mark impacted surfaces with inline warning badge and retry CTA.
- If schedule stub fails, keep shell + skeleton and show retry button.
- If avatars/sounds fail, keep placeholders; allow manual retry on demand.

5. Degraded Modes
- Use cached/stale data when network fails and cache available; label as stale.
- For schedule: show cached stub with "offline/stale" indicator; disable destructive actions until refreshed.
- For workouts: list view with titles only if details missing; disable play if critical data missing.

6. Telemetry
- Emit event `{type:'error', dataset, phase, attempt, duration, code?, message?, offline?, source:'network'|'cache'}`.
- Emit `retry` events with attempt number and backoff applied.
- Track timeouts separately from other errors.
- Count consecutive failures; trigger alert threshold if exceeded.

7. Alert Thresholds (initial)
- Critical dataset failure rate >1% over 15m window -> warn.
- Timeout rate >3% for any critical dataset -> warn.
- TTI regression >5% vs baseline -> flag for investigation (perf instrumentation covers).

8. UX Messaging
- Keep messages concise: "Coach data unavailable. Showing cached version." / "Schedule failed to refresh. Tap to retry.".
- Avoid blocking modals; prefer inline banners or toasts.
- Provide retry action; avoid auto-retrying too aggressively (respect backoff).

9. Cancellation
- If user navigates away, cancel in-flight enrichment fetches to save bandwidth.
- AbortController per request; log cancellations separately (not as errors).

10. Cache Interaction
- On network error with cache available: serve cache and log `source: cache` + `stale: true` if expired.
- On cache error (read/write): log cache error and fall back to network.

11. Testing
- Unit tests for retry/backoff helpers.
- Integration: simulate 5xx, 429, timeouts; assert retries/backoff and UX indicators.
- Offline simulation: ensure stale data path works and is labeled.

12. Edge Cases
- Mixed partial success: some datasets succeed; others fail. Ensure UI renders partial data with indicators.
- Long-pending requests: abort at timeout and show fallback.
- Repeated retries causing jank: ensure UI remains responsive (use idle callbacks for logging where possible).

13. Ownership
- Error policy steward: TBD (frontend infra).
- Alert routing: TBD (channel/on-call).

14. Rollout
- Behind `loadingPipelineV2` error-handling utilities; migrate callers to shared helper.
- Monitor telemetry for at least one week before graduation.

15. Helper API Sketch
- `fetchWithRetry(url, opts, { attempts, timeoutMs, backoffBaseMs, backoffFactor, jitterMs, retryOn })`
- `class RetryPolicy` encapsulating defaults per dataset.
- `withTimeout(promise, timeoutMs, signal)` to race with AbortController.
- `onError({dataset, attempt, code, duration, phase})` hook for logging.

16. Dataset-specific Overrides
- Schedule stub: 3 attempts, 6s timeout, backoff base 400ms.
- Coach/module/catalog: 3 attempts, 6s timeout.
- Workout details: 2 attempts, 8s timeout; no retry on 404.
- Avatars/sounds: 1 retry only if network error.

17. UX Copy Examples
- Inline banner: "Some data failed to load. Retrying..."
- Stale use: "Using cached data (offline). Refreshing when back online."
- Schedule error: "Schedule unavailable. Retry" (button).

18. Telemetry Fields (detail)
- dataset, phase, attempt, outcome (`success|timeout|network|http4xx|http5xx|aborted`), statusCode, durationMs, offline, cacheUsed, flagState.
- backoffAppliedMs for retries.

19. Alerting Hooks
- Feed metrics into monitoring; thresholds from section 7.
- Page on sustained error spike; otherwise log to dashboard.

20. User Controls
- Provide manual retry buttons near impacted components.
- Expose "Reload data" action in dev/QA menu to clear cache + refetch.

21. Accessibility
- Ensure error messages are announced to screen readers (aria-live polite).
- Buttons keyboard focusable; retries do not steal focus unexpectedly.

22. Logging Hygiene
- Avoid logging full payloads; keep to status, codes, durations.
- Redact potential PII (if any present) before logging.
