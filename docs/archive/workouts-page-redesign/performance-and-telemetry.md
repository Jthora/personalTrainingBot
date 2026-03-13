# Performance and Telemetry

## Performance Budgets (Proposed)
- Page load (LCP) within target (e.g., ≤2.5s on median hardware/network; adjust with actual budgets).
- Interaction latency: ≤100ms for filter apply UI response; ≤200ms for selection render.
- Bundle impact: added JS/CSS within set KB budget; avoid large deps; code-split where sensible.
- Memory: avoid leaks; list virtualization to cap DOM nodes.

## Critical Paths
- Initial data fetch for workouts + filters.
- Rendering list (possibly virtualized) and initial selection.
- Opening detail/preview (lazy-loaded content, images).
- Applying filters/sort/search (derived computations and rerenders).

## Optimization Strategies
- Data
	- Cache workout list; set TTL; conditional revalidation.
	- Debounce search/filter inputs; batch state updates.
	- Lazy-load detail data and media.
- Rendering
	- Virtualize long lists; window size tuned; stable keys.
	- Memoize derived lists and row renderers; avoid unnecessary context churn.
	- Skeletons for perceived performance; avoid layout shifts.
- Assets
	- Use existing icon sets; avoid new heavy deps.
	- Compress/optimize images; serve responsive sizes.
- Code
	- Code-split detail/preview if heavy; tree-shake unused utilities.
	- Avoid inline anonymous functions in hot paths where possible; prefer callbacks/memoization thoughtfully.

## Telemetry Plan
- Events (examples):
	- `workouts_load_start/success/fail` with timing and counts.
	- `workouts_filter_apply/clear`, `workouts_sort_change`, `workouts_search` with payload of applied values (non-PII).
	- `workouts_select`, `workouts_preview_open/close` with id and latency to render.
	- `workouts_add_to_schedule_success/fail`, `workouts_edit/remove` with status codes/reasons.
	- `workouts_error_shown`, `workouts_retry_click`.
- Payload guidelines: anonymized session/user id, workout id, filters, durations (ms), result counts, error codes; avoid PII.
- Sampling: default 100% in lower env; consider sampling in prod if volume high.

## Metrics to Track
- LCP/FID/INP (or equivalent interaction metric) on the page.
- Time to first list render; time to detail render after selection.
- Filter apply latency; search latency; retry success rate.
- Error rates for data fetch and schedule actions.
- Engagement: number of previews per session; add-to-schedule completions.

## Monitoring & Alerting
- Dashboards for perf (web vitals) and reliability (error rates, retries).
- Alerts: spike in fail rates, latency regressions beyond thresholds, missing telemetry.
- Owners: designated perf/telemetry contacts.

## Testing & Validation
- Perf tests on representative devices/networks; include throttling scenarios.
- Synthetic checks for key flows; regression alerts on build.
- Verify telemetry events in lower env dashboards before prod.

## Experimentation (If Applicable)
- If feature-flagged rollout: measure impact on engagement, errors, perf.
- A/B considerations: consistent event naming; guard for mixed cohorts.

## Open Questions
- Do we need virtualization now, or only if dataset size exceeds threshold?
- Should we prefetch detail data for top N items to speed first selection?
