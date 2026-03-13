# Migration & Risks

## Migration Plan
- Introduce versioned keys and data signature for selections; on first run, detect mismatch and clear stale selections.
- Migrate active schedule to new versioned key; if schedule shape mismatches, regenerate via unified generator.
- Provide one-time bridge to read old keys and write new ones, then remove after rollout window.
- Custom schedules: if schema unchanged, keep; otherwise migrate to new schema or flag for user review.

## Compatibility
- If old data is unreadable: log warn, clear, and regenerate schedule with defaults.
- If taxonomy changed: clear selections, repopulate defaults, inform user (optional banner/toast).

## Rollback
- Keep legacy key reading under a short-lived flag to restore previous behavior if needed.
- Ability to disable new generator and fall back to prior path (feature flag) during rollout.

## Risks & Mitigations
- Empty schedules after migration: mitigate with signature invalidation + default regeneration.
- User confusion on cleared selections: mitigate with gentle UX messaging and quick-select presets.
- Hidden calendar data ignored: mitigate by flagging off UI until integrated.
- Data drift in custom schedules: mitigate with validation when adopting as current; refuse/repair invalid items.

## Checklist
- [ ] Versioned keys implemented and documented.
- [ ] Signature calculated and applied before hydration.
- [ ] Bridge reads old keys and writes new ones (temporary).
- [x] Feature flags in place for generator swap and calendar surface (see `src/config/featureFlags.ts`).
- [ ] Release notes updated with migration behavior.
