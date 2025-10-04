import { CustomWorkoutSchedule, CustomWorkoutScheduleJSON } from '../types/WorkoutSchedule';

const CUSTOM_SCHEDULES_KEY = 'customWorkoutSchedules';

const isCustomWorkoutScheduleJSON = (value: unknown): value is CustomWorkoutScheduleJSON => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<CustomWorkoutScheduleJSON>;
    return typeof candidate.name === 'string'
        && typeof candidate.description === 'string'
        && typeof candidate.workoutSchedule === 'object'
        && candidate.workoutSchedule !== null;
};

const CustomWorkoutSchedulesStore = {
    getCustomSchedules(): CustomWorkoutSchedule[] {
        try {
            const schedules = localStorage.getItem(CUSTOM_SCHEDULES_KEY);
            if (schedules) {
                console.log('Retrieved custom workout schedules from localStorage.');
                const parsedSchedules = JSON.parse(schedules) as unknown;
                if (!Array.isArray(parsedSchedules)) {
                    console.warn('CustomWorkoutSchedulesStore: stored schedules are not an array.');
                    return [];
                }

                return parsedSchedules
                    .filter(isCustomWorkoutScheduleJSON)
                    .map(schedule => CustomWorkoutSchedule.fromJSON(schedule));
            } else {
                console.warn('No custom workout schedules found in localStorage.');
                return [];
            }
        } catch (error) {
            console.error('Failed to get custom workout schedules:', error);
            return [];
        }
    },
    saveCustomSchedule(schedule: CustomWorkoutSchedule) {
        try {
            const schedules = this.getCustomSchedules();
            schedules.push(schedule);
            localStorage.setItem(CUSTOM_SCHEDULES_KEY, JSON.stringify(schedules.map(s => s.toJSON())));
            console.log('Saved custom workout schedule to localStorage.');
        } catch (error) {
            console.error('Failed to save custom workout schedule:', error);
        }
    },
    updateCustomSchedule(updatedSchedule: CustomWorkoutSchedule) {
        try {
            const schedules = this.getCustomSchedules();
            const index = schedules.findIndex(schedule => schedule.id === updatedSchedule.id);
            if (index !== -1) {
                schedules[index] = updatedSchedule;
                localStorage.setItem(CUSTOM_SCHEDULES_KEY, JSON.stringify(schedules.map(s => s.toJSON())));
                console.log('Updated custom workout schedule in localStorage.');
            } else {
                console.warn('Custom workout schedule not found for update.');
            }
        } catch (error) {
            console.error('Failed to update custom workout schedule:', error);
        }
    },
    deleteCustomSchedule(scheduleId: string) {
        try {
            let schedules = this.getCustomSchedules();
            schedules = schedules.filter(schedule => schedule.id !== scheduleId);
            localStorage.setItem(CUSTOM_SCHEDULES_KEY, JSON.stringify(schedules.map(s => s.toJSON())));
            console.log('Deleted custom workout schedule from localStorage.');
        } catch (error) {
            console.error('Failed to delete custom workout schedule:', error);
        }
    },
    clearCustomSchedules() {
        try {
            localStorage.removeItem(CUSTOM_SCHEDULES_KEY);
            console.log('Cleared all custom workout schedules from localStorage.');
        } catch (error) {
            console.error('Failed to clear custom workout schedules:', error);
        }
    }
};

export default CustomWorkoutSchedulesStore;
