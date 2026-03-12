import { Drill, DrillCategory, SelectedDrillCategories, SelectedDrillGroups, SelectedDrillSubCategories, SelectedDrills } from "../types/DrillCategory";
import MissionScheduleStore from "../store/MissionScheduleStore";
import DrillFilterStore from "../store/DrillFilterStore";
import { applyDrillFilters } from "../utils/drillFilters";
import { DrillPreset, buildPresetSelections } from "../utils/drillPresets";

class DrillCategoryCache {
    private static instance: DrillCategoryCache;
    public cache: Map<string, DrillCategory>;
    public selectedCategories: Set<string>;
    public selectedSubCategories: Set<string>;
    public selectedDrillGroups: Set<string>;
    public selectedDrills: Set<string>;
    private loading: boolean;

    private constructor() {
        this.cache = new Map();
        this.selectedCategories = new Set();
        this.selectedSubCategories = new Set();
        this.selectedDrillGroups = new Set();
        this.selectedDrills = new Set();
        this.loading = false; // Set to false initially
    }

    public static getInstance(): DrillCategoryCache {
        if (!DrillCategoryCache.instance) {
            DrillCategoryCache.instance = new DrillCategoryCache();
        }
        return DrillCategoryCache.instance;
    }

    public async loadData(drillCategories: DrillCategory[]): Promise<void> {
        if (this.loading) {
            console.warn('DrillCategoryCache is already caching data.');
            return;
        }
        this.loading = true;
        console.log(`DrillCategoryCache: Starting to cache ${drillCategories.length} drill categories...`);

        drillCategories.forEach(category => {
            this.cache.set(category.id, category);
            this.selectedCategories.add(category.id);
            category.subCategories.forEach(subCategory => {
                this.selectedSubCategories.add(subCategory.id);
                subCategory.drillGroups.forEach(group => {
                    this.selectedDrillGroups.add(group.id);
                    group.drills.forEach(drill => {
                        this.selectedDrills.add(drill.id);
                    });
                });
            });
        });
        console.log(`DrillCategoryCache: Cached ${this.cache.size} drill categories.`);
        console.log(`DrillCategoryCache: Cached ${this.selectedSubCategories.size} drill subcategories.`);
        console.log(`DrillCategoryCache: Cached ${this.selectedDrillGroups.size} drill groups.`);
        console.log(`DrillCategoryCache: Cached ${this.selectedDrills.size} drills.`);

        const signature = this.computeTaxonomySignature(drillCategories);
        const shouldHydrate = MissionScheduleStore.syncTaxonomySignature(signature);

        if (shouldHydrate) {
            this.hydrateSelectionsFromStore();
        } else {
            this.persistSelectionState();
        }

        this.loading = false;
    }

    public async reloadData(drillCategories: DrillCategory[]): Promise<void> {
        this.clearCache();
        await this.loadData(drillCategories);
    }

    public isLoading(): boolean {
        return this.loading;
    }

    public getDrillCategories(): DrillCategory[] {
        // Return all DrillCategories from the cache
        return Array.from(this.cache.values());
    }

    public async fetchAllDrillsInCategory(categoryId: string): Promise<Drill[]> {
        const category = this.cache.get(categoryId);
        if (!category) {
            return [];
        }
        const drills: Drill[] = [];
        category.subCategories.forEach(subCategory => {
            subCategory.drillGroups.forEach(group => {
                drills.push(...group.drills);
            });
        });
        return drills;
    }

    public getAllDrillsSelected(): Drill[] {
        const selectedDrillCategories = MissionScheduleStore.getSelectedDrillCategoriesSync();
        const selectedDrillSubCategories = MissionScheduleStore.getSelectedDrillSubCategoriesSync();
        const selectedDrillGroups = MissionScheduleStore.getSelectedDrillGroupsSync();
        const selectedDrills = MissionScheduleStore.getSelectedDrillsSync();
        const filters = DrillFilterStore.getFiltersSync();
        console.log('Selected categories:', selectedDrillCategories);
        console.log('Selected subcategories:', selectedDrillSubCategories);
        console.log('Selected groups:', selectedDrillGroups);
        console.log('Selected drills:', selectedDrills);
        const selected = this.getAllDrillsFilteredBy(selectedDrillCategories, selectedDrillSubCategories, selectedDrillGroups, selectedDrills);
        const filtered = applyDrillFilters(selected, filters);
        console.log(`DrillCategoryCache: applied filters ${JSON.stringify(filters)} -> ${filtered.length}/${selected.length} drills`);
        return filtered;
    }

    public getAllDrills(): Drill[] {
        const drills: Drill[] = [];
        this.cache.forEach(category => {
            category.subCategories.forEach(subCategory => {
                subCategory.drillGroups.forEach(group => {
                    drills.push(...group.drills);
                });
            });
        });
        return drills;
    }

    public getDrillCategory(id: string): DrillCategory | undefined {
        return this.cache.get(id);
    }

    public toggleCategorySelection(id: string): void {
        if (this.selectedCategories.has(id)) {
            this.selectedCategories.delete(id);
        } else {
            this.selectedCategories.add(id);
        }
        MissionScheduleStore.saveSelectedDrillCategories(this.convertSetToObject(this.selectedCategories));
    }

    public toggleSubCategorySelection(id: string): void {
        if (this.selectedSubCategories.has(id)) {
            this.selectedSubCategories.delete(id);
        } else {
            this.selectedSubCategories.add(id);
        }
        MissionScheduleStore.saveSelectedDrillSubCategories(this.convertSetToObject(this.selectedSubCategories));
    }

    public toggleDrillGroupSelection(id: string): void {
        if (this.selectedDrillGroups.has(id)) {
            this.selectedDrillGroups.delete(id);
        } else {
            this.selectedDrillGroups.add(id);
        }
        MissionScheduleStore.saveSelectedDrillGroups(this.convertSetToObject(this.selectedDrillGroups));
    }

    public toggleDrillSelection(id: string): void {
        if (this.selectedDrills.has(id)) {
            this.selectedDrills.delete(id);
        } else {
            this.selectedDrills.add(id);
        }
        MissionScheduleStore.saveSelectedDrills(this.convertSetToObject(this.selectedDrills));
    }

    public applyPreset(preset: DrillPreset): void {
        const categories = Array.from(this.cache.values());
        const { categoryIds, subCategoryIds, groupIds, drillIds } = buildPresetSelections(categories, preset);

        if (drillIds.size === 0) {
            console.warn(`DrillCategoryCache: preset ${preset} matched no drills; falling back to select all.`);
            this.selectAll();
            return;
        }

        this.selectedCategories = categoryIds;
        this.selectedSubCategories = subCategoryIds;
        this.selectedDrillGroups = groupIds;
        this.selectedDrills = drillIds;
        this.persistSelectionState();
        MissionScheduleStore.saveLastPreset(preset);
    }

    public selectAll(): void {
        this.cache.forEach(category => {
            this.selectedCategories.add(category.id);
            category.subCategories.forEach(subCategory => {
                this.selectedSubCategories.add(subCategory.id);
                subCategory.drillGroups.forEach(group => {
                    this.selectedDrillGroups.add(group.id);
                    group.drills.forEach(drill => {
                        this.selectedDrills.add(drill.id);
                    });
                });
            });
        });
        this.persistSelectionState();
    }

    public unselectAll(): void {
        this.selectedCategories.clear();
        this.selectedSubCategories.clear();
        this.selectedDrillGroups.clear();
        this.selectedDrills.clear();
        this.persistSelectionState();
    }

    public isCategorySelected(id: string): boolean {
        return this.selectedCategories.has(id);
    }

    public isSubCategorySelected(id: string): boolean {
        return this.selectedSubCategories.has(id);
    }

    public isDrillGroupSelected(id: string): boolean {
        return this.selectedDrillGroups.has(id);
    }

    public isDrillSelected(id: string): boolean {
        return this.selectedDrills.has(id);
    }

    public clearCache(): void {
        this.cache.clear();
        this.selectedCategories.clear();
        this.selectedSubCategories.clear();
        this.selectedDrillGroups.clear();
        this.selectedDrills.clear();
    }

    private computeTaxonomySignature(drillCategories: DrillCategory[]): string {
        const parts = drillCategories
            .map(category => {
                const subParts = category.subCategories
                    .map(sub => {
                        const groupParts = sub.drillGroups
                            .map(group => {
                                const drillParts = group.drills
                                    .map(drill => drill.id)
                                    .sort()
                                    .join(',');
                                return `${group.id}:${drillParts}`;
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

    public getDrillsByDifficultyRange(minLevel: number, maxLevel: number, count: number): Drill[] {
        const drills: Drill[] = [];
        this.cache.forEach(category => {
            category.subCategories.forEach(subCategory => {
                subCategory.drillGroups.forEach(group => {
                    group.drills.forEach(drill => {
                        if (drill.difficulty_range[0] <= maxLevel && drill.difficulty_range[1] >= minLevel) {
                            drills.push(drill);
                        }
                    });
                });
            });
        });
        return this.getRandomItems(drills, count);
    }

    public getDrillsBySingleDifficultyLevel(level: number, count: number): Drill[] {
        return this.getDrillsByDifficultyRange(level, level, count);
    }

    public getAllDrillsFilteredBy(
        selectedCategories: SelectedDrillCategories,
        selectedSubCategories: SelectedDrillSubCategories,
        selectedGroups: SelectedDrillGroups,
        selectedDrills: SelectedDrills
    ): Drill[] {
        console.log(`getAllDrillsFilteredBy: filtering`);
        const drills: Drill[] = [];
        this.cache.forEach(category => {
            if (selectedCategories[category.id]) { 
                console.log('Selected category:', category.id);
                category.subCategories.forEach(subCategory => {
                    if (selectedSubCategories[subCategory.id]) {
                        console.log('Selected subCategory:', subCategory.id);
                        subCategory.drillGroups.forEach(group => {
                            if (selectedGroups[group.id]) {
                                console.log('Selected group:', group.id);
                                group.drills.forEach(drill => {
                                    if (selectedDrills[drill.id]) {
                                        console.log('Selected drill:', drill.id);
                                        drills.push(drill);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        if (drills.length === 0) {
            console.warn(`getAllDrillsFilteredBy: no drills selected?`);
        } else {
            console.log(`getAllDrillsFilteredBy: selected ${drills.length} drills`);
        }
        return drills;
    }

    private getRandomItems<T>(array: T[], count: number): T[] {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    private persistSelectionState(): void {
        MissionScheduleStore.saveSelectedDrillCategories(this.convertSetToObject(this.selectedCategories));
        MissionScheduleStore.saveSelectedDrillSubCategories(this.convertSetToObject(this.selectedSubCategories));
        MissionScheduleStore.saveSelectedDrillGroups(this.convertSetToObject(this.selectedDrillGroups));
        MissionScheduleStore.saveSelectedDrills(this.convertSetToObject(this.selectedDrills));
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
        const allGroupIds = new Set(this.selectedDrillGroups);
        const allDrillIds = new Set(this.selectedDrills);

        const persistedCategories = MissionScheduleStore.getSelectedDrillCategoriesSync();
        const persistedSubCategories = MissionScheduleStore.getSelectedDrillSubCategoriesSync();
        const persistedGroups = MissionScheduleStore.getSelectedDrillGroupsSync();
        const persistedDrills = MissionScheduleStore.getSelectedDrillsSync();

        this.selectedCategories.clear();
        this.selectedSubCategories.clear();
        this.selectedDrillGroups.clear();
        this.selectedDrills.clear();

        this.applySelectionMap(persistedCategories, allCategoryIds, this.selectedCategories, 'category');
        this.applySelectionMap(persistedSubCategories, allSubCategoryIds, this.selectedSubCategories, 'subcategory');
        this.applySelectionMap(persistedGroups, allGroupIds, this.selectedDrillGroups, 'group');
        this.applySelectionMap(persistedDrills, allDrillIds, this.selectedDrills, 'drill');

        this.persistSelectionState();
    }

    private applySelectionMap(
        persisted: Record<string, boolean>,
        validIds: Set<string>,
        target: Set<string>,
        label: 'category' | 'subcategory' | 'group' | 'drill'
    ): void {
        Object.entries(persisted).forEach(([id, isSelected]) => {
            if (!isSelected) {
                return;
            }

            if (validIds.has(id)) {
                target.add(id);
            } else {
                console.warn(`DrillCategoryCache: Stored ${label} id "${id}" no longer exists. Ignoring.`);
            }
        });
    }
}

export default DrillCategoryCache;
