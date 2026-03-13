import type { Page } from '@playwright/test';

/**
 * Wait for React to mount at least one child inside #root.
 * Replaces repeated `page.waitForFunction(…)` calls across specs.
 */
export async function waitForReactMount(
  page: Page,
  timeout = 15_000,
): Promise<void> {
  await page.waitForFunction(
    () => (document.getElementById('root')?.children.length ?? 0) > 0,
    { timeout },
  );
}
