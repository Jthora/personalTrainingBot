# Roadmap

## Milestones
- **M1: Foundation** — Finalize ADRs (generator, selection versioning, custom schedule reactivity), add feature flags, define signatures/keys.
- **M2: Unified generation** — Route all creation through the difficulty-aware generator; remove/deprecate legacy paths; add tests.
- **M3: Reactive custom schedules** — Context setter, UI updates on adoption, ensure persistence + version bump.
- **M4: Persistence hardening** — Versioned selection storage, migration/cleanup of stale data, improved hydration logging.
- **M5: UX & state polish** — Remove redundant loads, derive active item from schedule state, handle empty/zero-difficulty results gracefully.
- **M6: Calendar decision** — Either integrate into runtime (agenda/notifications) or hide flag/retire.
- **M7: Observability & tests** — Metrics/events, log-level gating, coverage expansion.
- **M8: Rollout & hardening** — Staged release, monitoring, fixes, release notes.

## Dependencies
- Taxonomy/data stability for signatures.
- Design for any calendar/UX adjustments.
- Feature flag infrastructure to gate calendar and generator swap (if needed).

## Rollout Plan
- Dev/stage validation → limited prod (flag) → full rollout after metrics/alerts are green.
- Kill switch for generator swap and calendar surface.

## Risks & Mitigations
- Stale storage causes empty schedules → mitigation: signature-based invalidation, safe fallbacks.
- UX regressions on schedule adoption → mitigation: context versioning tests and smoke tests.
- Calendar confusion → mitigation: hide or flag until functional.

## Checkpoints
- Each milestone requires: ADR merged, tests passing, metrics hooks landed (where applicable), release note entry drafted.
