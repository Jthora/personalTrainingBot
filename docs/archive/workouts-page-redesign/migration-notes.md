# Migration Notes

## Legacy → New Mapping
- Map legacy components to replacements: WorkoutsPage shell, Sidebar, List, Detail, Actions.
- Map CSS modules/tokens to new theming tokens; remove data-theme toggles.
- Align shared patterns with Home/Training/Schedules to reuse styles where possible.

## Deprecations & Cleanup
- Remove unused theme toggle hooks/props; delete dead styles.
- Remove legacy color variables hard-coded for light/dark.
- Clean up unused components after replacement; update imports.
- Prune feature-flag code paths once stable (if applicable).

## Rollout Plan
- Phase 0: Ship behind feature flag to internal users.
- Phase 1: Gradual % rollout; monitor errors/perf/UX telemetry.
- Phase 2: Full rollout; remove legacy UI from routes.
- Fallback: flag off reverts to legacy layout (if retained) until removed.

## Data/Compatibility
- Ensure API compatibility: new fields optional; avoid breaking existing consumers.
- Cache impacts: invalidate caches on shape changes; version data if needed.
- URL params: maintain backward-compatible params; support legacy query keys temporarily if necessary.

## Migration Steps (High-Level)
- Introduce new components in parallel with flags.
- Wire telemetry for both legacy and new during overlap for comparison.
- Update routing to allow flag-controlled rendering of new page shell.
- Migrate styles to new tokens; verify no regressions in adjacent pages.

## Testing During Migration
- Dual-path E2E (legacy and new) while both exist.
- Visual diffs for both experiences; ensure no cross-contamination of styles.

## Documentation & Training
- Document new components/props; update developer docs and onboarding notes.
- Communicate rollout dates to support and marketing.

## Post-Rollout Verification
- Monitor errors, latency, engagement, and add-to-schedule success.
- Confirm accessibility checks remain clean.
- Remove flags/legacy code after stability window.

## Open Questions
- Do we need side-by-side comparison mode for QA?
- How long do we keep legacy query params supported?
