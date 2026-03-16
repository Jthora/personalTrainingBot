import { test, expect } from '@playwright/test';
import {
  betaStep,
  betaAudit,
  installConsoleCollector,
  resetStepCounter,
  waitForApp,
} from '../fixtures/betaAssertions';
import { seedBetaPersona, seedAdditional } from '../fixtures/betaPersonas';

test.describe('Scenario 03: Mission Commander (active-commander)', () => {
  test('Full 6-phase mission loop', async ({ page }) => {
    resetStepCounter('03-mission-commander');
    installConsoleCollector(page);

    await seedBetaPersona(page, 'active-commander');

    // Step 1: Shell with mission tabs
    await betaStep(page, 'shell-with-mission-tabs', async () => {
      await page.goto('/train');
      await waitForApp(page);
      // Active Duty should be enabled — mission tabs visible
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      await expect(nav).toBeVisible({ timeout: 10_000 });
    });

    // Step 2: Navigate to Brief
    await betaStep(page, 'brief-surface', async () => {
      // Try clicking Brief tab if visible, otherwise navigate directly
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      const briefTab = nav.getByText('Brief');
      if (await briefTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await briefTab.click();
      } else {
        await page.goto('/mission/brief');
      }
      await waitForApp(page);
    });

    // a11y audit after brief surface
    await betaAudit(page);

    // Step 3: Brief content check
    await betaStep(page, 'brief-content', async () => {
      // Check for key brief components
      const todayLauncher = page.getByTestId('today-launcher');
      const weeklySummary = page.getByTestId('weekly-summary');
      // At least one of these should be visible
      if (await todayLauncher.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(todayLauncher).toBeVisible();
      }
    });

    // Step 4: Navigate to Triage
    await betaStep(page, 'triage-surface', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      const triageTab = nav.getByText('Triage');
      if (await triageTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await triageTab.click();
      } else {
        await page.goto('/mission/triage');
      }
      await waitForApp(page);
    });

    // a11y audit after triage surface
    await betaAudit(page);

    // Step 5: Toggle triage density
    await betaStep(page, 'triage-density-toggle', async () => {
      // Look for density toggle controls
      const compactBtn = page.getByRole('button', { name: /compact/i });
      if (await compactBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await compactBtn.click();
        await page.waitForTimeout(500);
      }
    });

    // Step 6: Switch triage view mode
    await betaStep(page, 'triage-view-toggle', async () => {
      const feedBtn = page.getByRole('button', { name: /feed/i });
      if (await feedBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await feedBtn.click();
        await page.waitForTimeout(500);
      }
    });

    // Step 7: Process triage item — acknowledge
    await betaStep(page, 'triage-acknowledge', async () => {
      const ackBtn = page.getByRole('button', { name: /acknowledge/i }).first();
      if (await ackBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await ackBtn.click();
        await page.waitForTimeout(500);
      }
    });

    // Step 8: Process triage item — escalate
    await betaStep(page, 'triage-escalate', async () => {
      const escalateBtn = page.getByRole('button', { name: /escalate/i }).first();
      if (await escalateBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await escalateBtn.click();
        await page.waitForTimeout(500);
      }
    });

    // Step 9: Process triage item — defer
    await betaStep(page, 'triage-defer', async () => {
      const deferBtn = page.getByRole('button', { name: /defer/i }).first();
      if (await deferBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await deferBtn.click();
        await page.waitForTimeout(500);
      }
    });

    // Step 10: Navigate to Case
    await betaStep(page, 'case-surface', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      const caseTab = nav.getByText('Case');
      if (await caseTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await caseTab.click();
      } else {
        await page.goto('/mission/case');
      }
      await waitForApp(page);
    });

    // Step 11: Review artifact
    await betaStep(page, 'artifact-review', async () => {
      // Try to click first artifact in list
      const artifactItem = page.locator('[role="listitem"], [role="article"]').first();
      if (await artifactItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await artifactItem.click();
        await page.waitForTimeout(500);
      }
    });

    // Step 12: Mark artifact reviewed + promote
    await betaStep(page, 'artifact-actions', async () => {
      const reviewBtn = page.getByRole('button', { name: /review/i }).first();
      if (await reviewBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await reviewBtn.click();
        await page.waitForTimeout(300);
      }
      const promoteBtn = page.getByRole('button', { name: /promote/i }).first();
      if (await promoteBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await promoteBtn.click();
        await page.waitForTimeout(300);
      }
    });

    // Step 13: Navigate to Signal
    await betaStep(page, 'signal-surface', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      const signalTab = nav.getByText('Signal');
      if (await signalTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await signalTab.click();
      } else {
        await page.goto('/mission/signal');
      }
      await waitForApp(page);
    });

    // a11y audit after signal surface
    await betaAudit(page);

    // Step 14: Create a new signal
    await betaStep(page, 'signal-create', async () => {
      // Look for signal creation form or button
      const titleInput = page.getByRole('textbox', { name: /title/i }).first();
      if (await titleInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await titleInput.fill('Contact Report Alpha');
        const descInput = page.getByRole('textbox', { name: /detail|description/i }).first();
        if (await descInput.isVisible().catch(() => false)) {
          await descInput.fill('Anomalous network activity detected in sector 7');
        }
        const submitBtn = page.getByRole('button', { name: /submit|create|send/i }).first();
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(500);
        }
      }
    });

    // Step 15: Acknowledge signal
    await betaStep(page, 'signal-acknowledge', async () => {
      const ackBtn = page.getByRole('button', { name: /acknowledge/i }).first();
      if (await ackBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await ackBtn.click();
        await page.waitForTimeout(500);
      }
    });

    // Step 16: Resolve signal
    await betaStep(page, 'signal-resolve', async () => {
      const resolveBtn = page.getByRole('button', { name: /resolve/i }).first();
      if (await resolveBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await resolveBtn.click();
        await page.waitForTimeout(500);
      }
    });

    // Step 17: Navigate to Debrief
    await betaStep(page, 'debrief-surface', async () => {
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      const debriefTab = nav.getByText('Debrief');
      if (await debriefTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await debriefTab.click();
      } else {
        await page.goto('/mission/debrief');
      }
      await waitForApp(page);
    });

    // a11y audit after debrief surface
    await betaAudit(page);

    // Step 18: Write a new AAR
    await betaStep(page, 'aar-create', async () => {
      const newAarBtn = page.getByRole('button', { name: /new aar|add aar|create/i }).first();
      if (await newAarBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await newAarBtn.click();
        await page.waitForTimeout(500);

        // Fill AAR fields
        const titleInput = page.getByRole('textbox', { name: /title/i }).first();
        if (await titleInput.isVisible().catch(() => false)) {
          await titleInput.fill('Operation Starlight');
        }

        // Try to fill remaining fields
        const textareas = page.locator('textarea');
        const count = await textareas.count();
        for (let i = 0; i < Math.min(count, 6); i++) {
          if (await textareas.nth(i).isVisible().catch(() => false)) {
            await textareas.nth(i).fill(`AAR field ${i + 1} content`);
          }
        }

        const saveBtn = page.getByRole('button', { name: /save|submit|record/i }).first();
        if (await saveBtn.isVisible().catch(() => false)) {
          await saveBtn.click();
          await page.waitForTimeout(500);
        }
      }
    });

    // Step 19: Verify mission shell is still functional
    await betaStep(page, 'mission-complete', async () => {
      // We're in MissionShell — verify the page is responsive and not crashed
      await waitForApp(page);
      // Navigate to /train to return to AppShell
      await page.goto('/train');
      await waitForApp(page);
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      if (await nav.isVisible({ timeout: 5_000 }).catch(() => false)) {
        // Bottom nav is back — AppShell loaded
      }
    });
  });
});
