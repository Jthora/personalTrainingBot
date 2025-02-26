import { WorkoutSchedule, WorkoutSet, WorkoutBlock } from '../types/WorkoutSchedule';
import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import { SelectedWorkoutCategories, SelectedWorkoutGroups, SelectedWorkoutSubCategories, SelectedWorkouts, Workout } from '../types/WorkoutCategory';

const WorkoutScheduleStore = {
    async getSchedule(): Promise<WorkoutSchedule | null> {
        try {
            const schedule = localStorage.getItem('workoutSchedule');
            if (schedule) {
                console.log('WorkoutScheduleStore: getSchedule: Retrieved workout schedule from localStorage.');
                const parsedSchedule = JSON.parse(schedule);
                const workoutSchedule = new WorkoutSchedule(
                    parsedSchedule.date,
                    parsedSchedule.scheduleItems.map((item: any) => {
                        if (item.workouts) {
                            const workouts = item.workouts.map(([workout, completed]: [any, boolean]) => {
                                const reconstructedWorkout = new Workout(
                                    workout.name,
                                    workout.description,
                                    workout.duration,
                                    workout.intensity,
                                    workout.difficulty_range
                                );
                                return [reconstructedWorkout, completed];
                            });
                            return new WorkoutSet(workouts);
                        } else if (item.name && item.description && item.duration && item.intervalDetails) {
                            return new WorkoutBlock(item.name, item.description, item.duration, item.intervalDetails);
                        } else {
                            console.warn('Unknown item type in schedule:', item);
                            return item;
                        }
                    }),
                    parsedSchedule.difficultySettings
                );
                if (workoutSchedule.scheduleItems.length === 0) {
                    console.warn('WorkoutScheduleStore: No workouts in the schedule. Creating a new schedule.');
                    const newSchedule = await this.createNewSchedule();
                    this.saveSchedule(newSchedule);
                    return newSchedule;
                }
                return workoutSchedule;
            } else {
                console.warn('getSchedule: No workout schedule found in localStorage. Creating a new schedule.');
                const defaultSchedule = await this.createNewSchedule();
                this.saveSchedule(defaultSchedule);
                return defaultSchedule;
            }
        } catch (error) {
            console.error('Failed to get workout schedule:', error);
            const defaultSchedule = await this.createNewSchedule();
            this.saveSchedule(defaultSchedule);
            return defaultSchedule;
        }
    },
    getScheduleSync(): WorkoutSchedule | null {
        try {
            const schedule = localStorage.getItem('workoutSchedule');
            if (schedule) {
                console.log('WorkoutScheduleStore: getScheduleSync: Retrieved workout schedule from localStorage.');
                const parsedSchedule = JSON.parse(schedule);
                const workoutSchedule = new WorkoutSchedule(
                    parsedSchedule.date,
                    parsedSchedule.scheduleItems.map((item: any) => {
                        if (item.workouts) {
                            const workouts = item.workouts.map(([workout, completed]: [any, boolean]) => {
                                const reconstructedWorkout = new Workout(
                                    workout.name,
                                    workout.description,
                                    workout.duration,
                                    workout.intensity,
                                    workout.difficulty_range
                                );
                                return [reconstructedWorkout, completed];
                            });
                            return new WorkoutSet(workouts);
                        } else if (item.name && item.description && item.duration && item.intervalDetails) {
                            return new WorkoutBlock(item.name, item.description, item.duration, item.intervalDetails);
                        } else {
                            console.warn('Unknown item type in schedule:', item);
                            return item;
                        }
                    }),
                    parsedSchedule.difficultySettings
                );
                if (workoutSchedule.scheduleItems.length === 0) {
                    console.warn('WorkoutScheduleStore: No workouts in the schedule. Creating a new schedule.');
                    const newSchedule = this.createNewScheduleSync();
                    this.saveSchedule(newSchedule);
                    return newSchedule;
                }
                return workoutSchedule;
            } else {
                console.warn('getScheduleSync: No workout schedule found in localStorage.');
                return null;
            }
        } catch (error) {
            console.error('Failed to get workout schedule:', error);
            return null;
        }
    },
    saveSchedule(schedule: WorkoutSchedule) {
        try {
            localStorage.setItem('workoutSchedule', JSON.stringify(schedule));
            console.log('Saved workout schedule to localStorage.');
        } catch (error) {
            console.error('Failed to save workout schedule:', error);
        }
    },
    clearSchedule() {
        try {
            localStorage.removeItem('workoutSchedule');
            console.log('Cleared workout schedule from localStorage.');
        } catch (error) {
            console.error('Failed to clear workout schedule:', error);
        }
    },
    async getSelectedWorkoutCategories(): Promise<SelectedWorkoutCategories> {
        try {
            const categories = localStorage.getItem('selectedWorkoutCategories');
            if (categories) {
                console.log('Retrieved selected workout categories from localStorage.');
                return JSON.parse(categories);
            } else {
                console.warn('No selected workout categories found in localStorage. Using all categories.');
                const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories();
                const selectedCategories = allCategories.reduce((acc, category) => {
                    acc[category.id] = true;
                    return acc;
                }, {} as SelectedWorkoutCategories);
                this.saveSelectedWorkoutCategories(selectedCategories);
                return selectedCategories;
            }
        } catch (error) {
            console.error('Failed to get selected workout categories:', error);
            const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories();
            const selectedCategories = allCategories.reduce((acc, category) => {
                acc[category.id] = true;
                return acc;
            }, {} as SelectedWorkoutCategories);
            this.saveSelectedWorkoutCategories(selectedCategories);
            return selectedCategories;
        }
    },
    saveSelectedWorkoutCategories(categories: SelectedWorkoutCategories) {
        try {
            localStorage.setItem('selectedWorkoutCategories', JSON.stringify(categories));
            console.log('Saved selected workout categories to localStorage.');
        } catch (error) {
            console.error('Failed to save selected workout categories:', error);
        }
    },
    clearSelectedWorkoutCategories() {
        try {
            localStorage.removeItem('selectedWorkoutCategories');
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

        return new WorkoutSchedule(new Date().toISOString(), workoutSets, { level: 1, range: [1, 10] });
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

        return new WorkoutSchedule(new Date().toISOString(), workoutSets, { level: 1, range: [1, 10] });
    },
    getSelectedWorkoutCategoriesSync(): SelectedWorkoutCategories {
        try {
            const categories = localStorage.getItem('selectedWorkoutCategories');
            if (categories) {
                console.log('Retrieved selected workout categories from localStorage.');
                return JSON.parse(categories);
            } else {
                console.warn('No selected workout categories found in localStorage. Using all categories.');
                const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories();
                const selectedCategories = allCategories.reduce((acc, category) => {
                    acc[category.id] = true;
                    return acc;
                }, {} as SelectedWorkoutCategories);
                this.saveSelectedWorkoutCategories(selectedCategories);
                return selectedCategories;
            }
        } catch (error) {
            console.error('Failed to get selected workout categories:', error);
            const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories();
            const selectedCategories = allCategories.reduce((acc, category) => {
                acc[category.id] = true;
                return acc;
            }, {} as SelectedWorkoutCategories);
            this.saveSelectedWorkoutCategories(selectedCategories);
            return selectedCategories;
        }
    },
    async getSelectedWorkoutGroups(): Promise<SelectedWorkoutGroups> {
        try {
            const groups = localStorage.getItem('selectedWorkoutGroups');
            if (groups) {
                console.log('Retrieved selected workout groups from localStorage.');
                return JSON.parse(groups);
            } else {
                console.warn('No selected workout groups found in localStorage. Using all groups.');
                const allGroups = WorkoutCategoryCache.getInstance().getWorkoutCategories().flatMap(category => 
                    category.subCategories.flatMap(subCategory => subCategory.workoutGroups)
                );
                const selectedGroups = allGroups.reduce((acc, group) => {
                    acc[group.id] = true;
                    return acc;
                }, {} as SelectedWorkoutGroups);
                this.saveSelectedWorkoutGroups(selectedGroups);
                return selectedGroups;
            }
        } catch (error) {
            console.error('Failed to get selected workout groups:', error);
            const allGroups = WorkoutCategoryCache.getInstance().getWorkoutCategories().flatMap(category => 
                category.subCategories.flatMap(subCategory => subCategory.workoutGroups)
            );
            const selectedGroups = allGroups.reduce((acc, group) => {
                acc[group.id] = true;
                return acc;
            }, {} as SelectedWorkoutGroups);
            this.saveSelectedWorkoutGroups(selectedGroups);
            return selectedGroups;
        }
    },
    getSelectedWorkoutGroupsSync(): SelectedWorkoutGroups {
        try {
            const groups = localStorage.getItem('selectedWorkoutGroups');
            if (groups) {
                console.log('Retrieved selected workout groups from localStorage.');
                return JSON.parse(groups);
            } else {
                console.warn('No selected workout groups found in localStorage. Using all groups.');
                const allGroups = WorkoutCategoryCache.getInstance().getWorkoutCategories().flatMap(category => 
                    category.subCategories.flatMap(subCategory => subCategory.workoutGroups)
                );
                const selectedGroups = allGroups.reduce((acc, group) => {
                    acc[group.id] = true;
                    return acc;
                }, {} as SelectedWorkoutGroups);
                this.saveSelectedWorkoutGroups(selectedGroups);
                return selectedGroups;
            }
        } catch (error) {
            console.error('Failed to get selected workout groups:', error);
            const allGroups = WorkoutCategoryCache.getInstance().getWorkoutCategories().flatMap(category => 
                category.subCategories.flatMap(subCategory => subCategory.workoutGroups)
            );
            const selectedGroups = allGroups.reduce((acc, group) => {
                acc[group.id] = true;
                return acc;
            }, {} as SelectedWorkoutGroups);
            this.saveSelectedWorkoutGroups(selectedGroups);
            return selectedGroups;
        }
    },
    async getSelectedWorkoutSubCategories(): Promise<SelectedWorkoutSubCategories> {
        try {
            const subCategories = localStorage.getItem('selectedWorkoutSubCategories');
            if (subCategories) {
                console.log('Retrieved selected workout subcategories from localStorage.');
                return JSON.parse(subCategories);
            } else {
                console.warn('No selected workout subcategories found in localStorage. Using all subcategories.');
                const allSubCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories().flatMap(category => 
                    category.subCategories
                );
                const selectedSubCategories = allSubCategories.reduce((acc, subCategory) => {
                    acc[subCategory.id] = true;
                    return acc;
                }, {} as SelectedWorkoutSubCategories);
                this.saveSelectedWorkoutSubCategories(selectedSubCategories);
                return selectedSubCategories;
            }
        } catch (error) {
            console.error('Failed to get selected workout subcategories:', error);
            const allSubCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories().flatMap(category => 
                category.subCategories
            );
            const selectedSubCategories = allSubCategories.reduce((acc, subCategory) => {
                acc[subCategory.id] = true;
                return acc;
            }, {} as SelectedWorkoutSubCategories);
            this.saveSelectedWorkoutSubCategories(selectedSubCategories);
            return selectedSubCategories;
        }
    },
    getSelectedWorkoutSubCategoriesSync(): SelectedWorkoutSubCategories {
        try {
            const subCategories = localStorage.getItem('selectedWorkoutSubCategories');
            if (subCategories) {
                console.log('Retrieved selected workout subcategories from localStorage.');
                return JSON.parse(subCategories);
            } else {
                console.warn('No selected workout subcategories found in localStorage. Using all subcategories.');
                const allSubCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories().flatMap(category => 
                    category.subCategories
                );
                const selectedSubCategories = allSubCategories.reduce((acc, subCategory) => {
                    acc[subCategory.id] = true;
                    return acc;
                }, {} as SelectedWorkoutSubCategories);
                this.saveSelectedWorkoutSubCategories(selectedSubCategories);
                return selectedSubCategories;
            }
        } catch (error) {
            console.error('Failed to get selected workout subcategories:', error);
            const allSubCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories().flatMap(category => 
                category.subCategories
            );
            const selectedSubCategories = allSubCategories.reduce((acc, subCategory) => {
                acc[subCategory.id] = true;
                return acc;
            }, {} as SelectedWorkoutSubCategories);
            this.saveSelectedWorkoutSubCategories(selectedSubCategories);
            return selectedSubCategories;
        }
    },
    async getSelectedWorkouts(): Promise<SelectedWorkouts> {
        try {
            const workouts = localStorage.getItem('selectedWorkouts');
            if (workouts) {
                console.log('Retrieved selected workouts from localStorage.');
                return JSON.parse(workouts);
            } else {
                console.warn('No selected workouts found in localStorage. Using all workouts.');
                const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkouts();
                const selectedWorkouts = allWorkouts.reduce((acc, workout) => {
                    acc[workout.id] = true;
                    return acc;
                }, {} as SelectedWorkouts);
                this.saveSelectedWorkouts(selectedWorkouts);
                return selectedWorkouts;
            }
        } catch (error) {
            console.error('Failed to get selected workouts:', error);
            const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkouts();
            const selectedWorkouts = allWorkouts.reduce((acc, workout) => {
                acc[workout.id] = true;
                return acc;
            }, {} as SelectedWorkouts);
            this.saveSelectedWorkouts(selectedWorkouts);
            return selectedWorkouts;
        }
    },
    getSelectedWorkoutsSync(): SelectedWorkouts {
        try {
            const workouts = localStorage.getItem('selectedWorkouts');
            if (workouts) {
                console.log('Retrieved selected workouts from localStorage.');
                return JSON.parse(workouts);
            } else {
                console.warn('No selected workouts found in localStorage. Using all workouts.');
                const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkouts();
                const selectedWorkouts = allWorkouts.reduce((acc, workout) => {
                    acc[workout.id] = true;
                    return acc;
                }, {} as SelectedWorkouts);
                this.saveSelectedWorkouts(selectedWorkouts);
                return selectedWorkouts;
            }
        } catch (error) {
            console.error('Failed to get selected workouts:', error);
            const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkouts();
            const selectedWorkouts = allWorkouts.reduce((acc, workout) => {
                acc[workout.id] = true;
                return acc;
            }, {} as SelectedWorkouts);
            this.saveSelectedWorkouts(selectedWorkouts);
            return selectedWorkouts;
        }
    },
    saveSelectedWorkoutGroups(groups: SelectedWorkoutGroups) {
        try {
            localStorage.setItem('selectedWorkoutGroups', JSON.stringify(groups));
            console.log('Saved selected workout groups to localStorage.');
        } catch (error) {
            console.error('Failed to save selected workout groups:', error);
        }
    },
    saveSelectedWorkoutSubCategories(subCategories: SelectedWorkoutSubCategories) {
        try {
            localStorage.setItem('selectedWorkoutSubCategories', JSON.stringify(subCategories));
            console.log('Saved selected workout subcategories to localStorage.');
        } catch (error) {
            console.error('Failed to save selected workout subcategories:', error);
        }
    },
    saveSelectedWorkouts(workouts: SelectedWorkouts) {
        try {
            localStorage.setItem('selectedWorkouts', JSON.stringify(workouts));
            console.log('Saved selected workouts to localStorage.');
        } catch (error) {
            console.error('Failed to save selected workouts:', error);
        }
    },
    clearSelectedWorkoutGroups() {
        try {
            localStorage.removeItem('selectedWorkoutGroups');
            console.log('Cleared selected workout groups from localStorage.');
        } catch (error) {
            console.error('Failed to clear selected workout groups:', error);
        }
    },
    clearSelectedWorkoutSubCategories() {
        try {
            localStorage.removeItem('selectedWorkoutSubCategories');
            console.log('Cleared selected workout subcategories from localStorage.');
        } catch (error) {
            console.error('Failed to clear selected workout subcategories:', error);
        }
    },
    clearSelectedWorkouts() {
        try {
            localStorage.removeItem('selectedWorkouts');
            console.log('Cleared selected workouts from localStorage.');
        } catch (error) {
            console.error('Failed to clear selected workouts:', error);
        }
    }
};

export default WorkoutScheduleStore;
