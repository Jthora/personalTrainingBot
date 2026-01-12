import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TodaysPlanBanner.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { summarizeSchedule } from '../../utils/scheduleSummary';

const TodaysPlanBanner: React.FC = () => {
    const { schedule, isLoading, createNewSchedule } = useWorkoutSchedule();
    const navigate = useNavigate();

    const summary = useMemo(() => summarizeSchedule(schedule), [schedule]);

    if (isLoading) {
        return (
            <div className={styles.banner}>
                <div className={styles.content}>
                    <div className={styles.heading}>Today&apos;s plan</div>
                    <div className={styles.skeletonLine} style={{ width: '60%' }} />
                    <div className={styles.meta}>
                        <span className={styles.skeletonPill} />
                        <span className={styles.skeletonPill} />
                        <span className={styles.skeletonPill} />
                    </div>
                    <div className={styles.skeletonLine} style={{ width: '80%' }} />
                </div>
                <div className={styles.actions}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.skeletonButton} />
                </div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className={styles.banner}>
                <div>
                    <div className={styles.heading}>Today&apos;s plan</div>
                    <div className={styles.empty}>No schedule yet. Generate one to get a focused plan.</div>
                </div>
                <div className={styles.actions}>
                    <button className={styles.primary} onClick={createNewSchedule}>Generate schedule</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <div className={styles.heading}>Today&apos;s plan</div>
                <div className={styles.title}>{summary.nextTitle}</div>
                <div className={styles.meta}>
                    <span>{summary.focus}</span>
                    <span className={styles.dot} aria-hidden>•</span>
                    <span>~{summary.remainingMinutes} min</span>
                    <span className={styles.dot} aria-hidden>•</span>
                    <span>{summary.remainingCount} item(s) queued</span>
                </div>
                <div className={styles.rationale}>{summary.rationale}</div>
            </div>
            <div className={styles.actions}>
                <button className={styles.primary} onClick={() => navigate('/training')}>Start training</button>
                <button className={styles.ghost} onClick={createNewSchedule}>Regenerate plan</button>
            </div>
        </div>
    );
};

export default TodaysPlanBanner;
