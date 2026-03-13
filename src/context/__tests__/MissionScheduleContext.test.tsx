import React, { act, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MissionScheduleProvider } from '../MissionScheduleContext';
import MissionScheduleContext from '../MissionScheduleContext';
import { MissionSchedule, MissionSet, MissionBlock } from '../../types/MissionSchedule';
import { Drill } from '../../types/DrillCategory';
import { DifficultySetting } from '../../types/DifficultySetting';
import MissionScheduleStore from '../../store/MissionScheduleStore';
import DrillHistoryStore from '../../store/DrillHistoryStore';
import * as Metrics from '../../utils/metrics';
import * as MissionScheduleCreator from '../../utils/MissionScheduleCreator';

type ContextValue = React.ContextType<typeof MissionScheduleContext>;

const makeSchedule = (label: string, difficulty: DifficultySetting = new DifficultySetting(1, [1, 3])) => {
    const drill = new Drill(`Drill ${label}`, 'desc', '10 min', 'Medium', [1, 3]);
    const set = new MissionSet([[drill, false]]);
    return new MissionSchedule(label, [set], difficulty);
};

const makeEmptySchedule = (label: string) => {
    const emptySet = new MissionSet([]);
    return new MissionSchedule(label, [emptySet], new DifficultySetting(1, [1, 3]));
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('MissionScheduleContext', () => {
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
            const ctx = useContext(MissionScheduleContext);
            capture(ctx);
            return null;
        };

        await act(async () => {
            root.render(
                <MissionScheduleProvider>
                    <Consumer />
                </MissionScheduleProvider>
            );
        });

        await flush();
        await flush();
    };

    it('loads schedule from store and increments version', async () => {
        const schedule = makeSchedule('A');
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
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
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});

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
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(emptySchedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(emptySchedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        expect(contextValue?.error).toBe('No drills available or difficulty is zero. Adjust selections or regenerate.');
        expect(contextValue?.schedule?.date).toBe('Empty');
        expect(saveSpy).not.toHaveBeenCalled();
    expect(metricSpy).toHaveBeenCalledWith('schedule_empty_generated', expect.objectContaining({ reason: 'empty' }));
    });

    it('surface error when schedule difficulty is zero', async () => {
        const zeroDifficultySchedule = makeSchedule('Zero', new DifficultySetting(0, [0, 0]));
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(zeroDifficultySchedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(zeroDifficultySchedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        expect(contextValue?.error).toBe('No drills available or difficulty is zero. Adjust selections or regenerate.');
        expect(contextValue?.schedule?.difficultySettings.level).toBe(0);
        expect(saveSpy).not.toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('schedule_empty_generated', expect.objectContaining({ reason: 'zero-difficulty' }));
    });

    it('records load failure metric and surfaces error on load failure', async () => {
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockRejectedValue(new Error('boom'));
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(null as any);
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
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(initialSchedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(initialSchedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        vi.spyOn(MissionScheduleCreator, 'createMissionSchedule').mockResolvedValue(generatedSchedule as any);
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
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(initialSchedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(initialSchedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        vi.spyOn(MissionScheduleCreator, 'createMissionSchedule').mockResolvedValue(emptyGenerated as any);
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            await contextValue?.createNewSchedule();
            await flush();
        });

        expect(contextValue?.error).toBe('No drills available or difficulty is zero. Adjust selections or regenerate.');
        expect(saveSpy).not.toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('schedule_generation_failure', expect.objectContaining({ reason: 'empty' }));
        expect(metricSpy).toHaveBeenCalledWith('schedule_empty_generated', expect.objectContaining({ reason: 'empty' }));
    });

    it('records completion and skip metrics', async () => {
    const drillA = new Drill('Drill A', 'desc', '10 min', 'Medium', [1, 3]);
    const drillB = new Drill('Drill B', 'desc', '10 min', 'Medium', [1, 3]);
    const schedule = new MissionSchedule('A', [new MissionSet([[drillA, false]]), new MissionSet([[drillB, false]])], new DifficultySetting(1, [1, 3]));
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.completeCurrentDrill();
            await flush();
        });

        await act(async () => {
            contextValue?.skipCurrentDrill();
            await flush();
        });

        expect(metricSpy).toHaveBeenCalledWith('drill_completed', expect.any(Object));
        expect(metricSpy).toHaveBeenCalledWith('drill_skipped', expect.any(Object));
    });

    it('completes a drill block and keeps remaining items', async () => {
        const drill = new Drill('Drill C', 'desc', '10 min', 'Medium', [1, 3]);
        const block = new MissionBlock('Block A', 'desc', 15, 'intervals');
        const schedule = new MissionSchedule('BlockFlow', [block, new MissionSet([[drill, false]])], new DifficultySetting(1, [1, 3]));
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.completeCurrentDrill();
            await flush();
        });

        expect(contextValue?.schedule.scheduleItems.length).toBe(1);
        expect(contextValue?.schedule.scheduleItems[0]).toBeInstanceOf(MissionSet);
        expect(saveSpy).toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('drill_completed', expect.objectContaining({ remaining: 1 }));
    });

    it('skips a drill block and keeps remaining items', async () => {
        const drill = new Drill('Drill C', 'desc', '10 min', 'Medium', [1, 3]);
        const block = new MissionBlock('Block B', 'desc', 12, 'intervals');
        const schedule = new MissionSchedule('SkipBlock', [block, new MissionSet([[drill, false]])], new DifficultySetting(1, [1, 3]));
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.skipCurrentDrill();
            await flush();
        });

        expect(contextValue?.schedule.scheduleItems.length).toBe(1);
        expect(contextValue?.schedule.scheduleItems[0]).toBeInstanceOf(MissionSet);
        expect(saveSpy).toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('drill_skipped', expect.objectContaining({ remaining: 1 }));
    });

    it('completes a set and drops empty schedule without errors', async () => {
        const drillA = new Drill('Drill A', 'desc', '10', 'med', [1, 3]);
        const drillB = new Drill('Drill B', 'desc', '10', 'med', [1, 3]);
        const set = new MissionSet([[drillA, false], [drillB, false]]);
        const schedule = new MissionSchedule('Edge', [set], new DifficultySetting(1, [1, 3]));
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.completeCurrentDrill();
            await flush();
        });

        await act(async () => {
            contextValue?.completeCurrentDrill();
            await flush();
        });

        expect(contextValue?.schedule.scheduleItems.length).toBe(0);
        expect(saveSpy).toHaveBeenCalled();
        expect(metricSpy).toHaveBeenCalledWith('drill_completed', expect.any(Object));
    });

    it('skip does nothing when schedule is empty', async () => {
        const emptySchedule = new MissionSchedule('Empty', [], new DifficultySetting(1, [1, 3]));
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(emptySchedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(emptySchedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        const metricSpy = vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.skipCurrentDrill();
            await flush();
        });

        expect(contextValue?.schedule.scheduleItems.length).toBe(0);
        expect(saveSpy).not.toHaveBeenCalled();
        expect(metricSpy).not.toHaveBeenCalledWith('drill_skipped', expect.any(Object));
    });

    /* ── Phase 4.3 fix: completeCurrentDrill no longer records to DrillHistoryStore ── */
    /* DrillHistoryStore.record() is now solely handled by DrillRunner.finalizeCompletion(),
       which carries self-assessment, notes, and correct domainId. completeCurrentDrill()
       only advances the schedule. */

    it('completeCurrentDrill does not double-record to DrillHistoryStore', async () => {
        const drillA = new Drill('Recon Sweep', 'desc', '10 min', 'Medium', [1, 3]);
        const schedule = new MissionSchedule('History', [new MissionSet([[drillA, false]])], new DifficultySetting(1, [1, 3]));
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});
        const recordSpy = vi.spyOn(DrillHistoryStore, 'record');

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.completeCurrentDrill();
            await flush();
        });

        // completeCurrentDrill should NOT call DrillHistoryStore.record — DrillRunner handles that
        expect(recordSpy).not.toHaveBeenCalled();
    });

    it('completeCurrentDrill with mismatched drillId does not advance schedule', async () => {
        const drillA = new Drill('Push Ups', 'desc', '10 min', 'Medium', [1, 3]);
        const schedule = new MissionSchedule('Guard', [new MissionSet([[drillA, false]])], new DifficultySetting(1, [1, 3]));
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            // Pass a card-drill ID that doesn’t match the schedule’s physical drill
            contextValue?.completeCurrentDrill('gen-drill-cybersecurity-0');
            await flush();
        });

        // Schedule should NOT have advanced
        expect(contextValue?.schedule.scheduleItems.length).toBe(1);
        expect(saveSpy).not.toHaveBeenCalled();
    });

    it('completeCurrentDrill with matching drillId advances the schedule', async () => {
        const drillA = new Drill('Push Ups', 'desc', '10 min', 'Medium', [1, 3]);
        const schedule = new MissionSchedule('Match', [new MissionSet([[drillA, false]])], new DifficultySetting(1, [1, 3]));
        vi.spyOn(MissionScheduleStore, 'getSchedule').mockResolvedValue(schedule);
        vi.spyOn(MissionScheduleStore, 'getScheduleSync').mockReturnValue(schedule);
        const saveSpy = vi.spyOn(MissionScheduleStore, 'saveSchedule').mockImplementation(() => {});
        vi.spyOn(Metrics, 'recordMetric').mockImplementation(() => {});

        let contextValue: ContextValue | undefined;
        await renderWithProvider(ctx => { contextValue = ctx; });

        await act(async () => {
            contextValue?.completeCurrentDrill(drillA.id);
            await flush();
        });

        // Schedule should advance since IDs match
        expect(contextValue?.schedule.scheduleItems.length).toBe(0);
        expect(saveSpy).toHaveBeenCalled();
    });
});
