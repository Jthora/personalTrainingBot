import { WorkoutSchedule, WorkoutSet, WorkoutBlock } from '../types/WorkoutSchedule';
import { recordMetric } from './metrics';

interface AlignmentResult {
    status: 'pass' | 'warn';
    outOfRangeCount: number;
    totalWorkouts: number;
}

const inRange = (difficultyLevel: number, range: [number, number]) => difficultyLevel >= range[0] && difficultyLevel <= range[1];

export const checkScheduleAlignment = (schedule: WorkoutSchedule): AlignmentResult => {
    const level = schedule.difficultySettings.level;
    let total = 0;
    let outOfRange = 0;

    schedule.scheduleItems.forEach(item => {
        if (item instanceof WorkoutSet) {
            item.workouts.forEach(([workout]) => {
                total += 1;
                if (!inRange(level, workout.difficulty_range)) outOfRange += 1;
            });
        } else if (item instanceof WorkoutBlock) {
            total += 1;
            // Treat blocks as neutral; they don't count out-of-range.
        }
    });

    const threshold = Math.ceil(total * 0.3); // warn if >30% misaligned
    const status: AlignmentResult['status'] = outOfRange > threshold ? 'warn' : 'pass';

    return { status, outOfRangeCount: outOfRange, totalWorkouts: total };
};

export const logAlignmentForSchedule = (schedule: WorkoutSchedule) => {
    const result = checkScheduleAlignment(schedule);
    if (result.status === 'warn') {
        recordMetric('alignment_check_warn', { outOfRange: result.outOfRangeCount, total: result.totalWorkouts });
    } else {
        recordMetric('alignment_check_pass', { total: result.totalWorkouts });
    }
    return result;
};

export default checkScheduleAlignment;