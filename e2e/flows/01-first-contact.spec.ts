import { test, expect } from '@playwright/test';

test.describe('Story 01 — First Contact', () => {
  test.describe.configure({ mode: 'serial' });

  test('1.1 — Welcome overlay renders with value-first messaging', async ({
    page,
  }) => {
    // Empty localStorage = fresh visitor
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    // Welcome overlay should appear
    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });

    // Value-first headline
    await expect(overlay.getByText('Train 19 Disciplines')).toBeVisible();

    // Both action buttons present
    await expect(
      overlay.getByRole('button', { name: 'Start Training Now' }),
    ).toBeVisible();
    await expect(
      overlay.getByRole('button', { name: 'Choose Your Focus First' }),
    ).toBeVisible();
  });

  test('1.2 — "Choose Your Focus First" opens archetype picker', async ({
    page,
  }) => {
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    // Wait for overlay and click the deliberate path
    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });
    await overlay
      .getByRole('button', { name: 'Choose Your Focus First' })
      .click();

    // Archetype picker should appear
    const picker = page.getByTestId('archetype-picker');
    await expect(picker).toBeVisible({ timeout: 10_000 });

    // Should show heading
    await expect(picker.getByText('Choose Your Archetype')).toBeVisible();

    // Should show at least a few archetype cards
    await expect(page.getByTestId('archetype-card-psi_operative')).toBeVisible();
    await expect(page.getByTestId('archetype-card-cyber_sentinel')).toBeVisible();
  });

  test('1.3 — Archetype selection shows description, enables confirm', async ({
    page,
  }) => {
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    // Dismiss overlay → archetype picker
    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });
    await overlay
      .getByRole('button', { name: 'Choose Your Focus First' })
      .click();
    await expect(page.getByTestId('archetype-picker')).toBeVisible({
      timeout: 10_000,
    });

    // Confirm button should be disabled before selection
    const confirmBtn = page.getByTestId('archetype-confirm');
    await expect(confirmBtn).toBeDisabled();

    // Click Psi Operative card
    await page.getByTestId('archetype-card-psi_operative').click();

    // Confirm button should now be enabled
    await expect(confirmBtn).toBeEnabled();
  });

  test('1.4 — Confirming archetype opens handler picker with recommendation', async ({
    page,
  }) => {
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    // Navigate through overlay → archetype picker
    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });
    await overlay
      .getByRole('button', { name: 'Choose Your Focus First' })
      .click();
    await expect(page.getByTestId('archetype-picker')).toBeVisible({
      timeout: 10_000,
    });

    // Select psi_operative and confirm
    await page.getByTestId('archetype-card-psi_operative').click();
    await page.getByTestId('archetype-confirm').click();

    // Handler picker should appear
    const handlerPicker = page.getByTestId('handler-picker');
    await expect(handlerPicker).toBeVisible({ timeout: 10_000 });
    await expect(handlerPicker.getByText('Choose Your Handler')).toBeVisible();

    // Tara should be first (recommended) and show badge
    const taraCard = page.getByTestId('handler-card-tara_van_dekar');
    await expect(taraCard).toBeVisible();
    await expect(page.getByTestId('recommended-badge')).toBeVisible();

    // Confirm should be enabled (recommended handler auto-selected)
    await expect(page.getByTestId('handler-confirm')).toBeEnabled();
  });

  test('1.5 — Confirming handler shows intake panel', async ({ page }) => {
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    // Navigate: overlay → archetype → handler
    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });
    await overlay
      .getByRole('button', { name: 'Choose Your Focus First' })
      .click();
    await expect(page.getByTestId('archetype-picker')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByTestId('archetype-card-psi_operative').click();
    await page.getByTestId('archetype-confirm').click();
    await expect(page.getByTestId('handler-picker')).toBeVisible({
      timeout: 10_000,
    });

    // Confirm handler (auto-selected recommended: tara_van_dekar)
    await page.getByTestId('handler-confirm').click();

    // Intake panel should appear
    const intakePanel = page.getByRole('region', { name: 'Mission intake' });
    await expect(intakePanel).toBeVisible({ timeout: 10_000 });
    await expect(intakePanel.getByText('Your Training Hub')).toBeVisible();
  });

  test('1.6 — Completing intake lands on Brief with identity-aware CTA', async ({
    page,
  }) => {
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    // Full onboarding sequence: overlay → archetype → handler → intake
    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });
    await overlay
      .getByRole('button', { name: 'Choose Your Focus First' })
      .click();
    await expect(page.getByTestId('archetype-picker')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByTestId('archetype-card-psi_operative').click();
    await page.getByTestId('archetype-confirm').click();
    await expect(page.getByTestId('handler-picker')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByTestId('handler-confirm').click();
    const intakePanel = page.getByRole('region', { name: 'Mission intake' });
    await expect(intakePanel).toBeVisible({ timeout: 10_000 });

    // Click "Start Training" to dismiss intake
    await intakePanel.getByRole('button', { name: 'Start Training' }).click();

    // Should land on Brief page with identity-aware CTA
    const launcher = page.getByTestId('today-launcher');
    await expect(launcher).toBeVisible({ timeout: 10_000 });

    // The launch button should mention the archetype
    const launchBtn = page.getByTestId('today-launch-btn');
    await expect(launchBtn).toBeVisible();
    await expect(launchBtn).toContainText('Psi Operative');

    // Archetype kit label should be present
    await expect(page.getByTestId('archetype-kit-label')).toContainText(
      'Psi Operative',
    );
  });

  test('1.7 — Profile persisted in localStorage', async ({ page }) => {
    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => (document.getElementById('root')?.children.length ?? 0) > 0,
      { timeout: 15_000 },
    );

    // Full onboarding sequence
    const overlay = page.getByRole('dialog', { name: 'Welcome' });
    await expect(overlay).toBeVisible({ timeout: 10_000 });
    await overlay
      .getByRole('button', { name: 'Choose Your Focus First' })
      .click();
    await expect(page.getByTestId('archetype-picker')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByTestId('archetype-card-psi_operative').click();
    await page.getByTestId('archetype-confirm').click();
    await expect(page.getByTestId('handler-picker')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByTestId('handler-confirm').click();
    const intakePanel = page.getByRole('region', { name: 'Mission intake' });
    await expect(intakePanel).toBeVisible({ timeout: 10_000 });
    await intakePanel.getByRole('button', { name: 'Start Training' }).click();

    // Wait for launcher to confirm app is settled
    await expect(page.getByTestId('today-launcher')).toBeVisible({
      timeout: 10_000,
    });

    // Check localStorage for profile
    const profile = await page.evaluate(() => {
      const raw = localStorage.getItem('operative:profile:v1');
      return raw ? JSON.parse(raw) : null;
    });

    expect(profile).toBeTruthy();
    expect(profile.archetypeId).toBe('psi_operative');
    expect(profile.handlerId).toBe('tara_van_dekar');
    expect(profile.enrolledAt).toBeTruthy();

    // Guidance overlay and intake should also be dismissed
    const overlaySeen = await page.evaluate(() =>
      localStorage.getItem('mission:guidance-overlay:v1'),
    );
    expect(overlaySeen).toBe('seen');

    const intakeSeen = await page.evaluate(() =>
      localStorage.getItem('mission:intake:v1'),
    );
    expect(intakeSeen).toBe('seen');
  });
});
