import { DifficultySetting } from '../types/DifficultySetting';
import { WorkoutSchedule, WorkoutSet, WorkoutScheduleJSON } from '../types/WorkoutSchedule';
import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import { SelectedWorkoutCategories, SelectedWorkoutGroups, SelectedWorkoutSubCategories, SelectedWorkouts } from '../types/WorkoutCategory';

const WORKOUT_SCHEDULE_KEY = 'workoutSchedule';
const SELECTED_CATEGORIES_KEY = 'selectedWorkoutCategories';
const SELECTED_SUBCATEGORIES_KEY = 'selectedWorkoutSubCategories';
const SELECTED_GROUPS_KEY = 'selectedWorkoutGroups';
const SELECTED_WORKOUTS_KEY = 'selectedWorkouts';

const isBooleanRecord = (value: unknown): value is Record<string, boolean> => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return Object.values(value as Record<string, unknown>).every(entry => typeof entry === 'boolean');
};

const isWorkoutScheduleJSON = (value: unknown): value is WorkoutScheduleJSON => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<WorkoutScheduleJSON>;
    return typeof candidate.date === 'string'
        && Array.isArray(candidate.scheduleItems)
        && typeof candidate.difficultySettings === 'object'
        && candidate.difficultySettings !== null;
};

const parseScheduleFromStorage = (raw: string): WorkoutSchedule | null => {
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!isWorkoutScheduleJSON(parsed)) {
            console.warn('WorkoutScheduleStore: Stored schedule has invalid shape.');
            return null;
        }

        return WorkoutSchedule.fromJSON(parsed);
    } catch (error) {
        console.error('WorkoutScheduleStore: Failed to parse or hydrate schedule from JSON', error);
        return null;
    }
};

const getDefaultSelectedWorkoutCategories = (): SelectedWorkoutCategories => {
    const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories();
    return allCategories.reduce((acc, category) => {
        acc[category.id] = true;
        return acc;
    }, {} as SelectedWorkoutCategories);
};

const getDefaultSelectedWorkoutGroups = (): SelectedWorkoutGroups => {
    const allGroups = WorkoutCategoryCache.getInstance()
        .getWorkoutCategories()
        .flatMap(category => category.subCategories.flatMap(subCategory => subCategory.workoutGroups));

    return allGroups.reduce((acc, group) => {
        acc[group.id] = true;
        return acc;
    }, {} as SelectedWorkoutGroups);
};

const getDefaultSelectedWorkoutSubCategories = (): SelectedWorkoutSubCategories => {
    const allSubCategories = WorkoutCategoryCache.getInstance()
        .getWorkoutCategories()
        .flatMap(category => category.subCategories);

    return allSubCategories.reduce((acc, subCategory) => {
        acc[subCategory.id] = true;
        return acc;
    }, {} as SelectedWorkoutSubCategories);
};

const getDefaultSelectedWorkouts = (): SelectedWorkouts => {
    const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkouts();
    return allWorkouts.reduce((acc, workout) => {
        acc[workout.id] = true;
        return acc;
    }, {} as SelectedWorkouts);
};

const WorkoutScheduleStore = {
    async getSchedule(): Promise<WorkoutSchedule | null> {
        try {
            const schedule = localStorage.getItem(WORKOUT_SCHEDULE_KEY);
            if (schedule) {
                console.log('WorkoutScheduleStore: getSchedule: Retrieved workout schedule from localStorage.');
                const workoutSchedule = parseScheduleFromStorage(schedule);
                if (workoutSchedule && workoutSchedule.scheduleItems.length > 0) {
                    return workoutSchedule;
                }

                console.warn('WorkoutScheduleStore: Stored schedule invalid or empty. Creating a new schedule.');
            } else {
                console.warn('getSchedule: No workout schedule found in localStorage. Creating a new schedule.');
            }

            const defaultSchedule = await this.createNewSchedule();
            this.saveSchedule(defaultSchedule);
            return defaultSchedule;
        } catch (error) {
            console.error('Failed to get workout schedule:', error);
            const defaultSchedule = await this.createNewSchedule();
            this.saveSchedule(defaultSchedule);
            return defaultSchedule;
        }
    },
    getScheduleSync(): WorkoutSchedule | null {
        try {
            const schedule = localStorage.getItem(WORKOUT_SCHEDULE_KEY);
            if (!schedule) {
                console.warn('getScheduleSync: No workout schedule found in localStorage.');
                return null;
            }

            console.log('WorkoutScheduleStore: getScheduleSync: Retrieved workout schedule from localStorage.');
            const workoutSchedule = parseScheduleFromStorage(schedule);
            if (!workoutSchedule) {
                console.warn('WorkoutScheduleStore: Stored schedule invalid.');
                return null;
            }

            if (workoutSchedule.scheduleItems.length === 0) {
                console.warn('WorkoutScheduleStore: No workouts in the schedule. Creating a new schedule.');
                const newSchedule = this.createNewScheduleSync();
                this.saveSchedule(newSchedule);
                return newSchedule;
            }

            return workoutSchedule;
        } catch (error) {
            console.error('Failed to get workout schedule:', error);
            return null;
        }
    },
    saveSchedule(schedule: WorkoutSchedule) {
        try {
            localStorage.setItem(WORKOUT_SCHEDULE_KEY, JSON.stringify(schedule.toJSON()));
            console.log('Saved workout schedule to localStorage.');
        } catch (error) {
            console.error('Failed to save workout schedule:', error);
        }
    },
    clearSchedule() {
        try {
            localStorage.removeItem(WORKOUT_SCHEDULE_KEY);
            console.log('Cleared workout schedule from localStorage.');
        } catch (error) {
            console.error('Failed to clear workout schedule:', error);
        }
    },
    async getSelectedWorkoutCategories(): Promise<SelectedWorkoutCategories> {
        try {
            const categories = localStorage.getItem(SELECTED_CATEGORIES_KEY);
            if (categories) {
                console.log('Retrieved selected workout categories from localStorage.');
                const parsed = JSON.parse(categories) as unknown;
                if (isBooleanRecord(parsed)) {
                    return parsed as SelectedWorkoutCategories;
                }
                console.warn('Invalid selected workout categories found in storage. Resetting to defaults.');
            } else {
                console.warn('No selected workout categories found in localStorage. Using all categories.');
            }
        } catch (error) {
            console.error('Failed to get selected workout categories:', error);
        }

        const selectedCategories = getDefaultSelectedWorkoutCategories();
        this.saveSelectedWorkoutCategories(selectedCategories);
        return selectedCategories;
    },
    saveSelectedWorkoutCategories(categories: SelectedWorkoutCategories) {
        try {
            localStorage.setItem(SELECTED_CATEGORIES_KEY, JSON.stringify(categories));
            console.log('Saved selected workout categories to localStorage.');
        } catch (error) {
            console.error('Failed to save selected workout categories:', error);
        }
    },
    clearSelectedWorkoutCategories() {
        try {
            localStorage.removeItem(SELECTED_CATEGORIES_KEY);
            console.log('Cleared selected workout categories from localStorage.');
        } catch (error) {
            console.error('Failed to clear selected workout categories:', error);
        }
    },
    async createNewSchedule(): Promise<WorkoutSchedule> {
        const selectedCategories = await this.getSelectedWorkoutCategories();
        const selectedGroups = await this.getSelectedWorkoutGroups();
        const selectedSubCategories = await this.getSelectedWorkoutSubCategories();
        const selectedWorkouts = await this.getSelectedWorkouts();
        
        const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkoutsFilteredBy(
            selectedCategories, selectedGroups, selectedSubCategories, selectedWorkouts
        );
        const randomWorkouts = allWorkouts.sort(() => 0.5 - Math.random()).slice(0, 10);

        const workoutSets: WorkoutSet[] = [];
        for (let i = 0; i < randomWorkouts.length; i++) {
            const workout = randomWorkouts[i];
            const workoutSet = new WorkoutSet([[workout, false]]);
            workoutSets.push(workoutSet);
        }

        return new WorkoutSchedule(new Date().toISOString(), workoutSets, new DifficultySetting(1, [1, 10]));
    },
    createNewScheduleSync(): WorkoutSchedule {
        const selectedCategories = this.getSelectedWorkoutCategoriesSync();
        const selectedGroups = this.getSelectedWorkoutGroupsSync();
        const selectedSubCategories = this.getSelectedWorkoutSubCategoriesSync();
        const selectedWorkouts = this.getSelectedWorkoutsSync();
        
        const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkoutsFilteredBy(
            selectedCategories, selectedGroups, selectedSubCategories, selectedWorkouts
        );
        const randomWorkouts = allWorkouts.sort(() => 0.5 - Math.random()).slice(0, 10);

        const workoutSets: WorkoutSet[] = [];
        for (let i = 0; i < randomWorkouts.length; i++) {
            const workout = randomWorkouts[i];
            const workoutSet = new WorkoutSet([[workout, false]]);
            workoutSets.push(workoutSet);
        }

        return new WorkoutSchedule(new Date().toISOString(), workoutSets, new DifficultySetting(1, [1, 10]));
    },
    getSelectedWorkoutCategoriesSync(): SelectedWorkoutCategories {
        try {
            const categories = localStorage.getItem(SELECTED_CATEGORIES_KEY);
            if (categories) {
                console.log('Retrieved selected workout categories from localStorage.');
                const parsed = JSON.parse(categories) as unknown;
                if (isBooleanRecord(parsed)) {
                    return parsed as SelectedWorkoutCategories;
                }
                console.warn('Invalid selected workout categories found in storage. Resetting to defaults.');
            } else {
                console.warn('No selected workout categories found in localStorage. Using all categories.');
            }
        } catch (error) {
            console.error('Failed to get selected workout categories:', error);
        }

        const selectedCategories = getDefaultSelectedWorkoutCategories();
        this.saveSelectedWorkoutCategories(selectedCategories);
        return selectedCategories;
    },
    async getSelectedWorkoutGroups(): Promise<SelectedWorkoutGroups> {
        try {
            const groups = localStorage.getItem(SELECTED_GROUPS_KEY);
            if (groups) {
                console.log('Retrieved selected workout groups from localStorage.');
                const parsed = JSON.parse(groups) as unknown;
                if (isBooleanRecord(parsed)) {
                    return parsed as SelectedWorkoutGroups;
                }
                console.warn('Invalid selected workout groups found in storage. Resetting to defaults.');
            } else {
                console.warn('No selected workout groups found in localStorage. Using all groups.');
            }
        } catch (error) {
            console.error('Failed to get selected workout groups:', error);
        }

        const selectedGroups = getDefaultSelectedWorkoutGroups();
        this.saveSelectedWorkoutGroups(selectedGroups);
        return selectedGroups;
    },
    getSelectedWorkoutGroupsSync(): SelectedWorkoutGroups {
        try {
            const groups = localStorage.getItem(SELECTED_GROUPS_KEY);
            if (groups) {
                console.log('Retrieved selected workout groups from localStorage.');
                const parsed = JSON.parse(groups) as unknown;
                if (isBooleanRecord(parsed)) {
                    return parsed as SelectedWorkoutGroups;
                }
                console.warn('Invalid selected workout groups found in storage. Resetting to defaults.');
            } else {
                console.warn('No selected workout groups found in localStorage. Using all groups.');
            }
        } catch (error) {
            console.error('Failed to get selected workout groups:', error);
        }

        const selectedGroups = getDefaultSelectedWorkoutGroups();
        this.saveSelectedWorkoutGroups(selectedGroups);
        return selectedGroups;
    },
    async getSelectedWorkoutSubCategories(): Promise<SelectedWorkoutSubCategories> {
        try {
            const subCategories = localStorage.getItem(SELECTED_SUBCATEGORIES_KEY);
            if (subCategories) {
                console.log('Retrieved selected workout subcategories from localStorage.');
                const parsed = JSON.parse(subCategories) as unknown;
                if (isBooleanRecord(parsed)) {
                    return parsed as SelectedWorkoutSubCategories;
                }
                console.warn('Invalid selected workout subcategories found in storage. Resetting to defaults.');
            } else {
                console.warn('No selected workout subcategories found in localStorage. Using all subcategories.');
            }
        } catch (error) {
            console.error('Failed to get selected workout subcategories:', error);
        }

        const selectedSubCategories = getDefaultSelectedWorkoutSubCategories();
        this.saveSelectedWorkoutSubCategories(selectedSubCategories);
        return selectedSubCategories;
    },
    getSelectedWorkoutSubCategoriesSync(): SelectedWorkoutSubCategories {
        try {
            const subCategories = localStorage.getItem(SELECTED_SUBCATEGORIES_KEY);
            if (subCategories) {
                console.log('Retrieved selected workout subcategories from localStorage.');
                const parsed = JSON.parse(subCategories) as unknown;
                if (isBooleanRecord(parsed)) {
                    return parsed as SelectedWorkoutSubCategories;
                }
                console.warn('Invalid selected workout subcategories found in storage. Resetting to defaults.');
            } else {
                console.warn('No selected workout subcategories found in localStorage. Using all subcategories.');
            }
        } catch (error) {
            console.error('Failed to get selected workout subcategories:', error);
        }

        const selectedSubCategories = getDefaultSelectedWorkoutSubCategories();
        this.saveSelectedWorkoutSubCategories(selectedSubCategories);
        return selectedSubCategories;
    },
    async getSelectedWorkouts(): Promise<SelectedWorkouts> {
        try {
            const workouts = localStorage.getItem(SELECTED_WORKOUTS_KEY);
            if (workouts) {
                console.log('Retrieved selected workouts from localStorage.');
                const parsed = JSON.parse(workouts) as unknown;
                if (isBooleanRecord(parsed)) {
                    return parsed as SelectedWorkouts;
                }
                console.warn('Invalid selected workouts found in storage. Resetting to defaults.');
            } else {
                console.warn('No selected workouts found in localStorage. Using all workouts.');
            }
        } catch (error) {
            console.error('Failed to get selected workouts:', error);
        }

        const selectedWorkouts = getDefaultSelectedWorkouts();
        this.saveSelectedWorkouts(selectedWorkouts);
        return selectedWorkouts;
    },
    getSelectedWorkoutsSync(): SelectedWorkouts {
        try {
            const workouts = localStorage.getItem(SELECTED_WORKOUTS_KEY);
            if (workouts) {
                console.log('Retrieved selected workouts from localStorage.');
                const parsed = JSON.parse(workouts) as unknown;
                if (isBooleanRecord(parsed)) {
                    return parsed as SelectedWorkouts;
                }
                console.warn('Invalid selected workouts found in storage. Resetting to defaults.');
            } else {
                console.warn('No selected workouts found in localStorage. Using all workouts.');
            }
        } catch (error) {
            console.error('Failed to get selected workouts:', error);
        }

        const selectedWorkouts = getDefaultSelectedWorkouts();
        this.saveSelectedWorkouts(selectedWorkouts);
        return selectedWorkouts;
    },
    saveSelectedWorkoutGroups(groups: SelectedWorkoutGroups) {
        try {
            localStorage.setItem(SELECTED_GROUPS_KEY, JSON.stringify(groups));
            console.log('Saved selected workout groups to localStorage.');
        } catch (error) {
            console.error('Failed to save selected workout groups:', error);
        }
    },
    saveSelectedWorkoutSubCategories(subCategories: SelectedWorkoutSubCategories) {
        try {
            localStorage.setItem(SELECTED_SUBCATEGORIES_KEY, JSON.stringify(subCategories));
            console.log('Saved selected workout subcategories to localStorage.');
        } catch (error) {
            console.error('Failed to save selected workout subcategories:', error);
        }
    },
    saveSelectedWorkouts(workouts: SelectedWorkouts) {
        try {
            localStorage.setItem(SELECTED_WORKOUTS_KEY, JSON.stringify(workouts));
            console.log('Saved selected workouts to localStorage.');
        } catch (error) {
            console.error('Failed to save selected workouts:', error);
        }
    },
    clearSelectedWorkoutGroups() {
        try {
            localStorage.removeItem(SELECTED_GROUPS_KEY);
            console.log('Cleared selected workout groups from localStorage.');
        } catch (error) {
            console.error('Failed to clear selected workout groups:', error);
        }
    },
    clearSelectedWorkoutSubCategories() {
        try {
            localStorage.removeItem(SELECTED_SUBCATEGORIES_KEY);
            console.log('Cleared selected workout subcategories from localStorage.');
        } catch (error) {
            console.error('Failed to clear selected workout subcategories:', error);
        }
    },
    clearSelectedWorkouts() {
        try {
            localStorage.removeItem(SELECTED_WORKOUTS_KEY);
            console.log('Cleared selected workouts from localStorage.');
        } catch (error) {
            console.error('Failed to clear selected workouts:', error);
        }
    }
};

export default WorkoutScheduleStore;
