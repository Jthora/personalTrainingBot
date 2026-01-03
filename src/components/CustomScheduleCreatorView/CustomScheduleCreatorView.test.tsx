// jsx runtime handles React import
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomScheduleCreatorView from './CustomScheduleCreatorView';
import { Workout } from '../../types/WorkoutCategory';
import { WorkoutSchedule, WorkoutSet } from '../../types/WorkoutSchedule';
import { DifficultySetting } from '../../types/DifficultySetting';
import WorkoutScheduleContext from '../../context/WorkoutScheduleContext';

const renderWithContext = (setCurrentSchedule = vi.fn()) => {
    const schedule = new WorkoutSchedule('today', [], new DifficultySetting(1, [1, 3]));

    return render(
        <WorkoutScheduleContext.Provider value={{
            schedule,
            loadSchedule: vi.fn(),
            completeCurrentWorkout: vi.fn(),
            skipCurrentWorkout: vi.fn(),
            timeoutCurrentWorkout: vi.fn(),
            createNewSchedule: vi.fn(),
            setCurrentSchedule,
            recap: null,
            recapOpen: false,
            recapToastVisible: false,
            openRecap: vi.fn(),
            dismissRecap: vi.fn(),
            dismissRecapToast: vi.fn(),
            isLoading: false,
            error: null,
            scheduleVersion: 1,
        }}>
            <CustomScheduleCreatorView />
        </WorkoutScheduleContext.Provider>
    );
};

describe('CustomScheduleCreatorView', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('sets a custom schedule as current and calls context setter', async () => {
        const workout = new Workout('Push Ups', 'desc', '10 min', 'Medium', [1, 3]);
        const set = new WorkoutSet([[workout, false]]);
        const customSchedule = new WorkoutSchedule('2024-01-01', [set], new DifficultySetting(1, [1, 3]));

        // Seed a custom schedule in storage
        const customSchedules = [
            {
                id: 'custom-1',
                name: 'My Custom',
                description: 'desc',
                workoutSchedule: customSchedule,
            }
        ];
        localStorage.setItem('customWorkoutSchedules', JSON.stringify(customSchedules));

        const setCurrentSchedule = vi.fn();
        renderWithContext(setCurrentSchedule);

        // Select the seeded schedule
        const select = await screen.findByRole('combobox');
        fireEvent.change(select, { target: { value: 'custom-1' } });

        // Click Set as Current
        const setButton = screen.getByRole('button', { name: /Set as Current Workout Schedule/i });
        fireEvent.click(setButton);

        await waitFor(() => {
            expect(setCurrentSchedule).toHaveBeenCalledTimes(1);
            const calledWith = setCurrentSchedule.mock.calls[0][0] as WorkoutSchedule;
            expect(calledWith.scheduleItems.length).toBe(1);
        });
    });

        it('blocks setting current schedule when empty and shows guidance', async () => {
            const emptySchedule = new WorkoutSchedule('2024-01-01', [], new DifficultySetting(1, [1, 3]));

            const customSchedules = [
                {
                    id: 'custom-empty',
                    name: 'Empty Custom',
                    description: 'desc',
                    workoutSchedule: emptySchedule,
                }
            ];
            localStorage.setItem('customWorkoutSchedules', JSON.stringify(customSchedules));

            const setCurrentSchedule = vi.fn();
            renderWithContext(setCurrentSchedule);

            const select = await screen.findByRole('combobox');
            fireEvent.change(select, { target: { value: 'custom-empty' } });

            const setButton = screen.getByRole('button', { name: /Set as Current Workout Schedule/i });
            fireEvent.click(setButton);

            expect(setCurrentSchedule).not.toHaveBeenCalled();
            const guidance = await screen.findByText(/Add at least one workout set or block/);
            expect(guidance).toBeTruthy();
        });

    it('disables move buttons at bounds', async () => {
        const workout1 = new Workout('Push Ups', 'desc', '10 min', 'Medium', [1, 3]);
        const workout2 = new Workout('Sit Ups', 'desc', '8 min', 'Medium', [1, 3]);
        const set1 = new WorkoutSet([[workout1, false]]);
        const set2 = new WorkoutSet([[workout2, false]]);
        const customSchedule = new WorkoutSchedule('2024-01-01', [set1, set2], new DifficultySetting(1, [1, 3]));

        const customSchedules = [
            {
                id: 'custom-1',
                name: 'My Custom',
                description: 'desc',
                workoutSchedule: customSchedule,
            }
        ];
        localStorage.setItem('customWorkoutSchedules', JSON.stringify(customSchedules));

        renderWithContext();

        const select = await screen.findByRole('combobox');
        fireEvent.change(select, { target: { value: 'custom-1' } });

        const moveUps = await screen.findAllByRole('button', { name: '▲' });
        const moveDowns = await screen.findAllByRole('button', { name: '▼' });

        expect((moveUps[0] as HTMLButtonElement).disabled).toBe(true);
        expect((moveDowns[0] as HTMLButtonElement).disabled).toBe(false);
        expect((moveUps[1] as HTMLButtonElement).disabled).toBe(false);
        expect((moveDowns[1] as HTMLButtonElement).disabled).toBe(true);
    });
});
