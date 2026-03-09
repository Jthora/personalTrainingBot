import { CustomMissionSchedule, CustomMissionScheduleJSON } from '../types/MissionSchedule';

const CUSTOM_SCHEDULES_KEY = 'customMissionSchedules';

const isCustomMissionScheduleJSON = (value: unknown): value is CustomMissionScheduleJSON => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<CustomMissionScheduleJSON>;
    return typeof candidate.name === 'string'
        && typeof candidate.description === 'string'
        && typeof candidate.missionSchedule === 'object'
        && candidate.missionSchedule !== null;
};

const CustomMissionSchedulesStore = {
    getCustomSchedules(): CustomMissionSchedule[] {
        try {
            const schedules = localStorage.getItem(CUSTOM_SCHEDULES_KEY);
            if (schedules) {
                console.log('Retrieved custom drill schedules from localStorage.');
                const parsedSchedules = JSON.parse(schedules) as unknown;
                if (!Array.isArray(parsedSchedules)) {
                    console.warn('CustomMissionSchedulesStore: stored schedules are not an array.');
                    return [];
                }

                return parsedSchedules
                    .filter(isCustomMissionScheduleJSON)
                    .map(schedule => CustomMissionSchedule.fromJSON(schedule));
            } else {
                console.warn('No custom drill schedules found in localStorage.');
                return [];
            }
        } catch (error) {
            console.error('Failed to get custom drill schedules:', error);
            return [];
        }
    },
    saveCustomSchedule(schedule: CustomMissionSchedule) {
        try {
            const schedules = this.getCustomSchedules();
            schedules.push(schedule);
            localStorage.setItem(CUSTOM_SCHEDULES_KEY, JSON.stringify(schedules.map(s => s.toJSON())));
            console.log('Saved custom drill schedule to localStorage.');
        } catch (error) {
            console.error('Failed to save custom drill schedule:', error);
        }
    },
    updateCustomSchedule(updatedSchedule: CustomMissionSchedule) {
        try {
            const schedules = this.getCustomSchedules();
            const index = schedules.findIndex(schedule => schedule.id === updatedSchedule.id);
            if (index !== -1) {
                schedules[index] = updatedSchedule;
                localStorage.setItem(CUSTOM_SCHEDULES_KEY, JSON.stringify(schedules.map(s => s.toJSON())));
                console.log('Updated custom drill schedule in localStorage.');
            } else {
                console.warn('Custom drill schedule not found for update.');
            }
        } catch (error) {
            console.error('Failed to update custom drill schedule:', error);
        }
    },
    deleteCustomSchedule(scheduleId: string) {
        try {
            let schedules = this.getCustomSchedules();
            schedules = schedules.filter(schedule => schedule.id !== scheduleId);
            localStorage.setItem(CUSTOM_SCHEDULES_KEY, JSON.stringify(schedules.map(s => s.toJSON())));
            console.log('Deleted custom drill schedule from localStorage.');
        } catch (error) {
            console.error('Failed to delete custom drill schedule:', error);
        }
    },
    clearCustomSchedules() {
        try {
            localStorage.removeItem(CUSTOM_SCHEDULES_KEY);
            console.log('Cleared all custom drill schedules from localStorage.');
        } catch (error) {
            console.error('Failed to clear custom drill schedules:', error);
        }
    }
};

export default CustomMissionSchedulesStore;
