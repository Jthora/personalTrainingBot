# Phase 0 — Verification

## Automated Verification Script

Run after all renames are complete:

```bash
#!/bin/bash
set -e

echo "=== Phase 0 Verification ==="

echo ""
echo "1. TypeScript compilation..."
npx tsc --noEmit
echo "   ✓ TypeScript compilation passed"

echo ""
echo "2. Test suite..."
npm test -- --run
echo "   ✓ All tests passed"

echo ""
echo "3. Checking for remaining 'workout' identifiers in source..."
WORKOUT_COUNT=$(grep -rn 'workout\|Workout' src/ --include='*.ts' --include='*.tsx' \
  | grep -v __tests__ | grep -v node_modules \
  | grep -v 'localStorage\|STORAGE_PREFIX\|STORAGE_KEY\|getItem\|setItem\|removeItem' \
  | grep -v '\.json' \
  | wc -l)
if [ "$WORKOUT_COUNT" -gt 0 ]; then
  echo "   ✗ Found $WORKOUT_COUNT remaining 'workout' references:"
  grep -rn 'workout\|Workout' src/ --include='*.ts' --include='*.tsx' \
    | grep -v __tests__ | grep -v node_modules \
    | grep -v 'localStorage\|STORAGE_PREFIX\|STORAGE_KEY\|getItem\|setItem\|removeItem' \
    | grep -v '\.json'
  exit 1
else
  echo "   ✓ No 'workout' identifiers in source"
fi

echo ""
echo "4. Checking for remaining 'coach' identifiers in source..."
COACH_COUNT=$(grep -rn '\bcoach\b\|Coach' src/ --include='*.ts' --include='*.tsx' \
  | grep -v __tests__ | grep -v node_modules \
  | grep -v 'localStorage\|STORAGE_PREFIX\|STORAGE_KEY\|getItem\|setItem\|removeItem' \
  | grep -v '\.json' \
  | wc -l)
if [ "$COACH_COUNT" -gt 0 ]; then
  echo "   ✗ Found $COACH_COUNT remaining 'coach' references:"
  grep -rn '\bcoach\b\|Coach' src/ --include='*.ts' --include='*.tsx' \
    | grep -v __tests__ | grep -v node_modules \
    | grep -v 'localStorage\|STORAGE_PREFIX\|STORAGE_KEY\|getItem\|setItem\|removeItem' \
    | grep -v '\.json'
  exit 1
else
  echo "   ✓ No 'coach' identifiers in source"
fi

echo ""
echo "5. Build verification..."
npm run build
echo "   ✓ Production build succeeded"

echo ""
echo "=== Phase 0 COMPLETE ==="
```

## Manual Verification Checklist

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm test -- --run` passes with zero failures
- [ ] `npm run build` succeeds
- [ ] No `workout`/`Workout` identifiers in `src/**/*.ts` or `src/**/*.tsx` (excluding localStorage key strings, JSON data files, and test files)
- [ ] No `coach`/`Coach` identifiers in `src/**/*.ts` or `src/**/*.tsx` (excluding localStorage key strings, JSON data files, and test files)
- [ ] Test files updated to use new identifiers
- [ ] `vite.config.ts` chunk groups renamed
- [ ] Performance marks use `handler_ready` not `coach_ready`
- [ ] Telemetry schema references `mission_schedule` not `workout_schedule`

## Acceptable Exceptions

These will still appear and are **expected**:

| Pattern | Location | Reason |
|---------|----------|--------|
| `workout:v2:selectedWorkout*` | `src/store/missionSchedule/keys.ts` | localStorage key string — backward compat |
| `coachModuleOverrides` | `src/utils/handlerModulePreferences.ts` | localStorage key string — backward compat |
| `selectedHandler` | `src/context/HandlerSelectionContext.tsx` | localStorage key string — already correct |
| `coaches` | JSON data files in `src/data/` | Static content data — out of scope |
| Any `.json` file | `src/data/` | Training content, not code |

## Rollback

If the rename causes unexpected issues:

```bash
git stash   # or git reset --hard HEAD~N
```

Since Phase 0 is pure renames with no logic changes, any issues will be compile errors caught by `tsc`, not runtime bugs. If `tsc` passes and tests pass, the rename is safe.
