import React from 'react';
import styles from './WorkoutResultsPanel.module.css';

export type StatusBannerProps = {
    actionState: 'idle' | 'success' | 'conflict' | 'error';
    actionMessage: string;
    error?: string | null;
    workoutsLength: number;
    isSubmitting: boolean;
    onAddAnyway: () => void;
    onRemove: () => void;
    onRefresh: () => void;
    onClearFilters: () => void;
};

const StatusBanner: React.FC<StatusBannerProps> = ({
    actionState,
    actionMessage,
    error,
    workoutsLength,
    isSubmitting,
    onAddAnyway,
    onRemove,
    onRefresh,
    onClearFilters,
}) => {
    if (actionState === 'conflict') {
        return (
            <div className={`${styles.stateCard} ${styles.conflictCard}`} role="alert">
                <div className={styles.stateIcon} aria-hidden>⚠️</div>
                <div className={styles.stateContent}>
                    <p className={styles.stateTitle}>Mission plan conflict detected</p>
                    <p className={styles.stateBody}>{actionMessage}</p>
                    <div className={styles.stateActions}>
                        <button type="button" className={styles.primaryButton} onClick={onAddAnyway} disabled={isSubmitting}>Add anyway</button>
                        <button type="button" className={styles.ghostButton} onClick={onRemove} disabled={isSubmitting}>Remove from mission plan</button>
                    </div>
                </div>
            </div>
        );
    }

    if (actionState === 'error') {
        return (
            <div className={`${styles.stateCard} ${styles.errorBanner}`} role="alert">
                <div className={styles.stateIcon} aria-hidden>⚠️</div>
                <div className={styles.stateContent}>
                    <p className={styles.stateTitle}>Action required</p>
                    <p className={styles.stateBody}>{actionMessage}</p>
                    <div className={styles.stateActions}>
                        <button type="button" className={styles.primaryButton} onClick={onRefresh}>Refresh</button>
                        <button type="button" className={styles.secondaryButton} onClick={onClearFilters}>Clear filters</button>
                    </div>
                </div>
            </div>
        );
    }

    if (actionState === 'success') {
        return (
            <div className={styles.statusBanner} role="status">
                {actionMessage}
            </div>
        );
    }

    if (error && workoutsLength > 0) {
        return (
            <div className={`${styles.stateCard} ${styles.errorBanner}`} role="alert">
                <div className={styles.stateIcon} aria-hidden>⚠️</div>
                <div className={styles.stateContent}>
                    <p className={styles.stateTitle}>Sync required</p>
                    <p className={styles.stateBody}>{error}</p>
                    <div className={styles.stateActions}>
                        <button type="button" className={styles.primaryButton} onClick={onRefresh}>Retry</button>
                        <button type="button" className={styles.secondaryButton} onClick={onClearFilters}>Clear filters</button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default StatusBanner;
