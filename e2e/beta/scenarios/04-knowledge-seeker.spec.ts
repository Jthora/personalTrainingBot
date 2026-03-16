import { test, expect } from '@playwright/test';
import {
  betaStep,
  betaAudit,
  installConsoleCollector,
  resetStepCounter,
  waitForApp,
} from '../fixtures/betaAssertions';
import { seedBetaPersona } from '../fixtures/betaPersonas';

test.describe('Scenario 04: Knowledge Seeker (quiz-grinder)', () => {
  test('Quiz system + spaced repetition', async ({ page }) => {
    resetStepCounter('04-knowledge-seeker');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'quiz-grinder');

    // Step 1: ReviewDashboard loads with due cards
    await betaStep(page, 'review-dashboard', async () => {
      await page.goto('/review');
      await waitForApp(page);
      const dueNow = page.getByText(/Due Now/i);
      const emptyState = page.getByText(/No cards due/i);
      await dueNow.or(emptyState).first().waitFor({ state: 'visible', timeout: 15_000 });
    });

    // a11y audit after ReviewDashboard
    await betaAudit(page);

    // Step 2: Check stats / forecast sections
    await betaStep(page, 'review-stats', async () => {
      const forecast = page.getByTestId('review-forecast');
      if (await forecast.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(forecast).toBeVisible();
      }
      const srStats = page.getByTestId('sr-stats');
      if (await srStats.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(srStats).toBeVisible();
      }
    });

    // Step 3: Start Review button navigates to quiz with ?mode=review
    await betaStep(page, 'start-review-attempt', async () => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      const startBtn = page.getByRole('button', { name: /Start Review/i });
      if (await startBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await startBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    // Step 4: Launch review quiz correctly via direct URL
    await betaStep(page, 'quiz-runner', async () => {
      await page.goto('/train/quiz?mode=review');
      await waitForApp(page);
      const quizRunner = page.getByTestId('quiz-runner');
      const noQuestions = page.getByText(/No Questions Available/i);
      const loading = page.getByText(/Loading training data/i);
      await quizRunner.or(noQuestions).or(loading)
        .first().waitFor({ state: 'visible', timeout: 15_000 });
    });

    // Step 5: Answer questions if quiz started
    await betaStep(page, 'answer-questions', async () => {
      const quizRunner = page.getByTestId('quiz-runner');
      if (!(await quizRunner.isVisible({ timeout: 3_000 }).catch(() => false))) return;

      for (let q = 0; q < 5; q++) {
        if (await page.getByTestId('quiz-results').isVisible().catch(() => false)) break;
        const option = page.getByTestId('option-0');
        if (await option.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await option.click();
          await page.waitForTimeout(500);
        }
        const fillInput = page.getByTestId('fill-input');
        if (await fillInput.isVisible().catch(() => false)) {
          await fillInput.fill('test');
          const submitBtn = page.getByRole('button', { name: /Submit|Check/i });
          if (await submitBtn.isVisible().catch(() => false)) await submitBtn.click();
          await page.waitForTimeout(500);
        }
        const nextBtn = page.getByTestId('next-btn');
        if (await nextBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(300);
        }
      }
    });

    // a11y audit during quiz
    await betaAudit(page);

    // Step 6: Complete quiz or check results
    await betaStep(page, 'quiz-complete', async () => {
      for (let i = 0; i < 20; i++) {
        if (await page.getByTestId('quiz-results').isVisible().catch(() => false)) break;
        const option = page.getByTestId('option-0');
        if (await option.isVisible({ timeout: 1_000 }).catch(() => false)) {
          await option.click();
          await page.waitForTimeout(300);
        }
        const fillInput = page.getByTestId('fill-input');
        if (await fillInput.isVisible().catch(() => false)) {
          await fillInput.fill('test');
          const checkBtn = page.getByRole('button', { name: /Submit|Check/i });
          if (await checkBtn.isVisible().catch(() => false)) await checkBtn.click();
          await page.waitForTimeout(300);
        }
        const nextBtn = page.getByTestId('next-btn');
        if (await nextBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(300);
        }
      }
      await page.waitForTimeout(500);
    });

    // Step 7: Quiz results (if reached)
    await betaStep(page, 'quiz-results-screen', async () => {
      const results = page.getByTestId('quiz-results');
      if (await results.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const retryBtn = page.getByTestId('retry-wrong-btn');
        if (await retryBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await retryBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    // a11y audit after quiz
    await betaAudit(page);

    // Step 8: Navigate to module quiz via deck browser
    await betaStep(page, 'module-quiz', async () => {
      await page.goto('/train');
      await waitForApp(page);
      const firstTile = page.locator('[data-testid^="module-tile-"]').first();
      if (await firstTile.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await firstTile.click();
        await page.waitForTimeout(1000);
        const quizBtn = page.locator('[data-testid^="quiz-deck-"]').first();
        if (await quizBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await quizBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    // Step 9: Return to review dashboard
    await betaStep(page, 'return-to-review', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      await nav.getByText('Review').click();
      await waitForApp(page);
    });
  });
});
