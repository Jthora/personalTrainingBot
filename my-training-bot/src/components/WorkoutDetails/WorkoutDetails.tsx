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
    const workout = schedule.workouts[0] || null;
    const timerRef = useRef<{ resetTimer: () => void }>(null);

    useEffect(() => {
        if (workout) {
            timerRef.current?.resetTimer();
        }
    }, [workout]);

    const handleCompleteWorkout = () => {
        playCompleteSound();
        onCompleteWorkout();
        timerRef.current?.resetTimer();
    };

    const handleSkipWorkout = () => {
        playSkipSound();
        onSkipWorkout();
        timerRef.current?.resetTimer();
    };

    const handleTimeoutWorkout = () => {
        playTimeoutSound();
        onCompleteWorkout();
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!workout) {
        return <div className={styles.noWorkout}>No workout selected</div>;
    }

    return (
        <div>
            <div className={styles.workoutDetails}>
                <div className={styles.top}>
                    <div className={styles.left}>
                        <h1>{workout.name}</h1>
                        <div className={styles.subDetails}>
                            <p>⏱️ {workout.duration}</p>
                            <p>🔥 {workout.intensity} Intensity</p>
                            <p>📈 Lv: [{workout.difficulty_range[0]} - {workout.difficulty_range[1]}]</p>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <WorkoutTimer
                            ref={timerRef}
                            onComplete={handleTimeoutWorkout}
                        />
                        <button onClick={handleCompleteWorkout}>Complete ✅</button>
                        <button onClick={handleSkipWorkout}>Skip ⏭️</button>
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