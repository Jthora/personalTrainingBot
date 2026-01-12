# Testing Plan

## Strategy
- Layered coverage: unit/component → integration → E2E → visual regression → accessibility → performance smoke.
- Focus on critical flows: filter/search/sort, selection, preview, add to schedule, error recovery.

## Unit/Component Tests
- Components: filters, chips, list item, list, detail panel, action bar, empty/loading/error states.
- States: default, loading, empty, error, selected, hover, focus, disabled, busy.
- Interactions: click/tap, keyboard navigation, close/escape handling, callbacks firing.
- A11y: appropriate roles/labels present; focus behavior verified where feasible.

## Integration Tests
- Flow: apply filters → list updates → select item → detail loads → add to schedule success.
- Flow: apply filters → no results → empty state shown → clear filters restores results.
- Flow: selection preserved across filter changes when still present; cleared when not.
- Flow: error on load → retry works; preserves chosen filters.
- Flow: slow network → loading states visible; no duplicate requests.

## End-to-End (E2E)
- Smoke: load Workouts → see list → select → open detail → add to schedule → confirm success.
- Error: API failure → error UI → retry → success.
- Mobile viewport: filters via sheet; detail via bottom sheet; keyboard tab order still functional (where applicable).
- Deep link: open with selected id → list scrolls/highlights → detail shown.

## Visual Regression
- Snapshots for: default list, hover/focus, selected, empty, loading skeleton, error banner, detail open, filter drawer open (mobile/desktop), applied filters chips.
- Thresholds: small allowed diffs; mask dynamic content as needed.

## Accessibility Checks
- Automated: axe/lint; check for color contrast via tooling if available.
- Keyboard scripts: tab/shift-tab through major flows; ensure ESC closes drawers/detail.
- Screen reader spot checks: NVDA/VoiceOver for list navigation, selection announcements, detail headings.
- Focus order and visible focus verified in critical flows.

## Performance Validation
- Measure filter apply latency and detail open latency under throttled conditions.
- Check list virtualization performance (if used) with large datasets.
- Verify no major bundle regressions (analyze build size deltas).

## Test Data/Fixtures
- Representative datasets: small, medium, large lists; varied difficulties, durations, equipment.
- Edge cases: missing fields, zero equipment, long titles/descriptions, many tags.
- Error fixtures: timeouts, 500s, malformed data.
- Schedule conflict fixture to test messaging.

## Tooling & Environment
- Unit/component: vitest + React Testing Library.
- E2E: Playwright/Cypress (confirm repo standard).
- Visual: Storybook + Chromatic/Playwright snapshots (confirm choice).
- Accessibility: axe-core, eslint-plugin-jsx-a11y; manual SR runs.

## CI Integration
- Run unit/component on every push; fail on test or lint errors.
- E2E/visual on main or gated branches; nightly runs for heavier suites.

## Acceptance Gates
- New/updated components require stories + component tests for core states.
- Critical flows require E2E coverage before launch.
- Accessibility checks must be clean (no critical issues) before release.

## Open Questions
- Which E2E tool is canonical for this repo?
- Do we gate release on visual regression diffs or treat as advisory?
