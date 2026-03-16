import { test, expect } from '@playwright/test';
import {
  betaStep,
  betaAudit,
  installConsoleCollector,
  resetStepCounter,
  waitForApp,
} from '../fixtures/betaAssertions';
import { seedBetaPersona } from '../fixtures/betaPersonas';

test.describe('Scenario 01: Fresh Cadet (tabula-rasa)', () => {
  // ── Deliberate onboarding path ────────────────────────────────
  // Onboarding flow lives in MissionShell (/mission/*), NOT AppShell (/train).
  // For a brand-new user: Guidance overlay → Archetype picker → Handler picker → Intake panel

  test('Deliberate onboarding + first drill', async ({ page }) => {
    resetStepCounter('01-fresh-cadet');
    installConsoleCollector(page);

    // Seed empty state (tabula-rasa)
    await seedBetaPersona(page, 'tabula-rasa');

    // Step 1: Welcome overlay (guidance overlay in MissionShell)
    await betaStep(page, 'welcome-overlay', async () => {
      await page.goto('/mission/brief');
      await waitForApp(page);
      // Welcome guidance overlay should appear for brand-new users
      const overlay = page.locator('section[role="dialog"][aria-label="Welcome"]');
      await expect(overlay).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole('button', { name: 'Start Training Now' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Choose Your Focus First' })).toBeVisible();
    });

    // Step 2: Click "Choose Your Focus First" → Archetype picker
    await betaStep(page, 'archetype-picker', async () => {
      await page.getByRole('button', { name: 'Choose Your Focus First' }).click();
      await expect(page.getByTestId('archetype-picker')).toBeVisible({ timeout: 10_000 });
      // 8 archetype cards
      const cards = page.locator('[data-testid^="archetype-card-"]');
      await expect(cards).toHaveCount(8);
      // Confirm button disabled until selection
      await expect(page.getByTestId('archetype-confirm')).toBeDisabled();
    });

    // a11y audit on archetype picker
    await betaAudit(page);

    // Step 3: Select Cyber Sentinel archetype
    await betaStep(page, 'archetype-selected', async () => {
      await page.getByTestId('archetype-card-cyber_sentinel').click();
      // Confirm should now be enabled
      await expect(page.getByTestId('archetype-confirm')).toBeEnabled();
    });

    // Step 4: Confirm archetype → Handler picker
    await betaStep(page, 'handler-picker', async () => {
      await page.getByTestId('archetype-confirm').click();
      await expect(page.getByTestId('handler-picker')).toBeVisible({ timeout: 10_000 });
      const handlers = page.locator('[data-testid^="handler-card-"]');
      await expect(handlers.first()).toBeVisible();
    });

    // Step 5: Select a handler + confirm
    await betaStep(page, 'handler-confirmed', async () => {
      // Select the first handler card
      const firstHandler = page.locator('[data-testid^="handler-card-"]').first();
      await firstHandler.click();
      await expect(page.getByTestId('handler-confirm')).toBeEnabled({ timeout: 5_000 });
      await page.getByTestId('handler-confirm').click();
      // Wait for intake panel or training surface
      await page.waitForTimeout(1000);
    });

    // Step 6: Intake panel (if visible) → Start training
    await betaStep(page, 'intake-panel', async () => {
      const intake = page.locator('section[aria-label="Mission intake"]');
      if (await intake.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await intake.getByRole('button', { name: 'Start Training' }).click();
        await page.waitForTimeout(1000);
      }
      await waitForApp(page);
    });

    // a11y audit after onboarding complete
    await betaAudit(page);

    // Step 7: Navigate to Train tab to start first drill
    await betaStep(page, 'navigate-to-train', async () => {
      await page.goto('/train');
      await waitForApp(page);
      // Module browser or training surface should be visible
      const moduleBrowser = page.getByTestId('module-browser');
      if (await moduleBrowser.isVisible({ timeout: 5_000 }).catch(() => false)) {
        const tiles = page.locator('[data-testid^="module-tile-"]');
        expect(await tiles.count()).toBeGreaterThan(0);
      }
    });

    // Step 8: Start first drill via Quick Train
    await betaStep(page, 'drill-started', async () => {
      const quickTrain = page.locator('[data-testid^="quick-train-"]').first();
      if (await quickTrain.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await quickTrain.click();
        // Wait for drill to start — look for checkboxes or timer
        await page
          .getByTestId('timer-display')
          .or(page.locator('input[type="checkbox"]').first())
          .first().waitFor({ state: 'visible', timeout: 15_000 });
      }
    });

    // a11y audit during drill
    await betaAudit(page);

    // Step 9: Toggle drill steps with realistic pacing
    await betaStep(page, 'steps-toggled', async () => {
      for (let i = 0; i < 3; i++) {
        const cb = page.locator('input[type="checkbox"]:not(:checked):not(:disabled)').first();
        if (!(await cb.isVisible({ timeout: 2_000 }).catch(() => false))) break;
        await cb.click();
        await page.waitForTimeout(1_500);
      }
    });

    // Step 10: Complete drill + reflection
    await betaStep(page, 'drill-complete', async () => {
      // Complete remaining unchecked checkboxes — re-query each iteration
      for (let attempt = 0; attempt < 20; attempt++) {
        const unchecked = page.locator('input[type="checkbox"]:not(:checked):not(:disabled)').first();
        if (!(await unchecked.isVisible({ timeout: 2_000 }).catch(() => false))) break;
        await unchecked.click();
        await page.waitForTimeout(500);
      }
      await page.waitForTimeout(1000);

      // Handle engagement warning if it appears
      const engWarning = page.getByTestId('engagement-warning');
      if (await engWarning.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const continueBtn = page.getByRole('button', { name: /continue/i });
        if (await continueBtn.isVisible().catch(() => false)) {
          await continueBtn.click();
        }
      }

      // Handle reflection if it appears
      const reflection = page.getByTestId('drill-reflection');
      if (await reflection.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const rateBtn = page.getByRole('button', { name: /rate 4/i });
        if (await rateBtn.isVisible().catch(() => false)) {
          await rateBtn.click();
        }
        const recordBtn = page.getByRole('button', { name: /record/i });
        if (await recordBtn.isVisible().catch(() => false)) {
          await recordBtn.click();
        }
      }

      await page.waitForTimeout(1000);
    });

    // Step 11: Return to training surface
    await betaStep(page, 'return-to-train', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      if (await nav.isVisible().catch(() => false)) {
        await nav.getByText('Train').click();
      } else {
        await page.goto('/train');
      }
      await waitForApp(page);
    });
  });

  // ── Fast path ─────────────────────────────────────────────────

  test('Fast path onboarding', async ({ page }) => {
    resetStepCounter('01-fresh-cadet-fast');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'tabula-rasa');

    // Step 1: Fast path — "Start Training Now" skips all onboarding
    await betaStep(page, 'fast-path-landing', async () => {
      await page.goto('/mission/brief');
      await waitForApp(page);
      const overlay = page.locator('section[role="dialog"][aria-label="Welcome"]');
      await expect(overlay).toBeVisible({ timeout: 15_000 });
      await page.getByRole('button', { name: 'Start Training Now' }).click();
      await page.waitForTimeout(1000);
      await waitForApp(page);
    });

    // a11y audit after fast path landing
    await betaAudit(page);

    // Step 2: Should land on training surface — verify modules available
    await betaStep(page, 'training-surface', async () => {
      // Navigate to /train to see module browser
      await page.goto('/train');
      await waitForApp(page);
      const moduleBrowser = page.getByTestId('module-browser');
      if (await moduleBrowser.isVisible({ timeout: 5_000 }).catch(() => false)) {
        const tiles = page.locator('[data-testid^="module-tile-"]');
        expect(await tiles.count()).toBeGreaterThan(0);
      }
    });
  });
});
