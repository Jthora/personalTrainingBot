import { sampleMissionKit, type MissionKit } from '../data/missionKits/sampleMissionKit';

const VISIBILITY_KEY = 'missionKit:visible';

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

export const MissionKitStore = {
  getKits(): MissionKit[] {
    return missionKits;
  },
  getPrimaryKit(): MissionKit | undefined {
    return missionKits[0];
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
};
