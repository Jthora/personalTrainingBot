import { test, expect, type Page } from '@playwright/test';
import { waitForReactMount } from '../fixtures/app';
import { seedPersona, buildDueCardProgressEntries, seedLocalStorage } from '../fixtures/seed';
import { scanAccessibility } from '../fixtures/a11y';

// ── Helpers ────────────────────────────────────────────────────────

/** Seed returning-operative persona BEFORE navigation. */
async function seedReturning(page: Page) {
  await seedPersona(page, 'returning-operative');
}

/** Navigate to brief and wait for the launcher to render. */
async function gotoBrief(page: Page) {
  await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
  await waitForReactMount(page);
  await expect(page.getByTestId('today-launcher')).toBeVisible();
}

/** Complete the current drill: check all steps, fill reflection, and record. */
async function completeDrillWithReflection(page: Page) {
  // Wait for checkboxes to render before interacting
  await page.locator('#section-mission-checklist input[type="checkbox"]').first()
    .waitFor({ state: 'visible', timeout: 10_000 });

  // Check all unchecked checkboxes (scoped to checklist section)
  const checked = await page.evaluate(() => {
    const section = document.getElementById('section-mission-checklist');
    const cbs = Array.from(
      (section ?? document).querySelectorAll('input[type="checkbox"]:not(:disabled)'),
    );
    let clicked = 0;
    for (const cb of cbs) {
      if (!(cb as HTMLInputElement).checked) {
        (cb as HTMLInputElement).click();
        clicked++;
      }
    }
    return { total: cbs.length, clicked };
  });
  expect(checked.total).toBeGreaterThan(0);

  // Engagement warning appears when drill completed faster than steps × 15s
  const engagementWarning = page.getByTestId('engagement-warning');
  if (await engagementWarning.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await page.getByRole('button', { name: 'Yes, continue to reflection' }).click();
  }

  // Reflection form should appear
  const reflection = page.getByTestId('drill-reflection');
  await expect(reflection).toBeVisible();
  return reflection;
}

// ── Spec ───────────────────────────────────────────────────────────

test.describe('Story 03 — Daily Cycle', () => {
  test.describe.configure({ mode: 'serial' });

  test('3.1 — Brief surface shows personalized training kit', async ({
    page,
  }) => {
    await seedReturning(page);
    await gotoBrief(page);

    // Launch button text contains archetype name
    const launchBtn = page.getByTestId('today-launch-btn');
    await expect(launchBtn).toBeVisible();
    await expect(launchBtn).toContainText('Psi Corps');

    // Archetype kit label visible
    await expect(page.getByTestId('archetype-kit-label')).toContainText(
      'Psi Corps',
    );
  });

  test('3.2 — Kit modules reflect archetype weighting', async ({ page }) => {
    await seedReturning(page);
    await gotoBrief(page);

    // The kit summary should include at least one core Psi Corps module
    const launcher = page.getByTestId('today-launcher');
    const text = await launcher.textContent();
    const coreModules = ['Psiops', 'Counter Psyops', 'Self Sovereignty', 'Martial Arts'];
    const found = coreModules.some((mod) => text?.includes(mod));
    expect(found).toBeTruthy();
  });

  test('3.3 — Starting training navigates to DrillRunner', async ({
    page,
  }) => {
    await seedReturning(page);
    await gotoBrief(page);

    // Click the launch button
    await page.getByTestId('today-launch-btn').click();
    await page.waitForURL('**/mission/checklist**');
    await waitForReactMount(page);

    // Timer display should be visible (enhanced mode)
    await expect(page.getByTestId('timer-display')).toBeVisible();

    // At least one checkbox (drill step) should render
    const checkboxes = page.locator('#section-mission-checklist input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
  });

  test('3.4 — Drill steps have real content (not placeholder)', async ({
    page,
  }) => {
    await seedReturning(page);
    await gotoBrief(page);

    await page.getByTestId('today-launch-btn').click();
    await page.waitForURL('**/mission/checklist**');
    await waitForReactMount(page);

    // Verify first step label is NOT a generic placeholder like "Step one"
    const firstLabel = page
      .locator('#section-mission-checklist label')
      .first();
    await expect(firstLabel).toBeVisible();
    const labelText = await firstLabel.textContent();
    expect(labelText).toBeTruthy();
    expect(labelText!.length).toBeGreaterThan(3);
    expect(labelText!.toLowerCase()).not.toMatch(/^step (one|two|three|\d+)$/);
  });

  test('3.5 — Completing all steps triggers reflection', async ({ page }) => {
    await seedReturning(page);
    await gotoBrief(page);

    await page.getByTestId('today-launch-btn').click();
    await page.waitForURL('**/mission/checklist**');
    await waitForReactMount(page);

    const reflection = await completeDrillWithReflection(page);

    // Reflection form structure
    await expect(reflection.getByText(/reflect before recording/i)).toBeVisible();
    await expect(reflection.locator('#drill-notes')).toBeVisible();

    // Rating buttons (1-5)
    const ratingGroup = reflection.getByRole('radiogroup', {
      name: /self-assessment/i,
    });
    await expect(ratingGroup).toBeVisible();
  });

  test('3.6 — Recording drill triggers rest interval and awards XP', async ({ page }) => {
    await seedReturning(page);
    await gotoBrief(page);

    await page.getByTestId('today-launch-btn').click();
    await page.waitForURL('**/mission/checklist**');
    await waitForReactMount(page);

    const reflection = await completeDrillWithReflection(page);

    // Fill reflection: rate 4, add notes, then record
    await reflection.locator('#drill-notes').fill('E2E test reflection — daily cycle');
    await reflection.getByRole('button', { name: /rate 4/i }).click();
    await reflection.getByRole('button', { name: 'Record drill' }).click();

    // For returning operatives (enhanced mode, non-fast-path), the rest interval
    // renders immediately after recording — XP feedback is batched under it.
    const rest = page.getByTestId('rest-interval');
    await expect(rest).toBeVisible();

    // Verify progression was recorded in localStorage
    const progress = await page.evaluate(() => {
      const raw = localStorage.getItem('userProgress:v1');
      return raw ? JSON.parse(raw) : null;
    });
    expect(progress).toBeTruthy();
    expect(progress.totalDrillsCompleted).toBeGreaterThan(47); // started at 47
    expect(progress.xp).toBeGreaterThan(2350); // started at 2350
  });

  test('3.7 — Rest interval has expected content', async ({ page }) => {
    await seedReturning(page);
    await gotoBrief(page);

    await page.getByTestId('today-launch-btn').click();
    await page.waitForURL('**/mission/checklist**');
    await waitForReactMount(page);

    await completeDrillWithReflection(page);
    const reflection = page.getByTestId('drill-reflection');
    await reflection.getByRole('button', { name: /rate 4/i }).click();
    await reflection.getByRole('button', { name: 'Record drill' }).click();

    // Rest interval should appear (enhanced mode is always on)
    const rest = page.getByTestId('rest-interval');
    await expect(rest).toBeVisible();
    await expect(rest).toContainText('Rest Period');
    await expect(rest).toContainText(/hydrate|reset focus/i);

    // Timer and skip button should be available
    await expect(page.getByTestId('timer-display')).toBeVisible();
    const skipBtn = page.getByTestId('rest-skip');
    await expect(skipBtn).toBeVisible();
  });

  test('3.8 — Review quiz button visible when SR cards are due', async ({
    page,
  }) => {
    // Seed returning operative + due card progress
    await seedReturning(page);
    await seedLocalStorage(page, buildDueCardProgressEntries());

    await gotoBrief(page);

    // The review quiz button should appear with a count
    const reviewBtn = page.getByTestId('review-quiz-btn');
    await expect(reviewBtn).toBeVisible();
    await expect(reviewBtn).toContainText(/review \d+ due card/i);
  });

  test('3.9 — Brief page passes accessibility audit', async ({ page }) => {
    await seedReturning(page);
    await gotoBrief(page);

    const { violations } = await scanAccessibility(page);
    expect(
      violations.map((v) => `${v.id}: ${v.description} (${v.nodes.length} nodes)`),
    ).toEqual([]);
  });
});
