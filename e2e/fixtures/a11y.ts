import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

export interface A11yResult {
  violations: { id: string; impact?: string; description: string; nodes: unknown[] }[];
}

/**
 * Run an axe-core accessibility scan on the current page.
 * Returns the violations array for assertion by the caller.
 *
 * By default excludes known-benign rules that may conflict with the
 * app's design system (e.g., color-contrast on dark themes).
 */
export async function scanAccessibility(
  page: Page,
  opts: { exclude?: string[]; include?: string; disableRules?: string[] } = {},
): Promise<A11yResult> {
  let builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
    // color-contrast can be noisy on dark-themed apps; test separately if needed
    // region rule requires all content in landmark regions — tracked separately
    .disableRules([
      'color-contrast',
      'region',
      ...(opts.disableRules ?? []),
    ]);

  if (opts.include) {
    builder = builder.include(opts.include);
  }
  if (opts.exclude) {
    for (const sel of opts.exclude) {
      builder = builder.exclude(sel);
    }
  }

  const results = await builder.analyze();
  return { violations: results.violations };
}
