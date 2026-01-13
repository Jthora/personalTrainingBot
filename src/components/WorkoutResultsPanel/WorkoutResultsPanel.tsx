import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WorkoutResultsPanel.module.css';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import WorkoutFilterStore, { DurationBucket, WorkoutFilters } from '../../store/WorkoutFilterStore';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';
import { Workout } from '../../types/WorkoutCategory';
import { parseDurationMinutes } from '../../utils/workoutFilters';
import useWorkoutResultsData from '../../hooks/useWorkoutResultsData';
import WorkoutSchedulingService from '../../services/WorkoutSchedulingService';
import AlignmentWarning from '../WorkoutsWindow/AlignmentWarning';
import { ListEmptyState, ListSkeleton } from '../ListStates/ListState';

interface WorkoutResultsPanelProps {
    onOpenPreview?: () => void;
    onOpenFilters?: (target?: 'filters' | 'difficulty') => void;
    filtersOpen?: boolean;
}

const highlightText = (text: string, query?: string) => {
    if (!query || !query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.split(regex).map((part, index) =>
        (() => {
            regex.lastIndex = 0;
            const isMatch = regex.test(part);
            return isMatch
                ? <mark key={index}>{part}</mark>
                : <React.Fragment key={index}>{part}</React.Fragment>;
        })()
    );
};

const formatDuration = (workout: Workout) => {
    const minutes = workout.durationMinutes ?? parseDurationMinutes(workout.duration, 0);
    if (minutes) return `${minutes} min`;
    return workout.duration || '—';
};

const formatDifficulty = (workout: Workout) => `${workout.difficulty_range[0]}–${workout.difficulty_range[1]}`;

const buildAppliedLabels = (filters: WorkoutFilters): string[] => {
    const labels: string[] = [];
    if (filters.search.trim()) labels.push(`Search: “${filters.search.trim()}”`);
    if (filters.duration !== 'any') {
        const map: Record<DurationBucket, string> = { any: 'Any', '10': '10 min', '20': '20 min', '30': '30 min', '30_plus': '30+ min' };
        labels.push(`Duration: ${map[filters.duration]}`);
    }
    if (filters.equipment.length) labels.push(`Equipment: ${filters.equipment.join(', ')}`);
    if (filters.themes.length) labels.push(`Themes: ${filters.themes.join(', ')}`);
    if (filters.difficultyMin !== 1 || filters.difficultyMax !== 10) {
        labels.push(`Difficulty: ${filters.difficultyMin}–${filters.difficultyMax}`);
    }
    return labels;
};

const WorkoutResultsPanel: React.FC<WorkoutResultsPanelProps> = ({ onOpenPreview, onOpenFilters, filtersOpen }) => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<WorkoutFilters>(WorkoutFilterStore.getFiltersSync());
    const { workouts, loading, error, lastUpdated, isStale, refresh } = useWorkoutResultsData(filters);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [selectionCounts, setSelectionCounts] = useState(() => WorkoutScheduleStore.getSelectionCounts());
    const [selectedWorkouts, setSelectedWorkouts] = useState<Record<string, boolean>>(() => WorkoutScheduleStore.getSelectedWorkoutsSync());
    const [liveMessage, setLiveMessage] = useState('');
    const [actionState, setActionState] = useState<'idle' | 'success' | 'conflict' | 'error'>('idle');
    const [actionMessage, setActionMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const detailHeadingRef = useRef<HTMLHeadingElement | null>(null);
    const lastSelectedIndexRef = useRef<number | null>(null);

    const syncSelectionSnapshot = useCallback(() => {
        setSelectionCounts(WorkoutScheduleStore.getSelectionCounts());
        setSelectedWorkouts(WorkoutScheduleStore.getSelectedWorkoutsSync());
    }, []);

    useEffect(() => {
        const unsubscribeFilters = WorkoutFilterStore.addListener(next => {
            setFilters(next);
        });
        const unsubscribeSelection = WorkoutScheduleStore.subscribeToSelectionChanges(() => {
            syncSelectionSnapshot();
        });
        return () => {
            unsubscribeFilters();
            unsubscribeSelection();
        };
    }, [syncSelectionSnapshot]);

    useEffect(() => {
        if (!workouts.length) {
            setSelectedId(null);
            setIsDetailOpen(false);
            return;
        }

        setSelectionCounts(WorkoutScheduleStore.getSelectionCounts());
        setSelectedId(prev => {
            if (prev && workouts.some(w => w.id === prev)) return prev;
            return workouts[0]?.id ?? null;
        });
        setIsDetailOpen(true);
    }, [workouts]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            setIsMobile(false);
            return undefined;
        }

        const media = window.matchMedia('(max-width: 960px)');
        const update = () => setIsMobile(media.matches);
        update();

        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (!isMobile || !isDetailOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isMobile, isDetailOpen]);

    const appliedLabels = useMemo(() => buildAppliedLabels(filters), [filters]);
    const selectedWorkout = useMemo(() => workouts.find(w => w.id === selectedId) ?? null, [workouts, selectedId]);
    const isSelectedInSchedule = useMemo(() => selectedWorkout ? Boolean(selectedWorkouts[selectedWorkout.id]) : false, [selectedWorkout, selectedWorkouts]);

    const handleSelect = (id: string, index: number) => {
        setSelectedId(id);
        setIsDetailOpen(true);
        lastSelectedIndexRef.current = index;
        const workout = workouts.find(w => w.id === id);
        setActionState('idle');
        setActionMessage('');
        if (workout) {
            setLiveMessage(`${workout.name} selected`);
        }
    };

    const persistSelection = useCallback((next: Record<string, boolean>) => {
        WorkoutScheduleStore.saveSelectedWorkouts(next);
        syncSelectionSnapshot();
    }, [syncSelectionSnapshot]);

    const handleOpenFilters = useCallback((target: 'filters' | 'difficulty' = 'filters') => {
        const regionId = target === 'difficulty' ? 'difficulty-controls' : 'workout-filters-region';
        const region = document.getElementById(regionId) || document.getElementById('workout-filters-region');
        if (region) {
            region.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (typeof region.focus === 'function') {
                region.focus();
            }
        }
    }, []);

    const handleClearFilters = useCallback(() => {
        WorkoutFilterStore.clearFilters();
    }, []);

    const goToSchedules = useCallback(() => navigate('/schedules'), [navigate]);
    const openDifficultyControls = useCallback(() => {
        if (onOpenFilters) {
            onOpenFilters('difficulty');
        } else {
            handleOpenFilters('difficulty');
        }
    }, [handleOpenFilters, onOpenFilters]);

    const handleAddToSchedule = async (options?: { force?: boolean }) => {
        if (!selectedWorkout || isSubmitting) return;

        const previousSelection = WorkoutScheduleStore.getSelectedWorkoutsSync();
        const previousSchedule = WorkoutScheduleStore.getScheduleSync();
    const result = WorkoutScheduleStore.addWorkoutToSchedule(selectedWorkout, { force: options?.force });

        if (result.status === 'conflict') {
            setActionState('conflict');
            setActionMessage(result.reason || 'Already scheduled');
            setLiveMessage(`${selectedWorkout.name} has a scheduling conflict`);
            return;
        }

        if (result.status === 'error') {
            setActionState('error');
            setActionMessage(result.reason || 'Unable to add to schedule');
            setLiveMessage(`Could not add ${selectedWorkout.name} to schedule`);
            return;
        }

        const currentSelection = WorkoutScheduleStore.getSelectedWorkoutsSync();
        const nextSelection = { ...currentSelection, [selectedWorkout.id]: true };
        persistSelection(nextSelection);
        setActionState('success');
        setActionMessage(`${selectedWorkout.name} added to schedule`);
        setLiveMessage(`${selectedWorkout.name} added to schedule`);
        setIsSubmitting(true);

        try {
            await WorkoutSchedulingService.confirmAdd(selectedWorkout);
        } catch (confirmError) {
            if (previousSchedule) {
                WorkoutScheduleStore.saveSchedule(previousSchedule);
            } else {
                WorkoutScheduleStore.clearSchedule();
            }
            persistSelection(previousSelection);
            setActionState('error');
            setActionMessage('We could not confirm the add. Changes were undone.');
            setLiveMessage(`Rolled back ${selectedWorkout.name}`);
            return;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateScheduleEntry = async () => {
        if (!selectedWorkout || isSubmitting) return;

        const previousSchedule = WorkoutScheduleStore.getScheduleSync();
        const result = WorkoutScheduleStore.updateWorkoutInSchedule(selectedWorkout);

        if (result.status === 'not_found') {
            setActionState('error');
            setActionMessage(`${selectedWorkout.name} is not on your schedule yet`);
            setLiveMessage(`${selectedWorkout.name} is not currently scheduled`);
            return;
        }

        if (result.status === 'error') {
            setActionState('error');
            setActionMessage(result.reason || 'Unable to update schedule');
            setLiveMessage(`Could not update ${selectedWorkout.name}`);
            return;
        }

        setActionState('success');
        setActionMessage(`${selectedWorkout.name} updated`);
        setLiveMessage(`${selectedWorkout.name} updated in schedule`);
        setIsSubmitting(true);

        try {
            await WorkoutSchedulingService.confirmEdit(selectedWorkout);
        } catch (confirmError) {
            if (previousSchedule) {
                WorkoutScheduleStore.saveSchedule(previousSchedule);
            }
            setActionState('error');
            setActionMessage('We could not confirm the update. Changes were undone.');
            setLiveMessage(`Rolled back updates for ${selectedWorkout.name}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveFromSchedule = async () => {
        if (!selectedWorkout || isSubmitting) return;

        const previousSelection = WorkoutScheduleStore.getSelectedWorkoutsSync();
        if (!previousSelection[selectedWorkout.id]) {
            setActionState('error');
            setActionMessage(`${selectedWorkout.name} is not on your schedule`);
            setLiveMessage(`${selectedWorkout.name} is not currently scheduled`);
            return;
        }

        const previousSchedule = WorkoutScheduleStore.getScheduleSync();
        const removal = WorkoutScheduleStore.removeWorkoutFromSchedule(selectedWorkout.id);

        if (removal.status === 'not_found') {
            setActionState('error');
            setActionMessage(removal.reason || 'Workout not on schedule');
            setLiveMessage(`${selectedWorkout.name} not found on schedule`);
            return;
        }

        if (removal.status === 'error') {
            setActionState('error');
            setActionMessage(removal.reason || 'Unable to remove from schedule');
            setLiveMessage(`Could not remove ${selectedWorkout.name}`);
            return;
        }

        const nextSelection = { ...previousSelection };
        delete nextSelection[selectedWorkout.id];
        persistSelection(nextSelection);

        setActionState('success');
        setActionMessage(`${selectedWorkout.name} removed from schedule`);
        setLiveMessage(`${selectedWorkout.name} removed from schedule`);
        setIsSubmitting(true);

        try {
            await WorkoutSchedulingService.confirmRemove(selectedWorkout.id);
        } catch (confirmError) {
            if (previousSchedule) {
                WorkoutScheduleStore.saveSchedule(previousSchedule);
            } else {
                WorkoutScheduleStore.clearSchedule();
            }
            persistSelection(previousSelection);
            setActionState('error');
            setActionMessage('We could not confirm the removal. Changes were undone.');
            setLiveMessage(`Rolled back removal for ${selectedWorkout.name}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickPreset = () => {
        const cache = WorkoutCategoryCache.getInstance();
        cache.applyPreset('quick20');
        setLiveMessage('Applied Quick 20 preset');
    };

    const onItemKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            itemRefs.current[index + 1]?.focus();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            itemRefs.current[index - 1]?.focus();
        } else if (event.key === 'Home') {
            event.preventDefault();
            itemRefs.current[0]?.focus();
        } else if (event.key === 'End') {
            event.preventDefault();
            itemRefs.current[itemRefs.current.length - 1]?.focus();
        }
    };

    const handleCloseDetail = useCallback(() => {
        if (!selectedId) return;
        const focusIndex = workouts.findIndex(w => w.id === selectedId);
        setIsDetailOpen(false);
        const targetIndex = focusIndex >= 0 ? focusIndex : 0;
        requestAnimationFrame(() => {
            itemRefs.current[targetIndex]?.focus();
        });
        setLiveMessage('Details closed. Returned to list');
    }, [selectedId, workouts]);

    useEffect(() => {
        if (!isDetailOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                handleCloseDetail();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [handleCloseDetail, isDetailOpen]);

    useEffect(() => {
        if (isDetailOpen && selectedWorkout && detailHeadingRef.current) {
            detailHeadingRef.current.focus();
        }
    }, [isDetailOpen, selectedWorkout]);

    const renderList = () => {
        if (loading && !workouts.length) {
            return <ListSkeleton label="Loading workouts" rows={3} />;
        }

        if (error && !workouts.length) {
            return (
                <ListEmptyState
                    tone="error"
                    icon="⚠️"
                    title="We couldn&apos;t load workouts."
                    body={error}
                    actions={(
                        <>
                            <button type="button" className={styles.primaryButton} onClick={() => refresh()}>Retry</button>
                            <button type="button" className={styles.secondaryButton} onClick={handleClearFilters}>Clear filters</button>
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
                    title="No workouts match the current filters."
                    body="Try clearing filters, adjusting difficulty, or using a preset."
                    actions={(
                        <>
                            <button type="button" className={styles.primaryButton} onClick={handleClearFilters}>Clear filters</button>
                            <button type="button" className={styles.secondaryButton} onClick={handleQuickPreset}>Try Quick 20</button>
                            {onOpenPreview && <button type="button" className={styles.secondaryButton} onClick={onOpenPreview}>Open preview</button>}
                        </>
                    )}
                />
            );
        }

        return (
            <ul className={styles.list} role="listbox" aria-label="Available workouts">
                {workouts.map((workout, index) => {
                    const selected = workout.id === selectedId;
                    const scheduled = Boolean(selectedWorkouts[workout.id]);
                    return (
                        <li key={workout.id} className={styles.listItem}>
                            <button
                                ref={node => { itemRefs.current[index] = node; }}
                                type="button"
                                className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
                                role="option"
                                aria-selected={selected}
                                onClick={() => handleSelect(workout.id, index)}
                                onKeyDown={onItemKeyDown(index)}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.title}>
                                        {highlightText(workout.name, filters.search)}
                                    </div>
                                    <span className={styles.duration}>{formatDuration(workout)}</span>
                                        <div className={styles.metaRow}>
                                            {scheduled && <span className={styles.statusChip}>Scheduled</span>}
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

    const renderStatusBanner = () => {
        if (actionState === 'conflict') {
            return (
                <div className={`${styles.stateCard} ${styles.conflictCard}`} role="alert">
                    <div className={styles.stateIcon} aria-hidden>⚠️</div>
                    <div className={styles.stateContent}>
                        <p className={styles.stateTitle}>Scheduling conflict</p>
                        <p className={styles.stateBody}>{actionMessage}</p>
                        <div className={styles.stateActions}>
                            <button type="button" className={styles.primaryButton} onClick={() => handleAddToSchedule({ force: true })} disabled={isSubmitting}>Add anyway</button>
                            <button type="button" className={styles.ghostButton} onClick={handleRemoveFromSchedule} disabled={isSubmitting}>Remove from schedule</button>
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
                        <p className={styles.stateTitle}>Action needed</p>
                        <p className={styles.stateBody}>{actionMessage}</p>
                        <div className={styles.stateActions}>
                            <button type="button" className={styles.primaryButton} onClick={() => refresh()}>Refresh</button>
                            <button type="button" className={styles.secondaryButton} onClick={handleClearFilters}>Clear filters</button>
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

        if (error && workouts.length > 0) {
            return (
                <div className={`${styles.stateCard} ${styles.errorBanner}`} role="alert">
                    <div className={styles.stateIcon} aria-hidden>⚠️</div>
                    <div className={styles.stateContent}>
                        <p className={styles.stateTitle}>We couldn&apos;t refresh workouts.</p>
                        <p className={styles.stateBody}>{error}</p>
                        <div className={styles.stateActions}>
                            <button type="button" className={styles.primaryButton} onClick={() => refresh()}>Retry</button>
                            <button type="button" className={styles.secondaryButton} onClick={handleClearFilters}>Clear filters</button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    const detailCard = selectedWorkout ? (
        isDetailOpen ? (
            <>
                <div className={styles.detailHeader}>
                    <div>
                        <p className={styles.eyebrow}>Details</p>
                        <h3 ref={detailHeadingRef} tabIndex={-1} className={styles.detailTitle}>{selectedWorkout.name}</h3>
                        <p className={styles.detailSubtitle}>{selectedWorkout.description}</p>
                        {isSelectedInSchedule && (
                            <span className={styles.metaBadge} aria-label="Already on your schedule">Scheduled</span>
                        )}
                    </div>
                    <button type="button" className={styles.iconButton} aria-label="Close details" onClick={handleCloseDetail}>✕</button>
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
                        <button type="button" className={styles.primaryButton} onClick={() => handleAddToSchedule()} disabled={isSubmitting}>Add to schedule</button>
                    )}
                    {isSelectedInSchedule && (
                        <>
                            <button type="button" className={styles.primaryButton} onClick={handleUpdateScheduleEntry} disabled={isSubmitting}>Update entry</button>
                            <button type="button" className={styles.secondaryButton} onClick={handleRemoveFromSchedule} disabled={isSubmitting}>Remove</button>
                            <button type="button" className={styles.ghostButton} onClick={goToSchedules}>Open schedule</button>
                        </>
                    )}
                    {onOpenPreview && <button type="button" className={styles.secondaryButton} onClick={onOpenPreview}>Open preview</button>}
                </div>
            </>
        ) : (
            <div className={styles.detailPlaceholder}>
                <p className={styles.label}>Details hidden</p>
                <p className={styles.detailSubtitle}>Press reopen to continue where you left off.</p>
                <div className={styles.detailActions}>
                    <button type="button" className={styles.primaryButton} onClick={() => setIsDetailOpen(true)}>Reopen details</button>
                    <button type="button" className={styles.secondaryButton} onClick={() => handleSelect(selectedWorkout.id, lastSelectedIndexRef.current ?? 0)}>Refocus selection</button>
                </div>
            </div>
        )
    ) : (
        <div className={styles.emptyDetail}>Select a workout to see details</div>
    );

    return (
        <div className={styles.resultsShell}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <div>
                        <p className={styles.eyebrow}>Workouts</p>
                        <h3 className={styles.heading}>Browse & select</h3>
                        <div className={styles.countRow} aria-live="polite">
                            <span className={styles.countBadge}>{workouts.length}</span>
                            <span className={styles.countText}>matching workouts</span>
                            <span className={styles.countSubtext}>
                                {selectionCounts.workouts} selected • {selectionCounts.categories} categories
                            </span>
                        </div>
                        <div className={styles.mobileFiltersPillRow}>
                            <button
                                type="button"
                                className={styles.mobileFiltersPill}
                                onClick={() => (onOpenFilters ? onOpenFilters('filters') : handleOpenFilters('filters'))}
                                aria-pressed={Boolean(filtersOpen)}
                                aria-label="Open filters and difficulty"
                            >
                                Filters & difficulty
                            </button>
                        </div>
                    </div>
                    {onOpenPreview && (
                        <AlignmentWarning onOpenPreview={onOpenPreview} onAdjustDifficulty={openDifficultyControls} />
                    )}
                </div>
                <div className={styles.toolbarActions}>
                    <div className={styles.refreshMeta} aria-live="polite">
                        {isStale && <span className={styles.staleBadge}>Stale</span>}
                        <span className={styles.timestampLabel}>
                            Updated {lastUpdated ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(lastUpdated)) : 'just now'}
                        </span>
                    </div>
                    <button type="button" onClick={() => refresh()} className={styles.secondaryButton} disabled={loading}>
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </button>
                    <button
                        type="button"
                        onClick={() => (onOpenFilters ? onOpenFilters('difficulty') : handleOpenFilters('difficulty'))}
                        className={styles.secondaryButton}
                        aria-pressed={Boolean(filtersOpen)}
                    >
                        Difficulty
                    </button>
                    <button
                        type="button"
                        onClick={() => (onOpenFilters ? onOpenFilters('filters') : handleOpenFilters('filters'))}
                        className={`${styles.secondaryButton} ${styles.desktopFiltersButton}`}
                        aria-pressed={Boolean(filtersOpen)}
                    >
                        Filters
                    </button>
                    {onOpenPreview && (
                        <button type="button" onClick={onOpenPreview} className={styles.secondaryButton}>Preview</button>
                    )}
                    <button type="button" onClick={goToSchedules} className={styles.primaryButton}>View schedule</button>
                </div>
            </div>

            {appliedLabels.length > 0 && (
                <div className={styles.appliedBar} aria-label="Applied filters">
                    <div className={styles.appliedChips}>
                        {appliedLabels.map(label => <span key={label} className={styles.appliedChip}>{label}</span>)}
                    </div>
                    <button type="button" className={styles.clearButton} onClick={handleClearFilters}>
                        Clear all
                    </button>
                </div>
            )}

            {renderStatusBanner()}

            <div className={styles.resultsGrid}>
                <div className={styles.listPanel}>
                    <div className={styles.panelHeader}>
                        <h4>Results</h4>
                        <span className={styles.panelMeta}>{workouts.length} items</span>
                    </div>
                    {renderList()}
                </div>

                <div
                    className={isMobile ? styles.detailPanelMobile : styles.detailPanel}
                    aria-live="polite"
                    aria-label="Workout details"
                >
                    {isMobile ? (
                        <div className={styles.mobileDetailPlaceholder}>Select a workout to open details.</div>
                    ) : (
                        detailCard
                    )}
                </div>
            </div>

            {isMobile && isDetailOpen && (
                <>
                    <div className={styles.detailSheetBackdrop} onClick={handleCloseDetail} role="presentation" />
                    <div
                        className={`${styles.detailPanel} ${styles.detailPanelSheet}`}
                        aria-live="polite"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Workout details"
                    >
                        {detailCard}
                    </div>
                </>
            )}

            <div className={styles.srOnly} aria-live="polite">{liveMessage}</div>
        </div>
    );
};

export default WorkoutResultsPanel;
