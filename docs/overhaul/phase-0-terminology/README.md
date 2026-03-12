# Phase 0 — Terminology Purge

## Objective

Rename all internal identifiers from the legacy "workout" and "coach" vocabulary to the mission-aligned "drill" and "handler" vocabulary. **No logic changes. No behaviour changes. Pure renames.**

## Why This Is Phase 0

Every subsequent phase touches these files. If we rename during feature work, we create merge conflicts and muddied diffs. Doing it first, in isolation, means every future diff is readable in the correct vocabulary.

## Scope

Two rename streams:

| Stream | Old Term | New Term | Files Affected |
|--------|----------|----------|----------------|
| A | `workout` / `Workout` | `drill` / `Drill` | ~18 source files + ~7 test files |
| B | `coach` / `Coach` | `handler` / `Handler` | ~6 source files |

**Out of scope:**
- Static JSON data files in `src/data/` (e.g. `bodyweight_leg_workouts.json`) — these are content, not code identifiers
- localStorage key strings (e.g. `workout:v2:selectedWorkoutCategories`) — changing these would break existing operatives' persisted state. These get a migration in Phase 6.
- The `vite.config.ts` chunk group named `'workouts'` — rename but verify chunk names don't affect cache keys

## Execution Order

1. Stream A: `workout` → `drill` (larger, more files)
2. Stream B: `coach` → `handler` (smaller, fewer files)
3. Vite config chunk group rename
4. Test files (follow the same renames)
5. Full verification

## Approach

For each rename:
1. Change the identifier name
2. Run `npx tsc --noEmit` — must pass with zero errors
3. Run `npm test` — must pass with zero failures
4. Commit with message format: `refactor(phase-0): rename <old> to <new> in <file>`

## Detailed Rename Specs

- [workout-to-drill-renames.md](workout-to-drill-renames.md) — Every identifier, every file, every line
- [coach-to-handler-renames.md](coach-to-handler-renames.md) — Every identifier, every file, every line

## Done Definition

See [verification.md](verification.md) for the full verification script.

```bash
# Zero matches (excluding data JSON files, test snapshots, and node_modules)
grep -rn 'workout\|Workout' src/ --include='*.ts' --include='*.tsx' \
  | grep -v __tests__ | grep -v node_modules | grep -v '.json' \
  | grep -v 'localStorage' | grep -v 'STORAGE_PREFIX' | wc -l
# Expected: 0

grep -rn '\bcoach\b\|Coach' src/ --include='*.ts' --include='*.tsx' \
  | grep -v __tests__ | grep -v node_modules | grep -v '.json' \
  | grep -v 'localStorage' | wc -l
# Expected: 0
```
