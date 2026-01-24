# Loading Refactor Strategy

1. Objectives
- Deliver faster first render/TTI with clear targets (cold/warm) on defined device/network matrix.
- Reduce blocking work before UI appears; stage loading without breaking functionality.
- Reuse previously fetched data safely to avoid unnecessary reloads.
- Maintain reliability (errors handled, graceful degradation) while optimizing.
- Keep observability to measure wins and prevent regressions.

1.1 Target Budgets (initial; refine with baseline)
- Cold start TTI: target 3.5–4.5s on mid-tier Android over 4G (throttled 1.5Mbps/300ms RTT).
- Warm start TTI: target 2.0–2.5s on same device/network.
- First render (shell visible): <1.5s cold, <1.0s warm on mid-tier Android 4G.
- Desktop WiFi: TTI <1.5s cold, <1.0s warm; first render <0.8s.
- Budget caps: critical requests <=8 total on cold; critical bytes <=450KB compressed.

2. Scope
- Covers client boot pipeline: data loaders, caches, schedule creation, initial render gating.
- Includes asset delivery choices (chunking, prefetch), but not backend API changes.
- Excludes UI redesign beyond loading states/skeletons required by staging.

3. Success Criteria
- Cold start TTI target: <X sec on mid-tier mobile over 4G (set concrete number once baseline measured).
- Warm start TTI target: <Y sec on same device/network.
- Request count reduction vs baseline; top-line bytes transferred reduced.
- Error budget: no increased boot failures; retry policy enforced.
- Perf marks show reductions per stage (coach, modules, workouts, schedule, render).

4. Principles
- Measure-first: add instrumentation before refactors.
- Minimize blocking: render shell early; move non-critical tasks after first paint.
- Parallelize sensibly: load independent data concurrently; avoid overfetching.
- Reuse with safety: signature/TTL gating; clear fallback rules.
- Protect UX: show skeletons/placeholders; avoid jank; keep keyboard/accessibility intact.

5. Constraints
- Client-only Vite build; no SSR today.
- Dynamic imports for content files; large catalog sizes.
- Feature flags exist but default to production-friendly states; avoid runtime flag sprawl unless necessary.

6. Deliverables
- Instrumented app with perf marks and logging.
- Staged/lazy loading architecture implemented.
- Parallelized data loading and tuned chunking.
- Persistence/TTL strategy for datasets.
- Updated loading states and schedule handling.
- Rollout plan with measurements pre/post.

7. Device/Network Matrix (to finalize)
- Desktop (modern CPU) on WiFi.
- Mid-tier Android on 4G (throttled to realistic throughput/latency).
- Optional low-end device on constrained 3G.

7.1 Acceptable Ranges (starting point)
- Mid-tier Android 4G: TTI <=4.5s cold / <=2.5s warm; FCP <=1.8s; LCP <=2.8s.
- Desktop WiFi: TTI <=1.5s cold / <=1.0s warm; FCP <=1.0s; LCP <=1.6s.
- Low-end 3G (if tested): TTI <=6.5s cold; FCP <=2.5s; allow degraded UX but must render shell <2.2s.
- CLS: <0.05 for all.

8. Risks (high level)
- Stale data if TTL/signature logic fails.
- Increased complexity in data flow; harder debugging.
- Chunking changes causing cache misses or request spikes.
- UX regressions if skeletons are missing/incorrect.

9. Mitigations (high level)
- Keep feature-flagged kill switch for new loading pipeline.
- Add robust logging for init steps and failures.
- Incremental rollout with A/B or phased deploys.
- Regression test matrix including perf checks.

10. Timeline (placeholder; to be refined)
- Week 1: instrumentation + baseline.
- Week 2: remove artificial waits; parallelize imports.
- Week 3: persistence/TTL + schedule decoupling.
- Week 4: chunking/prefetch + rollout prep.
- Week 5: measure, harden, ship broadly.

11. Owners/Stakeholders
- Eng lead: TBD
- Perf reviewer: TBD
- QA/perf validation: TBD
- Product/design for UX states: TBD

12. Out of Scope (explicit)
- Backend/API changes.
- Full redesign of non-loading UI beyond needed skeletons.
- Feature-flag management overhaul.

12.1 Scope Boundaries (load ordering)
- Must load upfront: shell UI (header/sidebar), theme tokens, router, minimal contexts, coach + module metadata, schedule stub, settings.
- Can be deferred: detailed workout cards, high-res images, audio binaries, analytics, share card assets, tutorials.
- Can be idle/optional: cache warming, predictive prefetch of next-route assets, debug overlays.

13. Open Questions (track in other docs)
- Final TTI targets per device.
- Acceptable data staleness/TTL.
- Route-specific critical data list.

14. References
- Current audit findings in `docs/audit/loading/loading_experience_audit_results.md`.
- Planned doc set in this refactor folder.

15. Next Steps
- Create and align on `architecture-plan.md` and `perf-instrumentation.md` content.
- Set concrete numeric targets after baseline measurement.
- Lock device/network matrix.

16. Baseline Measurement Plan (prep for targets)
- Run lighthouse/profile on mid-tier mobile 4G to capture initial TTI/FP/FCP/LCP.
- Record request waterfall to identify critical path resources.
- Capture current bundle breakdown (vendor/app/feature chunks) with sizes compressed/uncompressed.
- Enumerate current loading states and where they appear; note gaps.
- Document error frequency during boot (network, parsing, cache).

17. Dataset Criticality Matrix
- Critical for first paint: shell UI assets, theme tokens, coach list metadata, module mapping stub, schedule stub.
- Important soon after: workout categories list, recent workouts summary, coach avatar thumbnails (low-res), sound sprites metadata.
- Deferred/idle: full workout card details, large images, audio binaries, share card assets, analytics.
- Non-blocking but tracked: optional tips/tutorial content, debug overlays.

18. Do / Don’t
- Do render shell and skeletons before data is fully ready.
- Do parallelize independent fetches and avoid serial dependency chains.
- Do enforce TTL/signature checks before reusing cached data.
- Do surface a "using cached data" indicator when relying on stale-but-acceptable data.
- Don’t block on enrichment data for navigation chrome or basic interactions.
- Don’t prefetch everything eagerly; prefer informed prefetch post-critical phase.
- Don’t introduce global loading spinners that hide layout; prefer per-surface skeletons.

18.1 Success Criteria Mapping
- Meets TTI/first-render budgets on device matrix.
- Critical requests/bytes within budget; no increase in boot error rate.
- Staged loading visible (shell -> critical -> enrichment -> idle warm) with correct UX states.
- Cache reuse provides measurable warm-start wins (>30% TTI reduction vs cold).
- Telemetry present with clear comparison baseline.

19. Dependencies & Enablers
- IndexedDB or localStorage availability; choose wrapper to abstract differences.
- Reliable feature flag system to roll out changes; ensure defaults are safe.
- Telemetry sink (even console-only) to read perf marks easily in dev.
- Vite chunking configuration updates to support manual splitting and prefetch.
- Design input for skeleton states and cached-data indicator.

20. Acceptance Review Checklist (for rollout)
- Perf targets validated against baseline (cold/warm) on target matrix.
- Error rates at boot do not regress; retry/backoff confirmed.
- Cache hit/miss metrics captured and acceptable; stale data rules enforced.
- UX states verified: shell skeleton, component skeletons, background indicators.
- Feature flags behave: can toggle pipeline/prefetch/cache independently.
- Docs updated: architecture, instrumentation, rollout playbook, troubleshooting.

21. Glossary
- TTI: Time to Interactive—first moment app responds reliably to input.
- Critical data: minimum dataset required to render main view with skeletons filled minimally.
- Enrichment: data/assets that improve fidelity but are not required for basic navigation.
- Idle warm: background prefetch/warm of caches after user-visible work completes.
- TTL: Time To Live—duration before cached data considered stale.
