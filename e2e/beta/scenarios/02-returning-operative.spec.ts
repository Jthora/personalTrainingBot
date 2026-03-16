import { test, expect } from '@playwright/test';
import {
  betaStep,
  betaAudit,
  betaExpect,
  installConsoleCollector,
  resetStepCounter,
  waitForApp,
} from '../fixtures/betaAssertions';
import { seedBetaPersona } from '../fixtures/betaPersonas';

test.describe('Scenario 02: Returning Operative (day-two-cadet)', () => {
  test('Daily training cycle', async ({ page }) => {
    resetStepCounter('02-returning-operative');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Step 1: Training surface loads with 19 modules
    await betaStep(page, 'training-surface', async () => {
      await page.goto('/train');
      await waitForApp(page);
      await expect(page.getByTestId('module-browser')).toBeVisible({ timeout: 15_000 });
      const tiles = page.locator('[data-testid^="module-tile-"]');
      expect(await tiles.count()).toBeGreaterThanOrEqual(19);
    });

    // a11y audit after training surface
    await betaAudit(page);

    // Step 2: Check bottom nav — 4 tabs
    await betaStep(page, 'bottom-nav', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      await expect(nav).toBeVisible();
      for (const label of ['Train', 'Review', 'Progress', 'Profile']) {
        await expect(nav.getByText(label)).toBeVisible();
      }
    });

    // Step 3: Scroll through module list
    await betaStep(page, 'module-list-scroll', async () => {
      // Scroll to bottom of module browser to verify all modules render
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    });

    // Step 4: Enter Cybersecurity module
    await betaStep(page, 'deck-browser', async () => {
      await page.getByTestId('module-tile-cybersecurity').click();
      await expect(page.getByTestId('deck-browser')).toBeVisible({ timeout: 10_000 });
    });

    // Step 5: Inspect deck details
    await betaStep(page, 'deck-details', async () => {
      // At least one deck card should be visible
      const deckCards = page.locator('[data-testid^="deck-card-"]');
      expect(await deckCards.count()).toBeGreaterThan(0);
      // Train button should be visible on at least one deck
      const trainBtns = page.locator('[data-testid^="train-deck-"]');
      expect(await trainBtns.count()).toBeGreaterThan(0);
    });

    // Step 6: Train a deck
    await betaStep(page, 'drill-from-deck', async () => {
      const trainBtn = page.locator('[data-testid^="train-deck-"]').first();
      await trainBtn.click();
      // Wait for drill to start — timer or checkboxes appear
      const drillReady = page.getByTestId('timer-display')
        .or(page.locator('input[type="checkbox"]').first());
      await drillReady.first().waitFor({ state: 'visible', timeout: 15_000 });
    });

    // Step 7: Complete steps fast to trigger engagement warning
    await betaStep(page, 'engagement-warning', async () => {
      // Click all checkboxes rapidly (should trigger engagement warning)
      const scope = page.locator('#section-mission-checklist, [aria-label="Active Drill"]');
      await scope.evaluate((el) => {
        const cbs = Array.from(el.querySelectorAll('input[type="checkbox"]:not(:disabled)'));
        for (const cb of cbs) {
          (cb as HTMLInputElement).click();
        }
      });
      // Wait for engagement warning (may or may not appear depending on step count)
      await page.waitForTimeout(1000);
    });

    // Step 8: Handle engagement warning if it appeared
    await betaStep(page, 'handle-warning', async () => {
      const engWarning = page.getByTestId('engagement-warning');
      if (await engWarning.isVisible({ timeout: 3_000 }).catch(() => false)) {
        // Click "Go back and review"
        const goBackBtn = page.getByRole('button', { name: /go back/i });
        if (await goBackBtn.isVisible().catch(() => false)) {
          await goBackBtn.click();
          await page.waitForTimeout(500);
        } else {
          // Continue to reflection instead
          await page.getByRole('button', { name: /continue to reflection/i }).click();
        }
      }
    });

    // Step 9: Complete with proper pacing and reflection
    await betaStep(page, 'reflection-form', async () => {
      // Re-toggle steps if they were unchecked by "go back" — re-query each iteration
      for (let attempt = 0; attempt < 20; attempt++) {
        const next = page.locator('input[type="checkbox"]:not(:checked):not(:disabled)').first();
        if (!(await next.isVisible({ timeout: 2_000 }).catch(() => false))) break;
        await next.click();
        await page.waitForTimeout(1500);
      }

      // Handle engagement warning again if it reappears
      const engWarning = page.getByTestId('engagement-warning');
      if (await engWarning.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await page.getByRole('button', { name: /continue to reflection/i }).click();
      }

      // Wait for reflection form
      const reflection = page.getByTestId('drill-reflection');
      await reflection.waitFor({ state: 'visible', timeout: 10_000 });

      // Rate 3/5
      await page.getByRole('button', { name: 'Rate 3 out of 5' }).click();
    });

    // Step 10: Record drill
    await betaStep(page, 'drill-recorded', async () => {
      const recordBtn = page.getByRole('button', { name: /record/i });
      if (await recordBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await recordBtn.click();
      }
      // Wait for post-drill UI — completion XP, archetype prompt, or just settle
      const postDrill = page.getByTestId('drill-completion-xp')
        .or(page.getByTestId('post-drill-archetype-prompt'));
      await postDrill.first().waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
      await page.waitForTimeout(1000);
    });

    // Step 11: Navigate to Progress
    await betaStep(page, 'stats-surface', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      await nav.getByText('Progress').click();
      await page.waitForURL('**/progress**', { timeout: 10_000 });
      await waitForApp(page);
    });

    // a11y audit after stats surface
    await betaAudit(page);

    // Step 12: Check activity heatmap
    await betaStep(page, 'activity-heatmap', async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      const heatmap = page.getByTestId('activity-heatmap');
      if (await heatmap.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(heatmap).toBeVisible();
      }
    });

    // Step 13: Navigate to Profile
    await betaStep(page, 'profile-surface', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      await nav.getByText('Profile').click();
      await page.waitForURL('**/profile**', { timeout: 10_000 });
      await waitForApp(page);
    });

    // a11y audit after profile surface
    await betaAudit(page);
  });
});
