import { test, expect } from '@playwright/test';
import {
  betaStep,
  betaAudit,
  installConsoleCollector,
  resetStepCounter,
  waitForApp,
} from '../fixtures/betaAssertions';
import { seedBetaPersona } from '../fixtures/betaPersonas';

test.describe('Scenario 07: Navigation Atlas (day-two-cadet)', () => {
  test('Primary navigation tabs', async ({ page }) => {
    resetStepCounter('07-navigation-atlas');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');
    await page.goto('/train');
    await waitForApp(page);

    const nav = page.locator('nav[aria-label="Primary navigation"]');

    // Step 1: Train tab
    await betaStep(page, 'train-tab', async () => {
      await nav.getByText('Train').click();
      await page.waitForURL('**/train**', { timeout: 10_000 });
      await expect(page.getByTestId('module-browser')).toBeVisible({ timeout: 10_000 });
    });

    // Step 2: Review tab
    await betaStep(page, 'review-tab', async () => {
      await nav.getByText('Review').click();
      await page.waitForURL('**/review**', { timeout: 10_000 });
      await waitForApp(page);
    });

    // Step 3: Progress tab
    await betaStep(page, 'progress-tab', async () => {
      await nav.getByText('Progress').click();
      await page.waitForURL('**/progress**', { timeout: 10_000 });
      await waitForApp(page);
    });

    // Step 4: Profile tab
    await betaStep(page, 'profile-tab', async () => {
      await nav.getByText('Profile').click();
      await page.waitForURL('**/profile**', { timeout: 10_000 });
      await waitForApp(page);
    });

    // a11y audit after primary nav complete
    await betaAudit(page);
  });

  test('Mission tabs (Active Duty)', async ({ page }) => {
    resetStepCounter('07-navigation-atlas');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');
    await page.goto('/profile');
    await waitForApp(page);

    const nav = page.locator('nav[aria-label="Primary navigation"]');

    // Step 5: Enable Active Duty
    await betaStep(page, 'enable-active-duty', async () => {
      const toggle = page.getByRole('switch', { name: /Active Duty/i });
      if (await toggle.isVisible({ timeout: 5_000 }).catch(() => false)) {
        const checked = await toggle.getAttribute('aria-checked');
        if (checked !== 'true') {
          await toggle.click();
          await page.waitForTimeout(500);
        }
      }
    });

    // Step 6: Brief tab
    await betaStep(page, 'brief-tab', async () => {
      const briefTab = nav.getByText('Brief');
      if (await briefTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await briefTab.click();
        await page.waitForTimeout(1000);
        await waitForApp(page);
      } else {
        await page.goto('/mission/brief');
        await waitForApp(page);
      }
    });

    // Step 7: Triage tab
    await betaStep(page, 'triage-tab', async () => {
      const triageTab = nav.getByText('Triage');
      if (await triageTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await triageTab.click();
        await page.waitForTimeout(1000);
        await waitForApp(page);
      } else {
        await page.goto('/mission/triage');
        await waitForApp(page);
      }
    });

    // Step 8: Case tab
    await betaStep(page, 'case-tab', async () => {
      const caseTab = nav.getByText('Case');
      if (await caseTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await caseTab.click();
        await page.waitForTimeout(1000);
        await waitForApp(page);
      } else {
        await page.goto('/mission/case');
        await waitForApp(page);
      }
    });

    // Step 9: Signal tab
    await betaStep(page, 'signal-tab', async () => {
      const signalTab = nav.getByText('Signal');
      if (await signalTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await signalTab.click();
        await page.waitForTimeout(1000);
        await waitForApp(page);
      } else {
        await page.goto('/mission/signal');
        await waitForApp(page);
      }
    });

    // Step 10: Debrief tab
    await betaStep(page, 'debrief-tab', async () => {
      const debriefTab = nav.getByText('Debrief');
      if (await debriefTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await debriefTab.click();
        await page.waitForTimeout(1000);
        await waitForApp(page);
      } else {
        await page.goto('/mission/debrief');
        await waitForApp(page);
      }
    });

    // a11y audit after mission nav complete
    await betaAudit(page);
  });

  test('Legacy route redirects', async ({ page }) => {
    resetStepCounter('07-navigation-atlas');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    const legacyRedirects: [string, string, string][] = [
      ['/home', '**/train**', 'home-to-train'],
      ['/home/plan', '**/train**', 'home-plan-to-train'],
      ['/home/cards', '**/train**', 'home-cards-to-train'],
      ['/home/progress', '**/progress**', 'home-progress'],
      ['/home/handler', '**/profile**', 'home-handler'],
      ['/home/settings', '**/profile**', 'home-settings'],
    ];

    // Steps 11-16: Legacy route redirects
    for (const [route, expectedGlob, name] of legacyRedirects) {
      await betaStep(page, name, async () => {
        await page.goto(route);
        await waitForApp(page);
        await page.waitForURL(expectedGlob, { timeout: 10_000 });
      });
    }

    // Steps 17-21: Other legacy routes
    const otherLegacy = ['/schedules', '/drills', '/training', '/training/run', '/settings'];
    for (const route of otherLegacy) {
      const name = route.replace(/\//g, '-').replace(/^-/, '');
      await betaStep(page, name, async () => {
        await page.goto(route);
        await waitForApp(page);
        await page.waitForTimeout(1000);
        // Should resolve to a valid page (not blank)
        const hasChildren = await page.evaluate(
          () => (document.getElementById('root')?.children.length ?? 0) > 0,
        );
        expect(hasChildren, `Route ${route} resulted in empty #root`).toBe(true);
      });
    }
  });

  test('Deep links', async ({ page }) => {
    resetStepCounter('07-navigation-atlas');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Step 22: Mission with params
    await betaStep(page, 'mission-deeplink', async () => {
      await page.goto('/mission/brief?op=test-op&case=test-case&signal=test-signal');
      await waitForApp(page);
      await page.waitForTimeout(1000);
    });

    // Step 23: Card share
    await betaStep(page, 'card-share-link', async () => {
      await page.goto('/share/test-slug');
      await waitForApp(page);
      await page.waitForTimeout(1000);
    });

    // Step 24: Card redirect
    await betaStep(page, 'card-redirect', async () => {
      await page.goto('/c/test-slug?source=test');
      await waitForApp(page);
      await page.waitForTimeout(1000);
    });
  });

  test('Browser history', async ({ page }) => {
    resetStepCounter('07-navigation-atlas');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    // Step 25: Forward navigation through 6 pages
    await betaStep(page, 'forward-navigation', async () => {
      const routes = ['/train', '/review', '/progress', '/profile'];
      for (const route of routes) {
        await page.goto(route);
        await waitForApp(page);
        await page.waitForTimeout(300);
      }
    });

    // Step 26: Back x 3
    await betaStep(page, 'back-navigation', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack();
        await page.waitForTimeout(500);
        await waitForApp(page);
      }
    });

    // Step 27: Forward x 2
    await betaStep(page, 'forward-after-back', async () => {
      for (let i = 0; i < 2; i++) {
        await page.goForward();
        await page.waitForTimeout(500);
        await waitForApp(page);
      }
    });
  });

  test('Reload resilience', async ({ page }) => {
    resetStepCounter('07-navigation-atlas');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'day-two-cadet');

    const reloadTests: [string, string][] = [
      ['/train', 'reload-train'],
      ['/review', 'reload-review'],
      ['/progress', 'reload-progress'],
      ['/profile', 'reload-profile'],
    ];

    // Steps 28-31: Reload on each primary route
    for (const [route, name] of reloadTests) {
      await betaStep(page, name, async () => {
        await page.goto(route);
        await waitForApp(page);
        await page.reload();
        await waitForApp(page);
        // Verify app is still functional
        const hasChildren = await page.evaluate(
          () => (document.getElementById('root')?.children.length ?? 0) > 0,
        );
        expect(hasChildren, `Reload on ${route} resulted in empty #root`).toBe(true);
      });
    }

    // Step 32: Reload on mission brief
    await betaStep(page, 'reload-mission-brief', async () => {
      await page.goto('/mission/brief');
      await waitForApp(page);
      await page.reload();
      await waitForApp(page);
    });

    // Step 33: 404 catch-all
    await betaStep(page, 'catchall-404', async () => {
      await page.goto('/totally/invalid/deep/path');
      await waitForApp(page);
      await page.waitForTimeout(1000);
    });

    // Step 34: Root redirect
    await betaStep(page, 'root-redirect', async () => {
      await page.goto('/');
      await waitForApp(page);
      await page.waitForTimeout(1000);
    });
  });
});
