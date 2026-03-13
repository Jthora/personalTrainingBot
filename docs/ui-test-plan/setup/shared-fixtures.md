# Shared Test Fixtures

> *Stories 03, 05, and 06 all share the same entry point: "complete a drill, then observe consequences." Rather than each story reimplementing drill completion, extract it into a shared fixture that all three consume.*

## The Problem

| Story | What it needs | What it tests after |
|-------|---------------|---------------------|
| 03 — Daily Cycle | Complete a drill | Reflection, XP, rest interval, review button |
| 05 — Knowledge Retention | Complete a drill with known cardIds | Card progress entries, due cards, quiz round-trip |
| 06 — Proving Yourself | Complete a drill near XP/streak/badge thresholds | XP ticker, level-up, badge toast, stats |

All three re-implement "navigate to drill, advance through steps, complete" — duplicating ~20 lines of interaction code and creating three independent points of failure for the same code path.

## The Solution: `completeDrill` Shared Helper

```ts
// e2e/fixtures/drill-helpers.ts
import type { Page } from '@playwright/test';

export interface DrillResult {
  /** Number of steps completed */
  stepCount: number;
  /** Whether the completion screen appeared */
  completionVisible: boolean;
}

/**
 * Complete the currently loaded drill by advancing through all steps.
 * Assumes DrillRunner is already mounted on the page.
 * 
 * @param page - Playwright page
 * @param opts.fillReflection - If true, fill the reflection textarea
 * @param opts.selfAssessment - Rating to click (1-5), defaults to 3
 */
export async function completeDrill(
  page: Page,
  opts: { fillReflection?: boolean; selfAssessment?: number } = {},
): Promise<DrillResult> {
  const { fillReflection = false, selfAssessment = 3 } = opts;

  let stepCount = 0;

  // Advance through each drill step
  while (true) {
    // Check if we're on the completion screen
    const completion = page.getByTestId('drill-completion-xp');
    if (await completion.isVisible().catch(() => false)) {
      break;
    }

    // Click "Next" or "Continue" to advance
    const nextBtn = page.getByRole('button', { name: /Next|Continue|Start/i });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      stepCount++;
    } else {
      break;
    }

    // Safety: don't loop forever
    if (stepCount > 50) throw new Error('Drill completion loop exceeded 50 steps');
  }

  // Handle reflection if requested
  if (fillReflection) {
    const reflection = page.getByTestId('drill-reflection');
    if (await reflection.isVisible().catch(() => false)) {
      await reflection.locator('textarea').fill('E2E test reflection note');
    }
  }

  // Handle self-assessment if visible
  const ratingBtn = page.locator(`[data-testid="drill-reflection"] button`).nth(selfAssessment - 1);
  if (await ratingBtn.isVisible().catch(() => false)) {
    await ratingBtn.click();
  }

  const completionVisible = await page.getByTestId('drill-completion-xp')
    .isVisible().catch(() => false);

  return { stepCount, completionVisible };
}
```

## How Stories Consume It

### Story 03 — Daily Cycle

```ts
import { completeDrill } from '../fixtures/drill-helpers';

test('returning operative completes drill with reflection', async ({ page }) => {
  await seedPersona(page, 'returning-operative');
  await page.goto('/mission/brief');
  await page.getByTestId('today-launch-btn').click();

  const result = await completeDrill(page, {
    fillReflection: true,
    selfAssessment: 4,
  });
  expect(result.completionVisible).toBe(true);

  // Story 03's unique assertions:
  await expect(page.getByTestId('drill-completion-xp')).toBeVisible();
  await expect(page.getByTestId('rest-interval')).toBeVisible();
});
```

### Story 05 — Knowledge Retention

```ts
test('drill completion records card progress', async ({ page }) => {
  await seedPersona(page, 'returning-operative');
  await page.goto('/mission/brief');
  await page.getByTestId('today-launch-btn').click();

  await completeDrill(page);

  // Story 05's unique assertions:
  const cardProgress = await readLocalStorage(page, 'ptb:card-progress:v1');
  expect(JSON.parse(cardProgress!).entries.length).toBeGreaterThan(0);
});
```

### Story 06 — Proving Yourself

```ts
test('drill triggers XP ticker and badge', async ({ page }) => {
  await seedPersona(page, 'grinder'); // xp: 485, streak: 2, drills: 9
  await page.goto('/mission/brief');
  await page.getByTestId('today-launch-btn').click();

  await completeDrill(page);

  // Story 06's unique assertions:
  await expect(page.getByTestId('xp-ticker')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByTestId('badge-toast')).toBeVisible({ timeout: 5_000 });
});
```

## Dependency Graph (Corrected)

The original plan implied a linear dependency: `03 → 05 → 06`. The reality is:

```
          ┌──── Story 03 (Daily Cycle: reflection, XP, rest)
          │
completeDrill() ──── Story 05 (SR: card progress, quiz, intervals)
          │
          └──── Story 06 (Progression: ticker, badge, level-up)
```

All three stories share `completeDrill()` as a setup step. They are **siblings**, not a chain. They can run in parallel after Story 00 (smoke gate) passes.

## Other Shared Helpers

### `navigateToQuiz`

```ts
export async function navigateToQuiz(
  page: Page,
  mode: 'review' | { moduleId: string } | { deckId: string; moduleId: string },
): Promise<void> {
  if (mode === 'review') {
    await page.getByTestId('review-quiz-btn').click();
  } else if ('deckId' in mode) {
    await page.goto(`/mission/quiz?deck=${mode.deckId}&module=${mode.moduleId}`);
  } else {
    await page.goto(`/mission/quiz?module=${mode.moduleId}`);
  }
  await expect(page.getByTestId('quiz-runner')).toBeVisible({ timeout: 10_000 });
}
```

### `answerQuizQuestions`

```ts
export async function answerQuizQuestions(
  page: Page,
  strategy: 'all-first-option' | 'random',
): Promise<number> {
  let answered = 0;
  while (true) {
    const quizRunner = page.getByTestId('quiz-runner');
    if (!(await quizRunner.isVisible().catch(() => false))) break;

    // Try clicking first option
    const option = page.getByTestId('option-0');
    const fillInput = page.getByTestId('fill-input');

    if (await option.isVisible().catch(() => false)) {
      await option.click();
    } else if (await fillInput.isVisible().catch(() => false)) {
      await fillInput.fill('test answer');
      await fillInput.press('Enter');
    }

    answered++;

    // Click next
    const nextBtn = page.getByTestId('next-btn');
    await expect(nextBtn).toBeVisible({ timeout: 5_000 });
    await nextBtn.click();

    if (answered > 20) break; // safety
  }
  return answered;
}
```
