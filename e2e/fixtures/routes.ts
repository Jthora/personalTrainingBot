/**
 * Route mapping constants for E2E tests.
 *
 * When shellV2 rolls to production, update the `resolve()` calls in specs
 * to use v2 paths. Until then, tests run against v1 (production default).
 *
 * Task 240
 */

/** v1 mission routes (current production) */
export const V1_ROUTES = {
  brief: '/mission/brief',
  training: '/mission/training',
  triage: '/mission/triage',
  case: '/mission/case',
  signal: '/mission/signal',
  checklist: '/mission/checklist',
  debrief: '/mission/debrief',
  stats: '/mission/stats',
  plan: '/mission/plan',
  quiz: '/mission/quiz',
} as const;

/** v2 app routes (shellV2 enabled) */
export const V2_ROUTES = {
  brief: '/train',
  training: '/train',
  triage: '/train',
  case: '/train',
  signal: '/review',
  checklist: '/train',
  debrief: '/profile',
  stats: '/progress',
  plan: '/train',
  quiz: '/train',
} as const;

export type RouteSurface = keyof typeof V1_ROUTES;

/**
 * Resolve a surface name to the correct route for the active shell version.
 * Default is v1 (production).
 */
export function resolve(surface: RouteSurface, shellV2 = false): string {
  return shellV2 ? V2_ROUTES[surface] : V1_ROUTES[surface];
}

/**
 * Build a URL glob pattern for waitForURL.
 * e.g. `urlGlob('training')` → `'**/mission/training**'`
 */
export function urlGlob(surface: RouteSurface, shellV2 = false): string {
  const route = resolve(surface, shellV2);
  return `**${route}**`;
}
