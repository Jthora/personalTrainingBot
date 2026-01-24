import React, { useEffect, useMemo } from 'react';
import { WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';
import styles from './SchedulesSidebar.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { mark, measure } from '../../utils/perf';

const ScheduleSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
    <ul className={styles.scheduleList} aria-label="Schedule loading skeleton">
        {Array.from({ length: rows }).map((_, index) => (
            <li key={index} className={`${styles.scheduleItem} ${styles.skeletonItem}`}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonRow} />
                <div className={styles.skeletonRow} />
                <div className={styles.skeletonRowShort} />
            </li>
        ))}
    </ul>
);

const SchedulesSidebar: React.FC = () => {
    const { schedule, isLoading, loadSchedule, scheduleStatus } = useWorkoutSchedule();
    const currentSchedule = schedule.scheduleItems as (WorkoutSet | WorkoutBlock)[];
    const showSkeleton = isLoading && currentSchedule.length === 0;
    const isStale = useMemo(() => scheduleStatus.stale || scheduleStatus.source === 'fallback', [scheduleStatus]);

    useEffect(() => {
        const start = mark('schedule:shell_render_start');
        const raf = requestAnimationFrame(() => {
            const end = mark('schedule:shell_rendered');
            if (start && end) {
                measure('schedule_shell_render', start, end);
            }
        });
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className={styles.schedulesSidebar} aria-busy={isLoading} aria-live="polite">
            <div className={styles.scrollContainer}>
                <div className={styles.scrollableContent}>
                    <div className={styles.headerRow}>
                        <div>
                            <h1>Current</h1>
                            <h2>Workout Schedule</h2>
                        </div>
                        {isStale && (
                            <span className={styles.statusPill} title={scheduleStatus.message ?? 'Showing cached schedule'}>
                                Stale
                            </span>
                        )}
                    </div>

                    {scheduleStatus.status === 'error' && (
                        <div className={styles.statusBanner} role="status">
                            <div>
                                {scheduleStatus.message ?? 'Unable to refresh schedule. Showing last saved copy.'}
                            </div>
                            <button type="button" onClick={loadSchedule} className={styles.retryButton}>
                                Retry
                            </button>
                        </div>
                    )}

                    {showSkeleton ? (
                        <ScheduleSkeleton />
                    ) : (
                        <ul className={styles.scheduleList}>
                            {currentSchedule.map((item, index) => (
                                <li key={index} className={styles.scheduleItem}>
                                    {item instanceof WorkoutSet ? (
                                        <div className={styles.workoutSet}>
                                            <span className={styles.workoutSetTitle}>Workout Set</span>
                                            <ul className={styles.workoutList}>
                                                {item.workouts.map(([workout], idx) => (
                                                    <li key={idx} className={styles.workoutItem}>{workout.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className={styles.workoutBlock}>
                                            <span className={styles.workoutBlockTitle}>Workout Block</span>
                                            <ul className={styles.workoutDetails}>
                                                <li className={styles.workoutDetail}>{item.name}</li>
                                                <li className={styles.workoutDetail}>{item.description}</li>
                                                <li className={styles.workoutDetail}>{item.duration} minutes</li>
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchedulesSidebar;

