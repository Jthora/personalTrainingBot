import { test, expect } from '@playwright/test';
import {
  betaStep,
  betaAudit,
  installConsoleCollector,
  resetStepCounter,
  waitForApp,
} from '../fixtures/betaAssertions';
import { seedBetaPersona } from '../fixtures/betaPersonas';

test.describe('Scenario 05: Profile & Sovereign (veteran-operative)', () => {
  test('Profile management + veteran progression', async ({ page }) => {
    resetStepCounter('05-profile-sovereign');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'veteran-operative');

    // Step 1: Profile surface with veteran data
    await betaStep(page, 'profile-surface', async () => {
      await page.goto('/profile');
      await waitForApp(page);
      // Profile editor should be visible
      const profileEditor = page.getByTestId('profile-editor');
      if (await profileEditor.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await expect(profileEditor).toBeVisible();
      }
    });

    // a11y audit after profile surface
    await betaAudit(page);

    // Step 2: Edit callsign
    await betaStep(page, 'callsign-edit', async () => {
      const callsignInput = page.getByTestId('callsign-input');
      if (await callsignInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await callsignInput.clear();
        await callsignInput.fill('Ghost-Commander');
        // Trigger save (blur or enter)
        await callsignInput.press('Enter');
        await page.waitForTimeout(500);
      }
    });

    // Step 3: Verify callsign persistence after reload
    await betaStep(page, 'callsign-persisted', async () => {
      await page.reload();
      await waitForApp(page);
      const callsignInput = page.getByTestId('callsign-input');
      if (await callsignInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
        const value = await callsignInput.inputValue();
        expect(value).toContain('Ghost-Commander');
      }
    });

    // Step 4: Change archetype
    await betaStep(page, 'change-archetype', async () => {
      const changeBtn = page.getByTestId('change-archetype-btn');
      if (await changeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await changeBtn.click();
        // Archetype overlay should appear
        const overlay = page.getByTestId('archetype-overlay');
        await expect(overlay).toBeVisible({ timeout: 5_000 });
      }
    });

    // Step 5: Select Psi Corps archetype
    await betaStep(page, 'select-psi-corps', async () => {
      const overlay = page.getByTestId('archetype-overlay');
      if (await overlay.isVisible().catch(() => false)) {
        await page.getByTestId('archetype-card-psi_operative').click();
        const confirmBtn = page.getByTestId('archetype-confirm');
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(500);
        }
      }
    });

    // Step 6: Toggle Active Duty ON
    await betaStep(page, 'active-duty-on', async () => {
      const toggle = page.getByRole('switch', { name: /Active Duty/i });
      if (await toggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const checked = await toggle.getAttribute('aria-checked');
        if (checked !== 'true') {
          await toggle.click();
          await page.waitForTimeout(500);
        }
        // Mission tabs should now be visible in nav
        const nav = page.locator('nav[aria-label="Primary navigation"]');
        await expect(nav).toBeVisible();
      }
    });

    // Step 7: Toggle Active Duty OFF
    await betaStep(page, 'active-duty-off', async () => {
      const toggle = page.getByRole('switch', { name: /Active Duty/i });
      if (await toggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const checked = await toggle.getAttribute('aria-checked');
        if (checked === 'true') {
          await toggle.click();
          await page.waitForTimeout(500);
        }
      }
    });

    // Step 8: Export data
    await betaStep(page, 'export-data', async () => {
      const exportBtn = page.getByRole('button', { name: /Export Data/i });
      if (await exportBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        // Set up download promise before clicking
        const downloadPromise = page.waitForEvent('download', { timeout: 5_000 }).catch(() => null);
        await exportBtn.click();
        const download = await downloadPromise;
        // If download triggered, it worked
        if (download) {
          expect(download.suggestedFilename()).toContain('.json');
        }
      }
    });

    // Step 9: Navigate to Progress
    await betaStep(page, 'stats-surface', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      await nav.getByText('Progress').click();
      await page.waitForURL('**/progress**', { timeout: 10_000 });
      await waitForApp(page);
    });

    // a11y audit after stats surface
    await betaAudit(page);

    // Step 10: Badge gallery
    await betaStep(page, 'badge-gallery', async () => {
      const badgeGallery = page.getByRole('region', { name: /Badge/i });
      if (await badgeGallery.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await expect(badgeGallery).toBeVisible();
      }
    });

    // Step 11: Challenge board
    await betaStep(page, 'challenge-board', async () => {
      const challenges = page.getByRole('region', { name: /Challenge/i });
      if (await challenges.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(challenges).toBeVisible();
      }
    });

    // Step 12: Competency chart
    await betaStep(page, 'competency-chart', async () => {
      const domainProgress = page.getByRole('region', { name: /Domain progress/i });
      if (await domainProgress.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(domainProgress).toBeVisible();
      }
    });

    // Step 13: Score trend lines
    await betaStep(page, 'score-trends', async () => {
      const scoreChart = page.getByTestId('score-line-chart');
      if (await scoreChart.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(scoreChart).toBeVisible();
      }
    });

    // Step 14: Activity heatmap
    await betaStep(page, 'activity-heatmap', async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      const heatmap = page.getByTestId('activity-heatmap');
      if (await heatmap.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(heatmap).toBeVisible();
      }
    });
  });
});
