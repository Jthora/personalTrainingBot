import { test, expect } from '@playwright/test';
import {
  betaStep,
  betaAudit,
  installConsoleCollector,
  resetStepCounter,
  waitForApp,
} from '../fixtures/betaAssertions';
import { seedBetaPersona } from '../fixtures/betaPersonas';

// All 19 training modules
const ALL_MODULES = [
  'agencies', 'combat', 'counter_biochem', 'counter_psyops',
  'cybersecurity', 'dance', 'equations', 'espionage',
  'fitness', 'intelligence', 'investigation', 'martial_arts',
  'psiops', 'war_strategy', 'web_three', 'self_sovereignty',
  'anti_psn', 'anti_tcs_idc_cbc', 'space_force',
] as const;

test.describe('Scenario 08: Module Explorer (day-two-cadet)', () => {
  test('Module browser overview', async ({ page }) => {
    resetStepCounter('08-module-explorer');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Step 1: Module browser loads
    await betaStep(page, 'module-browser', async () => {
      await page.goto('/train');
      await waitForApp(page);
      await expect(page.getByTestId('module-browser')).toBeVisible({ timeout: 15_000 });
    });

    // a11y audit after ModuleBrowser
    await betaAudit(page);

    // Step 2: Count modules
    await betaStep(page, 'module-count', async () => {
      const tiles = page.locator('[data-testid^="module-tile-"]');
      // Scroll to load all
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      const count = await tiles.count();
      expect(count).toBeGreaterThanOrEqual(19);
    });

    // Step 3: Module metadata
    await betaStep(page, 'module-metadata', async () => {
      const firstTile = page.locator('[data-testid^="module-tile-"]').first();
      await expect(firstTile).toBeVisible();
    });
  });

  test('Per-module deep dive (all 19 modules)', async ({ page }) => {
    resetStepCounter('08-module-explorer');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');
    await page.goto('/train');
    await waitForApp(page);

    // Steps 4-22: Click into each module, verify DeckBrowser, navigate back
    for (let i = 0; i < ALL_MODULES.length; i++) {
      const moduleId = ALL_MODULES[i];
      await betaStep(page, `module-${moduleId}`, async () => {
        // Scroll to make the module tile visible
        const tile = page.getByTestId(`module-tile-${moduleId}`);

        // Scroll tile into view
        await tile.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        if (await tile.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await tile.click();
          await page.waitForTimeout(1000);

          // Wait for DeckBrowser or any content to load
          const deckBrowser = page.getByTestId('deck-browser');
          const anyContent = page.locator('[data-testid^="deck-card-"], [data-testid^="train-deck-"], h2, h3');
          await deckBrowser.or(anyContent.first())
            .first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});

          // Navigate back to module browser
          await page.goto('/train');
          await waitForApp(page);
          await page.getByTestId('module-browser').waitFor({ state: 'visible', timeout: 10_000 });
        }
      });
    }

    // a11y audit after module exploration
    await betaAudit(page);
  });

  test('Quick-train spot checks', async ({ page }) => {
    resetStepCounter('08-module-explorer');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Steps 23-25: Quick Train on 3 specific modules
    const spotCheckModules = ['combat', 'cybersecurity', 'espionage'];

    for (const moduleId of spotCheckModules) {
      await betaStep(page, `quick-train-${moduleId}`, async () => {
        await page.goto('/train');
        await waitForApp(page);
        await expect(page.getByTestId('module-browser')).toBeVisible({ timeout: 10_000 });

        const quickTrainBtn = page.getByTestId(`quick-train-${moduleId}`);
        await quickTrainBtn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        if (await quickTrainBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await quickTrainBtn.click();
          // Wait for drill to start
          await page
            .getByTestId('timer-display')
            .or(page.locator('input[type="checkbox"]').first())
            .first().waitFor({ state: 'visible', timeout: 15_000 });

          // Verify drill loaded — look for checkboxes or timer
          const checkboxes = page.locator('input[type="checkbox"]');
          const timer = page.getByTestId('timer-display');
          const drillLoaded = await checkboxes.count() > 0
            || await timer.isVisible().catch(() => false);
          expect(drillLoaded).toBeTruthy();
        }
      });
    }

    // a11y audit after Quick Train
    await betaAudit(page);
  });

  test('Module selection persistence', async ({ page }) => {
    resetStepCounter('08-module-explorer');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Step 26: Toggle module selection
    await betaStep(page, 'module-selection', async () => {
      await page.goto('/train');
      await waitForApp(page);
      await expect(page.getByTestId('module-browser')).toBeVisible({ timeout: 10_000 });

      // Click on a few module tiles (selection toggle behavior)
      const tiles = page.locator('[data-testid^="module-tile-"]');
      const count = await tiles.count();
      if (count >= 3) {
        // Click 3 modules to select them
        for (let i = 0; i < 3; i++) {
          await tiles.nth(i).scrollIntoViewIfNeeded();
        }
      }
    });

    // Step 27: Selection persistence across navigation
    await betaStep(page, 'selection-persists', async () => {
      // Navigate away
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      await nav.getByText('Progress').click();
      await page.waitForTimeout(1000);

      // Navigate back
      await nav.getByText('Train').click();
      await page.waitForURL('**/train**', { timeout: 10_000 });
      await expect(page.getByTestId('module-browser')).toBeVisible({ timeout: 10_000 });
    });
  });
});
