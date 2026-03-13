# Problems & Decisions

## Top Problems
- Dual schedule generators producing inconsistent shapes and ignoring difficulty in legacy path.
- Custom schedules are not reactive (context unaware after setting current).
- Selection persistence lacks versioning/signature → stale IDs linger after taxonomy changes.
- Calendar timer is stored but unused → dead feature surface.
- Render-time storage writes and redundant loads increase risk and noise.

## Options Considered (per problem)
- Unify generator: (A) wrap legacy to call modern generator; (B) remove legacy; (C) keep both with feature flag.
- Custom schedules: (A) context setter that persists and bumps version; (B) poll store; (C) force reload.
- Selection versioning: (A) versioned keys + signature; (B) naive clear on mismatch; (C) ignore.
- Calendar: (A) integrate into daily agenda; (B) hide behind flag; (C) remove.
- Render-side effects: (A) move to effects; (B) keep as-is.

## Decisions (ADR-style)
- **Use single generator path**: Adopt modern difficulty-aware generator for all schedule creation; deprecate legacy creation in store. Rationale: consistency + fewer bugs.
- **Make custom schedules reactive**: Add context-level `setCurrentSchedule` that persists and bumps version; UI listens to version changes. Rationale: immediate UX feedback.
- **Versioned selection storage**: Introduce versioned keys and data signature to invalidate stale selections. Rationale: prevent ghost selections and regenerate safely.
- **Calendar behind flag until functional**: Hide UI or no-op until integration is built. Rationale: avoid confusing users.
- **Eliminate render-time side effects**: Move storage writes to effects/handlers; remove redundant `loadSchedule` calls. Rationale: stability and predictable renders.

## Implications
- Requires migration for stored selections and schedules to new versions/signatures.
- Test surface increases: generator, store hydration, context mutations, custom schedule adoption.
- Small UX changes: fewer unexpected refreshes, clearer loading states.

## Follow-ups / Open Questions
- Do we need user-facing messaging when selections are cleared due to taxonomy drift?
- Should calendar integration include notifications or just agenda display?
- Do we support multiple active schedules (per-day) or keep single active at a time?
