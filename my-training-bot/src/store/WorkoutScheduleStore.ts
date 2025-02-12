import { WorkoutSchedule } from '../types/WorkoutSchedule';

const WorkoutScheduleStore = {
    getSchedule(): WorkoutSchedule | null {
        const schedule = localStorage.getItem('workoutSchedule');
        return schedule ? JSON.parse(schedule) : null;
    },
    saveSchedule(schedule: WorkoutSchedule) {
        localStorage.setItem('workoutSchedule', JSON.stringify(schedule));
    },
    clearSchedule() {
        localStorage.removeItem('workoutSchedule');
    },
    getSelectedWorkoutCategories(): string[] {
        const categories = localStorage.getItem('selectedWorkoutCategories');
        return categories ? JSON.parse(categories) : [];
    },
    saveSelectedWorkoutCategories(categories: string[]) {
        localStorage.setItem('selectedWorkoutCategories', JSON.stringify(categories));
    },
    clearSelectedWorkoutCategories() {
        localStorage.removeItem('selectedWorkoutCategories');
    }
};

export default WorkoutScheduleStore;
