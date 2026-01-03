import { WorkoutBlock, WorkoutSet } from '../types/WorkoutSchedule';
import { Workout } from '../types/WorkoutCategory';

export type ScheduleItem = WorkoutSet | WorkoutBlock;

const cloneWorkout = (workout: Workout): Workout => {
    const copy = new Workout(workout.name, workout.description, workout.duration, workout.intensity, workout.difficulty_range);
    copy.id = workout.id;
    copy.equipment = [...(workout.equipment ?? [])];
    copy.themes = [...(workout.themes ?? [])];
    copy.keywords = [...(workout.keywords ?? [])];
    copy.durationMinutes = workout.durationMinutes;
    return copy;
};

export const cloneScheduleItems = (items: ScheduleItem[]): ScheduleItem[] => {
    return items.map(item => {
        if (item instanceof WorkoutSet) {
            return new WorkoutSet(item.workouts.map(([workout, completed]) => [cloneWorkout(workout), completed]));
        }
        return new WorkoutBlock(item.name, item.description, item.duration, item.intervalDetails);
    });
};

export const moveScheduleItem = (items: ScheduleItem[], from: number, to: number): ScheduleItem[] => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
        return items;
    }
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
};

export const removeScheduleItem = (items: ScheduleItem[], index: number): ScheduleItem[] => {
    if (index < 0 || index >= items.length) return items;
    return items.filter((_, i) => i !== index);
};

export const describeScheduleItem = (item: ScheduleItem): string => {
    if (item instanceof WorkoutSet) {
        const names = item.workouts.map(([workout]) => workout.name).slice(0, 3).join(', ');
        const suffix = item.workouts.length > 3 ? '…' : '';
        return `Set • ${names}${suffix}`;
    }
    return `Block • ${item.name}`;
};

export type AlignmentStatus = 'aligned' | 'warn' | 'neutral';

export const getAlignmentStatus = (item: ScheduleItem, difficultyLevel: number): AlignmentStatus => {
    if (item instanceof WorkoutBlock) return 'neutral';
    const outOfRange = item.workouts.some(([workout]) => difficultyLevel < workout.difficulty_range[0] || difficultyLevel > workout.difficulty_range[1]);
    return outOfRange ? 'warn' : 'aligned';
};

export const adjustSetDifficulty = (item: WorkoutSet, targetLevel: number): WorkoutSet => {
    const clamped = Math.max(1, Math.min(10, targetLevel));
    const range: [number, number] = [Math.max(1, clamped - 1), Math.min(10, clamped + 1)];
    const updated = item.workouts.map(([workout, completed]) => {
        const copy = cloneWorkout(workout);
        copy.difficulty_range = range;
        return [copy, completed] as [Workout, boolean];
    });
    return new WorkoutSet(updated);
};

const midpoint = (range: [number, number]) => (range[0] + range[1]) / 2;

const similarityScore = (candidate: Workout, seed: Workout, targetLevel: number): number => {
    const diffScore = Math.abs(midpoint(candidate.difficulty_range) - targetLevel);
    const seedThemes = new Set(seed.themes ?? []);
    const candidateThemes = new Set(candidate.themes ?? []);
    let themeScore = 1; // base
    candidateThemes.forEach(theme => {
        if (seedThemes.has(theme)) themeScore -= 0.25;
    });
    const seedEquip = new Set(seed.equipment ?? []);
    const candidateEquip = new Set(candidate.equipment ?? []);
    let equipPenalty = 0;
    seedEquip.forEach(eq => {
        if (!candidateEquip.has(eq)) equipPenalty += 0.5;
    });
    return diffScore + themeScore + equipPenalty;
};

export const replaceSetWithSimilar = (item: WorkoutSet, pool: Workout[], targetLevel: number): WorkoutSet => {
    if (!pool.length) return item;
    const seed = item.workouts[0]?.[0] ?? pool[0];
    const sorted = pool
        .filter(w => w.id !== seed.id)
        .sort((a, b) => similarityScore(a, seed, targetLevel) - similarityScore(b, seed, targetLevel));
    const needed = item.workouts.length;
    const picks = sorted.slice(0, Math.max(needed, 1));
    if (picks.length < needed) {
        picks.push(seed);
    }
    const replacements = picks.slice(0, needed).map(w => [cloneWorkout(w), false] as [Workout, boolean]);
    return new WorkoutSet(replacements);
};
