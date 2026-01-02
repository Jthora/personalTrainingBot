import React, { act, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkoutScheduleProvider } from '../WorkoutScheduleContext';
import WorkoutScheduleContext from '../WorkoutScheduleContext';
import { WorkoutSchedule, WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';
import { DifficultySetting } from '../../types/DifficultySetting';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';
import * as Metrics from '../../utils/metrics';
import * as WorkoutScheduleCreator from '../../utils/WorkoutScheduleCreator';

type ContextValue = React.ContextType<typeof WorkoutScheduleContext>;

const makeSchedule = (label: string, difficulty: DifficultySetting = new DifficultySetting(1, [1, 3])) => {
    const workout = new Workout(`Workout ${label}`, 'desc', '10 min', 'Medium', [1, 3]);
    const set = new WorkoutSet([[workout, false]]);
    return new WorkoutSchedule(label, [set], difficulty);
};

const makeEmptySchedule = (label: string) => {
    const emptySet = new WorkoutSet([]);
    return new WorkoutSchedule(label, [emptySet], new DifficultySetting(1, [1, 3]));
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('WorkoutScheduleContext', () => {
    let container: HTMLDivElement;
    let root: ReturnType<typeof createRoot>;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        localStorage.clear();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    const renderWithProvider = async (capture: (value: ContextValue | undefined) => void) => {
        const Consumer = () => {
            const ctx = useContext(WorkoutScheduleContext);
            capture(ctx);
            return null;
        };

        await act(async () => {
            root.render(
                <WorkoutScheduleProvider>
                    <Consumer />
                </WorkoutScheduleProvider>
            );
        });

        await flush();
        await flush();
    };

    it('loads schedule from store and increments version', async () => {
        const schedule = makeSchedule('A');
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        expect(contextValue?.schedule.date).toBe('A');
        expect(contextValue?.scheduleVersion).toBeGreaterThan(0);
        expect(saveSpy).not.toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('schedule_load_success', expect.objectContaining({ source: 'store' }));
    });

    it('setCurrentSchedule persists schedule and bumps version', async () => {
        const schedule = makeSchedule('A');
        const nextSchedule = makeSchedule('B');
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        const initialVersion = contextValue?.scheduleVersion ?? 0;

        await act(async () => {
            contextValue?.setCurrentSchedule(nextSchedule);
            await flush();
        });

        expect(contextValue?.schedule.date).toBe('B');
        expect(contextValue?.scheduleVersion).toBe(initialVersion + 1);
        expect(saveSpy).toHaveBeenCalledWith(nextSchedule);
    });

    it('surface error when an empty schedule is loaded', async () => {
        const emptySchedule = makeEmptySchedule('Empty');
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(emptySchedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(emptySchedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        expect(contextValue?.error).toBe('No workouts available or difficulty is zero. Adjust selections or regenerate.');
        expect(contextValue?.schedule?.date).toBe('Empty');
        expect(saveSpy).not.toHaveBeenCalled();
    expect(metricSpy).toHaveBeenCalledWith('schedule_empty_generated', expect.objectContaining({ reason: 'empty' }));
    });

    it('surface error when schedule difficulty is zero', async () => {
        const zeroDifficultySchedule = makeSchedule('Zero', new DifficultySetting(0, [0, 0]));
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(zeroDifficultySchedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(zeroDifficultySchedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        expect(contextValue?.error).toBe('No workouts available or difficulty is zero. Adjust selections or regenerate.');
        expect(contextValue?.schedule?.difficultySettings.level).toBe(0);
        expect(saveSpy).not.toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('schedule_empty_generated', expect.objectContaining({ reason: 'zero-difficulty' }));
    });

    it('records load failure metric and surfaces error on load failure', async () => {
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockRejectedValue(new Error('boom'));
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(null as any);
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        expect(contextValue?.error).toBe('Failed to load schedule');
        expect(metricSpy).toHaveBeenCalledWith('schedule_load_failure', expect.objectContaining({ message: 'boom' }));
    });

    it('records metrics when creating a new schedule succeeds', async () => {
        const initialSchedule = makeEmptySchedule('Init');
        const generatedSchedule = makeSchedule('Generated');
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(initialSchedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(initialSchedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        vi.spyOn(WorkoutScheduleCreator, 'createWorkoutSchedule').mockResolvedValue(generatedSchedule as any);
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            await contextValue?.createNewSchedule();
            await flush();
        });

        expect(saveSpy).toHaveBeenCalledWith(generatedSchedule);
        expect(metricSpy).toHaveBeenCalledWith('schedule_generation_success', expect.objectContaining({ items: generatedSchedule.scheduleItems.length }));
    });

    it('records metrics when creating a new schedule fails with empty generation', async () => {
        const initialSchedule = makeEmptySchedule('Init');
        const emptyGenerated = makeEmptySchedule('Empty');
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(initialSchedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(initialSchedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        vi.spyOn(WorkoutScheduleCreator, 'createWorkoutSchedule').mockResolvedValue(emptyGenerated as any);
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            await contextValue?.createNewSchedule();
            await flush();
        });

        expect(contextValue?.error).toBe('No workouts available or difficulty is zero. Adjust selections or regenerate.');
        expect(saveSpy).not.toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('schedule_generation_failure', expect.objectContaining({ reason: 'empty' }));
        expect(metricSpy).toHaveBeenCalledWith('schedule_empty_generated', expect.objectContaining({ reason: 'empty' }));
    });

    it('records completion and skip metrics', async () => {
    const workoutA = new Workout('Workout A', 'desc', '10 min', 'Medium', [1, 3]);
    const workoutB = new Workout('Workout B', 'desc', '10 min', 'Medium', [1, 3]);
    const schedule = new WorkoutSchedule('A', [new WorkoutSet([[workoutA, false]]), new WorkoutSet([[workoutB, false]])], new DifficultySetting(1, [1, 3]));
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.completeCurrentWorkout();
            await flush();
        });

        await act(async () => {
            contextValue?.skipCurrentWorkout();
            await flush();
        });

        expect(metricSpy).toHaveBeenCalledWith('workout_completed', expect.any(Object));
        expect(metricSpy).toHaveBeenCalledWith('workout_skipped', expect.any(Object));
    });

    it('completes a workout block and keeps remaining items', async () => {
        const workout = new Workout('Workout C', 'desc', '10 min', 'Medium', [1, 3]);
        const block = new WorkoutBlock('Block A', 'desc', 15, 'intervals');
        const schedule = new WorkoutSchedule('BlockFlow', [block, new WorkoutSet([[workout, false]])], new DifficultySetting(1, [1, 3]));
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.completeCurrentWorkout();
            await flush();
        });

        expect(contextValue?.schedule.scheduleItems.length).toBe(1);
        expect(contextValue?.schedule.scheduleItems[0]).toBeInstanceOf(WorkoutSet);
        expect(saveSpy).toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('workout_completed', expect.objectContaining({ remaining: 1 }));
    });

    it('skips a workout block and keeps remaining items', async () => {
        const workout = new Workout('Workout C', 'desc', '10 min', 'Medium', [1, 3]);
        const block = new WorkoutBlock('Block B', 'desc', 12, 'intervals');
        const schedule = new WorkoutSchedule('SkipBlock', [block, new WorkoutSet([[workout, false]])], new DifficultySetting(1, [1, 3]));
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.skipCurrentWorkout();
            await flush();
        });

        expect(contextValue?.schedule.scheduleItems.length).toBe(1);
        expect(contextValue?.schedule.scheduleItems[0]).toBeInstanceOf(WorkoutSet);
        expect(saveSpy).toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('workout_skipped', expect.objectContaining({ remaining: 1 }));
    });

    it('completes a set and drops empty schedule without errors', async () => {
        const workoutA = new Workout('Workout A', 'desc', '10', 'med', [1, 3]);
        const workoutB = new Workout('Workout B', 'desc', '10', 'med', [1, 3]);
        const set = new WorkoutSet([[workoutA, false], [workoutB, false]]);
        const schedule = new WorkoutSchedule('Edge', [set], new DifficultySetting(1, [1, 3]));
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.completeCurrentWorkout();
            await flush();
        });

        await act(async () => {
            contextValue?.completeCurrentWorkout();
            await flush();
        });

        expect(contextValue?.schedule.scheduleItems.length).toBe(0);
        expect(saveSpy).toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('workout_completed', expect.any(Object));
    });

    it('skip does nothing when schedule is empty', async () => {
        const emptySchedule = new WorkoutSchedule('Empty', [], new DifficultySetting(1, [1, 3]));
        vi.spyOn(WorkoutScheduleStore, 'getSchedule').mockResolvedValue(emptySchedule);
        vi.spyOn(WorkoutScheduleStore, 'getScheduleSync').mockReturnValue(emptySchedule);
        const saveSpy = vi.spyOn(WorkoutScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.skipCurrentWorkout();
            await flush();
        });

        expect(contextValue?.schedule.scheduleItems.length).toBe(0);
        expect(saveSpy).not.toHaveBeenCalled();
        expect(metricSpy).not.toHaveBeenCalledWith('workout_skipped', expect.any(Object));
    });
});
