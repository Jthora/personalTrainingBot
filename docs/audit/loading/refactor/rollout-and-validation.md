# Rollout and Validation Plan

1. Goals
- Deploy loading refactor safely with measurable improvements.
- Compare before/after metrics and prevent regressions.
- Provide clear rollback path.

2. Phased Rollout
- Phase 0: Instrumentation only (no behavior change). Collect baseline.
- Phase 1: Parallelization + chunking behind `loadingPipelineV2`/`loadingPrefetchV2` for internal users.
- Phase 2: Persistence/TTL via `loadingCacheV2` for small cohort.
- Phase 3: Lazy loading/deferral enabled for larger beta cohort.
- Phase 4: Prefetch hints and CDN header updates.
- Phase 5: Graduate flags to default on after success criteria met.

3. Cohorts
- Internal/QA -> 5% beta -> 25% -> 50% -> 100%.
- Device/network mix in each cohort to ensure representativeness.

4. Metrics to Track (per phase)
- TTI (cold/warm), first render, LCP.
- Request count/bytes for critical path.
- Cache hit rate (per dataset).
- Error/timeout/retry rates.
- User-facing errors related to loading.

5. Comparison Method
- Baseline vs treatment runs captured as JSON/CSV (perf instrumentation doc).
- Compute p50/p90 deltas per device/net bucket.
- Thresholds: regressions >5% trigger hold; improvements recorded.
- Use small script to diff runs; include flag states in report.

6. Regression Matrix
- Functional: navigation, schedule load/edit, workout start, coach selection, sharing.
- Loading UX: skeletons present, no spinner-only states, cached-data indicator works.
- Perf: budgets met on device matrix (mid-tier Android 4G, desktop WiFi, optional low-end 3G).

7. Device/Network Matrix
- Desktop WiFi (unthrottled/fast).
- Mid-tier Android 4G (1.5Mbps/300ms RTT).
- Optional low-end 3G.

8. Acceptance Gates per Phase
- Phase 0 -> 1: instrumentation data completeness (>95% marks present).
- Phase 1: TTI improvement >=10% on cold vs baseline in cohort; no error rate increase.
- Phase 2: Warm start improvement >=30% due to cache; no stale-data incidents.
- Phase 3: No UX regressions; enrichment completes within targets.
- Phase 4: No bandwidth waste observed; prefetch not firing on save-data/2g.
- Final: All success criteria in strategy met.

9. Rollback Plan
- Feature flags toggled off per phase (`loadingPipelineV2`, `loadingCacheV2`, `loadingPrefetchV2`).
- Revert manual chunking config via Vite toggle.
- Clear caches if needed via version bump/migration script.
- Communicate rollback to QA/support.

10. Validation Steps per Release
- Run automated perf smoke on device matrix (Lighthouse/trace script).
- Run E2E functional suite.
- Manual exploratory on target routes (dashboard, schedule, training, share).
- Capture logs/metrics snapshot and attach to release notes.

11. Reporting
- Weekly report: metrics deltas, incidents, status of flags.
- Publish comparison charts (p50/p90) for TTI/FCP/LCP and request counts.

12. Ownership
- Rollout lead: TBD.
- QA owner: TBD.
- Perf reviewer: TBD.
- Release manager: TBD.

13. Risks
- Metrics noise from CDN/cache; mitigate with consistent test harness.
- Partial rollout complexity; mitigate with clear cohort configs.
- Flag drift; mitigate with documented defaults and scripts to set.

14. Tooling
- Script to toggle flags for cohorts.
- Trace capture script (puppeteer) with presets.
- Size budget checker in CI.

15. Success/Fail Criteria (final)
- Success: budgets met, error rates steady or lower, user-visible faster loads.
- Fail: regressions >5% sustained, error rate increase, UX regressions reported.

16. Next Steps
- Finalize cohort definitions.
- Build comparison script.
- Schedule baseline runs.

17. Reporting Format (example)
- CSV/JSON fields: device, network, flag state, TTI p50/p90, FCP p50/p90, LCP p50/p90, reqCount, bytes, cacheHitRate, errorRate.
- Visualization: simple line/bar charts for deltas over phases.

18. Validation Scripts (ideas)
- `npm run perf:trace -- --mode=cold --net=4g` to capture trace with marks.
- `npm run perf:compare -- --baseline=baseline.json --candidate=candidate.json` to output deltas.

19. Checklist per Phase Promotion
- Metrics collected for cohort >=48h.
- Regression matrix executed and passed.
- No open Sev2+/user-facing incidents related to loading.
- Rollback path tested (flag off works) within last 7 days.

20. Communication Plan
- Announce phase start/end in release notes or channel.
- Share weekly perf report and current cohort percentages.
- Document any deviations/exceptions to gates.

21. Data Retention
- Keep perf run artifacts for at least 4 weeks for comparison.
- Store in repo or shared storage with links in work-tracker.

22. QA Notes
- Provide checklist for manual runs (routes to cover, expected skeletons, cache indicator).
- Capture screenshots of loading states for visual regressions.
