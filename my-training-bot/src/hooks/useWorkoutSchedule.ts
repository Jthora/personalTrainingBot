import { useContext } from 'react';
import WorkoutScheduleContext from '../context/WorkoutScheduleContext';

export const useWorkoutSchedule = () => {
    const context = useContext(WorkoutScheduleContext);
    if (!context) {
        throw new Error('useWorkoutSchedule must be used within a WorkoutScheduleProvider');
    }
    return context;
};
