import { WorkoutBlock, WorkoutSchedule, WorkoutSet } from '../types/WorkoutSchedule';

const WORKOUT_FALLBACK_MINUTES = 10;
const BLOCK_FALLBACK_MINUTES = 8;

const numberFromString = (value: string | number | undefined): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const match = value.match(/\d+/);
        if (match) return Number(match[0]);
    }
    return null;
};

const extractMinutes = (input: string | number | undefined, fallback: number) => {
    const parsed = numberFromString(input);
    if (!parsed || Number.isNaN(parsed) || parsed <= 0) return fallback;
    return parsed;
};

const itemRemainingMinutes = (item: WorkoutSet | WorkoutBlock): number => {
    if (item instanceof WorkoutSet) {
        return item.workouts.reduce((total, [workout, completed]) => {
            if (completed) return total;
            return total + extractMinutes(workout.duration, WORKOUT_FALLBACK_MINUTES);
        }, 0);
    }

    return extractMinutes(item.duration, BLOCK_FALLBACK_MINUTES);
};

const describeNext = (item: WorkoutSet | WorkoutBlock | undefined) => {
    if (!item) return 'No workouts queued';
    if (item instanceof WorkoutSet) {
        const pending = item.workouts.find(([, completed]) => !completed)?.[0];
        return pending ? pending.name : 'Workout set';
    }
    return item.name;
};

const focusLabel = (level: number, range: [number, number]) => {
    if (!level) return 'Focus not set';
    if (level >= 7) return `High intensity • Level ${level} (${range[0]}-${range[1]})`;
    if (level >= 4) return `Moderate effort • Level ${level} (${range[0]}-${range[1]})`;
    return `Light day • Level ${level} (${range[0]}-${range[1]})`;
};

export interface ScheduleSummary {
    remainingMinutes: number;
    remainingCount: number;
    nextTitle: string;
    focus: string;
    rationale: string;
}

export const summarizeSchedule = (schedule?: WorkoutSchedule | null): ScheduleSummary | null => {
    if (!schedule || !schedule.scheduleItems || schedule.scheduleItems.length === 0) return null;

    const remainingCount = schedule.scheduleItems.length;
    const remainingMinutes = schedule.scheduleItems.reduce((total, item) => total + itemRemainingMinutes(item), 0);
    const nextTitle = describeNext(schedule.scheduleItems[0]);
    const focus = focusLabel(schedule.difficultySettings.level, schedule.difficultySettings.range);
    const rationale = `Based on your selections and difficulty level ${schedule.difficultySettings.level}. ${remainingCount} item(s) queued.`;

    return { remainingMinutes, remainingCount, nextTitle, focus, rationale };
};
