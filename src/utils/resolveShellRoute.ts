/**
 * Shell-aware route resolver — returns the correct route for the active shell version.
 *
 * When shellV2 is enabled, mission-surface paths map to their AppShell equivalents.
 * When shellV2 is off (production), mission paths pass through unchanged.
 */
import { isFeatureEnabled } from '../config/featureFlags';

const V2_MAP: Record<string, string> = {
  '/mission/brief': '/train',
  '/mission/training': '/train',
  '/mission/triage': '/train',
  '/mission/case': '/train',
  '/mission/signal': '/review',
  '/mission/checklist': '/train',
  '/mission/debrief': '/profile',
  '/mission/stats': '/progress',
  '/mission/plan': '/train',
  '/mission/quiz': '/train',
};

/**
 * Resolve a legacy mission route to the correct shell path.
 * Preserves query strings (e.g. `/mission/quiz?mode=review` → `/train?mode=review`).
 */
export const resolveShellRoute = (missionPath: string): string => {
  if (!isFeatureEnabled('shellV2')) return missionPath;

  // Split path and query
  const qIdx = missionPath.indexOf('?');
  const basePath = qIdx >= 0 ? missionPath.slice(0, qIdx) : missionPath;
  const query = qIdx >= 0 ? missionPath.slice(qIdx) : '';

  const mapped = V2_MAP[basePath];
  return mapped ? `${mapped}${query}` : missionPath;
};
