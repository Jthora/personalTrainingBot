import type { Page } from '@playwright/test';

export interface DrillResult {
  /** Number of advance-step clicks completed */
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
 * @param opts.selfAssessment - Rating button index to click (1-5), defaults to 3
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
    if (stepCount > 50)
      throw new Error('Drill completion loop exceeded 50 steps');
  }

  // Handle reflection if requested
  if (fillReflection) {
    const reflection = page.getByTestId('drill-reflection');
    if (await reflection.isVisible().catch(() => false)) {
      await reflection.locator('textarea').fill('E2E test reflection note');
    }
  }

  // Handle self-assessment if visible
  const ratingBtn = page
    .locator('[data-testid="drill-reflection"] button')
    .nth(selfAssessment - 1);
  if (await ratingBtn.isVisible().catch(() => false)) {
    await ratingBtn.click();
  }

  const completionVisible = await page
    .getByTestId('drill-completion-xp')
    .isVisible()
    .catch(() => false);

  return { stepCount, completionVisible };
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

    // Advance to next question
    const nextBtn = page.getByTestId('next-btn');
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
    }

    // Hint: sometimes need a short pause for transitions
    await page.waitForTimeout(300);
  }

  return answered;
}
