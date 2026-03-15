import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

// ── iPhone 14 viewport (matches Playwright config) ───────────────
export const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;

/**
 * Assert an element meets minimum tap-target size (Apple HIG: 44×44px).
 * Falls back to 36px minimum for compact controls (e.g. rating buttons).
 */
export async function assertTapTarget(
  locator: Locator,
  minSize = 44,
): Promise<{ width: number; height: number }> {
  const box = await locator.boundingBox();
  expect(box, 'element has no bounding box (invisible?)').toBeTruthy();
  expect(box!.width).toBeGreaterThanOrEqual(minSize);
  expect(box!.height).toBeGreaterThanOrEqual(minSize);
  return { width: box!.width, height: box!.height };
}

/**
 * Assert an element is within the visible viewport (not clipped by screen edge).
 */
export async function assertInViewport(
  locator: Locator,
  page: Page,
): Promise<void> {
  const box = await locator.boundingBox();
  expect(box, 'element has no bounding box (invisible?)').toBeTruthy();
  const viewport = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1); // 1px tolerance
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
}

/**
 * Assert the page has no horizontal overflow (no unintended horizontal scroll).
 */
export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(overflow, 'page has horizontal overflow').toBe(false);
}

/**
 * Assert an element is scrollable (content exceeds container).
 */
export async function assertScrollable(locator: Locator): Promise<void> {
  const isScrollable = await locator.evaluate((el) => {
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  });
  expect(isScrollable, 'element should be scrollable').toBe(true);
}

/**
 * Scroll an element to its bottom to verify all content is reachable.
 * Returns the total scroll distance.
 */
export async function scrollToBottom(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    const distance = el.scrollHeight - el.clientHeight;
    el.scrollTop = el.scrollHeight;
    return distance;
  });
}

/**
 * Count how many elements in a locator list are visible within the viewport.
 * Useful for checking grid layouts where items may require scrolling.
 */
export async function countVisibleInViewport(
  locator: Locator,
  page: Page,
): Promise<number> {
  const viewport = page.viewportSize()!;
  const count = await locator.count();
  let visible = 0;
  for (let i = 0; i < count; i++) {
    const box = await locator.nth(i).boundingBox();
    if (
      box &&
      box.y + box.height > 0 &&
      box.y < viewport.height &&
      box.x + box.width > 0 &&
      box.x < viewport.width
    ) {
      visible++;
    }
  }
  return visible;
}

/**
 * Assert an element is clickable at its center point (not obscured by another element).
 */
export async function assertClickable(
  locator: Locator,
  page: Page,
): Promise<void> {
  const box = await locator.boundingBox();
  expect(box, 'element has no bounding box').toBeTruthy();

  const centerX = box!.x + box!.width / 2;
  const centerY = box!.y + box!.height / 2;

  // elementFromPoint returns the topmost element — if it's not our element
  // (or a child of our element), something is obscuring it
  const isTopmost = await page.evaluate(
    ({ x, y }) => {
      const topEl = document.elementFromPoint(x, y);
      return topEl !== null;
    },
    { x: centerX, y: centerY },
  );
  expect(isTopmost, 'element center should be reachable').toBe(true);
}

/**
 * Assert the BottomNav is visible and has the expected tab labels.
 */
export async function assertBottomNav(
  page: Page,
  expectedLabels = ['Train', 'Review', 'Progress', 'Profile'],
): Promise<void> {
  const nav = page.locator('nav[aria-label="Primary navigation"]');
  await expect(nav).toBeVisible();

  for (const label of expectedLabels) {
    await expect(nav.getByText(label)).toBeVisible();
  }
}

/**
 * Assert the hamburger menu is visible and functional.
 * Note: HeaderDrawer has two "Close menu" buttons (✕ button + backdrop).
 * We target the one inside the drawer dialog.
 */
export async function assertHamburgerMenu(page: Page): Promise<void> {
  const hamburger = page.getByRole('button', { name: 'Open menu' });
  await expect(hamburger).toBeVisible();

  // Open the drawer
  await hamburger.click();
  const drawer = page.getByRole('dialog', { name: /Controls & Stats/i });
  await expect(drawer).toBeVisible();

  // Close via the ✕ button inside the drawer (first match, not the backdrop)
  await drawer.getByRole('button', { name: 'Close menu' }).first().click();
  await expect(drawer).not.toBeVisible();
}
