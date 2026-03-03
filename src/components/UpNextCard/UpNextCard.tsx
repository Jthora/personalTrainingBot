import React from 'react';
import styles from './UpNextCard.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { WorkoutBlock, WorkoutSet } from '../../types/WorkoutSchedule';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logEvent } from '../../utils/telemetry';
import { mark, measure } from '../../utils/perf';

const describeItem = (item: WorkoutSet | WorkoutBlock | undefined) => {
    if (!item) return 'No workouts queued';
    if (item instanceof WorkoutSet) {
        const pending = item.workouts.find(([, done]) => !done);
        return pending ? pending[0].name : 'Workout set';
    }
    return `${item.name} (${item.duration} min)`;
};

const UpNextCard: React.FC = () => {
    const { schedule, completeCurrentWorkout } = useWorkoutSchedule();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const mode = params.get('mode') === 'focus' ? 'focus' : 'overview';
    const nextItem = schedule?.scheduleItems[0];
    const remaining = schedule?.scheduleItems.length ?? 0;

    const handleStart = () => {
        const clickMark = mark('home:plan:start_clicked');
        if (clickMark) {
            measure('home:plan:start_click_since_boot', 'load:boot_start', clickMark);
        }
        logEvent({ type: 'plan_start_training', mode });
        navigate('/training');
    };

    return (
        <div className={styles.card}>
            <div className={styles.label}>Up next</div>
            <div className={styles.title}>{describeItem(nextItem as any)}</div>
            <div className={styles.meta}>{remaining} item(s) left</div>
            <div className={styles.actions}>
                <button className={styles.primary} onClick={handleStart}>Start/Resume</button>
                <button className={styles.ghost} onClick={completeCurrentWorkout}>Mark Done</button>
            </div>
        </div>
    );
};

export default UpNextCard;
