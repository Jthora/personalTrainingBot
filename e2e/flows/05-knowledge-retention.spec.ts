import { test, expect, type Page } from '@playwright/test';
import { waitForReactMount } from '../fixtures/app';
import {
  seedPersona,
  seedLocalStorage,
  buildDueCardProgressEntries,
  seedMissionContext,
  withMissionContext,
  FITNESS_MODULE_ID,
  FITNESS_CARD_IDS,
} from '../fixtures/seed';
import { scanAccessibility } from '../fixtures/a11y';

// ── Helpers ────────────────────────────────────────────────────────

/** Seed returning operative with due cards for review. */
async function seedWithDueCards(page: Page) {
  await seedPersona(page, 'returning-operative');
  await seedMissionContext(page);
  await seedLocalStorage(page, buildDueCardProgressEntries());
}

/** Navigate to brief and wait for launcher. */
async function gotoBrief(page: Page) {
  await page.goto(withMissionContext('/mission/brief'), {
    waitUntil: 'domcontentloaded',
  });
  await waitForReactMount(page);
  await expect(page.getByTestId('today-launcher')).toBeVisible();
}

/** Navigate to quiz in review mode via the review button. */
async function gotoReviewQuiz(page: Page) {
  await gotoBrief(page);
  const reviewBtn = page.getByTestId('review-quiz-btn');
  await expect(reviewBtn).toBeVisible();
  await reviewBtn.click();
  await page.waitForURL('**/mission/quiz**');
  await waitForReactMount(page);
  // Wait for quiz runner to actually render (shards load async)
  await expect(page.getByTestId('quiz-runner')).toBeVisible({ timeout: 15_000 });
}

/**
 * Answer one quiz question: handles MC, TF, fill-blank, and term-match.
 * Returns true if results screen appeared.
 */
async function answerOneQuestion(page: Page): Promise<boolean> {
  // Check if already on results
  if (await page.getByTestId('quiz-results').isVisible().catch(() => false)) {
    return true;
  }

  // Try multiple-choice / true-false option
  const option = page.getByTestId('option-0');
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    // Try fill-blank input
    const fillInput = page.getByTestId('fill-input');
    if (await fillInput.isVisible().catch(() => false)) {
      await fillInput.fill('test answer');
      await page.getByRole('button', { name: /Submit/i }).click();
    } else {
      // Term-match: click all description buttons sequentially
      const matchButtons = page.locator('[class*="matchSelectable"]');
      const count = await matchButtons.count();
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          await matchButtons.nth(i).click();
        }
        // Now the "Check Matches" button should appear
        const checkBtn = page.getByRole('button', { name: /Check Matches/i });
        await expect(checkBtn).toBeVisible({ timeout: 3_000 });
        await checkBtn.click();
      }
    }
  }

  // Wait for feedback phase — next-btn should appear
  const nextBtn = page.getByTestId('next-btn');
  await expect(nextBtn).toBeVisible({ timeout: 5_000 });

  // Click next and wait for transition
  await nextBtn.click();

  // Either results appear or next question loads
  await Promise.race([
    page.getByTestId('quiz-results').waitFor({ state: 'visible' }).catch(() => {}),
    nextBtn.waitFor({ state: 'hidden' }).catch(() => {}),
  ]);

  return page.getByTestId('quiz-results').isVisible().catch(() => false);
}

/** Answer all quiz questions until results appear. */
async function completeQuiz(page: Page, maxQuestions = 12): Promise<number> {
  let answered = 0;
  for (let i = 0; i < maxQuestions; i++) {
    const done = await answerOneQuestion(page);
    answered++;
    if (done) break;
  }
  return answered;
}

// ── Spec ───────────────────────────────────────────────────────────

test.describe('Story 05 — Knowledge Retention', () => {
  test.describe.configure({ mode: 'serial' });

  test('5.1 — Review quiz button shows due card count', async ({ page }) => {
    await seedWithDueCards(page);
    await gotoBrief(page);

    const reviewBtn = page.getByTestId('review-quiz-btn');
    await expect(reviewBtn).toBeVisible();
    // Should display count of due cards (we seeded 5)
    await expect(reviewBtn).toContainText(/review \d+ due card/i);
  });

  test('5.2 — Review quiz launches quiz runner with due cards', async ({
    page,
  }) => {
    await seedWithDueCards(page);
    await gotoReviewQuiz(page);

    // Quiz runner should be visible
    await expect(page.getByTestId('quiz-runner')).toBeVisible({
      timeout: 15_000,
    });

    // Verify URL still has mode=review (continuity hook should preserve it)
    expect(page.url()).toContain('mode=review');
  });

  test('5.3 — Quiz presents multiple-choice or fill-blank questions', async ({
    page,
  }) => {
    await seedWithDueCards(page);
    await gotoReviewQuiz(page);

    // At least one interactive question element should render
    const hasMC = await page.getByTestId('option-0').isVisible().catch(() => false);
    const hasFill = await page.getByTestId('fill-input').isVisible().catch(() => false);
    const hasRunner = await page.getByTestId('quiz-runner').isVisible().catch(() => false);

    // At minimum the runner is there; and one input type is available
    expect(hasRunner).toBe(true);
    expect(hasMC || hasFill).toBe(true);
  });

  test('5.4 — Answering a question shows feedback and next button', async ({
    page,
  }) => {
    await seedWithDueCards(page);
    await gotoReviewQuiz(page);

    // Answer the first question (any type) without clicking "next"
    const option = page.getByTestId('option-0');
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    } else {
      const fillInput = page.getByTestId('fill-input');
      if (await fillInput.isVisible().catch(() => false)) {
        await fillInput.fill('test answer');
        await page.getByRole('button', { name: /Submit/i }).click();
      } else {
        // Term-match: click all description buttons then check
        const matchButtons = page.locator('[class*="matchSelectable"]');
        const count = await matchButtons.count();
        for (let i = 0; i < count; i++) {
          await matchButtons.nth(i).click();
        }
        const checkBtn = page.getByRole('button', { name: /Check Matches/i });
        await expect(checkBtn).toBeVisible({ timeout: 3_000 });
        await checkBtn.click();
      }
    }

    // Now in feedback phase — next button should be visible
    await expect(page.getByTestId('next-btn')).toBeVisible({ timeout: 5_000 });
    // Feedback text ("Correct!" or "Incorrect") should be visible
    const feedbackText = page.locator('[class*="feedback"]').first();
    await expect(feedbackText).toBeVisible();
  });

  test('5.5 — Hint button reveals a hint', async ({ page }) => {
    await seedWithDueCards(page);
    await gotoReviewQuiz(page);

    const hintBtn = page.getByTestId('hint-btn');
    // Hint button may or may not be visible depending on question type
    if (await hintBtn.isVisible().catch(() => false)) {
      await hintBtn.click();
      // After clicking, some hint content should render near the quiz
      // (the hint button should get disabled or change state)
      await expect(page.getByTestId('quiz-runner')).toContainText(/.+/);
    }
  });

  test('5.6 — Completing quiz shows results screen with score', async ({
    page,
  }) => {
    await seedWithDueCards(page);
    await gotoReviewQuiz(page);

    await completeQuiz(page);

    // Results screen should be visible
    const results = page.getByTestId('quiz-results');
    await expect(results).toBeVisible();

    // Should show a percentage score
    await expect(results).toContainText(/%/);

    // Should show correct/total count
    await expect(results).toContainText(/\d+\/\d+ correct/i);

    // Done button should be visible
    await expect(
      page.getByRole('button', { name: 'Done' }),
    ).toBeVisible();
  });

  test('5.7 — Quiz completion updates card progress in localStorage', async ({
    page,
  }) => {
    await seedWithDueCards(page);
    await gotoReviewQuiz(page);

    // Read before state
    const beforeRaw = await page.evaluate(() =>
      localStorage.getItem('ptb:card-progress:v1'),
    );
    const before = beforeRaw ? JSON.parse(beforeRaw) : [];

    await completeQuiz(page);

    // Click Done to finalize
    await page.getByRole('button', { name: 'Done' }).click();
    await page.waitForURL('**/mission/training**');

    // Read after state
    const afterRaw = await page.evaluate(() =>
      localStorage.getItem('ptb:card-progress:v1'),
    );
    const after = afterRaw ? JSON.parse(afterRaw) : [];

    // Some card entries should have updated nextReviewAt
    expect(after.length).toBeGreaterThanOrEqual(before.length);

    // Find at least one card with a future review date (pushed forward by SR)
    const now = new Date().toISOString();
    const futureCards = after.filter(
      (c: { nextReviewAt: string }) => c.nextReviewAt > now,
    );
    expect(futureCards.length).toBeGreaterThan(0);
  });

  test('5.8 — After quiz, due count decreases on Brief', async ({ page }) => {
    await seedWithDueCards(page);
    await gotoReviewQuiz(page);

    await completeQuiz(page);
    await page.getByRole('button', { name: 'Done' }).click();
    await page.waitForURL('**/mission/training**');

    // Navigate back to Brief
    await page.goto(withMissionContext('/mission/brief'), {
      waitUntil: 'domcontentloaded',
    });
    await waitForReactMount(page);

    // The review button may be hidden (0 due) or show a lower count
    const reviewBtn = page.getByTestId('review-quiz-btn');
    const isVisible = await reviewBtn.isVisible().catch(() => false);
    if (isVisible) {
      const text = await reviewBtn.textContent();
      // Due count should be lower than the original 5
      const match = text?.match(/review (\d+)/i);
      if (match) {
        expect(parseInt(match[1], 10)).toBeLessThan(5);
      }
    }
    // If not visible, that means all cards were reviewed — also valid
  });

  test('5.9 — Empty review quiz shows fallback', async ({ page }) => {
    // Seed operative WITHOUT any due cards
    await seedPersona(page, 'psi-operative');
    await seedMissionContext(page);

    // Navigate directly to quiz in review mode
    await page.goto(withMissionContext('/mission/quiz?mode=review'), {
      waitUntil: 'domcontentloaded',
    });
    await waitForReactMount(page);

    // Should show "No Questions Available" fallback
    await expect(page.getByText('No Questions Available')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Back to Training' }),
    ).toBeVisible();
  });

  test('5.10 — Quiz passes accessibility audit', async ({ page }) => {
    await seedWithDueCards(page);
    await gotoReviewQuiz(page);

    const { violations } = await scanAccessibility(page);
    const actionable = violations.filter(
      (v) => !['landmark-one-main', 'page-has-heading-one'].includes(v.id),
    );
    expect(
      actionable.map(
        (v) => `${v.id}: ${v.description} (${v.nodes.length} nodes)`,
      ),
    ).toEqual([]);
  });
});
