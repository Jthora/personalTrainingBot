import { describe, expect, it, vi, beforeEach } from 'vitest';
import MissionScheduleStore from '../MissionScheduleStore';
import DrillCategoryCache from '../../cache/DrillCategoryCache';

// Ensure cache initialized for defaults
beforeEach(() => {
    localStorage.clear();
    DrillCategoryCache.getInstance();
});

describe('MissionScheduleStore selection listeners', () => {
    it('notifies subscribers when selections change', () => {
        const listener = vi.fn();
        const unsubscribe = MissionScheduleStore.subscribeToSelectionChanges(listener);

        MissionScheduleStore.saveSelectedDrills({ alpha: true });
        MissionScheduleStore.saveSelectedDrillCategories({ catA: true, catB: false });
        unsubscribe();

        MissionScheduleStore.saveSelectedDrillGroups({ g: true });
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('returns selection counts', () => {
        localStorage.clear();
        MissionScheduleStore.saveSelectedDrillCategories({ c1: true, c2: false });
        MissionScheduleStore.saveSelectedDrills({ w1: true, w2: true, w3: false });

        const counts = MissionScheduleStore.getSelectionCounts();
        expect(counts.categories).toBe(1);
        expect(counts.drills).toBe(2);
    });
});
