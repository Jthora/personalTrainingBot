/**
 * Gun sync wiring for UserProgressStore, DrillRunStore, and AARStore.
 *
 * Each store gets a GunSyncAdapter configured with:
 * - toGunData: flattens the store's state into a Gun-safe flat object
 * - fromGunData: reconstructs the store's state from Gun data
 * - getVersion: extracts a comparable clock from the state
 *
 * Gun's HAM conflict resolution works at the field level, so we
 * serialize complex state (arrays, nested objects) as JSON strings
 * in specific fields. This trades granularity for simplicity.
 */
import { createGunSyncAdapter, type GunSyncHandle } from './gunSyncAdapter';
import UserProgressStore, { type UserProgress } from '../store/UserProgressStore';
import { DrillRunStore, type DrillRunState } from '../store/DrillRunStore';
import { AARStore, type AAREntry } from '../store/AARStore';

// ─── UserProgress Sync ─────────────────────────────────────────

const progressToGun = (p: UserProgress): Record<string, string | number | boolean | null> => ({
  version: p.version,
  streakCount: p.streakCount,
  lastActiveDate: p.lastActiveDate,
  streakFrozen: p.streakFrozen ?? false,
  xp: p.xp,
  level: p.level,
  totalDrillsCompleted: p.totalDrillsCompleted,
  quietMode: p.quietMode,
  // Complex fields serialized as JSON strings
  badges_json: JSON.stringify(p.badges),
  badgeUnlocks_json: JSON.stringify(p.badgeUnlocks),
  dailyGoal_json: JSON.stringify(p.dailyGoal),
  weeklyGoal_json: JSON.stringify(p.weeklyGoal),
  challenges_json: JSON.stringify(p.challenges),
  lastRecap_json: JSON.stringify(p.lastRecap),
  flags_json: JSON.stringify(p.flags),
  // Sync clock — use highest of xp changes and last active date as a "version"
  _syncedAt: Date.now(),
});

const progressFromGun = (data: Record<string, any>): UserProgress | null => {
  try {
    if (typeof data.xp !== 'number') return null;
    return {
      version: data.version ?? 1,
      streakCount: data.streakCount ?? 0,
      lastActiveDate: data.lastActiveDate ?? '',
      streakFrozen: data.streakFrozen ?? false,
      xp: data.xp ?? 0,
      level: data.level ?? 1,
      totalDrillsCompleted: data.totalDrillsCompleted ?? 0,
      quietMode: data.quietMode ?? false,
      badges: data.badges_json ? JSON.parse(data.badges_json) : [],
      badgeUnlocks: data.badgeUnlocks_json ? JSON.parse(data.badgeUnlocks_json) : [],
      dailyGoal: data.dailyGoal_json ? JSON.parse(data.dailyGoal_json) : { target: 5, unit: 'ops', progress: 0, updatedAt: '' },
      weeklyGoal: data.weeklyGoal_json ? JSON.parse(data.weeklyGoal_json) : { target: 20, unit: 'ops', progress: 0, updatedAt: '', weekStart: '', weekEnd: '' },
      challenges: data.challenges_json ? JSON.parse(data.challenges_json) : [],
      lastRecap: data.lastRecap_json ? JSON.parse(data.lastRecap_json) : null,
      flags: data.flags_json ? JSON.parse(data.flags_json) : {},
    };
  } catch {
    return null;
  }
};

// ─── DrillRun Sync ──────────────────────────────────────────────

const drillRunToGun = (d: DrillRunState): Record<string, string | number | boolean | null> => ({
  drillId: d.drillId,
  title: d.title,
  startedAt: d.startedAt,
  updatedAt: d.updatedAt,
  completed: d.completed,
  steps_json: JSON.stringify(d.steps),
  _syncedAt: Date.now(),
});

const drillRunFromGun = (data: Record<string, any>): DrillRunState | null => {
  try {
    if (!data.drillId || typeof data.drillId !== 'string') return null;
    return {
      drillId: data.drillId,
      title: data.title ?? '',
      startedAt: data.startedAt ?? 0,
      updatedAt: data.updatedAt ?? 0,
      completed: data.completed ?? false,
      steps: data.steps_json ? JSON.parse(data.steps_json) : [],
    };
  } catch {
    return null;
  }
};

// ─── AAR Sync ───────────────────────────────────────────────────

/**
 * AAR entries are stored as a single JSON blob in Gun.
 * This is simpler than Gun sets and avoids orphaned graph nodes.
 * The tradeoff is less granular conflict resolution, but AAR entries
 * are rarely edited concurrently from two devices.
 */
type AARSyncEnvelope = {
  entries: AAREntry[];
  updatedAt: number;
};

const aarToGun = (env: AARSyncEnvelope): Record<string, string | number | boolean | null> => ({
  entries_json: JSON.stringify(env.entries),
  updatedAt: env.updatedAt,
  _syncedAt: Date.now(),
});

const aarFromGun = (data: Record<string, any>): AARSyncEnvelope | null => {
  try {
    if (!data.entries_json) return null;
    const entries = JSON.parse(data.entries_json) as AAREntry[];
    if (!Array.isArray(entries)) return null;
    return { entries, updatedAt: data.updatedAt ?? 0 };
  } catch {
    return null;
  }
};

// ─── Factory ────────────────────────────────────────────────────

let handles: GunSyncHandle[] = [];

/**
 * Start syncing all three stores to the Gun user graph.
 * Call once when p2pIdentity feature is enabled and user is authenticated.
 */
export const startStoreSyncs = (): void => {
  // UserProgress sync
  handles.push(createGunSyncAdapter<UserProgress>({
    namespace: 'progress',
    getLocal: () => UserProgressStore.get(),
    setLocal: (data) => UserProgressStore.save(data),
    toGunData: progressToGun,
    fromGunData: progressFromGun,
    getVersion: (p) => p.xp + p.totalDrillsCompleted + p.streakCount,
  }));

  // DrillRun sync (push-only: active drill state is ephemeral,
  // we push it so another device can see it, but don't pull
  // a remote drill run over a local one)
  handles.push(createGunSyncAdapter<DrillRunState>({
    namespace: 'drillRun',
    getLocal: () => DrillRunStore.get(),
    setLocal: () => {}, // no-op — we don't overwrite local drill runs from remote
    toGunData: drillRunToGun,
    fromGunData: drillRunFromGun,
    getVersion: (d) => d.updatedAt,
    direction: 'push',
  }));

  // AAR sync (bidirectional — merge by updatedAt envelope)
  handles.push(createGunSyncAdapter<AARSyncEnvelope>({
    namespace: 'aar',
    getLocal: () => {
      const entries = AARStore.list();
      const latest = entries.reduce((max, e) => Math.max(max, e.updatedAt), 0);
      return { entries, updatedAt: latest };
    },
    setLocal: (env) => {
      // Merge: keep local entries not in remote, add remote entries
      const local = AARStore.list();
      const localIds = new Set(local.map((e) => e.id));
      const remoteIds = new Set(env.entries.map((e) => e.id));

      // For entries in both, take the one with the later updatedAt
      const merged: AAREntry[] = [];
      const allIds = new Set([...localIds, ...remoteIds]);
      allIds.forEach((id) => {
        const localEntry = local.find((e) => e.id === id);
        const remoteEntry = env.entries.find((e) => e.id === id);
        if (localEntry && remoteEntry) {
          merged.push(localEntry.updatedAt >= remoteEntry.updatedAt ? localEntry : remoteEntry);
        } else {
          merged.push((localEntry ?? remoteEntry)!);
        }
      });

      // Write merged entries (using save for each to trigger listeners)
      merged.forEach((entry) => AARStore.save(entry));
    },
    toGunData: aarToGun,
    fromGunData: aarFromGun,
    getVersion: (env) => env.updatedAt,
  }));

  // Subscribe to local store changes and push on mutation
  // UserProgress — listen via polling since it has no subscribe
  const progressPollId = setInterval(() => {
    handles[0]?.pushNow();
  }, 5000);

  // DrillRun — subscribe to changes
  const unsubDrill = DrillRunStore.subscribe(() => {
    handles[1]?.pushNow();
  });

  // AAR — push periodically (AARStore.subscribe fires on mutations)
  const aarPollId = setInterval(() => {
    handles[2]?.pushNow();
  }, 10000);

  // Store cleanup references
  const cleanupPolls = () => {
    clearInterval(progressPollId);
    clearInterval(aarPollId);
    unsubDrill();
  };

  // Wrap stop to include poll cleanup
  const originalStops = handles.map((h) => h.stop);
  handles.forEach((h, i) => {
    h.stop = () => {
      originalStops[i]();
      if (i === 0) cleanupPolls(); // cleanup once on first handle stop
    };
  });
};

/**
 * Stop all store syncs and clean up.
 */
export const stopStoreSyncs = (): void => {
  handles.forEach((h) => h.stop());
  handles = [];
};
