import { test, expect, type Page } from '@playwright/test';
import { waitForReactMount } from '../fixtures/app';
import {
  seedPersona,
  seedMissionContext,
  withMissionContext,
  MISSION_CONTEXT_QUERY,
} from '../fixtures/seed';
import { scanAccessibility } from '../fixtures/a11y';

// ── Helpers ────────────────────────────────────────────────────────

/** Seed psi-operative persona + mission context BEFORE navigation. */
async function seedMissionOperative(page: Page) {
  await seedPersona(page, 'psi-operative');
  await seedMissionContext(page);
}

/** Navigate to a mission surface with mission-context query params. */
async function gotoSurface(page: Page, surface: string) {
  await page.goto(withMissionContext(`/mission/${surface}`), {
    waitUntil: 'domcontentloaded',
  });
  await waitForReactMount(page);
}

/** Wait for a specific section to become visible by its id. */
async function expectSection(page: Page, sectionId: string) {
  await expect(page.locator(`#${sectionId}`)).toBeVisible();
}

// ── Spec ───────────────────────────────────────────────────────────

test.describe('Story 04 — Mission Loop', () => {
  test.describe.configure({ mode: 'serial' });

  test('4.1 — Brief renders handoff CTA and mission content', async ({
    page,
  }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'brief');

    await expectSection(page, 'section-mission-brief');

    // Handoff section should render with "Why this step matters" guidance
    await expect(page.getByText(/Why this step matters/i)).toBeVisible();

    // Handoff CTA should be present
    const cta = page.getByRole('button', { name: 'Proceed to Triage' });
    await expect(cta).toBeVisible();

    // TodayLauncher should be present on brief
    await expect(page.getByTestId('today-launcher')).toBeVisible();
  });

  test('4.2 — Brief → Triage via handoff CTA', async ({ page }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'brief');

    // Click the handoff CTA
    await page.getByRole('button', { name: 'Proceed to Triage' }).click();
    await page.waitForURL('**/mission/triage**');
    await waitForReactMount(page);

    await expectSection(page, 'section-mission-triage');
    await expect(
      page.getByRole('button', { name: 'Proceed to Case Analysis' }),
    ).toBeVisible();
  });

  test('4.3 — Triage → Case via handoff CTA', async ({ page }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'triage');

    await page
      .getByRole('button', { name: 'Proceed to Case Analysis' })
      .click();
    await page.waitForURL('**/mission/case**');
    await waitForReactMount(page);

    await expectSection(page, 'section-mission-case');
    await expect(
      page.getByRole('button', { name: 'Proceed to Signal Operations' }),
    ).toBeVisible();
  });

  test('4.4 — Case → Signal via handoff CTA', async ({ page }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'case');

    await page
      .getByRole('button', { name: 'Proceed to Signal Operations' })
      .click();
    await page.waitForURL('**/mission/signal**');
    await waitForReactMount(page);

    await expectSection(page, 'section-mission-signal');
  });

  test('4.5 — Signal form allows creating a signal report', async ({
    page,
  }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'signal');

    // Signal form should be accessible
    const form = page.getByRole('form', { name: 'Create signal report' });
    await expect(form).toBeVisible();

    // Fill the signal form
    await page.getByPlaceholder('Signal title').fill('E2E Test Signal');
    await page
      .getByPlaceholder('What changed, who needs to know')
      .fill('Automated test — verifying signal submission flow');
    await page.getByRole('button', { name: 'Add signal' }).click();

    // The signal should appear in the list (new signal text visible)
    await expect(page.getByText('E2E Test Signal')).toBeVisible();

    // Acknowledge button should be available for the new signal
    const ackBtn = page.getByRole('button', { name: 'Acknowledge' }).first();
    await expect(ackBtn).toBeVisible();
  });

  test('4.6 — Signal → Checklist via handoff CTA', async ({ page }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'signal');

    await page
      .getByRole('button', { name: 'Proceed to Action Checklist' })
      .click();
    await page.waitForURL('**/mission/checklist**');
    await waitForReactMount(page);

    await expectSection(page, 'section-mission-checklist');
    await expect(
      page.getByRole('button', { name: 'Proceed to Debrief' }),
    ).toBeVisible();
  });

  test('4.7 — Checklist → Debrief via handoff CTA', async ({ page }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'checklist');

    await page.getByRole('button', { name: 'Proceed to Debrief' }).click();
    await page.waitForURL('**/mission/debrief**');
    await waitForReactMount(page);

    await expectSection(page, 'section-mission-debrief');
  });

  test('4.8 — Debrief shows AAR composer and restart CTA', async ({
    page,
  }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'debrief');

    // AAR Composer buttons should be visible
    await expect(
      page.getByRole('button', { name: 'Save locally' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Export JSON' }),
    ).toBeVisible();

    // Debrief closure summary should render
    await expect(
      page.getByRole('region', { name: 'Debrief closure summary' }),
    ).toBeVisible();

    // DataSafetyPanel should be present
    await expect(page.getByTestId('data-safety-panel')).toBeVisible();

    // Cycle restart CTA
    const restartCta = page.getByRole('button', {
      name: 'Start Next Mission Brief',
    });
    await expect(restartCta).toBeVisible();
  });

  test('4.9 — Debrief → Brief completes the cycle', async ({ page }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'debrief');

    // Click restart CTA
    await page
      .getByRole('button', { name: 'Start Next Mission Brief' })
      .click();
    await page.waitForURL('**/mission/brief**');
    await waitForReactMount(page);

    // Back on Brief — full cycle completed
    await expectSection(page, 'section-mission-brief');
    await expect(page.getByTestId('today-launcher')).toBeVisible();
  });

  test('4.10 — Shell step-complete toggle persists state', async ({
    page,
  }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'brief');

    // Mark step as complete
    const markBtn = page.getByRole('button', { name: 'Mark Step Complete' });
    await expect(markBtn).toBeVisible();
    await markBtn.click();

    // Button text should toggle to completed state
    await expect(
      page.getByRole('button', { name: '✓ Step Complete' }),
    ).toBeVisible();

    // Verify it persisted in localStorage
    const stored = await page.evaluate(() =>
      localStorage.getItem('mission:step-complete:v1'),
    );
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed['/mission/brief']).toBe(true);
  });

  test('4.11 — Mission loop passes accessibility audit', async ({ page }) => {
    await seedMissionOperative(page);
    await gotoSurface(page, 'brief');

    // Audit the Brief surface
    // Exclude structural rules (landmark-one-main, page-has-heading-one)
    // tracked as separate UX issues — same category as the `region` rule
    const { violations } = await scanAccessibility(page);
    const actionable = violations.filter(
      (v) => !['landmark-one-main', 'page-has-heading-one'].includes(v.id),
    );
    expect(
      actionable.map(
        (v) => `${v.id}: ${v.description} (${v.nodes.length} nodes)`,
      ),
    ).toEqual([]);
  });
});
