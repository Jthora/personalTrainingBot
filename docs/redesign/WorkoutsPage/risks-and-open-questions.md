# Risks and Open Questions

## Risks (with Severity/Likelihood/Mitigation)
- Scope creep from adjacent features (scheduling/training)
	- Mitigation: clear non-goals; change control; DRI approval for additions.
- API instability or schema changes mid-implementation
	- Mitigation: contract tests/mocks; versioning; feature flags; close coordination.
- Performance regressions due to richer UI
	- Mitigation: perf budgets; profiling; virtualization; code splitting.
- Accessibility gaps if not designed/tested early
	- Mitigation: a11y review of designs; lint/axe in CI; manual SR/keyboard passes.
- Timeline risk from design/asset delays
	- Mitigation: placeholder assets; parallelize engineering on structure; track dependencies.
- Visual inconsistency with coach themes
	- Mitigation: strict token use; design review; theming doc compliance checks.

## Assumptions to Validate
- Workout dataset size is manageable without pagination/virtualization beyond proposed.
- Filter taxonomy is stable and provided by backend.
- Users expect selection state to persist when navigating within the page.
- Schedule conflicts can be detected via existing APIs.
- Coach theme tokens are finalized and consistent across pages.

## Decision Log
- [Date] — [Decision] — [Decider(s)] — [Rationale] — [Outcome/Notes]
- Maintain chronological list for key calls (e.g., detail pane behavior, filter auto-apply, flag strategy).

## Open Questions
- Do we auto-open detail on desktop selection or require explicit open?
- Do filters auto-apply or require explicit Apply on mobile?
- Is personalization (recent/favorites) in scope for MVP?
- Should deep link params be always-on or only on “Share” action?
- Do we prefetch details for top-N items?
- Which E2E/visual tooling is canonical (Cypress/Playwright/Chromatic)?

## Blockers & Dependencies
- Design assets (tokens, icons, wireframes) delivery.
- API contracts for workouts and scheduling confirmations.
- Shared component availability (modals/sheets, buttons, inputs).
- Analytics pipeline readiness for new events.

## Monitoring Risks Post-Launch
- Error rate spikes; perf regressions; drop in add-to-schedule conversions.
- A11y regressions from rapid iteration; schedule periodic audits.
