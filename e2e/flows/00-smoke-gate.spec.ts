import { test, expect } from '@playwright/test';
import { waitForReactMount } from '../fixtures/app';
import { seedPersona } from '../fixtures/seed';

test.describe('Story 00 — Smoke Gate', () => {
  test.describe.configure({ mode: 'serial' });

  test('0.1 — SPA shell renders', async ({ page }) => {
    // Capture page errors
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    // Wait for React to paint something
    await waitForReactMount(page, 30_000);

    // If we get here, React mounted. Verify title.
    const title = await page.title();
    expect(
      title.includes('Archangel Knights') || title.includes('Training Console'),
    ).toBeTruthy();

    // No uncaught page errors
    expect(pageErrors).toEqual([]);
  });

  test('0.2 — Client-side routing resolves /mission/brief', async ({
    page,
  }) => {
    // Seed as returning user to skip overlays
    await seedPersona(page, 'psi-operative');

    await page.goto('/mission/brief', { waitUntil: 'domcontentloaded' });
    await waitForReactMount(page);

    // Should stay on /mission/brief, not redirect to 404
    expect(page.url()).toContain('/mission/brief');

    // Page should have visible content
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    // No server-side 404 text
    const body = await page.textContent('body');
    expect(body).not.toContain('Cannot GET');
  });

  test('0.3 — Service worker registers', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForReactMount(page);

    // Give SW time to register
    const swState = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 'unsupported';
      try {
        const reg = await navigator.serviceWorker.ready;
        return reg.active?.state ?? 'no-active';
      } catch {
        return 'error';
      }
    });

    expect(['activated', 'activating']).toContain(swState);
  });

  test('0.4 — localStorage is accessible', async ({ page }) => {
    await page.goto('/');

    const probeResult = await page.evaluate(() => {
      try {
        localStorage.setItem('__e2e_probe', '1');
        const v = localStorage.getItem('__e2e_probe');
        localStorage.removeItem('__e2e_probe');
        return v;
      } catch {
        return null;
      }
    });

    expect(probeResult).toBe('1');
  });

  test('0.5 — Training manifest is fetchable with 19 modules', async ({
    page,
  }) => {
    await page.goto('/');

    const moduleCount = await page.evaluate(async () => {
      const res = await fetch('/training_modules_manifest.json');
      if (!res.ok) return -1;
      const data = await res.json();
      const modules = Array.isArray(data) ? data : data?.modules;
      return Array.isArray(modules) ? modules.length : -2;
    });

    expect(moduleCount).toBe(19);
  });

  test('0.6 — At least one training shard loads', async ({ page }) => {
    await page.goto('/');

    const shardOk = await page.evaluate(async () => {
      const res = await fetch('/training_modules_shards/fitness.json');
      if (!res.ok) return false;
      const data = await res.json();
      return typeof data === 'object' && data !== null;
    });

    expect(shardOk).toBe(true);
  });

  test('0.7 — Legacy redirect /training/run → /mission/training', async ({
    page,
  }) => {
    // Seed returning user to avoid overlay blocking
    await seedPersona(page, 'psi-operative');

    await page.goto('/training/run', { waitUntil: 'domcontentloaded' });
    await waitForReactMount(page);

    // Wait for client-side redirect to complete
    await page.waitForURL('**/mission/training**');
    expect(page.url()).toContain('/mission/training');

    // Page should not be blank
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });
});
