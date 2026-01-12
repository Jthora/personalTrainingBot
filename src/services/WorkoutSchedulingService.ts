import { Workout } from '../types/WorkoutCategory';

const jitter = (min: number, max: number) => {
    const span = max - min;
    const delay = Math.random() * span + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

export type SchedulePersistResult = { status: 'ok' };

export const WorkoutSchedulingService = {
    /**
     * Simulates confirming a schedule update with a backing service.
     * Keeps the API async to support optimistic UI with rollback on failure.
     */
    async confirmAdd(_workout: Workout): Promise<SchedulePersistResult> {
        await jitter(120, 320);
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            throw new Error('Offline. We paused this add—retry when reconnected.');
        }
        return { status: 'ok' };
    },

    async confirmEdit(_workout: Workout): Promise<SchedulePersistResult> {
        await jitter(120, 320);
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            throw new Error('Offline. We paused this update—retry when reconnected.');
        }
        return { status: 'ok' };
    },

    async confirmRemove(_workoutId: string): Promise<SchedulePersistResult> {
        await jitter(120, 320);
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            throw new Error('Offline. We paused this removal—retry when reconnected.');
        }
        return { status: 'ok' };
    },
};

export default WorkoutSchedulingService;
