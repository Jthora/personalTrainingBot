# Work Tracker

1. Purpose
- Track tasks across refactor areas with owners, status, links, and dates.
- Map tasks to documents to keep alignment.

2. Status Legend
- TODO, IN_PROGRESS, BLOCKED, REVIEW, DONE.

3. Columns (conceptual)
- Area | Task | Owner | Status | Target Date | Links/Notes | Dependencies

4. Tasks
- Strategy
  - Finalize TTI/first-render targets per device matrix | Owner: TBD | Status: TODO | Target: | Links: strategy.md
  - Confirm scope boundaries and critical vs deferred list | Owner: TBD | Status: TODO | Target: | Links: strategy.md
- Architecture
  - Document current vs proposed init sequences with diagrams | Owner: TBD | Status: IN_PROGRESS | Target: | Links: architecture-plan.md
  - Implement readiness signaling helpers (events/promises) | Owner: TBD | Status: TODO | Target: | Links: architecture-plan.md
  - Route-level staging map finalized | Owner: TBD | Status: TODO | Target: | Links: architecture-plan.md
- Instrumentation
  - Add perf helper module (marks/measures/withTiming) | Owner: TBD | Status: DONE | Links: perf-instrumentation.md
  - Wire marks in main.tsx/App/contexts | Owner: TBD | Status: DONE | Links: perf-instrumentation.md
  - Create comparison script for perf runs | Owner: TBD | Status: DONE | Links: perf-instrumentation.md
- Baseline Capture
  - Build throttling presets and run harness | Owner: TBD | Status: DONE | Links: perf-instrumentation.md, scripts/perf/run-baseline.js
  - Store baseline artifacts (JSON/CSV) with links | Owner: TBD | Status: DONE | Links: artifacts/perf (2026-01-22 cold/warm, android4g & desktopWifi), perf-instrumentation.md
  - Baseline summary: load:boot_to_shell p50/p90 — android4g cold 56.2/180.1ms, android4g warm 23.0/55.9ms; desktopWifi cold 15.6/25.6ms, desktopWifi warm 18.8/25.0ms (5 samples each)
- Parallelization/Chunking
  - Define manualChunks in vite.config.ts | Owner: TBD | Status: DONE | Links: parallelization-and-chunking.md
  - Refactor loaders to run in parallel (Promise.all) | Owner: TBD | Status: DONE | Links: parallelization-and-chunking.md
  - Add prefetch helper tied to idle/hover | Owner: TBD | Status: DONE | Links: parallelization-and-chunking.md
  - Prefetch helper tests in CI/unit | Owner: TBD | Status: DONE | Links: parallelization-and-chunking.md
- Persistence/TTL
  - Implement cache wrapper (IndexedDB + fallback) | Owner: TBD | Status: TODO | Links: data-persistence-and-ttl.md
  - Define dataset TTL/signature constants | Owner: TBD | Status: TODO | Links: data-persistence-and-ttl.md
  - Add cache observability metrics | Owner: TBD | Status: IN_PROGRESS | Links: data-persistence-and-ttl.md
- Schedule Loading
  - Implement stub/detailed phased loader | Owner: TBD | Status: TODO | Links: schedule-loading-strategy.md
  - Add readiness events/promises | Owner: TBD | Status: TODO | Links: schedule-loading-strategy.md
  - Add UI placeholders and stale indicators | Owner: TBD | Status: TODO | Links: schedule-loading-strategy.md
- Error/Retry
  - Build shared fetch helper with timeout/backoff | Owner: TBD | Status: DONE | Links: error-and-retry-policy.md
  - Wire retry logging and alert thresholds | Owner: TBD | Status: IN_PROGRESS | Links: error-and-retry-policy.md
- Payload Optimization
  - Create manifest + shards for modules | Owner: TBD | Status: TODO | Links: payload-optimization.md
  - Add size budget CI check | Owner: TBD | Status: TODO | Links: payload-optimization.md
- Scheduling/Deferral
  - Implement task scheduler/priorities | Owner: TBD | Status: TODO | Links: scheduling-and-deferral.md
  - Honor saveData/effectiveType in scheduler | Owner: TBD | Status: TODO | Links: scheduling-and-deferral.md
- Caching/Delivery
  - Add head hints (preconnect/prefetch) | Owner: TBD | Status: TODO | Links: caching-and-delivery.md
  - Verify CDN headers (cache/compression) | Owner: TBD | Status: TODO | Links: caching-and-delivery.md
- Rollout/Validation
  - Define cohorts and flag defaults | Owner: TBD | Status: TODO | Links: rollout-and-validation.md
  - Set up perf/regression matrix runs | Owner: TBD | Status: TODO | Links: rollout-and-validation.md
  - Write rollback playbook | Owner: TBD | Status: TODO | Links: rollout-and-validation.md
- Risk/Mitigation
  - Finalize owners for risk areas | Owner: TBD | Status: TODO | Links: risk-and-mitigation.md
  - Add monitoring hooks to dashboards | Owner: TBD | Status: TODO | Links: risk-and-mitigation.md

5. Key Dates (placeholder)
- Baseline runs: 2026-01-22 (local captures against Vite preview, performanceInstrumentation enabled)
- Phase 1 enable internal: YYYY-MM-DD
- Phase 2 beta: YYYY-MM-DD
- Full rollout target: YYYY-MM-DD

6. Dependencies
- Instrumentation before rollout of pipeline changes.
- Cache wrapper before schedule loader uses persistence.
- Manual chunking before prefetch to avoid shifting chunk names mid-rollout.

7. Links
- strategy.md
- architecture-plan.md
- perf-instrumentation.md
- parallelization-and-chunking.md
- data-persistence-and-ttl.md
- schedule-loading-strategy.md
- error-and-retry-policy.md
- payload-optimization.md
- scheduling-and-deferral.md
- caching-and-delivery.md
- rollout-and-validation.md
- risk-and-mitigation.md

8. Update Cadence
- Weekly status review; update owners/status/dates.
- After each phase, add metrics links and incident notes.

9. Additional Tracking Suggestions
- Add column for "Flag dependency" (e.g., loadingPipelineV2, loadingCacheV2).
- Add column for "Risk/Notes" to highlight blockers.
- Link to perf run artifacts per task when completed.

10. Ownership Gaps
- Assign owners for each area (perf, cache, infra, UX) in next review.
- Record backup owners for vacations.

11. Milestone Placeholders
- Milestone 1: Instrumentation complete.
- Milestone 2: Parallelization + chunking live to internal.
- Milestone 3: Cache/TTL live to beta.
- Milestone 4: Lazy/deferred loading live to 50%.
- Milestone 5: Full rollout.

12. Notes
- Keep tasks small (<3 days) where possible; break down large epics.
- Ensure docs updated when tasks move to DONE.
