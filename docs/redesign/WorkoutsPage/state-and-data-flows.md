# State and Data Flows

## Data Sources & Ownership
- Workouts dataset: source API/cache, shape (id, title, duration, difficulty, equipment, coach, category, tags, description, steps, media, prerequisites, calories?, intensity?).
- Filters taxonomy: durations, difficulties, equipment list, categories, coaches; source of truth and update cadence.
- Scheduling data: endpoints for add/edit/remove; conflict resolution rules.
- Caching layers: `TrainingModuleCache`, `WorkoutCategoryCache`, `TrainingCoachCache` (confirm usage).
- Ownership: identify responsible services/teams; escalation contacts.

## State Diagram (conceptual)
- Page state: loading → ready → error; sub-states for sidebar/list/detail.
- Selection state: selectedWorkoutId (or null), derived selectedWorkout data from collection.
- Filters/sort/search: controlled state; persists per session; optional URL sync.
- Detail state: loading detail (if lazy), error, ready.
- Schedule action state: idle → submitting → success/error; optimistic vs confirmed.

## State Boundaries
- Local component state: transient UI (open/close, hover, input text before apply).
- Context/shared: filters/sort/selection if shared across subcomponents; theme tokens already global.
- Derived/memoized: filtered/sorted list from raw data + filter state; avoid recomputation storms.

## Data Fetching & Lifecycle
- Initial load: fetch workouts + filters taxonomy; show skeletons; handle partial availability.
- Refresh/invalidations: triggers (filter change, manual refresh, cache staleness TTL, focus regain).
- Pagination/virtualization: if needed, fetch pages/chunks; merge dedup; maintain selection validity.
- Detail fetch: if detail not fully present in list data, fetch on selection; cache by id.

## Loading & Error Handling
- Loading indicators at page and sub-section levels (list, detail, filters).
- Error states with retry; retries should not clear user choices.
- Offline/timeout: show non-blocking banner; allow reattempt; keep applied filters.
- Partial data: show what is available; mark missing fields; avoid blocking interactions.

## Optimistic Updates
- For add/edit/remove schedule actions, consider optimistic update to UI with rollback on failure.
- Strategy: mark item as busy; update schedule indicators; revert on error with toast/banner.
- Avoid optimistic changes when server-side validation likely to fail (e.g., conflicts) unless prechecked.

## Conflict & Consistency Handling
- Schedule conflicts: surface details and options (override, pick different time).
- Stale data: if workout removed/changed, show notice and suggest alternatives.
- Selection validity: if selected workout disappears after refetch, clear selection gracefully and notify.

## Derived State & Memoization
- Derived filtered list from workouts + filters + search + sort (memoized).
- Counts for filter facets (if required); compute efficiently.
- Applied filters summary for UI chips.

## Performance Considerations
- Debounce search/filter inputs; throttle scroll-driven loads.
- Virtualize list for large datasets; window size tuned to viewport.
- Cache busting: respect TTL; manual refresh button.

## URL/Navigation Sync
- Optional: reflect selection/filter/sort in URL query; hydrate on load; guard invalid params.
- Back/forward should restore selection and scroll where feasible.

## Telemetry Hooks
- Emit events on load success/fail, filter apply/clear, selection, detail fetch, schedule actions.
- Include timing/latency to monitor backend health.

## Security & Privacy
- Avoid storing sensitive user data in query params.
- Sanitize inputs before API calls; validate server responses.

## Feature Flags
- Gate new components/flows behind flags; default to stable behavior.
- Ensure both flag paths maintain consistent state handling.

## Open Questions
- Do we need local persistence (localStorage) for filters/sort across sessions?
- Is list data guaranteed to include all detail fields, or do we fetch detail lazily?
- What is the expected size of the workout dataset (to decide virtualization/pagination)?
