import React from 'react';
import styles from './WorkoutResultsPanel.module.css';
import { Workout } from '../../types/WorkoutCategory';
import { formatDuration, formatDifficulty } from './helpers';

export type DetailPanelProps = {
    selectedWorkout: Workout | null;
    isDetailOpen: boolean;
    isSelectedInSchedule: boolean;
    isSubmitting: boolean;
    lastSelectedIndex: number | null;
    detailHeadingRef: React.RefObject<HTMLHeadingElement | null>;
    onAddToSchedule: () => void;
    onUpdateSchedule: () => void;
    onRemoveFromSchedule: () => void;
    onGoToSchedules: () => void;
    onOpenPreview?: () => void;
    onCloseDetail: () => void;
    onReopenDetail: () => void;
    onRefocusSelection: (index: number) => void;
};

const DetailPanel: React.FC<DetailPanelProps> = ({
    selectedWorkout,
    isDetailOpen,
    isSelectedInSchedule,
    isSubmitting,
    lastSelectedIndex,
    detailHeadingRef,
    onAddToSchedule,
    onUpdateSchedule,
    onRemoveFromSchedule,
    onGoToSchedules,
    onOpenPreview,
    onCloseDetail,
    onReopenDetail,
    onRefocusSelection,
}) => {
    if (!selectedWorkout) {
        return <div className={styles.emptyDetail}>Select a drill to see details</div>;
    }

    if (!isDetailOpen) {
        return (
            <div className={styles.detailPlaceholder}>
                <p className={styles.label}>Details hidden</p>
                <p className={styles.detailSubtitle}>Press reopen to continue where you left off.</p>
                <div className={styles.detailActions}>
                    <button type="button" className={styles.primaryButton} onClick={onReopenDetail}>Reopen details</button>
                    <button type="button" className={styles.secondaryButton} onClick={() => onRefocusSelection(lastSelectedIndex ?? 0)}>Refocus selection</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.detailHeader}>
                <div>
                    <p className={styles.eyebrow}>Details</p>
                    <h3 ref={detailHeadingRef} tabIndex={-1} className={styles.detailTitle}>{selectedWorkout.name}</h3>
                    <p className={styles.detailSubtitle}>{selectedWorkout.description}</p>
                    {isSelectedInSchedule && (
                        <span className={styles.metaBadge} aria-label="Already in your mission plan">In mission plan</span>
                    )}
                </div>
                <button type="button" className={styles.iconButton} aria-label="Close details" onClick={onCloseDetail}>✕</button>
            </div>

            <div className={styles.detailGrid}>
                <div>
                    <p className={styles.label}>Duration</p>
                    <p className={styles.value}>{formatDuration(selectedWorkout)}</p>
                </div>
                <div>
                    <p className={styles.label}>Intensity</p>
                    <p className={styles.value}>{selectedWorkout.intensity}</p>
                </div>
                <div>
                    <p className={styles.label}>Difficulty</p>
                    <p className={styles.value}>{formatDifficulty(selectedWorkout)}</p>
                </div>
            </div>

            {selectedWorkout.equipment?.length ? (
                <div className={styles.detailSection}>
                    <p className={styles.label}>Equipment</p>
                    <div className={styles.chipRow}>
                        {selectedWorkout.equipment.map(eq => <span key={eq} className={styles.pill}>{eq}</span>)}
                    </div>
                </div>
            ) : null}

            {selectedWorkout.themes?.length ? (
                <div className={styles.detailSection}>
                    <p className={styles.label}>Themes</p>
                    <div className={styles.chipRow}>
                        {selectedWorkout.themes.map(theme => <span key={theme} className={styles.pillMuted}>{theme}</span>)}
                    </div>
                </div>
            ) : null}

            <div className={styles.detailActions}>
                {!isSelectedInSchedule && (
                    <button type="button" className={styles.primaryButton} onClick={onAddToSchedule} disabled={isSubmitting}>Add to mission plan</button>
                )}
                {isSelectedInSchedule && (
                    <>
                        <button type="button" className={styles.primaryButton} onClick={onUpdateSchedule} disabled={isSubmitting}>Update entry</button>
                        <button type="button" className={styles.secondaryButton} onClick={onRemoveFromSchedule} disabled={isSubmitting}>Remove</button>
                        <button type="button" className={styles.ghostButton} onClick={onGoToSchedules}>Open mission plan</button>
                    </>
                )}
                {onOpenPreview && <button type="button" className={styles.secondaryButton} onClick={onOpenPreview}>Open preview</button>}
            </div>
        </>
    );
};

export default DetailPanel;
