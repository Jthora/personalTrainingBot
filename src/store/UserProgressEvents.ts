import UserProgressStore from './UserProgressStore';
import { MissionBlock, MissionSchedule, MissionSet } from '../types/MissionSchedule';
import { recordMetric } from '../utils/metrics';
import { detectCelebrations, emitCelebration } from './celebrationEvents';

const XP_REWARDS = {
    drill: 35,
    block: 20,
    scheduleCompleteBonus: 50,
};

const MINUTES_FALLBACK = {
    drill: 10,
    block: 8,
};

const numberFromString = (value: string | number | undefined): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const match = value.match(/\d+/);
        if (match) return Number(match[0]);
    }
    return null;
};

const estimateMinutes = (input: string | number | undefined, fallback: number) => {
    const parsed = numberFromString(input);
    if (!parsed || Number.isNaN(parsed) || parsed <= 0) return fallback;
    return parsed;
};

const firstIncompleteDrill = (set: MissionSet) => set.drills.find(([, completed]) => !completed)?.[0];

const completionReward = (item: MissionSet | MissionBlock) => {
    if (item instanceof MissionSet) {
        const drill = firstIncompleteDrill(item);
        return {
            xp: XP_REWARDS.drill,
            minutes: estimateMinutes(drill?.duration, MINUTES_FALLBACK.drill),
        };
    }

    return {
        xp: XP_REWARDS.block,
        minutes: estimateMinutes(item.duration, MINUTES_FALLBACK.block),
    };
};

let lastEventTs: Record<string, number> = {};
let lastSignature: Record<string, string> = {};
const THROTTLE_MS = 500;

const throttled = (key: string, fn: () => void) => {
    const now = Date.now();
    if (lastEventTs[key] && now - lastEventTs[key] < THROTTLE_MS) return;
    lastEventTs[key] = now;
    fn();
};

const emitOnce = (event: string, key: string, payload: Record<string, unknown>, fn: () => void) => {
    const signature = JSON.stringify(payload);
    if (lastSignature[key] === signature) return;
    lastSignature[key] = signature;
    throttled(event, fn);
};

export const ProgressEventRecorder = {
    recordCompletion({ item, scheduleAfter }: { item: MissionSet | MissionBlock; scheduleAfter: MissionSchedule; }) {
        const { xp, minutes } = completionReward(item);
        const scheduleEmpty = scheduleAfter.scheduleItems.length === 0;
        const scheduleBonus = scheduleEmpty ? XP_REWARDS.scheduleCompleteBonus : 0;
        const totalXp = xp + scheduleBonus;
        // Snapshot before
        const before = UserProgressStore.get();
        UserProgressStore.recordActivity({
            xp: totalXp,
            goalDeltaMinutes: minutes,
            completedDrills: 1,
            difficultyLevel: scheduleAfter.difficultySettings.level,
        });
        // Snapshot after and emit celebrations
        const after = UserProgressStore.get();
        const events = detectCelebrations(
            { xp: before.xp, level: before.level, badges: before.badges },
            { xp: after.xp, level: after.level, badges: after.badges },
        );
        events.forEach(emitCelebration);

        const payload = { xp: totalXp, minutes, scheduleEmpty, remaining: scheduleAfter.scheduleItems.length, date: scheduleAfter.date };
        emitOnce('completion', 'completion', payload, () => recordMetric('progress_event_completion', payload));
        return { xp: totalXp, minutes, scheduleEmpty };
    },

    recordSkip(reason: 'skip' | 'timeout') {
        UserProgressStore.recordSkipOrTimeout({ reason });
        emitOnce(`non_completion_${reason}`, `non_completion_${reason}`, { reason }, () => recordMetric('progress_event_non_completion', { reason }));
    },

    recordScheduleSet(schedule: MissionSchedule) {
        const payload = { items: schedule.scheduleItems.length, difficultyLevel: schedule.difficultySettings.level, date: schedule.date };
        emitOnce('schedule_set', 'schedule_set', payload, () => recordMetric('progress_event_schedule_set', payload));
    },
};
