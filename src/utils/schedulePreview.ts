import { MissionBlock, MissionSet } from '../types/MissionSchedule';
import { Drill } from '../types/DrillCategory';

export type ScheduleItem = MissionSet | MissionBlock;

const cloneDrill = (drill: Drill): Drill => {
    const copy = new Drill(drill.name, drill.description, drill.duration, drill.intensity, drill.difficulty_range);
    copy.id = drill.id;
    copy.equipment = [...(drill.equipment ?? [])];
    copy.themes = [...(drill.themes ?? [])];
    copy.keywords = [...(drill.keywords ?? [])];
    copy.durationMinutes = drill.durationMinutes;
    return copy;
};

export const cloneScheduleItems = (items: ScheduleItem[]): ScheduleItem[] => {
    return items.map(item => {
        if (item instanceof MissionSet) {
            return new MissionSet(item.drills.map(([drill, completed]) => [cloneDrill(drill), completed]));
        }
        return new MissionBlock(item.name, item.description, item.duration, item.intervalDetails);
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
    if (item instanceof MissionSet) {
        const names = item.drills.map(([drill]) => drill.name).slice(0, 3).join(', ');
        const suffix = item.drills.length > 3 ? '…' : '';
        return `Set • ${names}${suffix}`;
    }
    return `Block • ${item.name}`;
};

export type AlignmentStatus = 'aligned' | 'warn' | 'neutral';

export const getAlignmentStatus = (item: ScheduleItem, difficultyLevel: number): AlignmentStatus => {
    if (item instanceof MissionBlock) return 'neutral';
    const outOfRange = item.drills.some(([drill]) => difficultyLevel < drill.difficulty_range[0] || difficultyLevel > drill.difficulty_range[1]);
    return outOfRange ? 'warn' : 'aligned';
};

export const adjustSetDifficulty = (item: MissionSet, targetLevel: number): MissionSet => {
    const clamped = Math.max(1, Math.min(10, targetLevel));
    const range: [number, number] = [Math.max(1, clamped - 1), Math.min(10, clamped + 1)];
    const updated = item.drills.map(([drill, completed]) => {
        const copy = cloneDrill(drill);
        copy.difficulty_range = range;
        return [copy, completed] as [Drill, boolean];
    });
    return new MissionSet(updated);
};

const midpoint = (range: [number, number]) => (range[0] + range[1]) / 2;

const similarityScore = (candidate: Drill, seed: Drill, targetLevel: number): number => {
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

export const replaceSetWithSimilar = (item: MissionSet, pool: Drill[], targetLevel: number): MissionSet => {
    if (!pool.length) return item;
    const seed = item.drills[0]?.[0] ?? pool[0];
    const sorted = pool
        .filter(w => w.id !== seed.id)
        .sort((a, b) => similarityScore(a, seed, targetLevel) - similarityScore(b, seed, targetLevel));
    const needed = item.drills.length;
    const picks = sorted.slice(0, Math.max(needed, 1));
    if (picks.length < needed) {
        picks.push(seed);
    }
    const replacements = picks.slice(0, needed).map(w => [cloneDrill(w), false] as [Drill, boolean]);
    return new MissionSet(replacements);
};
