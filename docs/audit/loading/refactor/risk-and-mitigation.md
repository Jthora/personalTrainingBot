# Risk and Mitigation

1. Purpose
- Identify key risks for loading refactor.
- Define mitigations, monitoring hooks, and rollback levers.
- Assign owners and playbook for response.

2. Risks
- Stale data served (cache misuse, TTL errors).
- Cache incoherence between datasets (schedule vs workouts).
- Chunk misses or increased requests causing slower TTI.
- Prefetch over-fetch on poor networks.
- UX regressions (missing skeletons, spinner-only states).
- Error rate increases from new loaders/retries.
- IndexedDB blocked/quota exceeded.
- Service worker (if added) causing stale/offline bugs.
- Flag drift or inconsistent rollout states.

3. Mitigations
- Signatures/versioned keys; strict validation before using cache.
- Cross-dataset validation: ensure schedule references workouts that exist; re-fetch on mismatch.
- Manual chunk grouping to balance size vs count; monitor chunk sizes and request count.
- Network-aware prefetch (respect saveData/effectiveType); idle-only prefetch.
- Enforce skeleton presence per surface; add tests.
- Shared error/retry helper with timeouts/backoff.
- IndexedDB fallback to localStorage for minimal data; log quota issues.
- Keep service worker (if used) small and flag-guarded; provide force-refresh path.
- Single source of truth for flag defaults; startup log of flag states.

4. Monitoring Hooks
- Cache metrics: hit/miss/stale, ageMs, signature mismatches.
- Perf marks: boot, shell, critical ready, enrichment, idle warm.
- Error/retry logs with dataset and attempts.
- Chunk/request metrics: counts, sizes, timing.
- Prefetch metrics: fired/not fired, network type.
- UX watchdog: alert if skeleton not rendered before data load (optional E2E check).

5. Rollback Levers
- Feature flags: `loadingPipelineV2`, `loadingCacheV2`, `loadingPrefetchV2`, `scheduleLoaderV2`.
- Vite config toggle to remove manualChunks.
- Disable prefetch helper globally.
- Clear caches via version bump/migration.
- Disable service worker (if introduced).

6. Response Playbook
- Incident triggers: perf regression >5%, error rate spike, stale data incident, UX blocker.
- Immediate actions: capture logs/metrics, toggle off relevant flag, notify channel.
- Next steps: reproduce with throttling; validate cache state; run trace.
- Recovery: ship hotfix or keep legacy path enabled until fix validated.

7. Owners
- Perf/Loading lead: TBD.
- Cache/TTL steward: TBD.
- Observability/telemetry: TBD.
- Release/flag management: TBD.

8. Testing/Prevention
- CI checks: bundle size budgets, lint/tests for loaders.
- E2E smoke: shell renders with skeletons; critical data hydrates.
- Perf smoke on device matrix each release.
- Cache corruption test: simulate bad signature and ensure fallback.

9. Residual Risks
- Users on very poor networks may still see slow loads; mitigated by deferral and skeletons but not eliminated.
- Analytics noise may mask small regressions; mitigate with controlled test harness.
- Unexpected browser storage limits; mitigate with size caps and graceful degradation.

10. Communication
- Status board in work-tracker (owners, flags, cohorts).
- Release notes to call out loading pipeline changes.
- Runbook link for on-call.

11. Detection Signals
- Alert if cache signature mismatches spike.
- Alert if `load:critical_ready` exceeds budget for >5% of sessions.
- Track user-visible error banners rate; alert on spikes.

12. Contingency Scenarios
- If chunk explosion occurs (too many requests): revert manualChunks, disable prefetch.
- If stale schedule incident: force cache clear for schedule store, disable schedule cache flag.
- If IndexedDB blocked widely: auto-disable persistence and fall back to network; reduce TTL reliance.

13. Recovery Steps Template
- Identify flag states and cohort.
- Reproduce under matching network/device throttle.
- Check cache state (age, signature) and chunk timings.
- Roll back relevant flags; clear caches if needed.
- Patch and retest with perf/instrumentation enabled.

14. Documentation
- Keep this doc and `work-tracker.md` linked in runbook.
- Update with new risks discovered during rollout.

15. Ownership Assignment To-Do
- Nominate leads and back-ups per area; record in work-tracker.
- Define communication channel for incidents (Slack/email/on-call).

16. Residual Risk Acceptance
- Document any risks accepted without mitigation (e.g., low-end 3G performance limits) with rationale and review date.

17. Next Review
- Revisit risk list after Phase 2 rollout; update mitigations and owners.
