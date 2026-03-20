/**
 * One-time localStorage migration for AppShell v2.
 *
 * Migrates mission-specific nav keys to app-generic keys, runs once
 * on first AppShell load, and is idempotent.
 *
 * Tasks 221-225
 */

const MIGRATION_KEY = 'ptb:shell-v2-migrated';

/** Path mapping from v1 mission routes → v2 app routes */
const PATH_MAP: Record<string, string> = {
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

export const migrateNavStorage = (): void => {
  if (typeof window === 'undefined') return;

  // Only run once
  if (window.localStorage.getItem(MIGRATION_KEY) === 'done') return;

  try {
    // Task 222: Migrate guidance mode
    const guidanceMode = window.localStorage.getItem('mission:guidance-mode:v1');
    if (guidanceMode) {
      window.localStorage.setItem('ptb:guidance-mode:v1', guidanceMode);
    }

    // Task 223: Migrate checkpoint (map old mission paths → new app paths)
    const rawCheckpoint = window.localStorage.getItem('ptb:mission-flow-checkpoint');
    if (rawCheckpoint) {
      try {
        const parsed = JSON.parse(rawCheckpoint) as { path?: string; updatedAt?: number };
        if (parsed.path) {
          const newPath = PATH_MAP[parsed.path] ?? '/train';
          window.localStorage.setItem(
            'ptb:app-checkpoint:v1',
            JSON.stringify({ path: newPath, updatedAt: parsed.updatedAt ?? Date.now() }),
          );
        }
      } catch {
        // Invalid checkpoint, skip
      }
    }

    // Task 224: Step-complete is mission-mode only — no migration needed
    // (mission:step-complete:v1 stays for MissionLayout mission chrome)

    // Task 225: These path-independent keys stay unchanged:
    // - mission:intake:v1
    // - mission:fast-path:v1
    // - mission:guidance-overlay:v1
    // - ptb:mission-flow-context

    // Mark migration done
    window.localStorage.setItem(MIGRATION_KEY, 'done');
  } catch {
    // Migration failures are non-fatal — user just gets defaults
  }
};

/** Map a v1 mission path to its v2 app equivalent. */
export const mapMissionPathToAppPath = (missionPath: string): string => {
  return PATH_MAP[missionPath] ?? '/train';
};
