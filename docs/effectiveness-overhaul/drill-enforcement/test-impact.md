# Drill Enforcement — Test Impact

## Current Test Inventory

| Test File | Tests | Lines |
|-----------|-------|-------|
| `src/components/DrillRunner/__tests__/DrillRunner.test.tsx` | 16 `it()` blocks | 566 |
| `src/components/ExerciseRenderer/__tests__/ExerciseRenderer.test.tsx` | 18 `it()` blocks | 184 |
| `e2e/flows/02-impatient-recruit.spec.ts` | 8 tests (drill-adjacent) | — |
| `e2e/flows/03-daily-cycle.spec.ts` | 9 tests (drill completion) | — |
| `e2e/flows/06-proving-yourself.spec.ts` | 11 tests (drill + stats) | — |

## Tests That Will Break

### DrillRunner Unit Tests (16 tests)

Nearly all 16 tests assume checkboxes toggle freely and completion fires immediately.

| Test Pattern | Why It Breaks | Fix |
|---|---|---|
| Tests that call `toggleStep()` directly | Checkbox now gated behind expansion — tests need to simulate opening content first | Add expansion setup step before toggle |
| Tests checking immediate completion | Completion now requires self-assessment — test needs to select a rating | Add assessment selection after all steps toggled |
| Tests for "Skip & record" button | Button is being removed | Delete these tests |
| Tests checking XP award on completion | Now gated behind assessment | Add assessment step |
| Reflection form tests | "optional" label changes to "required" | Update assertions |

**Estimated rewrite: 12-14 of 16 tests need modification.** Most modifications are
adding setup steps (expand content, select assessment) rather than full rewrites.

### ExerciseRenderer Unit Tests (18 tests)

| Test Pattern | Why It Breaks | Fix |
|---|---|---|
| Tests checking `onInteraction` callback | New `onAllCompleted` callback added — existing tests won't break but need new tests | Add tests for `onAllCompleted` firing |
| Tests for reveal/interaction counts | Internal `completedSet` tracking is new state | Verify `completedSet` side-effects |

**Estimated: 0 breaking, 4-6 new tests needed** for the `onAllCompleted` pathway and
completion tracking.

### E2E Tests

| Spec File | Tests Affected | Why |
|---|---|---|
| `02-impatient-recruit.spec.ts` | ~2 tests | Tests that complete drills via checkbox clicks need expansion + assessment steps |
| `03-daily-cycle.spec.ts` | ~2 tests | Daily drill completion flow needs assessment |
| `06-proving-yourself.spec.ts` | ~3 tests | Drill completion + XP verification needs assessment step |

**Estimated: ~5-7 E2E tests need updating.** Changes are mechanical: add "expand
content" and "select assessment rating" steps to drill completion helpers.

### E2E Helper Recommendation

Create a shared drill completion helper in `e2e/fixtures/`:

```typescript
async function completeDrill(page: Page, options?: { rating?: number }) {
  const steps = page.locator('[data-testid^="card-content-"]');
  const checkboxes = page.locator('input[type="checkbox"]');

  // Ensure all steps are expanded (default-expanded, but verify)
  for (let i = 0; i < await checkboxes.count(); i++) {
    // Content should be visible by default now
    await checkboxes.nth(i).check();
  }

  // Wait for reflection form
  await page.getByTestId('drill-reflection').waitFor();

  // Select self-assessment (required)
  const rating = options?.rating ?? 3;
  await page.getByRole('button', { name: `Rate ${rating} out of 5` }).click();

  // Record drill
  await page.getByRole('button', { name: 'Record drill' }).click();

  // Wait for completion
  await page.getByTestId('drill-completion-xp').waitFor();
}
```

## Tests That Won't Break

- **QuizRunner tests** (20 `it()` blocks) — Quiz flow is unchanged except for the new
  `explanation` field rendering. These need 2-3 new tests, not rewrites.
- **MissionShell tests** (8 `it()` blocks) — Shell navigation is unaffected.
- **Store tests** (DrillRunStore, CardProgressStore) — Store API is unchanged. The
  `toggleStep()` method still works; gating is at the component level.

## New Tests Needed

| Area | New Tests | Purpose |
|------|-----------|---------|
| DrillRunner | 3-4 | Gated checkbox behavior, required assessment, engagement warning |
| ExerciseRenderer | 4-6 | `onAllCompleted` callback, completion tracking |
| QuizRunner | 2-3 | Explanation rendering on wrong answers |
| E2E drill helper | 1 | Shared helper validation |

## Total Test Work Estimate

| Category | Modify | New | Delete | Days |
|----------|--------|-----|--------|------|
| DrillRunner unit | 12-14 | 3-4 | 1-2 | 2-3 |
| ExerciseRenderer unit | 0 | 4-6 | 0 | 1 |
| QuizRunner unit | 0 | 2-3 | 0 | 0.5 |
| E2E specs | 5-7 | 1 | 0 | 1-2 |
| **Total** | **17-21** | **10-14** | **1-2** | **4.5-6.5** |
