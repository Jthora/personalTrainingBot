import React, { useEffect, useState } from 'react';
import CoachDialog from '../CoachDialog/CoachDialog';
import WorkoutList from '../WorkoutList/WorkoutList';
import styles from './Sidebar.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';

const Sidebar: React.FC = () => {
    const { schedule, loadSchedule, isLoading } = useWorkoutSchedule();
    const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(schedule.workouts[0] || null);

    useEffect(() => {
        loadSchedule(); // Load the workout schedule on component mount
    }, [loadSchedule]);

    useEffect(() => {
        setCurrentWorkout(schedule.workouts[0] || null);
    }, [schedule]);

    const handleCompleteWorkout = () => {
        setCurrentWorkout(null);
    };

    const handleSkipWorkout = () => {
        setCurrentWorkout(null);
    };

    const handleWorkoutComplete = () => {
        setCurrentWorkout(schedule.workouts[0] || null);
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.sidebar}>
            <CoachDialog 
                currentWorkout={currentWorkout} 
                onComplete={handleCompleteWorkout} 
                onSkip={handleSkipWorkout} 
            />
            <WorkoutList onWorkoutComplete={handleWorkoutComplete} />
        </div>
    );
};

export default Sidebar;