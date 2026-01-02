# Playbook

## Runbooks
- Clear corrupted schedule storage: remove versioned schedule key and selection keys; trigger regeneration via context.
- Force regeneration: call unified generator via context action; verify persistence and UI refresh.
- Toggle feature flags: generator swap, calendar surface, migration bridge.
	- Defaults live in `src/config/featureFlags.ts` (`generatorSwap: on`, `calendarSurface: off`, `migrationBridge: off`).
	- Runtime overrides: set `localStorage.featureFlagOverrides` to JSON (e.g. `{ "calendarSurface": true }`) or provide `VITE_FEATURE_FLAGS` JSON at build time.
	- Generator swap off forces legacy generator; migration bridge enables fallback to legacy if modern generator errors or returns empty.
	- Calendar surface button/popup only renders when `calendarSurface` is enabled.

## Incident Response
- Who to page: <owner/rotation>.
- What to capture: console errors, localStorage snapshots, reproduction steps, metrics (hydration failures, empty schedules).
- Immediate steps: disable new generator flag if causing outages; clear storage and retry; check taxonomy availability.

## Support FAQs
- “My schedule is empty”: check filters, signature invalidation, regenerate.
- “Custom schedule didn’t apply”: ensure context setter path, confirm version bump.
- “Calendar not working”: feature may be flagged off; no-op behavior expected.

## Maintenance
- When to bump versions/signatures: taxonomy changes, schema changes to schedule or selections.
- How to retire bridges: remove old-key readers after rollout window; update docs.
- Log hygiene: keep warnings actionable; disable debug logs in production builds.
