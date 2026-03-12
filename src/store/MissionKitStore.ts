import { sampleMissionKit, type MissionKit, type Drill } from '../data/missionKits/sampleMissionKit';
import { createStore } from './createStore';

type DrillStats = Record<string, { lastCompleted: string; successRate: number; completionCount: number }>;

const missionKits: MissionKit[] = [sampleMissionKit];

const visibilityStore = createStore<boolean>({
  key: 'missionKit:visible',
  defaultValue: true,
  validate: (raw) => typeof raw === 'boolean' ? raw : null,
});

const statsStore = createStore<DrillStats>({
  key: 'ptb:drill-stats',
  defaultValue: {},
  validate: (raw) => (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw as DrillStats : null,
});

/** Merge persisted drill stats into the kit's baseline drills at read time. */
const applyDrillStats = (drill: Drill, stats: DrillStats): Drill => {
  const saved = stats[drill.id];
  if (!saved) return drill;
  return { ...drill, lastCompleted: saved.lastCompleted, successRate: saved.successRate };
};

export const MissionKitStore = {
  getKits(): MissionKit[] {
    const stats = statsStore.get();
    return missionKits.map(kit => ({
      ...kit,
      drills: kit.drills.map(d => applyDrillStats(d, stats)),
    }));
  },
  getPrimaryKit(): MissionKit | undefined {
    return this.getKits()[0];
  },
  isVisible(): boolean {
    return visibilityStore.get();
  },
  setVisible(next: boolean): boolean {
    visibilityStore.set(next);
    return next;
  },
  toggleVisible(): boolean {
    const next = !this.isVisible();
    return this.setVisible(next);
  },
  /** Record a drill completion — updates lastCompleted and running successRate. */
  recordDrillCompletion(drillId: string, success: boolean) {
    statsStore.update((stats) => {
      const existing = stats[drillId];
      const prevCount = existing?.completionCount ?? 0;
      const prevRate = existing?.successRate ?? 0.5;
      const newCount = prevCount + 1;
      const newRate = (prevRate * prevCount + (success ? 1 : 0)) / newCount;
      return {
        ...stats,
        [drillId]: {
          lastCompleted: new Date().toISOString(),
          successRate: Math.round(newRate * 100) / 100,
          completionCount: newCount,
        },
      };
    });
  },
};
