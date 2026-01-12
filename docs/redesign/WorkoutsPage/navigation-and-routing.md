# Navigation and Routing

## Entry Points
- Global nav link to Workouts landing (default filters/sort applied).
- Deep links with query params for selected workout, filters, sort, or search.
- Cross-page links from Schedules/Training to a specific workout id.
- External share links (if supported) resolving to the selected workout.

## URL Structure & Params
- Base path: `/workouts` (confirm actual route).
- Query params (examples):
	- `id` or `selected`: workout id to focus/show detail.
	- `filters`: encoded filters (duration, difficulty, equipment, category, coach, tags).
	- `sort`: key + direction.
	- `search`: free-text search.
	- `view`: optional layout mode (list/cards) if offered.
- Encoding: prefer stable, readable params; avoid exceeding URL length; consider compression for complex filters if necessary.

## State Hydration from URL
- On load: parse params; validate; apply to state; fetch detail for selected id if present.
- Invalid params: ignore gracefully; log (non-PII) for debugging; show defaults.

## Back/Forward Behavior
- Browser back/forward should restore filters/sort/selection when encoded in URL.
- If detail is a sheet/modal, back should close it when it has history entry.
- Scroll restoration: maintain list scroll position where possible; avoid jarring jumps.

## Cross-Page Handoffs
- From Schedules: link to workout detail; ensure selection highlights and detail opens.
- From Training: similar flow; maintain coach theme alignment and shared context if any.
- Return navigation: preserve previous filters/sort on return when appropriate.

## Auth & Guards
- Ensure authenticated access; redirect to login if not.
- Feature flags: if redesign behind a flag, route to legacy/new accordingly.
- Handle missing/removed workout id: show friendly message and fallback to list.

## Error & Fallback Routing
- Network/API failures: remain on page; show inline error with retry; do not hard-redirect.
- 404 for unknown routes; link back to `/workouts`.

## Accessibility & Navigation
- Focus management when route state changes (e.g., opening detail via URL): focus heading of detail or main list.
- Announce route-driven changes via live region where appropriate (e.g., “Filters applied”).

## Analytics/Telemetry
- Track entry sources (nav vs deep link vs cross-page) via referrer params or events.
- Track navigation events: open/close detail via URL, back/forward interactions if relevant.

## Open Questions
- Should filter state always sync to URL, or only on explicit share action?
- Do we need a shallow routing approach to avoid full re-mount on param changes?
