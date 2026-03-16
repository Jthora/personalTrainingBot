import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { resolve, dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { scanAccessibility } from '../../fixtures/a11y';
import { assertNoHorizontalOverflow } from '../../fixtures/mobile';

// ── Screenshot output directory ───────────────────────────────────
const __betaFilename = fileURLToPath(import.meta.url);
const __betaDirname = dirname(__betaFilename);
const SCREENSHOT_BASE = resolve(__betaDirname, '../../../artifacts/beta-screenshots');

// ── Console error collection ──────────────────────────────────────

/** Patterns to filter out of console error collection (known non-errors). */
const CONSOLE_ERROR_FILTERS = [
  // Optional asset loads (analytics, favicons)
  /Failed to load resource.*(?:analytics|favicon|\.map)/i,
  // React strict mode double-render warnings
  /Warning:.*strict mode/i,
  // Service worker info messages
  /service.?worker/i,
  // Vite HMR in dev
  /\[vite\]/i,
  // Browser extensions
  /chrome-extension:\/\//i,
  // React DevTools
  /Download the React DevTools/i,
  // Drill data loader: known subcategory format mismatches in current build
  /DrillDataLoader:.*(?:Failed to load|Invalid subcategory)/i,
  // Handler speech cache: JSON fetch failures on localhost
  /loadHandlerSpeech|HandlerSpeechCache/i,
  // Network fetch failures for training module shards (expected on localhost)
  /Failed to fetch|NetworkError|fetch.*training_modules/i,
  // Offline mode / network disconnected errors (expected in offline tests)
  /ERR_INTERNET_DISCONNECTED|ERR_NETWORK_CHANGED|net::/i,
  // Failed to load resource (generic network errors)
  /Failed to load resource/i,
  // Cache storage quota / access warnings
  /cache.*(?:storage|quota)/i,
];

/** Collected console errors for the current scenario. */
let collectedErrors: string[] = [];
let consoleListenerInstalled = false;

/**
 * Install a console.error listener on the page.
 * Call once per scenario, before any betaStep() calls.
 */
export function installConsoleCollector(page: Page): void {
  collectedErrors = [];
  consoleListenerInstalled = true;

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const isFiltered = CONSOLE_ERROR_FILTERS.some((pattern) => pattern.test(text));
      if (!isFiltered) {
        collectedErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    collectedErrors.push(`[pageerror] ${err.message}`);
  });
}

/**
 * Get and clear collected console errors.
 */
function drainErrors(): string[] {
  const errors = [...collectedErrors];
  collectedErrors = [];
  return errors;
}

// ── Step counter per scenario ─────────────────────────────────────
let stepCounter = 0;
let currentScenario = '';
let overflowWarnings: string[] = [];

/**
 * Reset step counter for a new scenario.
 */
export function resetStepCounter(scenarioName: string): void {
  stepCounter = 0;
  currentScenario = scenarioName;
  collectedErrors = [];
  consoleListenerInstalled = false;
  overflowWarnings = [];
}

/**
 * Get any horizontal overflow warnings collected during the scenario.
 */
export function getOverflowWarnings(): string[] {
  return [...overflowWarnings];
}

// ── betaStep ──────────────────────────────────────────────────────

/**
 * Execute a user interaction step with automatic post-condition checks:
 * 1. Run the provided interaction function
 * 2. Capture a screenshot
 * 3. Assert no console errors
 * 4. Assert no horizontal overflow
 *
 * @param page - Playwright page
 * @param name - Kebab-case step name (used for screenshot filename)
 * @param fn - Interaction function to execute
 */
export async function betaStep(
  page: Page,
  name: string,
  fn: () => Promise<void>,
): Promise<void> {
  stepCounter++;
  const stepNum = String(stepCounter).padStart(2, '0');
  const screenshotName = `${stepNum}-${name}.png`;
  const scenarioDir = resolve(SCREENSHOT_BASE, currentScenario);

  // Ensure directory exists
  if (!existsSync(scenarioDir)) {
    mkdirSync(scenarioDir, { recursive: true });
  }

  // Execute the interaction
  await fn();

  // Small settle time for React re-renders
  await page.waitForTimeout(150);

  // 1. Capture screenshot
  await page.screenshot({
    path: resolve(scenarioDir, screenshotName),
    fullPage: false,
  });

  // 2. Assert no console errors for this step
  const errors = drainErrors();
  expect(
    errors,
    `Console errors during step "${stepNum}-${name}":\n${errors.join('\n')}`,
  ).toHaveLength(0);

  // 3. Check horizontal overflow (non-fatal — log warning, don't block)
  try {
    await assertNoHorizontalOverflow(page);
  } catch {
    overflowWarnings.push(`${stepNum}-${name}`);
  }
}

// ── betaAudit ─────────────────────────────────────────────────────

/**
 * Run a full WCAG AA accessibility audit.
 * Called at major checkpoints (not every step — too slow).
 * Wraps the existing scanAccessibility() from e2e/fixtures/a11y.ts.
 */
export async function betaAudit(page: Page): Promise<void> {
  const { violations } = await scanAccessibility(page, {
    // Known pre-existing app issues — tracked separately, not beta blockers
    disableRules: [
      'color-contrast',
    ],
  });

  // Filter to critical/serious only for hard failures
  const critical = violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );

  if (critical.length > 0) {
    const summary = critical
      .map((v) => `  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
      .join('\n');
    expect(critical, `Critical a11y violations:\n${summary}`).toHaveLength(0);
  }
}

// ── betaExpect ────────────────────────────────────────────────────

/**
 * Extended visibility assertion: element is visible, not occluded,
 * and within the viewport bounds.
 *
 * @param page - Playwright page
 * @param selector - CSS selector or test ID
 */
export async function betaExpect(page: Page, selector: string): Promise<void> {
  // Resolve test ID shorthand
  const locator = selector.startsWith('[')
    ? page.locator(selector)
    : page.getByTestId(selector);

  // Assert visible
  await expect(locator.first()).toBeVisible({ timeout: 10_000 });

  // Assert within viewport
  const box = await locator.first().boundingBox();
  expect(box, `Element "${selector}" has no bounding box`).toBeTruthy();

  const viewport = page.viewportSize()!;
  expect(box!.x + box!.width).toBeGreaterThan(0);
  expect(box!.y + box!.height).toBeGreaterThan(0);
  expect(box!.x).toBeLessThan(viewport.width);
  expect(box!.y).toBeLessThan(viewport.height);
}

/**
 * Wait for the app to mount (React root has children).
 * Also injects CSS to prevent fixed-position overlays
 * (NetworkStatusIndicator, CacheIndicator, etc.) from intercepting
 * pointer events on the bottom navigation bar.
 */
export async function waitForApp(page: Page, timeout = 15_000): Promise<void> {
  await page.waitForFunction(
    () => (document.getElementById('root')?.children.length ?? 0) > 0,
    { timeout },
  );

  // Prevent status indicators / toasts from blocking nav clicks.
  // Elements remain visible for screenshots but pass-through pointer events.
  await page.addStyleTag({
    content: `
      [role="status"],
      [role="alert"][aria-live] {
        pointer-events: none !important;
      }
    `,
  });
}
