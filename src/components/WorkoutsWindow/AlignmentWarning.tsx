import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './AlignmentWarning.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { checkScheduleAlignment } from '../../utils/alignmentCheck';
import FeatureFlagsStore from '../../store/FeatureFlagsStore';
import { recordMetric } from '../../utils/metrics';

interface AlignmentWarningProps {
    onOpenPreview: () => void;
    onAdjustDifficulty?: () => void;
}

const listOutOfRangeWorkouts = (schedule: unknown, difficultyLevel: number) => {
    if (!schedule || typeof schedule !== 'object') return [] as string[];
    // Handles both class instances and plain objects with a workouts array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (schedule as any).scheduleItems;
    if (!Array.isArray(items)) return [] as string[];

    const names: string[] = [];
    items.forEach(item => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const workouts = (item as any).workouts;
        if (Array.isArray(workouts)) {
            workouts.forEach((pair: unknown) => {
                if (!Array.isArray(pair)) return;
                const workout = pair[0] as { name?: string; difficulty_range?: [number, number] };
                if (!workout?.difficulty_range) return;
                const [min, max] = workout.difficulty_range;
                if (difficultyLevel < min || difficultyLevel > max) {
                    if (workout.name) names.push(workout.name);
                }
            });
        }
    });
    return names.slice(0, 2);
};

const buildSuggestions = (
    difficultyLevel: number,
    counts: { outOfRange: number; total: number },
    schedule: unknown
) => {
    const names = listOutOfRangeWorkouts(schedule, difficultyLevel);
    const lowerDifficulty = Math.max(1, difficultyLevel - 1);
    const suggestions: string[] = [];

    suggestions.push(
        `Lower difficulty to ~${lowerDifficulty} to bring ${counts.outOfRange} set(s) back in range.`
    );

    const headline = names[0];
    if (headline) {
        suggestions.push(`Swap "${headline}" for a steadier block or lower its load; add mobility after it.`);
    } else {
        suggestions.push('Add a mobility/steady block after your heaviest set to smooth fatigue.');
    }

    if (names.length > 1) {
        suggestions.push(
            `Spread muscle groups: separate "${names[0]}" and "${names[1]}" with core/mobility between.`
        );
    } else {
        suggestions.push('Spread muscle groups so back-to-back blocks differ (push/pull/legs).');
    }

    return suggestions;
};

const AlignmentWarning: React.FC<AlignmentWarningProps> = ({ onOpenPreview, onAdjustDifficulty }) => {
    const { schedule, scheduleVersion } = useWorkoutSchedule();
    const quietMode = useMemo(() => FeatureFlagsStore.get().quietMode, []);
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const [dismissedKey, setDismissedKey] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const lastAnnouncedKey = useRef<string>('');
    const lastStatusRef = useRef<'pass' | 'warn' | null>(null);
    const lastCountsRef = useRef<{ outOfRange: number; total: number }>({ outOfRange: 0, total: 0 });

    const scheduleKey = useMemo(() => {
        if (!schedule) return 'none';
        return `${scheduleVersion}|${schedule.difficultySettings.level}|${schedule.scheduleItems.length}`;
    }, [schedule, scheduleVersion]);

    useEffect(() => {
        if (!schedule || quietMode) {
            setVisible(false);
            return;
        }

        const handle = setTimeout(() => {
            const result = checkScheduleAlignment(schedule);
            lastCountsRef.current = { outOfRange: result.outOfRangeCount, total: result.totalWorkouts };
            const keyChanged = lastAnnouncedKey.current !== scheduleKey;
            if (result.status === 'warn') {
                setMessage(
                    `${result.outOfRangeCount} of ${result.totalWorkouts} sets exceed the selected difficulty. ` +
                    'Try a swap or lower the level to rebalance.'
                );
                setSuggestions(buildSuggestions(schedule.difficultySettings.level, lastCountsRef.current, schedule));
                if (scheduleKey !== dismissedKey) {
                    setVisible(true);
                }
                if (keyChanged) {
                    setAnnouncement(
                        `Alignment warning: ${result.outOfRangeCount} of ${result.totalWorkouts} sets are out of range.`
                    );
                    lastAnnouncedKey.current = scheduleKey;
                    recordMetric('alignment_warning_surface', {
                        outOfRange: result.outOfRangeCount,
                        total: result.totalWorkouts,
                        difficulty: schedule.difficultySettings.level,
                    });
                }
            } else {
                if (lastStatusRef.current === 'warn' && keyChanged) {
                    recordMetric('alignment_warning_resolved', {
                        outOfRange: lastCountsRef.current.outOfRange,
                        total: lastCountsRef.current.total,
                        difficulty: schedule?.difficultySettings.level,
                    });
                }
                if (visible && keyChanged) {
                    setAnnouncement('Alignment back within range.');
                }
                setSuggestions([]);
                setVisible(false);
                if (keyChanged) {
                    lastAnnouncedKey.current = scheduleKey;
                }
            }
            lastStatusRef.current = result.status;
        }, 300);

        return () => clearTimeout(handle);
    }, [dismissedKey, quietMode, schedule, scheduleKey, visible]);

    if (!schedule || quietMode || !visible) return null;

    return (
        <div className={styles.warningCard} role="alert" aria-live="polite" aria-label="Alignment warning">
            <div className={styles.icon} aria-hidden>
                ⚠️
            </div>
            <div className={styles.content}>
                <div className={styles.titleRow}>
                    <span className={styles.title}>Alignment warning</span>
                </div>
                <p className={styles.message}>{message}</p>
                <div className={styles.suggestions} aria-label="Suggested fixes">
                    {suggestions.map(s => (
                        <span key={s} className={styles.suggestion}>
                            {s}
                        </span>
                    ))}
                </div>
            </div>
            <div className={styles.actions}>
                <button className={styles.button} onClick={onOpenPreview} aria-label="Open preview drawer to swap sets">
                    Swap in preview
                </button>
                <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={onAdjustDifficulty}
                    aria-label="Lower difficulty settings"
                    disabled={!onAdjustDifficulty}
                >
                    Lower difficulty
                </button>
                <button
                    className={`${styles.button} ${styles.ghost}`}
                    onClick={() => {
                        setDismissedKey(scheduleKey);
                        setVisible(false);
                        recordMetric('alignment_warning_ignored', {
                            outOfRange: lastCountsRef.current.outOfRange,
                            total: lastCountsRef.current.total,
                            difficulty: schedule.difficultySettings.level,
                        });
                    }}
                    aria-label="Dismiss alignment warning"
                >
                    Dismiss for now
                </button>
            </div>
            <div className={styles.liveRegion} role="status" aria-live="polite">
                {announcement}
            </div>
        </div>
    );
};

export default AlignmentWarning;
