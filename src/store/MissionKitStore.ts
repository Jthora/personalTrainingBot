import { sampleMissionKit, type MissionKit, type Drill } from '../data/missionKits/sampleMissionKit';

const VISIBILITY_KEY = 'missionKit:visible';
const DRILL_STATS_KEY = 'ptb:drill-stats';

type DrillStats = Record<string, { lastCompleted: string; successRate: number; completionCount: number }>;

const missionKits: MissionKit[] = [sampleMissionKit];

const readVisibility = (): boolean => {
  try {
    const raw = localStorage.getItem(VISIBILITY_KEY);
    if (raw === null) return true;
    return raw === 'true';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[MissionKitStore] unable to read visibility flag', err);
    return true;
  }
};

const writeVisibility = (visible: boolean) => {
  try {
    localStorage.setItem(VISIBILITY_KEY, String(visible));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[MissionKitStore] unable to persist visibility flag', err);
  }
};

const readDrillStats = (): DrillStats => {
  try {
    const raw = localStorage.getItem(DRILL_STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeDrillStats = (stats: DrillStats) => {
  try {
    localStorage.setItem(DRILL_STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[MissionKitStore] unable to persist drill stats', err);
  }
};

/** Merge persisted drill stats into the kit's baseline drills at read time. */
const applyDrillStats = (drill: Drill, stats: DrillStats): Drill => {
  const saved = stats[drill.id];
  if (!saved) return drill;
  return {
    ...drill,
    lastCompleted: saved.lastCompleted,
    successRate: saved.successRate,
  };
};

export const MissionKitStore = {
  getKits(): MissionKit[] {
    const stats = readDrillStats();
    return missionKits.map(kit => ({
      ...kit,
      drills: kit.drills.map(d => applyDrillStats(d, stats)),
    }));
  },
  getPrimaryKit(): MissionKit | undefined {
    return this.getKits()[0];
  },
  isVisible(): boolean {
    if (typeof window === 'undefined') return true;
    return readVisibility();
  },
  setVisible(next: boolean): boolean {
    if (typeof window !== 'undefined') {
      writeVisibility(next);
    }
    return next;
  },
  toggleVisible(): boolean {
    const next = !this.isVisible();
    return this.setVisible(next);
  },

  /** Record a drill completion — updates lastCompleted and running successRate. */
  recordDrillCompletion(drillId: string, success: boolean) {
    const stats = readDrillStats();
    const existing = stats[drillId];
    const prevCount = existing?.completionCount ?? 0;
    const prevRate = existing?.successRate ?? 0.5;
    const newCount = prevCount + 1;
    const newRate = (prevRate * prevCount + (success ? 1 : 0)) / newCount;
    stats[drillId] = {
      lastCompleted: new Date().toISOString(),
      successRate: Math.round(newRate * 100) / 100,
      completionCount: newCount,
    };
    writeDrillStats(stats);
  },
};
