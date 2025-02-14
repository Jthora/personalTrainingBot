import React, { useEffect, useRef, useState } from 'react';
import { WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';
import styles from './WorkoutDetails.module.css';
import WorkoutTimer from '../WorkoutTimer/WorkoutTimer';
import { playCompleteSound, playSkipSound, playTimeoutSound } from '../../utils/AudioPlayer';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';

interface WorkoutDetailsProps {
    item: WorkoutSet | WorkoutBlock;
}

const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({ item }) => {
    const { schedule, isLoading, loadSchedule, completeCurrentWorkout, skipCurrentWorkout, createNewSchedule, scheduleVersion } = useWorkoutSchedule();
    const timerRef = useRef<{ resetTimer: () => void }>(null);
    const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);

    useEffect(() => {
        console.log('WorkoutDetails: Loading schedule...');
        loadSchedule().catch(error => {
            console.error('Failed to load schedule:', error);
        }); // Load the workout schedule on component mount
    }, [loadSchedule]);

    useEffect(() => {
        if (item) {
            console.log('Workout updated:', item);
            timerRef.current?.resetTimer();
        }
    }, [item]);

    useEffect(() => {
        // Log schedule changes for debugging
        console.log('Schedule updated:', schedule);
    }, [schedule, scheduleVersion]);

    if (isLoading) {
        console.log('Loading workouts...');
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!item) {
        console.warn('No workout selected.');
        return (
            <div className={styles.noWorkout}>
                No workout selected
                {schedule && schedule.scheduleItems.length === 0 && (
                    <button onClick={createNewSchedule} className={styles.createNewScheduleButton}>
                        Create New Workout Schedule
                    </button>
                )}
            </div>
        );
    }

    const handleCompleteWorkout = async () => {
        console.log('Workout completed:', item);
        playCompleteSound();
        completeCurrentWorkout();
        setCurrentWorkoutIndex(prevIndex => prevIndex + 1);
        timerRef.current?.resetTimer();
    };

    const handleSkipWorkout = async () => {
        console.log('Workout skipped:', item);
        playSkipSound();
        skipCurrentWorkout();
        setCurrentWorkoutIndex(prevIndex => prevIndex + 1);
        timerRef.current?.resetTimer();
    };

    const handleTimeoutWorkout = async () => {
        console.log('Workout timed out:', item);
        playTimeoutSound();
        skipCurrentWorkout();
        setCurrentWorkoutIndex(prevIndex => prevIndex + 1);
    };

    if ('workouts' in item) {
        const currentWorkout = item.workouts[currentWorkoutIndex];
        if (!currentWorkout) {
            return <div className={styles.noWorkout}>All workouts in this set are completed.</div>;
        }
        const [workout, completed] = currentWorkout;
        return (
            <div className={styles.workoutDetails}>
                <h3>{workout.name}</h3>
                <p>{workout.description}</p>
                <p>Duration: {workout.duration}</p>
                <p>Intensity: {workout.intensity}</p>
                <p>Difficulty Range: {workout.difficulty_range[0]} - {workout.difficulty_range[1]}</p>
                <p>Completed: {completed ? 'Yes' : 'No'}</p>
                <div className={styles.buttons}>
                    <button onClick={handleCompleteWorkout} className={styles.completeButton}>✅</button>
                    <button onClick={handleSkipWorkout} className={styles.skipButton}>⏭️</button>
                </div>
            </div>
        );
    } else {
        return (
            <div className={styles.workoutDetails}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>Duration: {item.duration} minutes</p>
                <p>{item.intervalDetails}</p>
                <WorkoutTimer ref={timerRef} duration={item.duration * 60} onComplete={handleTimeoutWorkout} />
                <div className={styles.buttons}>
                    <button onClick={handleCompleteWorkout} className={styles.completeButton}>✅</button>
                    <button onClick={handleSkipWorkout} className={styles.skipButton}>⏭️</button>
                </div>
            </div>
        );
    }
};

export default WorkoutDetails;