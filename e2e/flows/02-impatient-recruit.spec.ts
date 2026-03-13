import { test, expect, type Page } from '@playwright/test';

/** Navigate through the fast-path: go to brief → click "Start Training Now" → land on /mission/training. */
async function navigateFastPath(page: Page) {
  await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => (document.getElementById('root')?.children.length ?? 0) > 0,
    { timeout: 15_000 },
  );
  const overlay = page.getByRole('dialog', { name: 'Welcome' });
  await expect(overlay).toBeVisible({ timeout: 10_000 });
  await overlay.getByRole('button', { name: 'Start Training Now' }).click();
  await page.waitForURL('**/mission/training**', { timeout: 10_000 });
  await page.waitForTimeout(2000);
}

/** Navigate to the checklist/drill page and start a drill. */
async function launchDrill(page: Page) {
  // Navigate directly to the checklist page (works on both desktop and mobile)
  await page.goto('/mission/checklist', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => (document.getElementById('root')?.children.length ?? 0) > 0,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(2000);

  // If there's a "Start drill" button (no active drill), click it
  const startBtn = page.getByRole('button', { name: /start drill/i });
  if (await startBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await startBtn.click();
    await page.waitForTimeout(1000);
  }
}

/** Complete the current drill on /mission/checklist: check all steps → reflection → record.
 *  NOTE: For fast-path users, the archetype prompt replaces XP feedback immediately. */
async function completeDrill(page: Page) {
  // Click all unchecked checkboxes via native DOM click to avoid Playwright locator
  // race conditions with React controlled re-renders
  const checked = await page.evaluate(() => {
    const cbs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    let checkedCount = 0;
    for (const cb of cbs) {
      if (!(cb as HTMLInputElement).checked) {
        (cb as HTMLInputElement).click();
        checkedCount++;
      }
    }
    return { total: cbs.length, clicked: checkedCount };
  });
  expect(checked.total).toBeGreaterThan(0);
  // Give React time to process all the state updates
  await page.waitForTimeout(1000);

  // Reflection form appears after all steps checked
  const reflection = page.getByTestId('drill-reflection');
  await expect(reflection).toBeVisible({ timeout: 10_000 });

  // Record drill (use exact match to avoid strict mode violation with "Skip & record")
  const recordBtn = page.getByRole('button', { name: 'Record drill' });
  await expect(recordBtn).toBeVisible({ timeout: 5_000 });
  await recordBtn.click();
  await page.waitForTimeout(1000);
}

test.describe('Story 02 — Impatient Recruit', () => {
  test.describe.configure({ mode: 'serial' });

  test('2.1 — "Start Training Now" button is visible on /mission/brief', async ({
    page,
  }) => {
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    // Welcome overlay should appear for fresh user
    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });

    // "Start Training Now" is the impatient path
    const fastPathBtn = overlay.getByRole('button', {
      name: 'Start Training Now',
    });
    await expect(fastPathBtn).toBeVisible();
  });

  test('2.2 — "Start Training Now" skips all onboarding, lands on /mission/training', async ({
    page,
  }) => {
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    // Dismiss via fast path
    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });
    await overlay
      .getByRole('button', { name: 'Start Training Now' })
      .click();

    // Should navigate to /mission/training
    await page.waitForURL('**/mission/training**', { timeout: 10_000 });
    expect(page.url()).toContain('/mission/training');

    // No archetype picker or intake visible
    await expect(page.getByTestId('archetype-picker')).not.toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Mission intake' }),
    ).not.toBeVisible();
  });

  test('2.3 — Fast path sets flag, no profile yet', async ({ page }) => {
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });
    await overlay
      .getByRole('button', { name: 'Start Training Now' })
      .click();
    await page.waitForURL('**/mission/training**', { timeout: 10_000 });

    // Check localStorage
    const fastPath = await page.evaluate(() =>
      localStorage.getItem('mission:fast-path:v1'),
    );
    expect(fastPath).toBe('active');

    const profile = await page.evaluate(() =>
      localStorage.getItem('operative:profile:v1'),
    );
    expect(profile).toBeNull();
  });

  test('2.4 — Training surface has actionable content', async ({ page }) => {
    await navigateFastPath(page);

    // The training surface should show module browser with module tiles
    const moduleTiles = page.locator('[data-testid^="module-tile-"]');
    const count = await moduleTiles.count();
    expect(count).toBeGreaterThan(0);

    // Click first module to verify deck browser appears with a Train button
    await moduleTiles.first().click();
    await page.waitForTimeout(1000);
    const trainBtn = page.getByTestId('train-module-btn');
    await expect(trainBtn).toBeVisible({ timeout: 10_000 });
  });

  test('2.5 — Complete drill: steps → reflection → record → post-drill prompt', async ({
    page,
  }) => {
    await navigateFastPath(page);
    await launchDrill(page);
    await completeDrill(page);
    // For fast-path users, archetype prompt appears immediately after recording
    // (XP feedback is not visible because archetype prompt takes over)
    const prompt = page.getByTestId('post-drill-archetype-prompt');
    await expect(prompt).toBeVisible({ timeout: 10_000 });
  });

  test('2.6 — Post-drill archetype prompt appears for fast-path user', async ({
    page,
  }) => {
    await navigateFastPath(page);
    await launchDrill(page);
    await completeDrill(page);

    // Post-drill archetype prompt should appear
    const prompt = page.getByTestId('post-drill-archetype-prompt');
    await expect(prompt).toBeVisible({ timeout: 10_000 });
    await expect(prompt.getByText('Nice work on your first drill')).toBeVisible();
  });

  test('2.7 — Selecting archetype from prompt dismisses it and updates experience', async ({
    page,
  }) => {
    await navigateFastPath(page);
    await launchDrill(page);
    await completeDrill(page);

    // Wait for archetype prompt
    const prompt = page.getByTestId('post-drill-archetype-prompt');
    await expect(prompt).toBeVisible({ timeout: 10_000 });

    // Select psi_operative archetype and confirm (scoped to prompt to avoid duplicate picker)
    await prompt.getByTestId('archetype-card-psi_operative').click();
    await prompt.getByTestId('archetype-confirm').click();

    // Prompt should dismiss
    await expect(prompt).not.toBeVisible({ timeout: 10_000 });

    // Navigate to brief to check identity-aware CTA
    await page.goto('/mission/brief');
    await page.waitForTimeout(2000);

    const launchBtn = page.getByTestId('today-launch-btn');
    if (await launchBtn.isVisible().catch(() => false)) {
      await expect(launchBtn).toContainText('Psi Operative');
    }
  });

  test('2.8 — Fast path flag cleared, profile saved', async ({ page }) => {
    await navigateFastPath(page);
    await launchDrill(page);
    await completeDrill(page);

    // Select archetype from prompt
    const prompt = page.getByTestId('post-drill-archetype-prompt');
    await expect(prompt).toBeVisible({ timeout: 10_000 });
    await prompt.getByTestId('archetype-card-psi_operative').click();
    await prompt.getByTestId('archetype-confirm').click();
    await expect(prompt).not.toBeVisible({ timeout: 10_000 });

    // Verify localStorage state
    const fastPath = await page.evaluate(() =>
      localStorage.getItem('mission:fast-path:v1'),
    );
    expect(fastPath).toBeNull(); // Flag should be cleared

    const profile = await page.evaluate(() => {
      const raw = localStorage.getItem('operative:profile:v1');
      return raw ? JSON.parse(raw) : null;
    });
    expect(profile).toBeTruthy();
    expect(profile.archetypeId).toBe('psi_operative');
    expect(profile.handlerId).toBe('tara_van_dekar'); // recommended handler
    expect(profile.enrolledAt).toBeTruthy();
  });
});
