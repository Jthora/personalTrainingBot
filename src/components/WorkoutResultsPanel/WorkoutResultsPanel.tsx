import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WorkoutResultsPanel.module.css';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import WorkoutFilterStore, { WorkoutFilters } from '../../store/WorkoutFilterStore';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';
import useWorkoutResultsData from '../../hooks/useWorkoutResultsData';
import WorkoutSchedulingService from '../../services/WorkoutSchedulingService';
import { buildAppliedLabels } from './helpers';
import ResultsList from './ResultsList';
import StatusBanner from './StatusBanner';
import Toolbar from './Toolbar';
import DetailPanel from './DetailPanel';
import AppliedFiltersBar from './AppliedFiltersBar';

interface WorkoutResultsPanelProps {
    onOpenPreview?: () => void;
    onOpenFilters?: (target?: 'filters' | 'difficulty') => void;
    filtersOpen?: boolean;
}

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
        const unsubscribeFilters = WorkoutFilterStore.addListener(next => setFilters(next));
        const unsubscribeSelection = WorkoutScheduleStore.subscribeToSelectionChanges(syncSelectionSnapshot);
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
        if (workout) setLiveMessage(`${workout.name} selected for mission review`);
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
            if (typeof region.focus === 'function') region.focus();
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
            setActionMessage(result.reason || 'Already in mission plan');
            setLiveMessage(`${selectedWorkout.name} has a mission plan conflict`);
            return;
        }

        if (result.status === 'error') {
            setActionState('error');
            setActionMessage(result.reason || 'Unable to add to mission plan');
            setLiveMessage(`Could not add ${selectedWorkout.name} to the mission plan`);
            return;
        }

        const currentSelection = WorkoutScheduleStore.getSelectedWorkoutsSync();
        const nextSelection = { ...currentSelection, [selectedWorkout.id]: true };
        persistSelection(nextSelection);
        setActionState('success');
        setActionMessage(`${selectedWorkout.name} added to mission plan`);
        setLiveMessage(`${selectedWorkout.name} added to mission plan`);
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
            setActionMessage(`${selectedWorkout.name} is not in your mission plan yet`);
            setLiveMessage(`${selectedWorkout.name} is not currently in the mission plan`);
            return;
        }

        if (result.status === 'error') {
            setActionState('error');
            setActionMessage(result.reason || 'Unable to update mission plan');
            setLiveMessage(`Could not update ${selectedWorkout.name}`);
            return;
        }

        setActionState('success');
        setActionMessage(`${selectedWorkout.name} updated`);
        setLiveMessage(`${selectedWorkout.name} updated in mission plan`);
        setIsSubmitting(true);

        try {
            await WorkoutSchedulingService.confirmEdit(selectedWorkout);
        } catch (confirmError) {
            if (previousSchedule) WorkoutScheduleStore.saveSchedule(previousSchedule);
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
            setActionMessage(`${selectedWorkout.name} is not in your mission plan`);
            setLiveMessage(`${selectedWorkout.name} is not currently in the mission plan`);
            return;
        }

        const previousSchedule = WorkoutScheduleStore.getScheduleSync();
        const removal = WorkoutScheduleStore.removeWorkoutFromSchedule(selectedWorkout.id);

        if (removal.status === 'not_found') {
            setActionState('error');
            setActionMessage(removal.reason || 'Drill not in mission plan');
            setLiveMessage(`${selectedWorkout.name} not found in mission plan`);
            return;
        }

        if (removal.status === 'error') {
            setActionState('error');
            setActionMessage(removal.reason || 'Unable to remove from mission plan');
            setLiveMessage(`Could not remove ${selectedWorkout.name} from mission plan`);
            return;
        }

        const nextSelection = { ...previousSelection };
        delete nextSelection[selectedWorkout.id];
        persistSelection(nextSelection);

        setActionState('success');
        setActionMessage(`${selectedWorkout.name} removed from mission plan`);
        setLiveMessage(`${selectedWorkout.name} removed from mission plan`);
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

    const setItemRef = (index: number, node: HTMLButtonElement | null) => {
        itemRefs.current[index] = node;
    };

    const detailContent = (
        <DetailPanel
            selectedWorkout={selectedWorkout}
            isDetailOpen={isDetailOpen}
            isSelectedInSchedule={isSelectedInSchedule}
            isSubmitting={isSubmitting}
            lastSelectedIndex={lastSelectedIndexRef.current}
            detailHeadingRef={detailHeadingRef}
            onAddToSchedule={() => handleAddToSchedule()}
            onUpdateSchedule={handleUpdateScheduleEntry}
            onRemoveFromSchedule={handleRemoveFromSchedule}
            onGoToSchedules={goToSchedules}
            onOpenPreview={onOpenPreview}
            onCloseDetail={handleCloseDetail}
            onReopenDetail={() => setIsDetailOpen(true)}
            onRefocusSelection={(index) => {
                if (selectedWorkout) handleSelect(selectedWorkout.id, index);
            }}
        />
    );

    return (
        <div className={styles.resultsShell}>
            <Toolbar
                workoutsLength={workouts.length}
                selectionCounts={selectionCounts}
                isStale={isStale}
                lastUpdated={lastUpdated}
                loading={loading}
                filtersOpen={filtersOpen}
                onRefresh={refresh}
                onOpenFilters={target => (onOpenFilters ? onOpenFilters(target) : handleOpenFilters(target))}
                onOpenPreview={onOpenPreview}
                onOpenDifficulty={openDifficultyControls}
                onGoToSchedules={goToSchedules}
            />

            <AppliedFiltersBar appliedLabels={appliedLabels} onClearFilters={handleClearFilters} />

            <StatusBanner
                actionState={actionState}
                actionMessage={actionMessage}
                error={error}
                workoutsLength={workouts.length}
                isSubmitting={isSubmitting}
                onAddAnyway={() => handleAddToSchedule({ force: true })}
                onRemove={handleRemoveFromSchedule}
                onRefresh={refresh}
                onClearFilters={handleClearFilters}
            />

            <div className={styles.resultsGrid}>
                <div className={styles.listPanel}>
                    <div className={styles.panelHeader}>
                        <h4>Results</h4>
                        <span className={styles.panelMeta}>{workouts.length} items</span>
                    </div>
                    <ResultsList
                        workouts={workouts}
                        filters={filters}
                        selectedId={selectedId}
                        selectedWorkouts={selectedWorkouts}
                        loading={loading}
                        error={error}
                        onRetry={refresh}
                        onClearFilters={handleClearFilters}
                        onQuickPreset={handleQuickPreset}
                        onOpenPreview={onOpenPreview}
                        onSelect={handleSelect}
                        setItemRef={setItemRef}
                        onItemKeyDown={onItemKeyDown}
                    />
                </div>

                <div
                    className={isMobile ? styles.detailPanelMobile : styles.detailPanel}
                    aria-live="polite"
                    aria-label="Drill details"
                >
                    {isMobile ? (
                        <div className={styles.mobileDetailPlaceholder}>Select a drill to open details.</div>
                    ) : (
                        detailContent
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
                        aria-label="Drill details"
                    >
                        {detailContent}
                    </div>
                </>
            )}

            <div className={styles.srOnly} aria-live="polite">{liveMessage}</div>
        </div>
    );
};

export default WorkoutResultsPanel;
