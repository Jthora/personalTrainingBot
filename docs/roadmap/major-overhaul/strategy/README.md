# Strategy

## Goals
- Deliver a persona-correct Psi Operative experience with reliable offline usage, built and tested solo.
- Reduce scope risk via small slices with clear gates a single developer can verify quickly.

## Scope and Constraints
- In-scope: IA/copy pivot, minimal mission kit/drill content, readiness model, offline SW baseline, Signals/AAR stub, privacy note, lightweight telemetry, simple deploy/rollback steps.
- Out-of-scope (initial): New auth stack, payments, rich media beyond low-data budget, complex team backends.
- Constraints: Maintain SPA shell and routes; deep links must keep working; offline baseline cannot regress; everything must be doable by one developer.

## Success Metrics (solo-friendly)
- IA adoption: tab/view impressions to Mission Kit from Home (instrumented locally/console and later to a sink if available).
- Readiness: render rate and time-to-ready p75/p95 from local telemetry.
- Offline: cold offline load success after sync; cache hit ratio for kits/drills; deep-link success rate.
- Signals/AAR: presence and local actions (create/save/export) tracked locally.

## Phases and Gates (solo)
- Phase 0: Rewrites verified + SW skeleton; gate: deep-link matrix passes online; offline indicator works.
- Phase 1: IA/copy + readiness slice; gate: readiness shows with sample data, Web3 hidden, privacy note live.
- Phase 2: Offline/low-data + drill flow; gate: cold offline start succeeds with cached kit; low-data reduces asset loads.
- Phase 3: Signals/AAR stub; gate: AAR create/save/export works locally; Signals list visible.

## Risks and Mitigations
- Scope creep: enforce phase gates; defer polish.
- Content gap: ship with one curated pack first; log backlog separately.
- Offline regressions: maintain a small runnable deep-link/offline matrix; run per phase.
- Privacy/trust: remove unused Web3; add consent and data-handling note early.
