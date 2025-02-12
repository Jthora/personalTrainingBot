import { WorkoutSchedule } from '../types/WorkoutSchedule';
import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import { createWorkoutSchedule } from '../utils/WorkoutScheduleCreator';

const WorkoutScheduleStore = {
    async getSchedule(options = {}): Promise<WorkoutSchedule | null> {
        try {
            const schedule = localStorage.getItem('workoutSchedule');
            if (schedule) {
                console.log('Retrieved workout schedule from localStorage.');
                return JSON.parse(schedule);
            } else {
                console.warn('No workout schedule found in localStorage. Creating a new schedule.');
                const defaultSchedule = await createWorkoutSchedule(options);
                this.saveSchedule(defaultSchedule);
                return defaultSchedule;
            }
        } catch (error) {
            console.error('Failed to get workout schedule:', error);
            const defaultSchedule = await createWorkoutSchedule(options);
            this.saveSchedule(defaultSchedule);
            return defaultSchedule;
        }
    },
    getScheduleSync(): WorkoutSchedule | null {
        try {
            const schedule = localStorage.getItem('workoutSchedule');
            if (schedule) {
                console.log('Retrieved workout schedule from localStorage.');
                return JSON.parse(schedule);
            } else {
                console.warn('No workout schedule found in localStorage.');
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
    async getSelectedWorkoutCategories(): Promise<string[]> {
        try {
            const categories = localStorage.getItem('selectedWorkoutCategories');
            if (categories) {
                console.log('Retrieved selected workout categories from localStorage.');
                return JSON.parse(categories);
            } else {
                console.warn('No selected workout categories found in localStorage. Using all categories.');
                const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories().map(category => category.id);
                this.saveSelectedWorkoutCategories(allCategories);
                return allCategories;
            }
        } catch (error) {
            console.error('Failed to get selected workout categories:', error);
            const allCategories = WorkoutCategoryCache.getInstance().getWorkoutCategories().map(category => category.id);
            this.saveSelectedWorkoutCategories(allCategories);
            return allCategories;
        }
    },
    saveSelectedWorkoutCategories(categories: string[]) {
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
    }
};

export default WorkoutScheduleStore;
