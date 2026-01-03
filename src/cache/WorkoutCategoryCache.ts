import { Workout, WorkoutCategory, SelectedWorkoutCategories, SelectedWorkoutGroups, SelectedWorkoutSubCategories, SelectedWorkouts } from "../types/WorkoutCategory";
import WorkoutScheduleStore from "../store/WorkoutScheduleStore";
import WorkoutFilterStore from "../store/WorkoutFilterStore";
import { applyWorkoutFilters } from "../utils/workoutFilters";
import { WorkoutPreset, buildPresetSelections } from "../utils/workoutPresets";

class WorkoutCategoryCache {
    private static instance: WorkoutCategoryCache;
    public cache: Map<string, WorkoutCategory>;
    public selectedCategories: Set<string>;
    public selectedSubCategories: Set<string>;
    public selectedWorkoutGroups: Set<string>;
    public selectedWorkouts: Set<string>;
    private loading: boolean;

    private constructor() {
        this.cache = new Map();
        this.selectedCategories = new Set();
        this.selectedSubCategories = new Set();
        this.selectedWorkoutGroups = new Set();
        this.selectedWorkouts = new Set();
        this.loading = false; // Set to false initially
    }

    public static getInstance(): WorkoutCategoryCache {
        if (!WorkoutCategoryCache.instance) {
            WorkoutCategoryCache.instance = new WorkoutCategoryCache();
        }
        return WorkoutCategoryCache.instance;
    }

    public async loadData(workoutCategories: WorkoutCategory[]): Promise<void> {
        if (this.loading) {
            console.warn('WorkoutCategoryCache is already caching data.');
            return;
        }
        this.loading = true;
        console.log(`WorkoutCategoryCache: Starting to cache ${workoutCategories.length} workout categories...`);
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`WorkoutCategoryCache: Now caching ${workoutCategories.length} workout categories...`);
                workoutCategories.forEach(category => {
                    this.cache.set(category.id, category);
                    this.selectedCategories.add(category.id);
                    category.subCategories.forEach(subCategory => {
                        this.selectedSubCategories.add(subCategory.id);
                        subCategory.workoutGroups.forEach(group => {
                            this.selectedWorkoutGroups.add(group.id);
                            group.workouts.forEach(workout => {
                                this.selectedWorkouts.add(workout.id);
                            });
                        });
                    });
                });
                console.log(`WorkoutCategoryCache: Cached ${this.cache.size} workout categories.`);
                console.log(`WorkoutCategoryCache: Cached ${this.selectedSubCategories.size} workout subcategories.`);
                console.log(`WorkoutCategoryCache: Cached ${this.selectedWorkoutGroups.size} workout groups.`);
                console.log(`WorkoutCategoryCache: Cached ${this.selectedWorkouts.size} workouts.`);

                const signature = this.computeTaxonomySignature(workoutCategories);
                const shouldHydrate = WorkoutScheduleStore.syncTaxonomySignature(signature);

                if (shouldHydrate) {
                    this.hydrateSelectionsFromStore();
                } else {
                    this.persistSelectionState();
                }

                this.loading = false;
                resolve();
            }, 1000); // Simulate a delay
        });
    }

    public async reloadData(workoutCategories: WorkoutCategory[]): Promise<void> {
        this.clearCache();
        await this.loadData(workoutCategories);
    }

    public isLoading(): boolean {
        return this.loading;
    }

    public getWorkoutCategories(): WorkoutCategory[] {
        // Return all WorkoutCategories from the cache
        return Array.from(this.cache.values());
    }

    public async fetchAllWorkoutsInCategory(categoryId: string): Promise<Workout[]> {
        const category = this.cache.get(categoryId);
        if (!category) {
            return [];
        }
        const workouts: Workout[] = [];
        category.subCategories.forEach(subCategory => {
            subCategory.workoutGroups.forEach(group => {
                workouts.push(...group.workouts);
            });
        });
        return workouts;
    }

    public getAllWorkoutsSelected(): Workout[] {
        const selectedWorkoutCategories = WorkoutScheduleStore.getSelectedWorkoutCategoriesSync();
        const selectedWorkoutSubCategories = WorkoutScheduleStore.getSelectedWorkoutSubCategoriesSync();
        const selectedWorkoutGroups = WorkoutScheduleStore.getSelectedWorkoutGroupsSync();
        const selectedWorkouts = WorkoutScheduleStore.getSelectedWorkoutsSync();
        const filters = WorkoutFilterStore.getFiltersSync();
        console.log('Selected categories:', selectedWorkoutCategories);
        console.log('Selected subcategories:', selectedWorkoutSubCategories);
        console.log('Selected groups:', selectedWorkoutGroups);
        console.log('Selected workouts:', selectedWorkouts);
        const selected = this.getAllWorkoutsFilteredBy(selectedWorkoutCategories, selectedWorkoutSubCategories, selectedWorkoutGroups, selectedWorkouts);
        const filtered = applyWorkoutFilters(selected, filters);
        console.log(`WorkoutCategoryCache: applied filters ${JSON.stringify(filters)} -> ${filtered.length}/${selected.length} workouts`);
        return filtered;
    }

    public getAllWorkouts(): Workout[] {
        const workouts: Workout[] = [];
        this.cache.forEach(category => {
            category.subCategories.forEach(subCategory => {
                subCategory.workoutGroups.forEach(group => {
                    workouts.push(...group.workouts);
                });
            });
        });
        return workouts;
    }

    public getWorkoutCategory(id: string): WorkoutCategory | undefined {
        return this.cache.get(id);
    }

    public toggleCategorySelection(id: string): void {
        if (this.selectedCategories.has(id)) {
            this.selectedCategories.delete(id);
        } else {
            this.selectedCategories.add(id);
        }
        WorkoutScheduleStore.saveSelectedWorkoutCategories(this.convertSetToObject(this.selectedCategories));
    }

    public toggleSubCategorySelection(id: string): void {
        if (this.selectedSubCategories.has(id)) {
            this.selectedSubCategories.delete(id);
        } else {
            this.selectedSubCategories.add(id);
        }
        WorkoutScheduleStore.saveSelectedWorkoutSubCategories(this.convertSetToObject(this.selectedSubCategories));
    }

    public toggleWorkoutGroupSelection(id: string): void {
        if (this.selectedWorkoutGroups.has(id)) {
            this.selectedWorkoutGroups.delete(id);
        } else {
            this.selectedWorkoutGroups.add(id);
        }
        WorkoutScheduleStore.saveSelectedWorkoutGroups(this.convertSetToObject(this.selectedWorkoutGroups));
    }

    public toggleWorkoutSelection(id: string): void {
        if (this.selectedWorkouts.has(id)) {
            this.selectedWorkouts.delete(id);
        } else {
            this.selectedWorkouts.add(id);
        }
        WorkoutScheduleStore.saveSelectedWorkouts(this.convertSetToObject(this.selectedWorkouts));
    }

    public applyPreset(preset: WorkoutPreset): void {
        const categories = Array.from(this.cache.values());
        const { categoryIds, subCategoryIds, groupIds, workoutIds } = buildPresetSelections(categories, preset);

        if (workoutIds.size === 0) {
            console.warn(`WorkoutCategoryCache: preset ${preset} matched no workouts; falling back to select all.`);
            this.selectAll();
            return;
        }

        this.selectedCategories = categoryIds;
        this.selectedSubCategories = subCategoryIds;
        this.selectedWorkoutGroups = groupIds;
        this.selectedWorkouts = workoutIds;
        this.persistSelectionState();
        WorkoutScheduleStore.saveLastPreset(preset);
    }

    public selectAll(): void {
        this.cache.forEach(category => {
            this.selectedCategories.add(category.id);
            category.subCategories.forEach(subCategory => {
                this.selectedSubCategories.add(subCategory.id);
                subCategory.workoutGroups.forEach(group => {
                    this.selectedWorkoutGroups.add(group.id);
                    group.workouts.forEach(workout => {
                        this.selectedWorkouts.add(workout.id);
                    });
                });
            });
        });
        this.persistSelectionState();
    }

    public unselectAll(): void {
        this.selectedCategories.clear();
        this.selectedSubCategories.clear();
        this.selectedWorkoutGroups.clear();
        this.selectedWorkouts.clear();
        this.persistSelectionState();
    }

    public isCategorySelected(id: string): boolean {
        return this.selectedCategories.has(id);
    }

    public isSubCategorySelected(id: string): boolean {
        return this.selectedSubCategories.has(id);
    }

    public isWorkoutGroupSelected(id: string): boolean {
        return this.selectedWorkoutGroups.has(id);
    }

    public isWorkoutSelected(id: string): boolean {
        return this.selectedWorkouts.has(id);
    }

    public clearCache(): void {
        this.cache.clear();
        this.selectedCategories.clear();
        this.selectedSubCategories.clear();
        this.selectedWorkoutGroups.clear();
        this.selectedWorkouts.clear();
    }

    private computeTaxonomySignature(workoutCategories: WorkoutCategory[]): string {
        const parts = workoutCategories
            .map(category => {
                const subParts = category.subCategories
                    .map(sub => {
                        const groupParts = sub.workoutGroups
                            .map(group => {
                                const workoutParts = group.workouts
                                    .map(workout => workout.id)
                                    .sort()
                                    .join(',');
                                return `${group.id}:${workoutParts}`;
                            })
                            .sort()
                            .join('|');
                        return `${sub.id}:${groupParts}`;
                    })
                    .sort()
                    .join('#');
                return `${category.id}:${subParts}`;
            })
            .sort()
            .join('~');

        return parts;
    }

    public getWorkoutsByDifficultyRange(minLevel: number, maxLevel: number, count: number): Workout[] {
        const workouts: Workout[] = [];
        this.cache.forEach(category => {
            category.subCategories.forEach(subCategory => {
                subCategory.workoutGroups.forEach(group => {
                    group.workouts.forEach(workout => {
                        if (workout.difficulty_range[0] <= maxLevel && workout.difficulty_range[1] >= minLevel) {
                            workouts.push(workout);
                        }
                    });
                });
            });
        });
        return this.getRandomItems(workouts, count);
    }

    public getWorkoutsBySingleDifficultyLevel(level: number, count: number): Workout[] {
        return this.getWorkoutsByDifficultyRange(level, level, count);
    }

    public getAllWorkoutsFilteredBy(
        selectedCategories: SelectedWorkoutCategories,
        selectedSubCategories: SelectedWorkoutSubCategories,
        selectedGroups: SelectedWorkoutGroups,
        selectedWorkouts: SelectedWorkouts
    ): Workout[] {
        console.log(`getAllWorkoutsFilteredBy: filtering`);
        const workouts: Workout[] = [];
        this.cache.forEach(category => {
            if (selectedCategories[category.id]) { 
                console.log('Selected category:', category.id);
                category.subCategories.forEach(subCategory => {
                    if (selectedSubCategories[subCategory.id]) {
                        console.log('Selected subCategory:', subCategory.id);
                        subCategory.workoutGroups.forEach(group => {
                            if (selectedGroups[group.id]) {
                                console.log('Selected group:', group.id);
                                group.workouts.forEach(workout => {
                                    if (selectedWorkouts[workout.id]) {
                                        console.log('Selected workout:', workout.id);
                                        workouts.push(workout);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        if (workouts.length === 0) {
            console.warn(`getAllWorkoutsFilteredBy: no workouts selected?`);
        } else {
            console.log(`getAllWorkoutsFilteredBy: selected ${workouts.length} workouts`);
        }
        return workouts;
    }

    private getRandomItems<T>(array: T[], count: number): T[] {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    private persistSelectionState(): void {
        WorkoutScheduleStore.saveSelectedWorkoutCategories(this.convertSetToObject(this.selectedCategories));
        WorkoutScheduleStore.saveSelectedWorkoutSubCategories(this.convertSetToObject(this.selectedSubCategories));
        WorkoutScheduleStore.saveSelectedWorkoutGroups(this.convertSetToObject(this.selectedWorkoutGroups));
        WorkoutScheduleStore.saveSelectedWorkouts(this.convertSetToObject(this.selectedWorkouts));
    }

    private convertSetToObject(set: Set<string>): { [key: string]: boolean } {
        const obj: { [key: string]: boolean } = {};
        set.forEach(id => {
            obj[id] = true;
        });
        return obj;
    }

    private hydrateSelectionsFromStore(): void {
        const allCategoryIds = new Set(this.selectedCategories);
        const allSubCategoryIds = new Set(this.selectedSubCategories);
        const allGroupIds = new Set(this.selectedWorkoutGroups);
        const allWorkoutIds = new Set(this.selectedWorkouts);

        const persistedCategories = WorkoutScheduleStore.getSelectedWorkoutCategoriesSync();
        const persistedSubCategories = WorkoutScheduleStore.getSelectedWorkoutSubCategoriesSync();
        const persistedGroups = WorkoutScheduleStore.getSelectedWorkoutGroupsSync();
        const persistedWorkouts = WorkoutScheduleStore.getSelectedWorkoutsSync();

        this.selectedCategories.clear();
        this.selectedSubCategories.clear();
        this.selectedWorkoutGroups.clear();
        this.selectedWorkouts.clear();

        this.applySelectionMap(persistedCategories, allCategoryIds, this.selectedCategories, 'category');
        this.applySelectionMap(persistedSubCategories, allSubCategoryIds, this.selectedSubCategories, 'subcategory');
        this.applySelectionMap(persistedGroups, allGroupIds, this.selectedWorkoutGroups, 'group');
        this.applySelectionMap(persistedWorkouts, allWorkoutIds, this.selectedWorkouts, 'workout');

        this.persistSelectionState();
    }

    private applySelectionMap(
        persisted: Record<string, boolean>,
        validIds: Set<string>,
        target: Set<string>,
        label: 'category' | 'subcategory' | 'group' | 'workout'
    ): void {
        Object.entries(persisted).forEach(([id, isSelected]) => {
            if (!isSelected) {
                return;
            }

            if (validIds.has(id)) {
                target.add(id);
            } else {
                console.warn(`WorkoutCategoryCache: Stored ${label} id "${id}" no longer exists. Ignoring.`);
            }
        });
    }
}

export default WorkoutCategoryCache;
