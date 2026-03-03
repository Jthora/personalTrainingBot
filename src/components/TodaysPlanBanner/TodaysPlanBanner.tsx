import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './TodaysPlanBanner.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { summarizeSchedule } from '../../utils/scheduleSummary';
import { logEvent } from '../../utils/telemetry';
import { mark, measure } from '../../utils/perf';

const TodaysPlanBanner: React.FC = () => {
    const { schedule, isLoading, createNewSchedule } = useWorkoutSchedule();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const mode = params.get('mode') === 'focus' ? 'focus' : 'overview';
    const perfMarkedRef = useRef(false);

    const summary = useMemo(() => summarizeSchedule(schedule), [schedule]);

    useEffect(() => {
        if (perfMarkedRef.current || isLoading) return;
        const endMark = mark('home:plan:content_ready');
        if (endMark) {
            measure('home:plan:boot_to_ready', 'load:boot_start', endMark);
        }
        perfMarkedRef.current = true;
    }, [isLoading]);

    const handleStart = () => {
        const clickMark = mark('home:plan:start_clicked');
        if (clickMark) {
            measure('home:plan:start_click_since_boot', 'load:boot_start', clickMark);
        }
        logEvent({ type: 'plan_start_training', mode });
        navigate('/training');
    };

    const handleRegenerate = () => {
        logEvent({ type: 'plan_regenerate' });
        createNewSchedule();
    };

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
                    <button className={styles.primary} onClick={handleRegenerate}>Generate schedule</button>
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
                <button className={styles.primary} onClick={handleStart} disabled={!summary?.remainingCount}>
                    Start training
                </button>
                <button className={styles.ghost} onClick={handleRegenerate}>Regenerate plan</button>
            </div>
        </div>
    );
};

export default TodaysPlanBanner;
