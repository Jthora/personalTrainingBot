import React from 'react';
import { Workout } from '../../types/WorkoutCategory';
import { WorkoutFilters } from '../../store/WorkoutFilterStore';
import { highlightText, formatDuration, formatDifficulty } from './helpers';
import styles from './WorkoutResultsPanel.module.css';
import { ListEmptyState, ListSkeleton } from '../ListStates/ListState';

export type ResultsListProps = {
    workouts: Workout[];
    filters: WorkoutFilters;
    selectedId: string | null;
    selectedWorkouts: Record<string, boolean>;
    loading: boolean;
    error?: string | null;
    onRetry: () => void;
    onClearFilters: () => void;
    onQuickPreset: () => void;
    onOpenPreview?: () => void;
    onSelect: (id: string, index: number) => void;
    setItemRef: (index: number, node: HTMLButtonElement | null) => void;
    onItemKeyDown: (index: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => void;
};

const ResultsList: React.FC<ResultsListProps> = ({
    workouts,
    filters,
    selectedId,
    selectedWorkouts,
    loading,
    error,
    onRetry,
    onClearFilters,
    onQuickPreset,
    onOpenPreview,
    onSelect,
    setItemRef,
    onItemKeyDown,
}) => {
    if (loading && !workouts.length) {
        return <ListSkeleton label="Loading drills" rows={3} />;
    }

    if (error && !workouts.length) {
        return (
            <ListEmptyState
                tone="error"
                icon="⚠️"
                title="We couldn&apos;t load drills."
                body={error}
                actions={(
                    <>
                        <button type="button" className={styles.primaryButton} onClick={onRetry}>Retry</button>
                        <button type="button" className={styles.secondaryButton} onClick={onClearFilters}>Clear filters</button>
                        {onOpenPreview && <button type="button" className={styles.secondaryButton} onClick={onOpenPreview}>Open preview</button>}
                    </>
                )}
            />
        );
    }

    if (!workouts.length) {
        return (
            <ListEmptyState
                icon="🔍"
                title="No drills match the current filters."
                body="Try clearing filters, adjusting difficulty, or using a preset."
                actions={(
                    <>
                        <button type="button" className={styles.primaryButton} onClick={onClearFilters}>Clear filters</button>
                        <button type="button" className={styles.secondaryButton} onClick={onQuickPreset}>Try Quick 20</button>
                        {onOpenPreview && <button type="button" className={styles.secondaryButton} onClick={onOpenPreview}>Open preview</button>}
                    </>
                )}
            />
        );
    }

    return (
        <ul className={styles.list} role="listbox" aria-label="Available drills">
            {workouts.map((workout, index) => {
                const selected = workout.id === selectedId;
                const scheduled = Boolean(selectedWorkouts[workout.id]);
                return (
                    <li key={workout.id} className={styles.listItem}>
                        <button
                            ref={node => setItemRef(index, node)}
                            type="button"
                            className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
                            role="option"
                            aria-selected={selected}
                            onClick={() => onSelect(workout.id, index)}
                            onKeyDown={onItemKeyDown(index)}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.title}>
                                    {highlightText(workout.name, filters.search)}
                                </div>
                                <span className={styles.duration}>{formatDuration(workout)}</span>
                                    <div className={styles.metaRow}>
                                        {scheduled && <span className={styles.statusChip}>In mission plan</span>}
                                        <span className={styles.duration}>{formatDuration(workout)}</span>
                                    </div>
                            </div>
                                <p className={styles.description}>{highlightText(workout.description, filters.search)}</p>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaBadge} aria-label={`Intensity ${workout.intensity}`}>{workout.intensity}</span>
                                    <span className={styles.metaBadge} aria-label={`Difficulty range ${formatDifficulty(workout)}`}>
                                        Difficulty {formatDifficulty(workout)}
                                    </span>
                                    {workout.equipment?.length ? (
                                        <span className={styles.metaBadge} aria-label={`Equipment ${workout.equipment.join(', ')}`}>
                                            Equipment: {workout.equipment.join(', ')}
                                        </span>
                                    ) : null}
                                    {workout.themes?.length ? (
                                        <span className={styles.metaBadge} aria-label={`Themes ${workout.themes.join(', ')}`}>
                                            {workout.themes.join(' • ')}
                                        </span>
                                    ) : null}
                                </div>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};

export default ResultsList;
