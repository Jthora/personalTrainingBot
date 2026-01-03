import React from 'react';
import styles from './UpNextCard.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { WorkoutBlock, WorkoutSet } from '../../types/WorkoutSchedule';
import { useNavigate } from 'react-router-dom';

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
    const nextItem = schedule?.scheduleItems[0];
    const remaining = schedule?.scheduleItems.length ?? 0;

    return (
        <div className={styles.card}>
            <div className={styles.label}>Up next</div>
            <div className={styles.title}>{describeItem(nextItem as any)}</div>
            <div className={styles.meta}>{remaining} item(s) left</div>
            <div className={styles.actions}>
                <button className={styles.primary} onClick={() => navigate('/training')}>Start/Resume</button>
                <button className={styles.ghost} onClick={completeCurrentWorkout}>Mark Done</button>
            </div>
        </div>
    );
};

export default UpNextCard;
