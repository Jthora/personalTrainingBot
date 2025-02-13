import { WorkoutSchedule } from '../types/WorkoutSchedule';
import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';
import { SelectedWorkoutCategories } from '../types/WorkoutCategory';

const WorkoutScheduleStore = {
    async getSchedule(options = {}): Promise<WorkoutSchedule | null> {
        try {
            const schedule = localStorage.getItem('workoutSchedule');
            if (schedule) {
                console.log('WorkoutScheduleStore: getSchedule: Retrieved workout schedule from localStorage.');
                const parsedSchedule = JSON.parse(schedule);
                const workoutSchedule = new WorkoutSchedule(parsedSchedule.date, parsedSchedule.workouts, parsedSchedule.difficultySettings);
                if (workoutSchedule.workouts.length === 0) {
                    console.warn('WorkoutScheduleStore: No workouts in the schedule. Creating a new schedule.');
                    const newSchedule = await this.createNewSchedule(options);
                    this.saveSchedule(newSchedule);
                    return newSchedule;
                }
                return workoutSchedule;
            } else {
                console.warn('getSchedule: No workout schedule found in localStorage. Creating a new schedule.');
                const defaultSchedule = await this.createNewSchedule(options);
                this.saveSchedule(defaultSchedule);
                return defaultSchedule;
            }
        } catch (error) {
            console.error('Failed to get workout schedule:', error);
            const defaultSchedule = await this.createNewSchedule(options);
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
                const workoutSchedule = new WorkoutSchedule(parsedSchedule.date, parsedSchedule.workouts, parsedSchedule.difficultySettings);
                if (workoutSchedule.workouts.length === 0) {
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
    async createNewSchedule(options = {}): Promise<WorkoutSchedule> {
        const selectedCategories = await this.getSelectedWorkoutCategories();
        const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkouts().filter(workout => selectedCategories[workout.id]);
        const randomWorkouts = allWorkouts.sort(() => 0.5 - Math.random()).slice(0, 10);
        return new WorkoutSchedule(new Date().toISOString(), randomWorkouts, { level: 1, range: [1, 10] });
    },
    createNewScheduleSync(): WorkoutSchedule {
        const selectedCategories = this.getSelectedWorkoutCategoriesSync();
        const allWorkouts = WorkoutCategoryCache.getInstance().getAllWorkouts().filter(workout => selectedCategories[workout.id]);
        const randomWorkouts = allWorkouts.sort(() => 0.5 - Math.random()).slice(0, 10);
        return new WorkoutSchedule(new Date().toISOString(), randomWorkouts, { level: 1, range: [1, 10] });
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
    }
};

export default WorkoutScheduleStore;
