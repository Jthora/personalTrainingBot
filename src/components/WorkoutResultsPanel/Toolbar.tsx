import React from 'react';
import styles from './WorkoutResultsPanel.module.css';
import AlignmentWarning from '../WorkoutsWindow/AlignmentWarning';

export type ToolbarProps = {
    workoutsLength: number;
    selectionCounts: { workouts: number; categories: number };
    isStale: boolean;
    lastUpdated?: number | null;
    loading: boolean;
    filtersOpen?: boolean;
    onRefresh: () => void;
    onOpenFilters: (target: 'filters' | 'difficulty') => void;
    onOpenPreview?: () => void;
    onOpenDifficulty: () => void;
    onGoToSchedules: () => void;
};

const Toolbar: React.FC<ToolbarProps> = ({
    workoutsLength,
    selectionCounts,
    isStale,
    lastUpdated,
    loading,
    filtersOpen,
    onRefresh,
    onOpenFilters,
    onOpenPreview,
    onOpenDifficulty,
    onGoToSchedules,
}) => {
    const timestamp = lastUpdated ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(lastUpdated)) : 'just now';

    return (
        <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
                <div>
                    <p className={styles.eyebrow}>Drills</p>
                    <h3 className={styles.heading}>Review & assign</h3>
                    <div className={styles.countRow} aria-live="polite">
                        <span className={styles.countBadge}>{workoutsLength}</span>
                        <span className={styles.countText}>matching drills</span>
                        <span className={styles.countSubtext}>
                            {selectionCounts.workouts} selected • {selectionCounts.categories} lanes
                        </span>
                    </div>
                    <div className={styles.mobileFiltersPillRow}>
                        <button
                            type="button"
                            className={styles.mobileFiltersPill}
                            onClick={() => onOpenFilters('filters')}
                            aria-pressed={Boolean(filtersOpen)}
                            aria-label="Open filters and difficulty"
                        >
                            Filters & difficulty
                        </button>
                    </div>
                </div>
                {onOpenPreview && (
                    <AlignmentWarning onOpenPreview={onOpenPreview} onAdjustDifficulty={onOpenDifficulty} />
                )}
            </div>
            <div className={styles.toolbarActions}>
                <div className={styles.refreshMeta} aria-live="polite">
                    {isStale && <span className={styles.staleBadge}>Stale</span>}
                    <span className={styles.timestampLabel}>
                        Updated {timestamp}
                    </span>
                </div>
                <button type="button" onClick={onRefresh} className={styles.secondaryButton} disabled={loading}>
                    {loading ? 'Refreshing…' : 'Refresh'}
                </button>
                <button
                    type="button"
                    onClick={() => onOpenFilters('difficulty')}
                    className={styles.secondaryButton}
                    aria-pressed={Boolean(filtersOpen)}
                >
                    Difficulty
                </button>
                <button
                    type="button"
                    onClick={() => onOpenFilters('filters')}
                    className={`${styles.secondaryButton} ${styles.desktopFiltersButton}`}
                    aria-pressed={Boolean(filtersOpen)}
                >
                    Filters
                </button>
                {onOpenPreview && (
                    <button type="button" onClick={onOpenPreview} className={styles.secondaryButton}>Preview</button>
                )}
                <button type="button" onClick={onGoToSchedules} className={styles.primaryButton}>View mission plan</button>
            </div>
        </div>
    );
};

export default Toolbar;
