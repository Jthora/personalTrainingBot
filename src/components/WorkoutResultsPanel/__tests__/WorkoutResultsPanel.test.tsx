import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WorkoutResultsPanel from '../WorkoutResultsPanel';
import type { Workout } from '../../../types/WorkoutCategory';

const baseWorkouts: Workout[] = [
    {
        id: 'pushups',
        name: 'Push Ups',
        description: 'Classic push up movement',
        duration: '10 min',
        durationMinutes: 10,
        intensity: 'Easy',
        difficulty_range: [1, 3],
        equipment: ['bodyweight'],
        themes: ['strength'],
        keywords: ['push']
    },
    {
        id: 'mountain',
        name: 'Mountain Climbers',
        description: 'Cardio friendly movement',
        duration: '12 min',
        durationMinutes: 12,
        intensity: 'Medium',
        difficulty_range: [3, 6],
        equipment: ['bodyweight'],
        themes: ['cardio'],
        keywords: ['mountain']
    }
];

let workouts: Workout[] = [...baseWorkouts];
let selectedWorkoutsState: Record<string, boolean> = {};
let scheduleState: any = null;

const filterListeners = new Set<(filters: any) => void>();
const selectionListeners = new Set<() => void>();
const saveSelectedWorkouts = vi.fn();
const applyPreset = vi.fn();
const saveSchedule = vi.fn();
const getScheduleSync = vi.fn();
const addWorkoutToSchedule = vi.fn();
const clearSchedule = vi.fn();
const updateWorkoutInSchedule = vi.fn();
const removeWorkoutFromSchedule = vi.fn();
const confirmAdd = vi.fn();
const confirmEdit = vi.fn();
const confirmRemove = vi.fn();

vi.mock('../../../store/WorkoutFilterStore', () => {
    let filters = { search: '', duration: 'any', equipment: [] as string[], themes: [] as string[], difficultyMin: 1, difficultyMax: 10 };
    return {
        __esModule: true,
        default: {
            getFiltersSync: () => filters,
            addListener: (fn: (next: typeof filters) => void) => { filterListeners.add(fn); return () => filterListeners.delete(fn); },
            clearFilters: () => { filters = { search: '', duration: 'any', equipment: [], themes: [], difficultyMin: 1, difficultyMax: 10 }; filterListeners.forEach(listener => listener(filters)); },
        },
    };
});

vi.mock('../../../store/WorkoutScheduleStore', () => ({
    __esModule: true,
    default: {
        getSelectionCounts: () => ({ categories: 2, workouts: Object.keys(selectedWorkoutsState).length || workouts.length }),
        subscribeToSelectionChanges: (fn: () => void) => { selectionListeners.add(fn); return () => selectionListeners.delete(fn); },
        getSelectedWorkoutsSync: () => ({ ...selectedWorkoutsState }),
        saveSelectedWorkouts: (next: Record<string, boolean>) => { selectedWorkoutsState = { ...next }; saveSelectedWorkouts(next); selectionListeners.forEach(listener => listener()); },
        getScheduleSync: (...args: unknown[]) => getScheduleSync(...args),
        saveSchedule: (...args: unknown[]) => saveSchedule(...args),
        addWorkoutToSchedule: (...args: unknown[]) => addWorkoutToSchedule(...args),
        updateWorkoutInSchedule: (...args: unknown[]) => updateWorkoutInSchedule(...args),
        removeWorkoutFromSchedule: (...args: unknown[]) => removeWorkoutFromSchedule(...args),
        clearSchedule: (...args: unknown[]) => clearSchedule(...args),
    },
}));

vi.mock('../../../cache/WorkoutCategoryCache', () => ({
    __esModule: true,
    default: {
        getInstance: () => ({
            getAllWorkoutsSelected: () => workouts,
            applyPreset,
            reloadData: vi.fn(),
        }),
    },
}));

vi.mock('../../../services/WorkoutSchedulingService', () => ({
    __esModule: true,
    default: {
        confirmAdd: (...args: unknown[]) => confirmAdd(...args),
        confirmEdit: (...args: unknown[]) => confirmEdit(...args),
        confirmRemove: (...args: unknown[]) => confirmRemove(...args),
    },
}));

describe('WorkoutResultsPanel', () => {
    const renderPanel = () => render(
        <MemoryRouter>
            <WorkoutResultsPanel />
        </MemoryRouter>
    );

        const setupMatchMedia = (matches: boolean) => {
            const listeners = new Set<(event: MediaQueryListEvent) => void>();
            const mql: MediaQueryList = {
                matches,
                media: '(max-width: 960px)',
                onchange: null,
                addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
                removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
                addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
                removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
                dispatchEvent: () => true,
            } as MediaQueryList;

            vi.spyOn(window, 'matchMedia').mockImplementation(() => mql);

            const update = (nextMatch: boolean) => {
                (mql as any).matches = nextMatch;
                const event = { matches: nextMatch } as MediaQueryListEvent;
                listeners.forEach(listener => listener(event));
            };

            return { update, restore: () => (window.matchMedia as any).mockRestore?.() };
        };

    beforeEach(() => {
        workouts = [...baseWorkouts];
        selectedWorkoutsState = {};
        scheduleState = { date: '2026-01-12', scheduleItems: [], difficultySettings: { level: 1, range: [1, 3] } };
        getScheduleSync.mockReturnValue(scheduleState);
        addWorkoutToSchedule.mockReturnValue({ status: 'added', schedule: scheduleState });
        updateWorkoutInSchedule.mockReturnValue({ status: 'updated', schedule: scheduleState });
        removeWorkoutFromSchedule.mockReturnValue({ status: 'removed', schedule: scheduleState });
        saveSelectedWorkouts.mockClear();
        applyPreset.mockClear();
        saveSchedule.mockClear();
        addWorkoutToSchedule.mockClear();
        updateWorkoutInSchedule.mockClear();
        removeWorkoutFromSchedule.mockClear();
        clearSchedule.mockClear();
        confirmAdd.mockResolvedValue({ status: 'ok' });
        confirmEdit.mockResolvedValue({ status: 'ok' });
        confirmRemove.mockResolvedValue({ status: 'ok' });
    });

    it('renders workouts and shows detail for the first item', () => {
        renderPanel();

        const detail = screen.getByLabelText(/Drill details/i);
        expect(within(detail).getByText(/Push Ups/i)).toBeTruthy();
        expect(within(detail).getByText(/Classic push up movement/i)).toBeTruthy();
        expect(within(detail).getByText(/Details/i)).toBeTruthy();
    });

    it('lets users select a different workout', () => {
        renderPanel();

        fireEvent.click(screen.getByRole('option', { name: /Mountain Climbers/i }));
        const detail = screen.getByLabelText(/Drill details/i);
        expect(within(detail).getByText(/Mountain Climbers/i)).toBeTruthy();
        expect(within(detail).getByText(/Cardio friendly movement/i)).toBeTruthy();
    });

    it('shows empty state when no workouts are available', () => {
        workouts = [];
        renderPanel();

        expect(screen.getByText(/No drills match the current filters/i)).toBeTruthy();
    });

    it('closes detail with Escape and returns focus to the selected list item', async () => {
        renderPanel();

        const mountain = screen.getByRole('option', { name: /Mountain Climbers/i });
        fireEvent.click(mountain);

        fireEvent.keyDown(document, { key: 'Escape' });

        await waitFor(() => {
            expect(screen.getByText(/Details hidden/i)).toBeTruthy();
        });
        await waitFor(() => expect(document.activeElement).toBe(mountain));
    });

    it('shows conflict messaging when workout is already selected and allows override', async () => {
        addWorkoutToSchedule
            .mockReturnValueOnce({ status: 'conflict', reason: 'Already scheduled', schedule: scheduleState })
            .mockReturnValue({ status: 'added', schedule: scheduleState });
        renderPanel();

        fireEvent.click(screen.getByRole('button', { name: /Add to mission plan/i }));

        expect(await screen.findByText(/Already scheduled/i)).toBeTruthy();
        expect(saveSelectedWorkouts).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: /Add anyway/i }));

        await waitFor(() => {
            expect(saveSelectedWorkouts).toHaveBeenCalled();
        });
    });

    it('optimistically updates a scheduled workout and rolls back on confirm failure', async () => {
        selectedWorkoutsState = { pushups: true };
        updateWorkoutInSchedule.mockReturnValue({ status: 'updated', schedule: scheduleState });
        confirmEdit.mockRejectedValueOnce(new Error('network'));

    renderPanel();

        fireEvent.click(screen.getByRole('button', { name: /Update entry/i }));

        await waitFor(() => {
            expect(updateWorkoutInSchedule).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(confirmEdit).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(saveSchedule).toHaveBeenCalledWith(scheduleState);
        });

        expect(await screen.findByText(/Changes were undone/i)).toBeTruthy();
    });

    it('optimistically removes a scheduled workout and rolls back if confirmation fails', async () => {
        selectedWorkoutsState = { pushups: true };
        removeWorkoutFromSchedule.mockReturnValue({ status: 'removed', schedule: scheduleState });
        confirmRemove.mockRejectedValueOnce(new Error('timeout'));

    renderPanel();

        fireEvent.click(screen.getByRole('button', { name: /^Remove$/i }));

        await waitFor(() => expect(removeWorkoutFromSchedule).toHaveBeenCalledWith('pushups'));
        await waitFor(() => expect(confirmRemove).toHaveBeenCalledWith('pushups'));

        await waitFor(() => {
            expect(saveSelectedWorkouts).toHaveBeenCalledWith({});
            expect(saveSelectedWorkouts).toHaveBeenCalledWith({ pushups: true });
            expect(saveSchedule).toHaveBeenCalledWith(scheduleState);
        });

        expect(await screen.findByText(/Changes were undone/i)).toBeTruthy();
    });

    it('renders the mobile detail sheet with accessible dialog semantics', async () => {
        const { restore } = setupMatchMedia(true);
        renderPanel();

        const dialog = await screen.findByRole('dialog', { name: /Drill details/i });
    expect(dialog.getAttribute('aria-modal')).toBe('true');

        const closeButton = within(dialog).getByRole('button', { name: /Close details/i });
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByRole('dialog', { name: /Drill details/i })).toBeNull();
        });

        restore();
    });
});
