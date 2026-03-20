/**
 * Route resolver — maps legacy mission-surface paths to their AppShell equivalents.
 * Preserves query strings (e.g. `/mission/quiz?mode=review` → `/train?mode=review`).
 */

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

export const resolveShellRoute = (missionPath: string): string => {
  const qIdx = missionPath.indexOf('?');
  const basePath = qIdx >= 0 ? missionPath.slice(0, qIdx) : missionPath;
  const query = qIdx >= 0 ? missionPath.slice(qIdx) : '';

  const mapped = V2_MAP[basePath];
  return mapped ? `${mapped}${query}` : missionPath;
};
