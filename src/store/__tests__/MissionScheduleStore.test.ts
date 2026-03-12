import { beforeEach, describe, expect, it, vi } from 'vitest';
import MissionScheduleStore from '../MissionScheduleStore';
import DrillCategoryCache from '../../cache/DrillCategoryCache';
import type { DrillCategory } from '../../types/DrillCategory';
import { recordMetric } from '../../utils/metrics';

vi.mock('../../utils/metrics', () => ({
    recordMetric: vi.fn(),
}));

const sampleCategories: DrillCategory[] = [
    {
        id: 'cat-strength',
        name: 'Strength',
        description: 'Build strength',
        subCategories: [
            {
                id: 'sub-upper',
                name: 'Upper',
                description: 'Upper body work',
                drillGroups: [
                    {
                        id: 'group-push',
                        name: 'Push',
                        description: 'Push movements',
                        drills: [
                            {
                                id: 'drill-pushup',
                                name: 'Push Ups',
                                description: 'Do push ups',
                                duration: '10 min',
                                intensity: 'Medium',
                                difficulty_range: [1, 3],
                            },
                            {
                                id: 'drill-dips',
                                name: 'Dips',
                                description: 'Do dips',
                                duration: '8 min',
                                intensity: 'Medium',
                                difficulty_range: [2, 4],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const cache = DrillCategoryCache.getInstance();

const loadCategories = async () => {
    vi.useFakeTimers();
    const promise = cache.loadData(sampleCategories);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    await promise;
};

describe('MissionScheduleStore persistence', () => {
    beforeEach(() => {
        cache.clearCache();
        localStorage.clear();
        vi.useRealTimers();
    });

    it('persists and returns default selections when storage is empty', async () => {
        await loadCategories();

        const categories = MissionScheduleStore.getSelectedDrillCategoriesSync();
        const groups = MissionScheduleStore.getSelectedDrillGroupsSync();
        const subCategories = MissionScheduleStore.getSelectedDrillSubCategoriesSync();
        const drills = MissionScheduleStore.getSelectedDrillsSync();

        expect(categories['cat-strength']).toBe(true);
        expect(groups['group-push']).toBe(true);
        expect(subCategories['sub-upper']).toBe(true);
        expect(drills['drill-pushup']).toBe(true);
        expect(drills['drill-dips']).toBe(true);

        expect(localStorage.getItem('workout:v2:selectedWorkoutCategories')).toBeTruthy();
        expect(localStorage.getItem('workout:v2:selectedWorkoutGroups')).toBeTruthy();
        expect(localStorage.getItem('workout:v2:selectedWorkoutSubCategories')).toBeTruthy();
        expect(localStorage.getItem('workout:v2:selectedWorkouts')).toBeTruthy();
    });

    it('resets invalid stored selections back to defaults', async () => {
        await loadCategories();

        localStorage.setItem('workout:v2:selectedWorkoutCategories', JSON.stringify({ 'cat-strength': 'yes' }));
        localStorage.setItem('workout:v2:selectedWorkoutGroups', JSON.stringify({ 'group-push': null }));
        localStorage.setItem('workout:v2:selectedWorkoutSubCategories', JSON.stringify({ 'sub-upper': 123 }));
        localStorage.setItem('workout:v2:selectedWorkouts', JSON.stringify({ 'drill-pushup': 'nope' }));

        const categories = MissionScheduleStore.getSelectedDrillCategoriesSync();
        const groups = MissionScheduleStore.getSelectedDrillGroupsSync();
        const subCategories = MissionScheduleStore.getSelectedDrillSubCategoriesSync();
        const drills = MissionScheduleStore.getSelectedDrillsSync();

        expect(categories['cat-strength']).toBe(true);
        expect(groups['group-push']).toBe(true);
        expect(subCategories['sub-upper']).toBe(true);
        expect(drills['drill-pushup']).toBe(true);

        expect(JSON.parse(localStorage.getItem('workout:v2:selectedWorkoutCategories') || '{}')['cat-strength']).toBe(true);
        expect(JSON.parse(localStorage.getItem('workout:v2:selectedWorkoutGroups') || '{}')['group-push']).toBe(true);
        expect(JSON.parse(localStorage.getItem('workout:v2:selectedWorkoutSubCategories') || '{}')['sub-upper']).toBe(true);
        expect(JSON.parse(localStorage.getItem('workout:v2:selectedWorkouts') || '{}')['drill-pushup']).toBe(true);
    });

    it('resets and logs when stored schedule is invalid', async () => {
        await loadCategories();
        localStorage.setItem('workout:v2:schedule', JSON.stringify({ bad: 'data' }));

        const schedule = MissionScheduleStore.getScheduleSync();

        expect(recordMetric).toHaveBeenCalledWith('store_reset_drift', { reason: 'invalid_schedule_sync' });
        expect(schedule).not.toBeNull();
        expect(localStorage.getItem('workout:v2:schedule')).toBeTruthy();
    });

    it('clears persisted selections when taxonomy signature changes', async () => {
        await loadCategories();

        localStorage.setItem('workout:v2:selectedWorkoutCategories', JSON.stringify({ 'cat-strength': true }));
        localStorage.setItem('workout:v2:selectedWorkoutSubCategories', JSON.stringify({ 'sub-upper': true }));
        localStorage.setItem('workout:v2:selectedWorkoutGroups', JSON.stringify({ 'group-push': true }));
        localStorage.setItem('workout:v2:selectedWorkouts', JSON.stringify({ 'drill-pushup': true }));
        localStorage.setItem('workout:v2:taxonomySignature', 'old-signature');

        const result = MissionScheduleStore.syncTaxonomySignature('new-signature');

        expect(result).toBe(false);
        expect(localStorage.getItem('workout:v2:selectedWorkoutCategories')).toBeNull();
        expect(localStorage.getItem('workout:v2:selectedWorkoutSubCategories')).toBeNull();
        expect(localStorage.getItem('workout:v2:selectedWorkoutGroups')).toBeNull();
        expect(localStorage.getItem('workout:v2:selectedWorkouts')).toBeNull();
        expect(localStorage.getItem('workout:v2:taxonomySignature')).toBe('new-signature');
    });

    it('returns defaults when selection storage read throws', async () => {
        await loadCategories();
        const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
            throw new Error('read blocked');
        });

        const categories = MissionScheduleStore.getSelectedDrillCategoriesSync();

        expect(categories['cat-strength']).toBe(true);
        expect(localStorage.getItem('workout:v2:selectedWorkoutCategories')).toBeTruthy();

        getItemSpy.mockRestore();
    });
});
