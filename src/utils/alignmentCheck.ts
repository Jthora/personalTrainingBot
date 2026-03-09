import { MissionSchedule, MissionSet, MissionBlock } from '../types/MissionSchedule';
import { recordMetric } from './metrics';

interface AlignmentResult {
    status: 'pass' | 'warn';
    outOfRangeCount: number;
    totalDrills: number;
}

const inRange = (difficultyLevel: number, range: [number, number]) => difficultyLevel >= range[0] && difficultyLevel <= range[1];

export const checkScheduleAlignment = (schedule: MissionSchedule): AlignmentResult => {
    const level = schedule.difficultySettings.level;
    let total = 0;
    let outOfRange = 0;

    schedule.scheduleItems.forEach(item => {
        if (item instanceof MissionSet) {
            item.drills.forEach(([drill]) => {
                total += 1;
                if (!inRange(level, drill.difficulty_range)) outOfRange += 1;
            });
        } else if (item instanceof MissionBlock) {
            total += 1;
            // Treat blocks as neutral; they don't count out-of-range.
        }
    });

    const threshold = Math.ceil(total * 0.3); // warn if >30% misaligned
    const status: AlignmentResult['status'] = outOfRange > threshold ? 'warn' : 'pass';

    return { status, outOfRangeCount: outOfRange, totalDrills: total };
};

export const logAlignmentForSchedule = (schedule: MissionSchedule) => {
    const result = checkScheduleAlignment(schedule);
    if (result.status === 'warn') {
        recordMetric('alignment_check_warn', { outOfRange: result.outOfRangeCount, total: result.totalDrills });
    } else {
        recordMetric('alignment_check_pass', { total: result.totalDrills });
    }
    return result;
};

export default checkScheduleAlignment;