import React, { useEffect, useRef } from 'react';
import styles from './WorkoutDetails.module.css';
import WorkoutTimer from '../WorkoutTimer/WorkoutTimer';
import { playCompleteSound, playSkipSound, playTimeoutSound } from '../../utils/AudioPlayer';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';

interface WorkoutDetailsProps {
    onSkipWorkout: () => void;
    onCompleteWorkout: () => void;
}

const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({ onSkipWorkout, onCompleteWorkout }) => {
    const { schedule, isLoading } = useWorkoutSchedule();
    const workout = schedule?.workouts[0] || null;
    const timerRef = useRef<{ resetTimer: () => void }>(null);

    useEffect(() => {
        if (workout) {
            console.log('Workout updated:', workout);
            timerRef.current?.resetTimer();
        }
    }, [workout]);

    useEffect(() => {
        // Log schedule changes for debugging
        console.log('Schedule updated:', schedule);
    }, [schedule]);

    if (isLoading) {
        console.log('Loading workouts...');
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!workout) {
        console.warn('No workout selected.');
        return <div className={styles.noWorkout}>No workout selected</div>;
    }

    const handleCompleteWorkout = () => {
        console.log('Workout completed:', workout);
        playCompleteSound();
        onCompleteWorkout();
        timerRef.current?.resetTimer();
    };

    const handleSkipWorkout = () => {
        console.log('Workout skipped:', workout);
        playSkipSound();
        onSkipWorkout();
        timerRef.current?.resetTimer();
    };

    const handleTimeoutWorkout = () => {
        console.log('Workout timed out:', workout);
        playTimeoutSound();
        onCompleteWorkout();
    };

    return (
        <div>
            <div className={styles.workoutDetails}>
                <div className={styles.top}>
                    <div className={styles.left}>
                        <h1>{workout.name}</h1>
                        <div className={styles.subDetails}>
                            <p>⏱️ {workout.duration}</p>
                            <p>🔥 {workout.intensity} Intensity</p>
                            <p>📈 Level {workout.difficulty_range[0]} - {workout.difficulty_range[1]}</p>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <WorkoutTimer
                            ref={timerRef}
                            onComplete={handleTimeoutWorkout}
                        />
                        <div className={styles.workoutDetailsButtonGroup}>
                            <button className={styles.workoutDetailsButton} onClick={handleCompleteWorkout}>✅</button>
                            <button className={styles.workoutDetailsButton} onClick={handleSkipWorkout}>⏭️</button>
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <p>{workout.description}</p>
                </div>
            </div>
        </div>
    );
};

export default WorkoutDetails;