import { CustomMissionSchedule, CustomMissionScheduleJSON } from '../types/MissionSchedule';
import { createStore } from './createStore';

const isCustomMissionScheduleJSON = (value: unknown): value is CustomMissionScheduleJSON => {
    if (!value || typeof value !== 'object') return false;
    const c = value as Partial<CustomMissionScheduleJSON>;
    return typeof c.name === 'string' && typeof c.description === 'string'
        && typeof c.missionSchedule === 'object' && c.missionSchedule !== null;
};

const store = createStore<CustomMissionScheduleJSON[]>({
    key: 'customMissionSchedules',
    defaultValue: [],
    validate: (raw) => {
        if (!Array.isArray(raw)) return null;
        return raw.filter(isCustomMissionScheduleJSON);
    },
});

const CustomMissionSchedulesStore = {
    getCustomSchedules(): CustomMissionSchedule[] {
        return store.get().map(s => CustomMissionSchedule.fromJSON(s));
    },
    saveCustomSchedule(schedule: CustomMissionSchedule) {
        store.update(prev => [...prev, schedule.toJSON()]);
    },
    updateCustomSchedule(updatedSchedule: CustomMissionSchedule) {
        store.update(prev => {
            const idx = prev.findIndex(s => s.id === updatedSchedule.id);
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = updatedSchedule.toJSON();
            return next;
        });
    },
    deleteCustomSchedule(scheduleId: string) {
        store.update(prev => prev.filter(s => s.id !== scheduleId));
    },
    clearCustomSchedules() {
        store.reset();
    }
};

export default CustomMissionSchedulesStore;
