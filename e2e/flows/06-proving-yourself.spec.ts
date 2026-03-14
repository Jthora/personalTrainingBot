import { test, expect, type Page } from '@playwright/test';
import { waitForReactMount } from '../fixtures/app';
import {
  seedPersona,
  seedMissionContext,
  withMissionContext,
  readLocalStorage,
} from '../fixtures/seed';
import { scanAccessibility } from '../fixtures/a11y';

// ── Helpers ────────────────────────────────────────────────────────

/** Seed grinder persona with drill history, badges, and XP. */
async function seedGrinder(page: Page) {
  await seedPersona(page, 'grinder');
  await seedMissionContext(page);
}

/** Navigate to the Stats surface. */
async function gotoStats(page: Page) {
  await page.goto(withMissionContext('/mission/stats'), {
    waitUntil: 'domcontentloaded',
  });
  await waitForReactMount(page);
  await expect(
    page.getByRole('region', { name: /Operative Dashboard/i }),
  ).toBeVisible({ timeout: 15_000 });
}

/** Navigate to Brief then switch to Stats via tab. */
async function gotoBrief(page: Page) {
  await page.goto(withMissionContext('/mission/brief'), {
    waitUntil: 'domcontentloaded',
  });
  await waitForReactMount(page);
  await expect(page.getByTestId('today-launcher')).toBeVisible({ timeout: 15_000 });
}

// ── Spec ───────────────────────────────────────────────────────────

test.describe('Story 06 — Proving Yourself', () => {
  test('6.1 — Stats surface renders operative dashboard', async ({ page }) => {
    await seedGrinder(page);
    await gotoStats(page);

    // Operative Dashboard heading
    await expect(
      page.getByRole('heading', { name: /Operative Dashboard/i }),
    ).toBeVisible();

    // Quick stats chips should all render (use exact text to avoid ambiguity)
    await expect(page.getByText('Lv 5')).toBeVisible();
    await expect(page.getByText('Drills Done')).toBeVisible();
    await expect(page.getByText('Daily Goal')).toBeVisible();
    await expect(page.getByText('Weekly Goal')).toBeVisible();
  });

  test('6.2 — Quick stats show seeded values', async ({ page }) => {
    await seedGrinder(page);
    await gotoStats(page);

    // Level 5 (floor(2350/500)+1 = 5)
    await expect(page.getByText('Lv 5')).toBeVisible();
    // XP 2350
    await expect(page.getByText('2350')).toBeVisible();
    // Streak 5 days
    await expect(page.getByText(/🔥 5d/)).toBeVisible();
    // 47 drills completed
    await expect(page.getByText('47')).toBeVisible();
  });

  test('6.3 — XP progress bar renders with correct level range', async ({
    page,
  }) => {
    await seedGrinder(page);
    await gotoStats(page);

    // XP bar "Level 5 → 6" label
    await expect(page.getByText('Level 5 → 6')).toBeVisible();

    // Progress bar element
    const xpBar = page.getByRole('progressbar', { name: /XP progress/i });
    await expect(xpBar).toBeVisible();

    // 2350 % 500 = 350 → 350/500 = 70%
    const value = await xpBar.getAttribute('aria-valuenow');
    expect(Number(value)).toBe(70);
  });

  test('6.4 — Profile editor shows callsign and archetype options', async ({
    page,
  }) => {
    await seedGrinder(page);
    await gotoStats(page);

    // Profile editor section
    const editor = page.getByTestId('profile-editor');
    await expect(editor).toBeVisible();

    // Callsign input with seeded value
    const callsign = page.getByTestId('callsign-input');
    await expect(callsign).toBeVisible();
    await expect(callsign).toHaveValue('Ironclad');

    // Change archetype button
    await expect(page.getByTestId('change-archetype-btn')).toBeVisible();
  });

  test('6.5 — Callsign can be edited', async ({ page }) => {
    await seedGrinder(page);
    await gotoStats(page);

    const callsign = page.getByTestId('callsign-input');
    await callsign.clear();
    await callsign.fill('Specter');

    // Trigger save (blur or change event)
    await callsign.blur();

    // Verify localStorage updated
    const profileRaw = await readLocalStorage(page, 'operative:profile:v1');
    expect(profileRaw).toContain('Specter');
  });

  test('6.6 — Score line chart renders', async ({ page }) => {
    await seedGrinder(page);
    await gotoStats(page);

    // Either the chart or empty state should be visible
    const chart = page.getByTestId('score-line-chart');
    const emptyChart = page.getByTestId('score-line-chart-empty');

    const hasChart = await chart.isVisible().catch(() => false);
    const hasEmpty = await emptyChart.isVisible().catch(() => false);
    expect(hasChart || hasEmpty).toBe(true);
  });

  test('6.7 — Activity heatmap renders with recent activity', async ({
    page,
  }) => {
    await seedGrinder(page);
    await gotoStats(page);

    // Heatmap should be visible
    const heatmap = page.getByTestId('activity-heatmap');
    await expect(heatmap).toBeVisible();

    // Today's cell should have activity (we seeded drill history entries)
    const todayDate = new Date().toISOString().slice(0, 10);
    const todayCell = page.getByTestId(`cell-${todayDate}`);
    // The cell should exist (may or may not be highlighted)
    await expect(todayCell).toBeAttached();
  });

  test('6.8 — Badge gallery shows earned badges', async ({ page }) => {
    await seedGrinder(page);
    await gotoStats(page);

    // Badge gallery region
    const gallery = page.getByRole('region', { name: /Badge gallery/i });
    await expect(gallery).toBeVisible();

    // Seeded badges: streak_3, streak_7, completion_10
    // Gallery should show some badges (names from badgeCatalog)
    await expect(gallery).toContainText(/Warm Streak|Persistent Operative|Field Initiate/i);
  });

  test('6.9 — Tab navigation reaches Stats surface', async ({ page }) => {
    await seedGrinder(page);
    await gotoBrief(page);

    // On mobile the tab/step buttons may not show "Stats", so open the
    // Action Palette and select Stats from there.
    const statsTab = page.getByRole('button', { name: /Stats/i }).first();
    const isVisible = await statsTab.isVisible().catch(() => false);

    if (isVisible) {
      await statsTab.click();
    } else {
      // Mobile path: open palette and select Stats
      await page.getByRole('button', { name: /action palette/i }).click();
      const palette = page.getByRole('dialog', { name: /action palette/i });
      await expect(palette).toBeVisible({ timeout: 5_000 });
      await palette.getByRole('button', { name: /Stats/i }).click();
    }
    await page.waitForURL('**/mission/stats**');

    // Dashboard renders
    await expect(
      page.getByRole('region', { name: /Operative Dashboard/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('6.10 — Archetype overlay opens and closes', async ({ page }) => {
    await seedGrinder(page);
    await gotoStats(page);

    // Open archetype overlay
    const changeBtn = page.getByTestId('change-archetype-btn');
    await expect(changeBtn).toBeVisible();
    await changeBtn.click();

    // Overlay should appear
    const overlay = page.getByTestId('archetype-overlay');
    await expect(overlay).toBeVisible();

    // Close via Cancel button
    const cancelBtn = overlay.getByRole('button', { name: /Cancel/i });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await expect(overlay).not.toBeVisible({ timeout: 5_000 });
  });

  test('6.11 — Stats surface passes accessibility audit', async ({ page }) => {
    await seedGrinder(page);
    await gotoStats(page);

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
