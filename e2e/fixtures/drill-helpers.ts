import type { Page } from '@playwright/test';

export interface DrillResult {
  /** Number of advance-step clicks completed */
  stepCount: number;
  /** Whether the completion screen appeared */
  completionVisible: boolean;
}

/**
 * Complete the currently loaded drill by checking all steps, handling the
 * engagement warning, filling reflection, and recording.
 *
 * Assumes DrillRunner is already mounted on the page (e.g. via /mission/checklist).
 *
 * @param page - Playwright page
 * @param opts.fillReflection - If true, fill the reflection textarea
 * @param opts.selfAssessment - Rating to click (1-5), defaults to 3
 * @param opts.skipRecord - If true, don't click Record (useful for testing intermediate states)
 */
export async function completeDrill(
  page: Page,
  opts: { fillReflection?: boolean; selfAssessment?: number; skipRecord?: boolean } = {},
): Promise<DrillResult> {
  const { fillReflection = false, selfAssessment = 3, skipRecord = false } = opts;

  // Click all unchecked checkboxes via DOM (avoids React re-render races)
  const checked = await page.evaluate(() => {
    const section = document.getElementById('section-mission-checklist') ?? document;
    const cbs = Array.from(section.querySelectorAll('input[type="checkbox"]:not(:disabled)'));
    let stepCount = 0;
    for (const cb of cbs) {
      if (!(cb as HTMLInputElement).checked) {
        (cb as HTMLInputElement).click();
        stepCount++;
      }
    }
    return stepCount;
  });

  // Engagement warning appears when drill completed faster than steps × 15s
  const engagementWarning = page.getByTestId('engagement-warning');
  if (await engagementWarning.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await page.getByRole('button', { name: 'Yes, continue to reflection' }).click();
  }

  // Wait for reflection form
  const reflection = page.getByTestId('drill-reflection');
  await reflection.waitFor({ state: 'visible', timeout: 10_000 });

  // Fill reflection notes if requested
  if (fillReflection) {
    await reflection.locator('textarea').fill('E2E test reflection note');
  }

  // Required self-assessment: click the rating button
  await page.getByRole('button', { name: `Rate ${selfAssessment} out of 5` }).click();

  if (skipRecord) {
    return { stepCount: checked, completionVisible: false };
  }

  // Click Record drill
  await page.getByRole('button', { name: 'Record drill' }).click();

  // Wait for completion or archetype prompt
  await page.getByTestId('drill-completion-xp')
    .or(page.getByTestId('post-drill-archetype-prompt'))
    .waitFor({ state: 'visible', timeout: 10_000 });

  const completionVisible = await page
    .getByTestId('drill-completion-xp')
    .isVisible()
    .catch(() => false);

  return { stepCount: checked, completionVisible };
}

/**
 * Navigate to the quiz section for a deck.
 * Assumes the deck browser is visible.
 */
export async function navigateToQuiz(
  page: Page,
  deckId: string,
): Promise<void> {
  const quizBtn = page.getByTestId(`quiz-deck-${deckId}`);
  await quizBtn.click();
  await page.getByTestId('quiz-runner').waitFor({ state: 'visible' });
}

/**
 * Answer quiz questions until all are complete or maxQuestions limit reached.
 * Uses a click-the-first-available-option strategy — not necessarily correct answers.
 */
export async function answerQuizQuestions(
  page: Page,
  maxQuestions = 10,
): Promise<number> {
  let answered = 0;

  for (let i = 0; i < maxQuestions; i++) {
    // Check if quiz results are showing (quiz complete)
    const results = page.getByTestId('quiz-results');
    if (await results.isVisible().catch(() => false)) {
      break;
    }

    // Try multiple-choice / true-false option
    const option = page.getByTestId('option-0');
    if (await option.isVisible().catch(() => false)) {
      await option.click();
      answered++;
    }

    // Try fill-blank input
    const fillInput = page.getByTestId('fill-input');
    if (await fillInput.isVisible().catch(() => false)) {
      await fillInput.fill('test answer');
      const submitBtn = page.getByRole('button', { name: /Submit|Check/i });
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        answered++;
      }
    }

    // Advance to next question — wait for phase transition instead of sleeping
    const nextBtn = page.getByTestId('next-btn');
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      // Wait for next-btn to disappear (question transition) or results to show
      await Promise.race([
        nextBtn.waitFor({ state: 'hidden' }).catch(() => {}),
        page.getByTestId('quiz-results').waitFor({ state: 'visible' }).catch(() => {}),
      ]);
    }
  }

  return answered;
}
