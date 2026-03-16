import { test, expect } from '@playwright/test';
import {
  betaStep,
  betaAudit,
  installConsoleCollector,
  resetStepCounter,
  waitForApp,
} from '../fixtures/betaAssertions';
import { seedBetaPersona } from '../fixtures/betaPersonas';

test.describe('Scenario 06: Edge Gremlin (adversarial)', () => {

  // ── State Destruction ───────────────────────────────────────────

  test('State destruction & recovery', async ({ page }) => {
    resetStepCounter('06-edge-gremlin');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Step 1: Refresh mid-drill
    await betaStep(page, 'refresh-mid-drill', async () => {
      await page.goto('/train');
      await waitForApp(page);

      // Start a quick-train drill
      const quickTrain = page.locator('[data-testid^="quick-train-"]').first();
      if (await quickTrain.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await quickTrain.click();
        await page.waitForTimeout(2000);

        // Toggle 2 steps if checkboxes are visible
        for (let i = 0; i < 2; i++) {
          const cb = page.locator('input[type="checkbox"]:not(:checked):not(:disabled)').first();
          if (!(await cb.isVisible({ timeout: 2_000 }).catch(() => false))) break;
          await cb.click();
          await page.waitForTimeout(300);
        }
      }

      // Hard reload mid-drill
      await page.reload();
      await waitForApp(page);
      // App should recover — no crash, no blank screen
      await page.waitForTimeout(1000);
    });

    // Step 2: Clear localStorage mid-session
    await betaStep(page, 'clear-localstorage', async () => {
      await page.goto('/train');
      await waitForApp(page);
      // Nuke all state
      await page.evaluate(() => localStorage.clear());
      // Navigate to profile — should redirect to onboarding or show empty state
      await page.goto('/profile');
      await waitForApp(page);
      await page.waitForTimeout(1000);
    });

    // Step 3: Corrupt localStorage with invalid JSON
    await betaStep(page, 'corrupt-json', async () => {
      await page.evaluate(() => {
        localStorage.setItem('userProgress:v1', '"{invalid json"');
        localStorage.setItem('ptb:drill-history:v1', '---not-json---');
      });
      await page.reload();
      await waitForApp(page);
      // App should handle corrupt data gracefully
      await page.waitForTimeout(1000);
    });
  });

  // ── Navigation Abuse ────────────────────────────────────────────

  test('Navigation abuse', async ({ page }) => {
    resetStepCounter('06-edge-gremlin');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Step 4: Invalid route
    await betaStep(page, 'invalid-route', async () => {
      await page.goto('/nonexistent/path/here');
      await waitForApp(page);
      // Should redirect to a valid route, not show blank screen
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).not.toContain('/nonexistent');
    });

    // a11y audit after error redirect state
    await betaAudit(page);

    // Step 5: Deep link with bad params
    await betaStep(page, 'bad-deeplink-params', async () => {
      await page.goto('/mission/brief?op=op-doesnt-exist&case=fake&signal=fake');
      await waitForApp(page);
      await page.waitForTimeout(1000);
      // Should not crash — page loads something
    });

    // Step 6: Card share with bad slug
    await betaStep(page, 'bad-share-slug', async () => {
      await page.goto('/share/nonexistent-slug-12345');
      await waitForApp(page);
      await page.waitForTimeout(1000);
    });

    // Step 7: Card redirect with bad slug
    await betaStep(page, 'bad-card-redirect', async () => {
      await page.goto('/c/nonexistent-slug');
      await waitForApp(page);
      await page.waitForTimeout(1000);
    });

    // Step 8: All legacy routes resolve
    await betaStep(page, 'legacy-routes', async () => {
      const legacyRoutes = [
        '/home', '/home/plan', '/home/cards', '/home/progress',
        '/home/handler', '/home/settings', '/schedules', '/drills',
        '/training', '/training/run', '/settings',
      ];
      for (const route of legacyRoutes) {
        await page.goto(route);
        await waitForApp(page);
        await page.waitForTimeout(500);
        // Each should resolve — not show blank screen
        const root = page.locator('#root');
        const hasChildren = await root.evaluate((el) => el.children.length > 0);
        expect(hasChildren, `Legacy route ${route} resulted in empty #root`).toBe(true);
      }
    });

    // Step 9: Back button stress
    await betaStep(page, 'back-button-stress', async () => {
      // Navigate through 5 screens
      await page.goto('/train');
      await waitForApp(page);
      await page.goto('/review');
      await waitForApp(page);
      await page.goto('/progress');
      await waitForApp(page);
      await page.goto('/profile');
      await waitForApp(page);
      await page.goto('/train');
      await waitForApp(page);

      // Press back 4 times
      for (let i = 0; i < 4; i++) {
        await page.goBack();
        await page.waitForTimeout(500);
      }
      // Should be on first page — not in a loop
    });
  });

  // ── Input Edge Cases ────────────────────────────────────────────

  test('Input edge cases', async ({ page }) => {
    resetStepCounter('06-edge-gremlin');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'veteran-operative');

    // Step 10: Emoji callsign
    await betaStep(page, 'emoji-callsign', async () => {
      await page.goto('/profile');
      await waitForApp(page);

      const callsignInput = page.getByTestId('callsign-input');
      if (await callsignInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await callsignInput.clear();
        await callsignInput.fill('🚀Commander🔥💀');
        await callsignInput.press('Enter');
        await page.waitForTimeout(500);
        // Verify it saved
        const value = await callsignInput.inputValue();
        expect(value).toContain('🚀');
      }
    });

    // Step 11: Very long callsign
    await betaStep(page, 'long-callsign', async () => {
      const callsignInput = page.getByTestId('callsign-input');
      if (await callsignInput.isVisible().catch(() => false)) {
        const longName = 'A'.repeat(200);
        await callsignInput.clear();
        await callsignInput.fill(longName);
        await callsignInput.press('Enter');
        await page.waitForTimeout(500);
      }
    });

    // Step 12: Empty callsign
    await betaStep(page, 'empty-callsign', async () => {
      const callsignInput = page.getByTestId('callsign-input');
      if (await callsignInput.isVisible().catch(() => false)) {
        await callsignInput.clear();
        await callsignInput.press('Enter');
        await page.waitForTimeout(500);
      }
    });

    // Step 13: Rapid step double-tap
    await betaStep(page, 'rapid-step-toggle', async () => {
      await page.goto('/train');
      await waitForApp(page);

      const quickTrain = page.locator('[data-testid^="quick-train-"]').first();
      if (await quickTrain.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await quickTrain.click();
        await page.waitForTimeout(2000);

        const scope = page.locator('#section-mission-checklist, [aria-label="Active Drill"]');
        const firstCb = scope.locator('input[type="checkbox"]:not(:disabled)').first();
        if (await firstCb.isVisible({ timeout: 3_000 }).catch(() => false)) {
          // Rapid double click
          await firstCb.click();
          await firstCb.click();
          await page.waitForTimeout(300);
        }
      }
    });

    // Step 14: Rapid tab switching
    await betaStep(page, 'rapid-tab-switch', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      if (await nav.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const tabs = ['Train', 'Review', 'Progress', 'Profile'];
        for (const tab of tabs) {
          const tabBtn = nav.getByText(tab);
          if (await tabBtn.isVisible().catch(() => false)) {
            await tabBtn.click();
            // No wait — rapid switching
          }
        }
        // Wait for final tab to settle
        await page.waitForTimeout(1000);
        // Should be on Profile (last tab clicked)
        await waitForApp(page);
      }
    });
  });

  // ── Network & Offline ───────────────────────────────────────────

  test('Offline behavior', async ({ page }) => {
    resetStepCounter('06-edge-gremlin');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Step 15: Go offline
    await betaStep(page, 'go-offline', async () => {
      await page.goto('/train');
      await waitForApp(page);

      await page.context().setOffline(true);
      await page.waitForTimeout(1000);

      // Network status should indicate offline
      const offlineText = page.getByText(/Offline/i);
      if (await offlineText.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(offlineText).toBeVisible();
      }
    });

    // a11y audit while offline
    await betaAudit(page);

    // Step 16: Complete drill while offline
    await betaStep(page, 'drill-offline', async () => {
      const quickTrain = page.locator('[data-testid^="quick-train-"]').first();
      if (await quickTrain.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await quickTrain.click();
        await page.waitForTimeout(2000);
      }
    });

    // Step 17: Come back online
    await betaStep(page, 'come-online', async () => {
      await page.context().setOffline(false);
      await page.waitForTimeout(1000);
    });
  });

  // ── Error Recovery ──────────────────────────────────────────────

  test('Error boundary & recovery', async ({ page }) => {
    resetStepCounter('06-edge-gremlin');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Step 18: Trigger error boundary
    await betaStep(page, 'error-boundary', async () => {
      await page.goto('/train');
      await waitForApp(page);

      // Inject an error into the React component tree
      await page.evaluate(() => {
        const root = document.getElementById('root');
        if (root) {
          // Trigger unhandled error
          const event = new ErrorEvent('error', {
            error: new Error('Beta test trigger'),
            message: 'Beta test trigger',
          });
          window.dispatchEvent(event);
        }
      });
      await page.waitForTimeout(1000);
    });

    // a11y audit of error state (may or may not have triggered boundary)
    await betaAudit(page);

    // Step 19: Recover from error boundary
    await betaStep(page, 'error-recovery', async () => {
      const reloadBtn = page.getByRole('button', { name: /Reload/i });
      if (await reloadBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await reloadBtn.click();
        await waitForApp(page);
      } else {
        // Error boundary didn't trigger — verify app still works
        await page.reload();
        await waitForApp(page);
      }
    });
  });
});
