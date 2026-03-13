# Testing & Metrics

## Test Strategy
- Unit: generators (including feature-flagged modern/legacy/migration bridge), `WorkoutScheduleStore` (parse/hydrate/versioned selections), `WorkoutScheduleContext` mutations (completion/skip edge cases including WorkoutBlocks, empty/zero guardrails), selection signature handling.
- Integration: UI + context for schedule creation/adoption; custom schedule adoption flow; selection toggles affecting generation inputs.
- E2E (optional): happy path for generate → complete/skip → regenerate; corrupt storage recovery.
- Regression: ensure single generator path; ensure signature clears stale selections.

## Coverage Targets
- Unit: high coverage on store/generator/context logic.
- Integration: key flows above; snapshots minimized.

## Observability & Logging
- Metrics/events: schedule created/regenerated, completion/skip counts, hydration failures, generation failures/empties, selection signature mismatches.
- Log policy: warn on parse/validation issues; info for migrations; debug behind flag for noisy traces.

## KPIs / SLIs
- Hydration success rate.
- Time to first schedule load.
- Error rate for schedule generation/hydration.
- User-level metrics: completion rate, regenerate frequency, empty-schedule incidence.

## Tooling
- Vitest + React Testing Library for unit/integration.
- Optional: Playwright/Cypress for e2e if available.
- CI: ensure tests run on PR; enforce coverage gate if feasible.
