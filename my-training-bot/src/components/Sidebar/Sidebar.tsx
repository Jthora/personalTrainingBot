import React, { useEffect, useState } from 'react';
import CoachDialog from '../CoachDialog/CoachDialog';
import WorkoutList from '../WorkoutList/WorkoutList';
import styles from './Sidebar.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';

const Sidebar: React.FC = () => {
    const { schedule, loadSchedule, isLoading } = useWorkoutSchedule();
    const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(schedule?.workouts[0] || null);

    useEffect(() => {
        console.log('Loading schedule...');
        loadSchedule().catch(error => {
            console.error('Failed to load schedule:', error);
        }); // Load the workout schedule on component mount
    }, [loadSchedule]);

    useEffect(() => {
        setCurrentWorkout(schedule?.workouts[0] || null);
        // Log schedule changes for debugging
        console.log('Schedule updated:', schedule);
    }, [schedule]);

    if (isLoading) {
        console.log('Schedule is loading...');
        return <div className={styles.loading}>Loading...</div>;
    }

    if (schedule?.workouts.length === 0) {
        console.warn('No workouts available in the schedule.');
        return <div className={styles.noWorkouts}>No workouts available</div>;
    }

    const handleCompleteWorkout = () => {
        console.log('Workout completed:', currentWorkout);
        setCurrentWorkout(null);
    };

    const handleSkipWorkout = () => {
        console.log('Workout skipped:', currentWorkout);
        setCurrentWorkout(null);
    };

    const handleWorkoutComplete = () => {
        console.log('Workout complete handler called');
        setCurrentWorkout(schedule?.workouts[0] || null);
    };

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