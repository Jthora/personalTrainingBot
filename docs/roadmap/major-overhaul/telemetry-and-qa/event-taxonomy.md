# Event Taxonomy (Draft)

## Core Categories
- ia: tab_view, deep_link_load, nav_error
- readiness: score_render, score_source, next_action_click
- offline: offline_enter, offline_exit, cache_hit, cache_miss, sw_install, sw_update_available, sw_update_applied
- drills: drill_start, step_complete, drill_complete, drill_abort, drill_export
- signals: signal_create, signal_ack, signal_resolve
- aar: aar_create, aar_save, aar_export
- settings: toggle_low_data, toggle_mute, preload_trigger

## Notes
- Include route and cache status where relevant.
- Use consistent naming; avoid PII.

## Mission Step Transition Contracts
- See [mission-step-transition-contracts.md](./mission-step-transition-contracts.md) for route-by-route contract table and required/optional payload fields.

## Automation Hooks
- Payload schema validation tests: `src/utils/__tests__/telemetryValidation.test.ts`.
- Schema drift detector utility/tests:
	- `src/utils/telemetryDrift.ts`
	- `src/utils/__tests__/telemetryDrift.test.ts`
- Runtime drift check script: `scripts/checkTelemetrySchemaDrift.ts` (`npm run telemetry:drift`).
